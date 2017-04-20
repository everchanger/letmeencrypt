/// <reference path="jquery.d.ts" />
/// <reference path="keystore_new.ts" />

$(document).ready(function(){
    g_KeyStore.open();
    //g_KeyStore.clearDB();

    generateKeyTest()
});

async function generateKeyTest() 
{
     const keyPair: CryptoKeyPair = await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),  // 24 bit representation of 65537
                hash: {name: "SHA-256"}
            },
            true,  // Cannot extract new key
            ['encrypt','decrypt']
        );

    g_KeyStore.storeKey(keyPair.publicKey, keyPair.privateKey, "test");
}