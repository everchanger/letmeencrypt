$(document).ready(function()
{
    $('#target_friend').on('change', target_changed);
    $('#target_me').on('change', target_changed);

    $('#plain_file').on('change', function() {
		$('#encrypt').prop("disabled", false); 		
	});

    $('#encrypt').on('click', function() {
		var files = $('#plain_file').prop("files");
		readDataFromFileInput(files, encryptUserFile);			
	});

    bindFileFunctions();

    $('.show-more').on('click', function() {
        var show_more = $(this).parent().parent().next();
        if(show_more.is(":visible")) {
            show_more.slideUp();
        } else {
            show_more.slideDown();
        }
    });


    // Set timer to autoupdate the file segment
    setInterval(updateFiles, 5000);
});

function updateFiles() 
{
    var filelist = getFileIDList();

    $.ajax({
        url: '?controller=user&action=updateFiles',
    })
    .done(function(response) {
        $('#files').html(response);
        bindFileFunctions();

        var newFileList = getFileIDList();

        // Check for new entries, these we will send notifications about!
        for(var i = 0; i < newFileList.length; ++i)
        {
            if(filelist.indexOf(newFileList[i]) == -1 ) {
                console.log('File with ID: '+ newFileList[i]+' added!');
            }
        }
    });
}

function bindFileFunctions() 
{
    $('.download_file').on('click', function() {
		var file_id = $(this).attr("id");
        var filename = $(this).attr("name");
		getFile(file_id, filename);			
	});

    $('.remove_file').on('click', function() {
        var file_id = $(this).attr("id");
        if(confirm('Are you sure you want to delete this file?'))
        {
            requestFileDelete(file_id);
        }
    });
}

function getFileIDList() 
{
    // Create a list with id's to compare to the 
    var filelist = [];
    $('#files > div').each(function() {
        filelist.push($(this).attr('id'));
    });

    return filelist;
}

function requestFileDelete(file_id)
{
    $.ajax({
        url: '?controller=file&action=delete',
        data: {id: file_id}
    })
    .done(function(response) {
        updateFiles();
        showSuccess('File deleted');
    });
}

function target_changed(evt) 
{
    if($(this).val() == "myself") {
        $('#friend_list').hide();
    } else {
        $('#friend_list').show();
    }
}

async function encryptUserFile(filedata) 
{
    var filename = $('#file_name').val();
    var username = $('#email').html().trim();
    var target = $('#target_me').prop("checked") ? 'me' : 'friends';

    if(target == 'friends') 
    {
        // Check if we actually have any friends selected, else abort
        var parameters = '';
        var userlist = [];
        var friend_options = [];

        $('#friend_select > option').each(function() {
            friend_options.push($(this).val());
        });

        $('.inner').children('li').each(function () {
            if($(this).hasClass('selected')) {
                var org_index = $(this).data('original-index');
                var friend_id = friend_options[org_index];
                console.log(friend_id + ' selected ');


                var friend = new Object();
                friend.id = friend_id;
                friend.public_key = null;

                userlist.push(friend);

                parameters += '&friend_ids[]='+friend_id;
            }
        });

        if(userlist.length <= 0) 
        {
            showError('No friends selected');
            return;
        }

        startLoading();
        encryptUsingFriendKeys(filename, filedata, userlist, parameters);
    } else {
         // Get the public key from the user that the file is to be sent to. (For now ourselfs only)
        await g_keyStore.open();

        var keyPair = await g_keyStore.getKey("name", username);

        var myUserList = [{id: 0, public_key: keyPair.publicKey}];

        startLoading();
        encryptAndUploadFile(filename, filedata, myUserList);
    }
}

async function encryptUsingFriendKeys(filename, filedata, userlist, parameters)
{
    // We need to fetch all of the public keys and import them before we can encrypt with them...
    // Send request for friends blobs
    var request = new XMLHttpRequest();
    request.responseType = 'arraybuffer';

    request.friendCount = userlist.length;

    request.onreadystatechange = async function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                try
                {
                    // The blobs are returned in the same order as the id's were passed in
                    var blobs = parseResponseBlobs(request.response, request.friendCount);
                    for(var i = 0; i < request.friendCount; ++i) {
                        // Import the blob into a public key, then add it to the list
                        userlist[i].public_key = await g_Crypt.subtle.importKey("spki", blobs[i], {
                            name: 'RSA-OAEP',
                            modulusLength: 2048,
                            publicExponent: new Uint8Array([1, 0, 1]),  // 24 bit representation of 65537
                            hash: {name: "SHA-256"}
                            }, true, ["encrypt"]);
                    }

                    encryptAndUploadFile(filename, filedata, userlist);
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

async function encryptAndUploadFile(filename, filedata, userarray)
{
    // Generate bulk crypto key and iv.
	const encKey = await g_Crypt.subtle.generateKey({name: "AES-CBC", length: 256}, true, ["decrypt", "encrypt"]);
	var iv = g_Crypt.getRandomValues(new Uint8Array(16));

    loading(10);

	// Encrypt filedata with the bulk key
    const cryptData = await g_Crypt.subtle.encrypt({name: "AES-CBC", iv: iv}, encKey, filedata.data);
    var crypt_blob  = new Blob([cryptData], {type: "application/octet-stream"});

    loading(10);

    // Export bulk key
    var exported_key    = await g_Crypt.subtle.exportKey("raw", encKey);

    // Upload file
    var formData = new FormData();
    formData.append("filename", filename);
    formData.append("type", filedata.type);
    formData.append('data', crypt_blob, 'data');

    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                var file_id = request.responseText;
                var loadingPerUser = loadingLeft() / userarray.length;
                for(var i = 0; i < userarray.length; ++i) {
                    encryptAndUploadKeysIV(userarray[i].id, userarray[i].public_key, file_id, exported_key, iv);
                    loading(loadingPerUser);
                }
                updateFiles();
                endLoading();
            } else if(request.status == 500) {
                showError(request.responseText);
            }
         }
    }

    request.open('POST', '?controller=file&action=add', true);
    request.send(formData);

    loading(10);
    // When done call 'encryptAndUploadKeysIV' with returned file id
}

async function encryptAndUploadKeysIV(user_id, public_key, file_id, key, iv)
{
    // Encrypt iv and key using the users public key
	const encryptedIV   = await g_Crypt.subtle.encrypt({name: "RSA-OAEP"}, public_key, iv);
    const encryptedKey  = await g_Crypt.subtle.encrypt({name: "RSA-OAEP"}, public_key, key);

    var iv_blob     = new Blob([encryptedIV], {type: "application/octet-stream"});
    var key_blob    = new Blob([encryptedKey], {type: "application/octet-stream"});

    // Upload the encrypted iv and key to the server.	
	var formData = new FormData();
    formData.append("file_id", file_id);
    formData.append("reciever_id", user_id);
    formData.append("iv", iv_blob, 'iv');
    formData.append("key", key_blob, 'key');
   
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                showSuccess("Encrypted file uploaded");
            } else if(request.status == 500) {
                showError(request.responseText);
            }
         }
    }

    request.open('POST', '?controller=file&action=addEncryptedKeyIV', true);
    request.send(formData);
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