const IV_END = new TextEncoder().encode('iv_end');

async function encryptFile(publicKey, filedata, filename) {
	var Crypt = window.crypto || window.msCrypto;
	
	// generate IV's and the bulk crypto alg, store the original extenstion of the file in the encrypted file 
	// also store an id string to let us know this is a file we can encrypt.
	// Encrypt the file contents with the bulk crypto, encrypt the IV's with the public key.
	
	// Encrypted file layout
	
	/*
		[ENCRYPTED_WITH_PUB_KEY_IV]
		IV_END
		[BULK_CRYPT_DATA]
		
		[BULKBULK_CRYPT_DATA SPECIFIED]
		[ID_STRING]
		EXT_START
		[FILE_EXT]
		DATA_START
		[DATA]
	*/
	
	// Generate bulk crypto key and iv.
	const encKey = await Crypt.subtle.generateKey({name: "AES-CBC", length: 256}, true,	["encrypt", "decrypt"]);
	var iv = Crypt.getRandomValues(new Uint8Array(16));
	
	// Encrypt filedata with the bulk key
    const cryptData = await Crypt.subtle.encrypt({name: "AES-CBC", iv: iv}, encKey, filedata);
	
	// Encrypt iv using the users public key
	const encryptedIV = await Crypt.subtle.encrypt({name: "RSA-OAEP"}, publicKey, iv);
	
	// Create destination buffer, this will be returned.	
	var tmp = new Uint8Array(cryptData.byteLength+encryptedIV.byteLength+IV_END.length);
	tmp.set(new Uint8Array(encryptedIV), 0);
	tmp.set(new Uint8Array(IV_END), encryptedIV.byteLength);
	tmp.set(new Uint8Array(cryptData), IV_END.byteLength);
	
	return tmp;
}

async function decryptFile(privateKey, buffer, filename) {
	var Crypt = window.crypto || window.msCrypto;
	// Find the IV_START tag, read until ID_START tag, try to decrypt the IV's with the private key.
	// Use the IV's to do a decryption, check if the first data before the EXT_START tag is ID_STRING
	
	var dv = new DataView(buffer);
	var tmp = new Uint8Array(buffer.byteLength);
	tmp.set(new Uint8Array(buffer), 0);
	
	var index = findInData(tmp, IV_END, 0);
	if(index == -1) {
		return -1;		
	}
	
	var encryptedIV = new Uint8Array(index);
	encryptedIV.set(tmp.slice(0, index));
	
	// Encrypt iv using the users public key
	const iv = await Crypt.subtle.decrypt({name: "RSA-OAEP"}, privateKey, encryptedIV);
	
	/*.then(function(decryptedData) {
			const plaintext = new TextDecoder().decode(decryptedData);
			alert('message contained:\n'+plaintext);			
		}).catch(function(e) {
  console.log(e); // "oh, no!"
});*/
	
	alert(iv);
}

function findInData(haystack, needle, origin) {
	var found = -1;
	var old_found = -1;
	var current_start_index = -1;
	var searchIndex = 0;
	for(var i=0;i<needle.length;i++) {
		found = haystack.indexOf(needle[i], origin+searchIndex);		
		if(found == -1) {
			if(current_start_index+1 < haystack.byteLength) {
				i = 0;
				searchIndex = current_start_index+1;
				old_found = -1;
				current_start_index = -1;
				continue;
			}
			return -1;
		} else {
			if(current_start_index == -1) {
				current_start_index = found;
			}
			
			if(old_found != -1) {
				if(old_found != found - 1) {
					// not next to eachother.
					i = 0;
					searchIndex = current_start_index+1;
					old_found = -1;
					current_start_index = -1;
					continue;
				}				
			}
			
			searchIndex = found;
			old_found = found;			
		} 
	}
	
	return current_start_index-1;
}