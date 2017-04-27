var g_publicBlob = null;
var g_privateBlob = null;

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

    if(g_publicBlob && g_privateBlob) 
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

            var crypto_private_key  = await g_Crypt.subtle.importKey("pkcs8", g_privateBlob, {
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
            console.log('Error in keyLoaded: '+e);
        }
    }
}

async function encryptUserFile(file) 
{
	var Crypt = window.crypto || window.msCrypto;
	
	console.log(file);
}