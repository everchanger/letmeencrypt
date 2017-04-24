# Let Me Encrypt
A small and modern web app to make encryption available for everyone!

The server runs on Apache and MySQL.
The client uses the SubtleCrypto interface for cryptologic operations.

## Planned features

- Encryption/decryption of files using asymmetrical algorithms.
- Generation of public and private keys. 
- Storing of encrypted files.
- Uploading encrypted files directly to the person the public key belongs to.
- Groups, encrypt and send files to large groups of friends and family.
- Different modes of storing the private key depending of level of security/ease of use.
  - Store the private key encrypted with the user's password and another copy encrypted with a server secret. Storing the private key this way enables us to help the user with resetting a password without losing access to all encrypted files.
  - Store the private key encrypted with the user's password in the server database, this makes retrieving the key easier when used from multiple computers or devices. If a user forgets his/her password all files already encrypted will not be able to be decrypted.
  - Let the user store the private key and load it when needed in the client. This option is the most secure, the private key never leaves the client. The user is responsible for storing the private key securely.
