g_storedPairs = [];
g_keyStore = new KeyStore();

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
	
	// Check if we have a function to run on this page!
	if (typeof OnReady == 'function') { 
		OnReady();
	}	
});

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
	
	return keyPair;
}

async function encrypt_decrypt(keyPair) {
	var Crypt = window.crypto || window.msCrypto;
	
	const ptUtf8 = new TextEncoder().encode('my plaintext');
	console.log(ptUtf8);	
	
	const ctBuffer = await Crypt.subtle.encrypt({name: "RSA-OAEP"}, keyPair.publicKey, ptUtf8);	
	
	console.log(ab2str(ctBuffer));
	
	const plainText = await Crypt.subtle.decrypt({name: "RSA-OAEP"}, keyPair.privateKey, ctBuffer);

	console.log(ab2str(plainText));		
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
			console.log(exportedKey);
					
			saveAs(new Blob([exportedKey], {type: "example/binary"}), "data.dat");
		})		
	})	
}

function getPrivateKey() {
	var file = new File(["Hello, world!"], "hello world.txt", {type: "text/plain;charset=utf-8"});
	saveAs(file);
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