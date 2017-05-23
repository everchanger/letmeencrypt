var usingKeyPassword = false;
var usingKeyLocal = false;

$(document).ready(function() 
{
    $('#register').on('submit', handleRegistration);

    $('input[type=radio][name=key_choice]').change(function() {
        if(this.id != 'opt0') {
            usingKeyPassword = true;
            $('#key_password1').attr('required', true);
            $('#key_password2').attr('required', true);
            $('#key_passwords').show();
        } else {
            usingKeyPassword = false;
            $('#key_password1').attr('required', false);
            $('#key_password2').attr('required', false);
            $('#key_passwords').hide();
        }

        if(this.id == 'opt2') {
            usingKeyLocal = true;
        } else {
            usingKeyLocal = false;
        }
    });
});

async function handleRegistration(evt) {
    evt.preventDefault();

    startLoading();

    // Generate a keypair, export the public and private key to a format we can POST then submit the form with the keypair.
    var user_email = $('#register_email').val();
    var pairName = user_email;
    try
    {
        var keyPair = await generateKeyPair(pairName);
        loading(25);
    }
    catch(e)
    {
        showError("Failed to generate a keypair: "+e);
        endLoading();
        return;
    }
    
    var password    = $('#register_password1').val();
    var password2   = $('#register_password2').val(); 

    if(password != password2) {
        showError("Passwords doesn't match");
        endLoading();
        return;
    }

    var key_password = password;
    var keypassword1  = $('#key_password1').val();
    var keypassword2 = $('#key_password2').val(); 

    if(usingKeyPassword) 
    {
        if(keypassword1 != keypassword2) {
            showError("Key passwords doesn't match");
            endLoading();
            return;
        }

        key_password = keypassword1;
    }

    localStorage.setItem("userPassword", key_password);

    try
    {
        var public_key = await g_Crypt.subtle.exportKey("spki", keyPair.publicKey);
        var public_blob = new Blob([public_key], {type: "application/octet-stream"});

        loading(15);
    
        var private_key =  await g_Crypt.subtle.exportKey("pkcs8", keyPair.privateKey);

        loading(15);

        var encryptedOutput = await encryptPrivateKey(private_key, key_password);

        loading(25);
        
        var private_blob = null;
        var iv_blob = null;
        var file_blob = null;

        if(usingKeyLocal) 
        {
            file_blob = new Blob([encryptedOutput.IV, encryptedOutput.encryptedKey], {type: "application/octet-stream"});
        } 
        else 
        {
            private_blob = new Blob([encryptedOutput.encryptedKey], {type: "application/octet-stream"});
            iv_blob = new Blob([encryptedOutput.IV], {type: "application/octet-stream"});
        }
    }
    catch(e)
    {
        showError("Failed to generate a keypair: "+e);
        endLoading();
        return;
    }
    
    loading(10);

    // Let the user decide if he/she wants to download a copy of the private key.
    if(usingKeyLocal) 
    {
        // Need to sqeeze private_blob and iv_blob into a single blob, then save that blob to a file for the user to keep
        saveBinaryDataAs(file_blob, user_email.substring(0, user_email.indexOf('@'))+'.private_key');
    }
    
    var formData = new FormData();
    formData.append("email", user_email);
    formData.append("password1", password);
    formData.append("password2", password2);
    formData.append('public_key', public_blob, 'public');

    if(usingKeyLocal == false) 
    {
        formData.append('private_key', private_blob, 'private');
        formData.append('private_iv', iv_blob, 'private_iv');
    }
    
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
         if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                endLoading();
                window.location = "?controller=user&action=show";
            } else if(request.status == 500) {
                showError(request.responseText);
                endLoading();
                return;
            }
         }
    }

    request.open($('#register').attr('method'), $('#register').attr('action'), true);
    request.send(formData);

    loading(5);
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