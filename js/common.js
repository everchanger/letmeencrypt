g_keyStore = new KeyStore();

if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
    window.crypto.subtle = window.crypto.webkitSubtle;
}

var g_Crypt = window.crypto || window.msCrypto;

$(document).on('change', ':file', function() {
var input = $(this),
	numFiles = input.get(0).files ? input.get(0).files.length : 1,
	label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	input.trigger('fileselect', [numFiles, label]);
});

$(document).ready(function() {	
	try 
	{
		compabilityCheck();
	} 
	catch(e) 
	{
		showError("Your browser is missing functionallity to run this page correctly");
		return;
	}


	$('#sign-in-button').on('click', function() {
		// This is not as shady as it looks, we stored the users password temporary to be able to decrypt the private key!
		localStorage.setItem("userPassword", $('#user-password').val());
	});

	$('.selectpicker').selectpicker();

	if($('#friend-search')) {
		$('#friend-search').typeahead({
        autoSelect: true,
        minLength: 2,
        delay: 400,
        source: function (query, process) {
            $.ajax({
                url: '?controller=user&action=find',
                data: {query: query},
                dataType: 'json'
            })
			.done(function(response) {
				return process(response);
			});
        },
		updater: function (item) {
			window.location = '?controller=user&action=profile&id='+item.id;
			return item;
		}
    });}
				
	$(':file').on('fileselect', function(event, numFiles, label) {
		var input = $(this).parents('.input-group').find(':text'),
		log = numFiles > 1 ? numFiles + ' files selected' : label;

		if( input.length ) {
			input.val(log);
		} else {
			if( log ) alert(log);
		}

	});

	if($('#email').html().trim().length > 0) 
	{
		try{
			loadUserKeys();
		}
		catch(e) 
		{
			alert(e);
		}
	}

	if($('#clear_loaded_keys')) {
		$('#clear_loaded_keys').on('click', function() {
		// This is not as shady as it looks, we stored the users password temporary to be able to decrypt the private key!
		deleteKeys();
	});
	}
});

async function deleteKeys() 
{
	await g_keyStore.open();

    var username = $('#email').html().trim();

	try 
	{
		await g_keyStore.deleteKey(username);
		$('#public_key_loaded').removeClass('glyphicon-ok-circle');
		$('#public_key_loaded').addClass('glyphicon-remove-circle');
        
		$('#private_key_loaded').removeClass('glyphicon-ok-circle');
		$('#private_key_loaded').addClass('glyphicon-remove-circle');
    				
		showSuccess("Deleted loaded keys");
	}
	catch(e) 
	{
		showError("Failed to delete user keys: "+e);
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
                    $('#private_key_loaded').removeClass('glyphicon-remove-circle');
                    $('#private_key_loaded').addClass('glyphicon-ok-circle');
                } 
                if(list[i].value.publicKey) {
                    $('#public_key_loaded').removeClass('glyphicon-remove-circle');
                    $('#public_key_loaded').addClass('glyphicon-ok-circle');
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

        $('#public_key_loaded').removeClass('glyphicon-remove-circle');
        $('#public_key_loaded').addClass('glyphicon-ok-circle');
        $('#private_key_loaded').removeClass('glyphicon-remove-circle');
        $('#private_key_loaded').addClass('glyphicon-ok-circle');
        
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

var loading_goal = 0;
function startLoading()
{
	$('#loading-bar').removeClass('paused');
	$('#loading-bar').addClass('running');
	$('#loading').show();
	$('#loading').width("1%");

	loading_goal = 1;
}

function loading(progress)
{
	loading_goal += progress; 
	
	if(loading_goal > 100) {
		loading_goal = 100;
	}

	$('#loading').animate({width:(loading_goal + "%")}, 75);
}

function loadingLeft()
{
	return 100 - loading_goal;
}

function endLoading()
{
	$('#loading-bar').removeClass('running');
	$('#loading-bar').addClass('paused');
	loading(100);
	$('#loading').delay(1500).slideUp();
}

function compabilityCheck() 
{
	if(!window.crypto && !window.msCrypto )
	{
		throw new Error("No crypto object availible");
	}

	if(!window.indexedDB) 
	{
		throw new Error("No indexedDB object availible");
	}
}

function readDataFromFileInput(files, callback) {
	if(files.length <= 0) {
		return;
	}
	
	var file = files[0];
	var fileContent = { data:null, type:null };

	if(file.type && typeof file.type != 'undefined') 
	{
		fileContent.type = file.type;
	}
	
	
	var reader = new FileReader();
	reader.onloadend = handleReadDone(fileContent, callback);
	reader.onload = (function(output) { return function(e) { 
		output.data = e.target.result; 
	}; })(fileContent);
	reader.readAsArrayBuffer(file);
}

function handleReadDone(input, callback) {
	return function(e) { 
		callback(input); 
	};	
}

function readKeyFromInput(keys) {
	if(keys.length <= 0) {
		return;
	}
	
	var key = keys[0];
	var outputArea = $('#output');
	
	var reader = new FileReader();
    reader.onload = (function(output) { return function(e) { output.val(ab2str(e.target.result)); }; })(outputArea);
    reader.readAsArrayBuffer(key);
}

function saveBinaryDataAs(data, filename) {
	saveAs(new Blob([data], {type: "example/binary"}), filename);	
}

function findArrayInArray(haystack, needle, startOffset = 0)
{
    var foundPos = -1;
    var matched = 0;

	if(startOffset >= haystack.length || needle.length > haystack.length) 
	{
		return -1;
	}

    for(var i = 0 + startOffset; i< haystack.length; i++)
    {
        if(haystack[i] == needle[matched]) 
        {
            if(matched == 0) 
            {
                foundPos = i;
            }

            matched++;
            if(matched == needle.length)
            {
                break;
            }
        } 
        else
		{
            matched = 0;
            foundPos = -1;
        }
    }

    return foundPos;
}

function parseResponseBlobs(responseBlob, numberOfBlobs)
{
     // We will recieve a blob containing 'sub-blobs'
    var tmp = new Uint8Array(responseBlob);
    var blobs = Array();
                
    var splitter = new Uint8Array([95,45,124,45,95]);

    var startPos = 0;
    var pos = 0;
    for(var i = 0; i < numberOfBlobs-1; ++i) 
    {
        var pos = findArrayInArray(tmp, splitter, startPos);
        if(pos == -1) {
            throw new Error('No more blob entries found while looking!');
        }

        blobs.push(tmp.slice(startPos, pos));        
        startPos = pos+splitter.length
    }

	if(numberOfBlobs > 1) {
		var lastBuff = tmp.slice(pos+splitter.length);
    	blobs.push(tmp.slice(pos+splitter.length));
	} else {
		blobs.push(tmp);
	}
	

    return blobs;
}
