<div class="col-xs-12">
	<ul class="faq-list">
		<li>
			<p class="question">What is this?</p>
			<p class="answer">This is a try to create a secure file transfer without an native client.</p>
		</li>
		<li>
			<p class="question">How does it work?</p>
			<p class="answer">The service uses asymmetrical encryption to encrypt files. Then the files get uploaded to our server to make sharing files with friends safe and easy.</p>
		</li>
		<li>
			<p class="question">Hold up, what exactly is being uploaded to your server?</p>
			<p class="answer">We store your encrypted files and your encrypted private key, that's it, no plaintext files! All sensitive data that's being sent to the server is encrypted by your browser before leaving your device!</p>
		</li>
		<li>
			<p class="question">How are the encryption actually done?</p>
			<p class="answer">When you create an account you get to create your keypair, these two keys are used to encrypt and decrypt files for you.
			The keypair consists of a public key and a private key. The public key is used by others to encrypt files for you while the private key is used to decrypt files.</p>
		</li>
		<li>
			<p class="question">How is my private key stored?</p>
			<p class="answer">This is up to you to decide. We have a couple of different ways to store your key:</p>
			<p class="answer"><span class="option">Option 1)</span> We store the key on the server, encrypted with your password. This enables you to use the application from any computer BUT if our server got compromised an attacker may be able to brute force your password and gain access to your account and private key.</p>
			<p class="answer"><span class="option">Option 2)</span> Again we store the key on the server, but you get to set another password for your private key! This means that the attacker can gain access to your account but your private key is a lot more safe!</p>
			<p class="answer"><span class="option">Option 3)</span> You store the key. Keep it on your harddrive, your Dropbox or a usb drive. You will have to load the private key when you want to use it to decrypt your files. A little more hastle but safe if the server is compromised</p>			
		</li>
	</ul>
</div>