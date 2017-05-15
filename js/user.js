$(document).ready(function()
{
    $('#target_friend').on('change', target_changed);
    $('#target_me').on('change', target_changed);

    $('#plain_file').on('change', function() {
		$('#encrypt').prop("disabled", false); 		
	});

    $('#encrypt').on('click',  function() {
		var files = $('#plain_file').prop("files");
		readDataFromFileInput(files, encryptUserFile);			
	});

     $('.download_file').on('click',  function() {
		var file_id = $(this).attr("id");
        var filename = $(this).attr("name");
		getFile(file_id, filename);			
	});

    $('.show-more').on('click', function() {
        var show_more = $(this).parent().parent().next();
        if(show_more.is(":visible")) {
            show_more.slideUp();
        } else {
            show_more.slideDown();
        }
    });

    try{
        loadUserKeys();
    }
    catch(e) 
    {
        alert(e);
    }
    
});

function target_changed(evt) 
{
    if($(this).val() == "myself") {
        $('#friend_list').hide();
    } else {
        $('#friend_list').show();
    }
}

async function loadUserKeys()
{
    await g_keyStore.open();

    var username = $('#email').html().trim();

    var list = await g_keyStore.listKeys();
    if(list != null && list.length)  {	
        for(var i=0;i<list.length;i++) {
            if(list[i].value.name == username) {
                if(list[i].value.privateKey) {
                    $('#private_key_loaded').removeClass('glyphicon-remove');
                    $('#private_key_loaded').addClass('glyphicon-ok');
                } 
                if(list[i].value.publicKey) {
                    $('#public_key_loaded').removeClass('glyphicon-remove');
                    $('#public_key_loaded').addClass('glyphicon-ok');
                }

                return;
            }
        }
    }

    var request = new XMLHttpRequest();
    request.responseType = 'arraybuffer';

    request.onreadystatechange = function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                try
                {
                    var blobs = parseResponseBlobs(request.response, 3);
                    loadKeys(blobs[0], blobs[1], blobs[2]);
                } 
                catch(e) 
                {
                    showError("Failed to load user keys: "+e);
                }
            } else if(request.status == 500) {
                showError(request.responseText);
            }
         }
    }
    request.open("GET", "?controller=user&action=get_binary_data", true);
    request.send();
}

async function loadKeys(public_blob, private_blob, private_iv) 
{
    var username = $('#email').html().trim();

    await g_keyStore.open();

    try {
        var crypto_public_key = await g_Crypt.subtle.importKey("spki", public_blob, {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),  // 24 bit representation of 65537
            hash: {name: "SHA-256"}
            }, true, ["encrypt"]);

        console.log('public: '+crypto_public_key);

        var userpassword = localStorage.getItem("userPassword");

        var decrypted_private_key = await decryptPrivateKey(private_blob, private_iv, userpassword);

        // See, I told you, not so shady!
        localStorage.setItem("userPassword", null);

        var crypto_private_key  = await g_Crypt.subtle.importKey("pkcs8", decrypted_private_key, {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),  // 24 bit representation of 65537
            hash: {name: "SHA-256"}
            }, false, ["decrypt"]);
        
        console.log('private: '+crypto_public_key);

        await g_keyStore.storeKey(crypto_public_key, crypto_private_key, username);

        $('#public_key_loaded').removeClass('glyphicon-remove');
        $('#public_key_loaded').addClass('glyphicon-ok');
        $('#private_key_loaded').removeClass('glyphicon-remove');
        $('#private_key_loaded').addClass('glyphicon-ok');
        
    } catch(err) { 
        showError('Error in keyLoaded: '+err);
    }
}

async function decryptPrivateKey(encryptedPrivateKey, IV, password) 
{
    const pwUtf8 = new TextEncoder().encode(password);
    const pwHash = await g_Crypt.subtle.digest('SHA-256', pwUtf8);

    const alg = { name: 'AES-GCM', iv: IV };
    const key = await g_Crypt.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);

    const ptBuffer = await g_Crypt.subtle.decrypt(alg, key, encryptedPrivateKey);

    return ptBuffer;
}

async function prepareFriendKeys()
{
    // We need to fetch all of the public keys and import them before we can encrypt with them...
    var parameters = '';
    var targets = [];
    $('.inner').children('li').each(function () {
        if($(this).hasClass('selected')) {
            var friend_id = $(this).data('original-index');
            console.log(friend_id + ' selected ');

            var friend = new Object();
            friend.id = friend_id;
            friend.public_blob = null;

            targets.push(friend);

            parameters += '&friend_ids[]='+friend_id;
        }
    });

    // Send request for friends blobs
    var request = new XMLHttpRequest();
    request.responseType = 'arraybuffer';

    request.friendCount = targets.length;

    request.onreadystatechange = function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                try
                {
                    // The blobs are returned in the same order as the id's were passed in
                    var blobs = parseResponseBlobs(request.response, request.friendCount);
                    for(var i = 0; i < request.friendCount; ++i) {
                        targets[i] = blobs[i];
                    }
                } 
                catch(e) 
                {
                    showError("Failed to load user keys: "+e);
                }
            } else if(request.status == 500) {
                showError(request.responseText);
            }
         }
    }
    request.open("GET", "?controller=user&action=get_public_key"+parameters, true);
    request.send();
}

