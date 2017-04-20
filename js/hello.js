/// <reference path="jquery.d.ts" />
/// <reference path="keystore_new.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
$(document).ready(function () {
    g_KeyStore.open();
    //g_KeyStore.clearDB();
    generateKeyTest();
});
function generateKeyTest() {
    return __awaiter(this, void 0, void 0, function* () {
        const keyPair = yield window.crypto.subtle.generateKey({
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: { name: "SHA-256" }
        }, true, // Cannot extract new key
        ['encrypt', 'decrypt']);
        g_KeyStore.storeKey(keyPair.publicKey, keyPair.privateKey, "test");
    });
}
