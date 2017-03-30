<div class="col-xs-12">
	<div class="col-xs-offset-5 col-xs-6">
		<ul class="helloworld-list">
			<li>
				<span class="earth-icon glyphicon glyphicon-globe"></span>
			</li>
			<li>
				<h2>Hello World!</h2>
			</li>
		</ul>
	</div>
	
	<div class="row">
		<div class="col-xs-6">
			<form class="">
				<h3>Generate Keys</h3>
				<div class="input-group">
				  <input class="form-control" type="text" id="new_pair_name" placeholder="Enter a descriptive name for your keypair">
				  <span class="input-group-btn">
					<button class="btn btn-info" id="generate_key_pair" type="button">Generate</button>
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
						<span class="btn btn-info">Browse
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
				<button id="get_public" class="btn btn-info" disabled><span class="glyphicon glyphicon-download"></span> Public key</button>
				<button id="get_private" class="btn btn-info" disabled><span class="glyphicon glyphicon-download"></span> Private key</button>
			</div>
		</div>
	</div>
</div>