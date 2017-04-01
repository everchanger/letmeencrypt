function encryptFile(publicKey, filedata, filename) {
	var Crypt = window.crypto || window.msCrypto;
	
	// generate IV's and the bulk crypto alg, store the original extenstion of the file in the encrypted file 
	// also store an id string to let us know this is a file we can encrypt.
	// Encrypt the file contents with the bulk crypto, encrypt the IV's with the public key.
	
	// Encrypted file layout
	
	/*
		IV_START
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

	const encKey = await Crypt.subtle.generateKey(
					{name: "AES-CBC", length: 256}, 
					true, 
					["encrypt", "decrypt"]
					);
					
	var iv = Crypt.getRandomValues(new Uint8Array(16));
    Crypt.subtle.encrypt({name: "AES-CBC", iv: iv}, encKey, filedata);
}

function decryptFile(privateKey, filedata, filename) {
	// Find the IV_START tag, read until ID_START tag, try to decrypt the IV's with the private key.
	// Use the IV's to do a decryption, check if the first data before the EXT_START tag is ID_STRING
}