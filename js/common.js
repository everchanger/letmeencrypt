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

function showError(errorText) {
	$('#main_navbar').addClass('no-margin');
	$('#error_field').removeClass('hidden');
	$('#error_message').text(errorText);
}

async function generateKey() {
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