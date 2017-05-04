var g_publicBlob = null;
var g_privateBlob = null;
var g_privateIVBlob = null;

function OnReady() 
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

    loadUserKeys();
}

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
    request.key = "public";

    request.onreadystatechange = function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                keyLoaded(request);
            } else if(request.status == 500) {
                showError(request.responseText);
            }
         }
    }
    request.open("GET", "?controller=user&action=get_public_key", true);
    request.send();

    var request2 = new XMLHttpRequest();
    request2.responseType = 'arraybuffer';
    request2.key = "private";

     request2.onreadystatechange = function() {
         if(request2.readyState === XMLHttpRequest.DONE) {
            if(request2.status === 200) {
                keyLoaded(request2);
            } else if(request2.status == 500) {
                showError(request2.responseText);
            }
         }
    }
    request2.open("GET", "?controller=user&action=get_private_key", true);
    request2.send();

    var request3 = new XMLHttpRequest();
    request3.responseType = 'arraybuffer';
    request3.key = "iv";

     request3.onreadystatechange = function() {
         if(request3.readyState === XMLHttpRequest.DONE) {
            if(request3.status === 200) {
                keyLoaded(request3);
            } else if(request3.status == 500) {
                showError(request3.responseText);
            }
         }
    }
    request3.open("GET", "?controller=user&action=get_private_iv", true);
    request3.send();
}

async function keyLoaded(request) 
{
    var username = $('#email').html().trim();

    if(request.responseType != "arraybuffer") {
        return;
    }

    if(request.key == "public") 
    {
        g_publicBlob = request.response;
        var tmp = new Uint8Array(g_publicBlob.byteLength);
	    tmp.set(new Uint8Array(g_publicBlob), 0);
        console.log(tmp);
    } 
    else if(request.key == "private") 
    {
        g_privateBlob = request.response;
        var tmp = new Uint8Array(g_privateBlob.byteLength);
	    tmp.set(new Uint8Array(g_privateBlob), 0);
        console.log(tmp);
    } 
    else if(request.key == "iv") 
    {
        g_privateIVBlob = request.response;
        var tmp = new Uint8Array(g_privateIVBlob.byteLength);
	    tmp.set(new Uint8Array(g_privateIVBlob), 0);
        console.log(tmp);
    } 

    if(g_publicBlob && g_privateBlob && g_privateIVBlob) 
    {
        await g_keyStore.open();

        try {
            var crypto_public_key = await g_Crypt.subtle.importKey("spki", g_publicBlob, {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),  // 24 bit representation of 65537
                hash: {name: "SHA-256"}
                }, true, ["encrypt"]);

            console.log('public: '+crypto_public_key);

            var userpassword = localStorage.getItem("userPassword");

            var decrypted_private_key = await decryptPrivateKey(g_privateBlob, g_privateIVBlob, userpassword);

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
            console.log('Error in keyLoaded: '+err);
        }
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

async function encryptUserFile(filedata) 
{
    var filename = $('#file_name').val();
    var username = $('#email').html().trim();

    // Get the public key from the user that the file is to be sent to. (For now ourselfs only)
    await g_keyStore.open();

    var keyPair = await g_keyStore.getKey("name", username);

	// Generate bulk crypto key and iv.
	const encKey = await g_Crypt.subtle.generateKey({name: "AES-CBC", length: 256}, true, ["decrypt", "encrypt"]);
	var iv = g_Crypt.getRandomValues(new Uint8Array(16));
	
	// Encrypt filedata with the bulk key
    const cryptData = await g_Crypt.subtle.encrypt({name: "AES-CBC", iv: iv}, encKey, filedata);
	
	// Encrypt iv using the users public key
	const encryptedIV   = await g_Crypt.subtle.encrypt({name: "RSA-OAEP"}, keyPair.publicKey, iv);
    var exported_key    = await g_Crypt.subtle.exportKey("raw", encKey);
    const encryptedKey  = await g_Crypt.subtle.encrypt({name: "RSA-OAEP"}, keyPair.publicKey, exported_key);

    var iv_blob     = new Blob([encryptedIV], {type: "application/octet-stream"});
    var key_blob    = new Blob([encryptedKey], {type: "application/octet-stream"});
    var crypt_blob  = new Blob([cryptData], {type: "application/octet-stream"});
	
	var formData = new FormData();
    formData.append("recievers", '');
    formData.append("filename", filename);
    formData.append("iv", iv_blob, 'iv');
    formData.append("key", key_blob, 'key');
    formData.append('data', crypt_blob, 'data');

    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                window.location = "?controller=user&action=show";
            } else if(request.status == 500) {
                showError(request.responseText);
            }
         }
    }

    request.open('POST', '?controller=file&action=add', true);
    request.send(formData);
}

async function decryptUserFile(fileID) 
{
    // We need to get the IV, key and the file data, the we can decrypt it all for the user.
    var request = new XMLHttpRequest();
    request.responseType = 'arraybuffer';

    request.onreadystatechange = function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                var tmp = new Uint8Array(request.response);
                console.log(tmp);
            } else if(request.status == 500) {
                showError(request.responseText);
            }
         }
    }
    request.open("GET", "?controller=file&action=get&id="+fileID, true);
    request.send();

}