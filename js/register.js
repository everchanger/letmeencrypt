function OnReady() 
{
    $('#register').on('submit', handleRegistration);
}

async function handleRegistration(evt) {
    evt.preventDefault();

    // Generate a keypair, export the public and private key to a format we can POST then submit the form with the keypair.
    var user_email = $('#register_email').val();
    var pairName = user_email;
    var keyPair = await generateKeyPair(pairName);
	if(keyPair == null) {
        return "Error";
    }

    var password    = $('#register_password1').val();
    var password2   = $('#register_password2').val(); 

    if(password != password2) {
        return "Error";
    }

    var public_key = await g_Crypt.subtle.exportKey("spki", keyPair.publicKey);
    var public_blob = new Blob([public_key], {type: "application/octet-stream"});
   
    var private_key =  await g_Crypt.subtle.exportKey("pkcs8", keyPair.privateKey);
    var encryptedOutput = await encryptPrivateKey(private_key, password);

    var private_blob = new Blob([encryptedOutput.encryptedKey], {type: "application/octet-stream"});
    var iv_blob = new Blob([encryptedOutput.IV], {type: "application/octet-stream"});

    // Let the user decide if he/she wants to download a copy of the private key.
    saveBinaryDataAs(private_key, user_email.substring(0, user_email.indexOf('@'))+'.private_key');
   
    var formData = new FormData();
    formData.append("email", user_email);
    formData.append("password1", password);
    formData.append("password2", password2);
    formData.append('public_key', public_blob, 'public');

    // We should not send/store the private key unencrypted. If we store it we should encrypt it somehow, maybe with the users password?
    formData.append('private_key', private_blob, 'private');
    formData.append('private_iv', iv_blob, 'private_iv');
    
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

    request.open($('#register').attr('method'), $('#register').attr('action'), true);
    request.send(formData);
}

async function generateKeyPair(pairName) 
{
	const keyPair = await g_Crypt.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),  // 24 bit representation of 65537
            hash: {name: "SHA-256"}
        },
        true,
        ['encrypt','decrypt']
    );

	return keyPair;
}

async function encryptPrivateKey(privateKey, password) 
{
    // Encrypt the users private key with the users password.
    const pwUtf8 = new TextEncoder().encode(password);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8); 

    const iv = g_Crypt.getRandomValues(new Uint8Array(12));
    const alg = { name: 'AES-GCM', iv: iv };
    const key = await g_Crypt.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);

    const ctBuffer = await g_Crypt.subtle.encrypt(alg, key, privateKey);

    var completeObject = {encryptedKey: ctBuffer, IV: iv};

    return completeObject;
}