async function encryptUserFile(filedata) 
{
    var filename = $('#file_name').val();
    var username = $('#email').html().trim();
    var target = $('#target_me').prop("checked") ? 'me' : 'friends';

    if(target == 'friends') 
    {
        await prepareFriendKeys();
        return;
    }

    startLoading();

    // Get the public key from the user that the file is to be sent to. (For now ourselfs only)
    await g_keyStore.open();

    var keyPair = await g_keyStore.getKey("name", username);

    loading(5);

	// Generate bulk crypto key and iv.
	const encKey = await g_Crypt.subtle.generateKey({name: "AES-CBC", length: 256}, true, ["decrypt", "encrypt"]);
	var iv = g_Crypt.getRandomValues(new Uint8Array(16));

    loading(20);
	
	// Encrypt filedata with the bulk key
    const cryptData = await g_Crypt.subtle.encrypt({name: "AES-CBC", iv: iv}, encKey, filedata.data);

    loading(15);
	
	// Encrypt iv using the users public key
	const encryptedIV   = await g_Crypt.subtle.encrypt({name: "RSA-OAEP"}, keyPair.publicKey, iv);
    loading(15);

    var exported_key    = await g_Crypt.subtle.exportKey("raw", encKey);
    loading(10);

    const encryptedKey  = await g_Crypt.subtle.encrypt({name: "RSA-OAEP"}, keyPair.publicKey, exported_key);
    loading(15);

    var iv_blob     = new Blob([encryptedIV], {type: "application/octet-stream"});
    var key_blob    = new Blob([encryptedKey], {type: "application/octet-stream"});
    var crypt_blob  = new Blob([cryptData], {type: "application/octet-stream"});

    loading(10);
	
	var formData = new FormData();
    formData.append("recievers", '');
    formData.append("filename", filename);
    formData.append("type", filedata.type);
    formData.append("iv", iv_blob, 'iv');
    formData.append("key", key_blob, 'key');
    formData.append('data', crypt_blob, 'data');

    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                loading(5);
                showSuccess("Encrypted file uploaded");
                endLoading();
                //window.location = "?controller=user&action=show&user_message=File upload";
            } else if(request.status == 500) {
                showError(request.responseText);
                endLoading();
            }
         }
    }

    request.open('POST', '?controller=file&action=add', true);
    request.send(formData);

    loading(5);
}

async function getFile(fileID, filename) 
{
    startLoading();

    // We need to get the IV, key and the file data, the we can decrypt it all for the user.
    var request = new XMLHttpRequest();
    request.responseType = 'arraybuffer';

    request.filename = filename;

    request.onreadystatechange = async function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                try 
                {
                    var blobs = parseResponseBlobs(request.response, 3);
                    loading(20);
                    // Time to decrypt! :D
                    await decryptUserData(blobs[2], blobs[1], blobs[0], request.filename);
                    endLoading();
                }
                catch(e) 
                {
                    endLoading();
                    showError("Error while getting file: "+e);
                }
                

            } else if(request.status == 500) {
                showError(request.responseText);
            }
         }
    }
    request.open("GET", "?controller=file&action=get&id="+fileID, true);
    request.send();

    loading(10);

}

async function decryptUserData(encryptedIV, encryptedKey, fileData, fileName) 
{
    var username = $('#email').html().trim();

      // Get the public key from the user that the file is to be sent to. (For now ourselfs only)
    await g_keyStore.open();

    var keyPair = await g_keyStore.getKey("name", username);
    loading(10);

    const iv = await g_Crypt.subtle.decrypt({name: "RSA-OAEP"}, keyPair.privateKey, encryptedIV);
    loading(20);
    
    const key = await g_Crypt.subtle.decrypt({name: "RSA-OAEP"}, keyPair.privateKey, encryptedKey);
	loading(20);

	const decKey = await g_Crypt.subtle.importKey('raw', key, {name: "AES-CBC", length: 256}, false, ["decrypt"]);
	loading(10);

	// Decrypt filedata with the bulk key
    g_Crypt.subtle.decrypt({name: "AES-CBC", iv: iv}, decKey, fileData).then(function(decryptedData) {
        saveBinaryDataAs(decryptedData, fileName);	
        loading(10);	
    }).catch(function(e) {
        endLoading();
        console.log(e); // "oh, no!"
    });
}