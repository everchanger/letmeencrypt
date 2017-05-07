g_storedPairs = [];
g_keyStore = new KeyStore();

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

	$('#close-message-btn').on('click', closeMessage);

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
			window.confirm("Do you want to add "+item.name +" as a friend?");
			return item;
		}
    });
	}
		
	g_keyStore.open().then(function() {
		
		g_keyStore.listKeys().then(function(list) {
			if(list == null)  {
				return;
			}
			
			g_storedPairs = list;
			
			for(var i=0;i<g_storedPairs.length;i++) {
				$("#key_selector").append($("<option></option>").attr("value",g_storedPairs[i].value.name).text(g_storedPairs[i].value.name));	
			}
			
			if($("#key_selector option").length > 1) {
				$("#key_selector option")[0].remove();
				$("#key_selector").prop('disabled', false);	
					
				$("#get_public").prop('disabled', false);
				$("#get_private").prop('disabled', false);
				$("#clear_DB").prop('disabled', false);				
			}
		})
	})
	
	
	
	$(':file').on('fileselect', function(event, numFiles, label) {
		var input = $(this).parents('.input-group').find(':text'),
		log = numFiles > 1 ? numFiles + ' files selected' : label;

		if( input.length ) {
			input.val(log);
		} else {
			if( log ) alert(log);
		}

	});
	
	$('#generate_key_pair').on('click', generateKey);
	$('#get_public').on('click', getPublicKey);
	$('#get_private').on('click', getPrivateKey);
	$('#clear_DB').on('click', clearDB);
	$('#test_encrypt').on('click', testEncryptFile);
	
	$('#encrypt_text').on('click', function() {
		var cleartext = $('#cleartext').val();
		encrypt(cleartext);
	});
	$('#decrypt_file').on('click', function() {
		var files = $('#encrypted_files').prop("files");
		readDataFromFileInput(files, decrypt);			
	});
	
	// Check if we have a function to run on this page!
	if (typeof OnReady == 'function') { 
		OnReady();
	}	
});

function showSuccess(successText) 
{
	showMessage(successText, 'panel-success');
}

function showError(errorText) 
{
	showMessage(errorText, 'panel-danger');
}

function showWarning(warningText)
{
	showMessage(warningText, 'panel-warning');
}

function showMessage(message, panelType) 
{
	if(message.length > 128)
	{
		message = message.substr(0, 125);
		message += '...';
	}

	$('#message_field').removeClass('panel-success');
	$('#message_field').removeClass('panel-warning');
	$('#message_field').removeClass('panel-danger');

	$('#message_field').addClass(panelType);

	$("html, body").animate({ scrollTop: 0 }, "fast");
	$('#message_field').slideDown(400, function(){
		$('#user_message').text(message);
		console.log(message);
	});
}

function startLoading()
{
	$('#loading-bar').width("1%");
}

function loading(progress)
{
	var percentages_done = $('#loading-bar').width()  / $('#loading-bar').parent().width() * 100;;
	$('#loading-bar').width(percentages_done + progress + "%");
}

function endLoading()
{
	$('#loading-bar').width("0%");
}

function closeMessage()
{
	$('#message_field').slideUp(400, function(){	
	});
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

async function generateKey() 
{
	var Crypt = window.crypto || window.msCrypto;

	var pairName = $("#new_pair_name").val();
	
	if(pairName == "" || pairNameExists(pairName)) {
		return 0;
	}
	
	const keyPair = await Crypt.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),  // 24 bit representation of 65537
                hash: {name: "SHA-256"}
            },
            true,  // Cannot extract new key
            ['encrypt','decrypt']
        );
		
	g_keyStore.storeKey(keyPair.publicKey, keyPair.privateKey, pairName);
	
	location.reload();
	
	return keyPair;
}

async function clearDB() {
	if(!confirm('Are you sure you want to clear the key DB?')) {
		return;		
	}
	
	g_keyStore.clearDB();
	
	location.reload();
	
	return;
}

async function testEncryptFile() {
	var Crypt = window.crypto || window.msCrypto;
	
	var pairName = $("#key_selector").val();
	
	if(pairName == "" || !pairNameExists(pairName)) {
		return 0;
	}
	
	g_keyStore.getKey("name", pairName).then(function(keyPair) {		
		const ptUtf8 = new TextEncoder().encode('hello world');
		encryptFile(keyPair.publicKey, ptUtf8, 'foo').then(function(encryptedData) {
			saveBinaryDataAs(encryptedData, 'message.enc');			
		});
	});	
}

