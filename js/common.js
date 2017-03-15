keyStore = new KeyStore();

$(document).ready(function() {	
	keyStore.open().then(function() {
		keyStore.getKey("name", "myTestPair").then(function(keyPair) {
			if(keyPair == null)  {
				keyPair = generateKey();
			}
			
			console.log(keyPair.name);	
			encrypt_decrypt(keyPair);
		})
	})
	
	// Check if we have a function to run on this page!
	if (typeof OnReady == 'function') { 
		OnReady();
	}	
});

async function generateKey() {
	var Crypt = window.crypto || window.msCrypto;
	
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
		
	keyStore.storeKey(keyPair.publicKey, keyPair.privateKey, "myTestPair");
	
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