<div class="col-xs-12">
	<div class="row">
		<div class="col-xs-6">
			<form class="">
				<h3>Generate Keys</h3>
				<div class="input-group">
					<input class="form-control" type="text" id="new_pair_name" placeholder="Enter a descriptive name for your keypair">
					<span class="input-group-btn">
						<button class="btn btn-primary" id="generate_key_pair" type="button">Generate</button>
					</span>
				</div>
				<p class="help-block">Generate a key pair and hold onto the private key! The public key is uploaded to the server.</p>
			</form>
		</div>
		<div class="col-xs-6">
			<form class="">
				<h3>Load private key</h3>
				<div class="input-group">
					<label for="private_key" class="input-group-btn">
						<span class="btn btn-primary">Browse
							<input type="file" id="private_key" accept="privateKey" onchange="readKeyFromInput(this.files)" class="hidden">
						</span>
					</label>
					<input type="text" class="form-control" readonly="">
				</div>
				<p class="help-block">Your private key will not be submited to the server only used localy by javascript to decrypt your files for you.</p>
			</form>
		</div>
	</div>
	<div class="row">
		<div class="col-xs-6">
			<h3>Stored keys</h3>
			<div class="form-group">
				<select class="form-control" id="key_selector" disabled>
					<option value="none">No keys loaded</option>
				</select>
			</div>
			<div class="form-group">
				<button id="clear_DB" class="btn btn-danger" disabled><span class="glyphicon glyphicon-download"></span> Clear loaded keys</button>
				<button id="get_public" class="btn btn-primary" disabled><span class="glyphicon glyphicon-download"></span> Public key</button>
				<button id="get_private" class="btn btn-primary" disabled><span class="glyphicon glyphicon-download"></span> Private key</button>
			</div>
		</div>
		<div class="col-xs-6">
			<h3>Encrypt</h3>
			<div class="form-group">
				<div class="input-group">
					<input class="form-control" type="text" id="cleartext" placeholder="Enter a secret message">
					<span class="input-group-btn">
						<button class="btn btn-primary" id="encrypt_text" type="button">Encrypt</button>
					</span>
				</div>
				<p class="help-block">Enter a message you wish to encrypt.</p>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-xs-6">
			<h3>Encrypt test</h3>
			<div class="form-group">
				<button id="test_encrypt" class="btn btn-primary"> Test</button>
			</div>
		</div>
		<div class="col-xs-6">
			<h3>Decrypt</h3>
			<div class="form-group">
				<div class="input-group">
					<label for="encrypted_files" class="input-group-btn">
						<span class="btn btn-primary">Browse
							<input type="file" id="encrypted_files" class="hidden">
						</span>
					</label>
					<input type="text" class="form-control" readonly="">
				</div>
				<p class="help-block">Upload a file with encrypted text to decrypt it with the selected key.</p>
			</div>
			<div class="form-group">
				<button id="decrypt_file" class="btn btn-primary"><span class="glyphicon glyphicon-resize-full"></span> Decrypt file</button>
			</div>
		</div>
	</div>
</div>