async function testDecryptFile(cryptFile) {
	var Crypt = window.crypto || window.msCrypto;
	
	var pairName = $("#key_selector").val();
	
	if(pairName == "" || !pairNameExists(pairName)) {
		return 0;
	}
	
	g_keyStore.getKey("name", pairName).then(function(keyPair) {		
		decryptFile(keyPair.privateKey, cryptFile, 'foo').then(function(decryptedData) {
			 console.log('decrypted: '+decryptedData);			
		});
	});	
	
}

async function encrypt(message) {
	var Crypt = window.crypto || window.msCrypto;
	
	var pairName = $("#key_selector").val();
	
	if(pairName == "" || !pairNameExists(pairName)) {
		return 0;
	}
	
	g_keyStore.getKey("name", pairName).then(function(keyPair) {		

		const ptUtf8 = new TextEncoder().encode(message);
	
		Crypt.subtle.encrypt({name: "RSA-OAEP"}, keyPair.publicKey, ptUtf8).then(function(encryptedData){
			saveBinaryDataAs(encryptedData, 'message.enc');
		});				
	});	
}

async function decrypt(cryptText) {
	var Crypt = window.crypto || window.msCrypto;
	var pairName = $("#key_selector").val();
	
	if(pairName == "" || !pairNameExists(pairName)) {
		return 0;
	}
	
	g_keyStore.getKey("name", pairName).then(function(keyPair) {		
		Crypt.subtle.decrypt({name: "RSA-OAEP"}, keyPair.privateKey, cryptText).then(function(decryptedData) {
			const plaintext = new TextDecoder().decode(decryptedData);
			alert('message contained:\n'+plaintext);			
		});
	});			
}

async function useKey(pairName) {
	if(pairName == "") {
		return 0;
	}
	
	g_keyStore.getKey("name", pairName).then(function(keyPair) {		
		encrypt_decrypt(keyPair);
	})	
}

function pairNameExists(pairName) {
	for(var i=0;i<g_storedPairs.length;i++) {
		if(g_storedPairs[i].value.name == pairName) {
			return true;
		}				
	}	
	
	return false;
}

function readDataFromFileInput(files, callback) {
	if(files.length <= 0) {
		return;
	}
	
	var file = files[0];
	var fileContent = { data:null };
	
	var reader = new FileReader();
	reader.onloadend = handleReadDone(fileContent, callback);
	reader.onload = (function(output) { return function(e) { output.data = e.target.result; }; })(fileContent);
	reader.readAsArrayBuffer(file);
}

function handleReadDone(input, callback) {
	return function(e) { 
		callback(input.data); 
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

async function getPublicKey() {
	var Crypt = window.crypto || window.msCrypto;
	var pairName = $("#key_selector").val();
	
	if(pairName == "" || !pairNameExists(pairName)) {
		return 0;
	}
	
	g_keyStore.getKey("name", pairName).then(function(keyPair) {		
		Crypt.subtle.exportKey("spki", keyPair.publicKey).then(function(exportedKey) {		
			saveBinaryDataAs(exportedKey, pairName+".pub_key");
		})		
	})	
}

function getPrivateKey() {
	var Crypt = window.crypto || window.msCrypto;
	var pairName = $("#key_selector").val();
	
	if(pairName == "" || !pairNameExists(pairName)) {
		return 0;
	}
	
	g_keyStore.getKey("name", pairName).then(function(keyPair) {		
		Crypt.subtle.exportKey("pkcs8", keyPair.privateKey).then(function(exportedKey) {		
			saveBinaryDataAs(exportedKey, pairName+".priv_key");
		})		
	})	
}

function saveBinaryDataAs(data, filename) {
	saveAs(new Blob([data], {type: "example/binary"}), filename);	
}

function ajaxUploadFile(elm, callback) {
	var formID = '#' + elm.id;
	var form = $(formID);
	
	$.ajax ({
		type: 'POST',
		url: form.attr('action'),
		data: new FormData(form[0]),
		mimeType:"multipart/form-data",
		processData: false,
		contentType: false,
		success: function (data) {
			callback(formID, data);
		},
		error: function(jqXHR, textStatus, errorThrown) 
		{
			console.log(jqXHR.status, textStatus, errorThrown);     
		}
	});
	
	form.preventDefault();
}

function submitAndRedirect(formName, redirectUrl) {
	formName = '#' + formName;
	var form = $(formName);
	// what if we were to send a url we want the server to respond with, we could then just submit the form without ajax, we simply set the url in a hidden field and then submit the form, the server will look at the hidden form and send us to that page.
	form.append('<input type="hidden" name="url_redirect" value="'+redirectUrl+'" />');
	form.submit();
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
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

    blobs.push(tmp.slice(pos+splitter.length));

    return blobs;
}