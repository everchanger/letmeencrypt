<div class="col-xs-12">
	<div class="row">
		<div class="col-xs-6">
			<h3>Key status</h3>
			<div class="col-xs-12">
				<p class="help-block">View the current status of your keys.</p>
				<p>Public key:  <span class="glyphicon key_status glyphicon-remove" id="public_key_loaded"></span></p>
				<p>Private key: <span class="glyphicon key_status glyphicon-remove" id="private_key_loaded"></span></p>
				<h4>Load private key</h4>
				<div class="input-group">
					<label for="private_key" class="input-group-btn">
						<span class="btn btn-primary">Browse
							<input type="file" id="private_key" accept="privateKey" onchange="readKeyFromInput(this.files)" class="hidden">
						</span>
					</label>
					<input type="text" class="form-control" readonly="">
				</div>
				<p class="help-block">Your private key will not be submited to the server only used localy by javascript to decrypt your files for you.</p>
			</div>
		</div>
		<div class="col-xs-6">
			<h3>Encrypt file</h3>
			<div class="col-xs-12">
				<p class="help-block">Encrypt a file for storage, either for yourself or for a friend.</p>
				<p>Choose file</p>
				<div class="input-group">
					<label for="plain_file" class="input-group-btn">
						<span class="btn btn-primary">Browse
							<input type="file" id="plain_file" class="hidden">
						</span>
					</label>
					<input type="text" class="form-control" readonly="">
				</div>
				<p class="help-block">The file will not be submitted until encryption has been applied.</p>
				<div class="form-group">
					<input type="radio" id="target_friend" name="reciever" value="friend" checked> Friend
					<input type="radio" id="target_me" name="reciever" value="myself"> Myself
					<p class="help-block">Chose who the reciever of the file is.</p>
				</div>
				<div class="form-group">
					<select class="form-control" id="friend_list">
						<?php foreach($friends as $friend): ?>
						<option value="<?=$friend?>"><?=$friend?></option>
						<?php endforeach ?>
					</select>
				</div>
				<div class="form-group">
					<button class="btn btn-primary" id="encrypt" disabled>Encrypt and upload!</button>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-xs-12">
		<h3>My encrypted files</h3>
			<div class="col-xs-12">
				
				<p class="help-block">Here are your encrypted files listed, to download the file, simply press the download button and watch the file get downloaded and decrypted!.</p>
				<ul>
					<li>
						<div class="col-xs-3">
							Filename
						</div>
						<div class="col-xs-3">
							Uploaded by
						</div>
						<div class="col-xs-2">
							Upload date
						</div>
						<div class="col-xs-2">
							Filesize
						</div>
						<div class="col-xs-2">
							Download
						</div>
					</li>
					<?php foreach($files as $file): ?>
					<li>
						<div class="col-xs-3">
							<?= $file->filename ?>
						</div>
						<div class="col-xs-3">
							<?= $file->uploaded_by ?>
						</div>
						<div class="col-xs-2">
							<?= $file->upload_date ?>
						</div>
						<div class="col-xs-2">
							<?= $file->size ?>
						</div>
						<div class="col-xs-2">
							<a href="?controller=file&action=get&file=<?=$file->id?>">Download</a>
						</div>
					</li>
					<?php endforeach; ?>
				</ul>
			</div>
		</div>
	</div>
</div>

<div id="email" class="hidden">
	<?=$user->email?>
</div>

<script type="text/javascript" src="js/user.js"></script>