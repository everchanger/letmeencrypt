<div class="col-xs-offset-3 col-xs-6 col-sm-offset-5 col-sm-6">
	<div class="row">
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
		<form class="">
			<div class="form-group">
				<label for="private_key">Private key</label>
				<input type="file" id="private_key" accept="privateKey" onchange="readKeyFromInput(this.files)">
				<p class="help-block">Your private key will not be submited to the server only used localy by javascript to decrypt your files for you.</p>
			</div>
		</form>
	</div>
	<div class="row">
		<div class="col-sm-6 no-padding">
			<textarea id="output" class="form-control" rows="3">
			</textarea>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-6 no-padding">
			<textarea disabled="disabled" id="loaded_key_pair" class="form-control" rows="3">
			</textarea>
		</div>
	</div>
</div>