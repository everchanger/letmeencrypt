<div class="col-xs-12">
	<div class="row">
		<div class="col-xs-6">
			<h3>Key status</h3>
			<div class="col-xs-12">
				<p class="help-block">View the current status of your keys.</p>
				<p>Public key:  <span class="glyphicon key_status glyphicon-remove" id="public_key_loaded"></span></p>
				<p>Private key: <span class="glyphicon key_status glyphicon-remove" id="private_key_loaded"></span></p>
				<div class="hidden-elm">
					<h4>Load private key</h4>
					<div class="input-group">
						<label for="private_key" class="input-group-btn">
							<span class="btn btn-primary">Browse
								<input type="file" id="private_key" accept="privateKey" onchange="readKeyFromInput(this.files)" class="hidden">
							</span>
						</label>
						<input type="text" class="form-control" readonly="">
					</div>
					<p class="help-block">Your private key will not be submited to the server only used localy by javascript to decrypt your files for you.</p>->
				</div>
			</div>
		</div>
		<div class="col-xs-6">
			<h3>Encrypt file</h3>
			<div class="col-xs-12">
				<p class="help-block">Encrypt a file for storage, either for yourself or for a friend.</p>
				<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">ENCRYPT</button>
			</div>
		</div>
	</div>
	<div class="row">
	<?php foreach($files as $file): 
		$mime = splitMime($file->type);
		$filetype = $mime[0];
		$typeglyph = "glyphicon-file";

		switch($mime[0])
		{
			case 'image':
				$typeglyph = 'glyphicon-picture';
				break;
			case 'video':
				$typeglyph = 'glyphicon-film';
				break;
			case 'audio':
				$typeglyph = 'glyphicon-volume-up';
				break;
			case 'application':
				switch($mime[1]) 
				{
					case 'pdf':
					case 'msword':
					case 'vnd.ms-excel':
					case 'rtf':
					case 'vnd.oasis.opendocument.presentation':
					case 'vnd.oasis.opendocument.spreadsheet':
					case 'vnd.oasis.opendocument.text':
						$typeglyph = 'glyphicon-book';
						break;
					case 'zip':
						$typeglyph = 'glyphicon-compressed';
						break;
					default:
						$typeglyph = 'glyphicon-cog';
						break;
				}
				
				break;
			case 'unknown':
			default:
				$typeglyph = 'glyphicon-file';
				break;
		}
	?>
		<div class="col-sm-12 col-lg-3 col-sm-6">
			<div class="filebox">
				<div class="filebox-header" title="<?=$file->original_name?>">
					<div class="col-xs-2"> 
						<span class="glyphicon <?=$typeglyph?> filebox-filetype"></span>
					</div>
					<div class="col-xs-10">
						<?=formatString($file->original_name, 25)?>
					</div>
					<div class="col-xs-10 offset-xs-2">
						<?=formatBytes($file->size)?>
					</div>
				</div>
				<div class="filebox-preview">
					<div class="col-xs-9">
						<?= ucfirst($filetype) . ' (.'.$file->extension.')'?>
					</div>
					<div class="col-xs-2 filebox-download-holder"> 
						<a href="#" name="<?=$file->original_name?>" id="<?=$file->id?>" class="download_file"><span class=" glyphicon glyphicon-download filebox-download"></span></a>
					</div>
					<div class="col-xs-9">
						<?=$file->upload_date?>
					</div>
					<div class="col-xs-12 hidden-elm">
						<a href="#" class="show-more">More...</a>
					</div>
				</div>
				<div class="filebox-body hidden-elm">
				</div>
			</div>
		</div>
	<?php endforeach; ?>
	</div>
</div>

<div id="email" class="hidden">
	<?=$user->email?>
</div>

<div id="myModal" class="modal fade">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h4 class="modal-title">Choose files to encrypt</h4>
      </div>
      <div class="modal-body">
		<div class="input-group">
			<label for="plain_file" class="input-group-btn">
				<span class="btn btn-primary">Browse
					<input type="file" id="plain_file" class="hidden">
				</span>
			</label>
			<input type="text" id="file_name" class="form-control" readonly="">
		</div>
		<p class="help-block">The file will not be submitted until encryption has been applied.</p>
		<div class="form-group">
			<input type="radio" id="target_friend" name="reciever" value="friend" checked> Friend
			<input type="radio" id="target_me" name="reciever" value="myself"> Myself
		</div>
		<div class="form-group" id="friend_list">
			<p class="help-block">Pick friends who will recieve the file.</p>
			<select class="selectpicker" id="friend_select" multiple data-live-search="true" data-none-selected-text="No friend selected" data-style="btn-primary">
				<?php foreach($friends as $friend): ?>
				<option value="<?=$friend->id?>"><?=$friend->name?></option>
				<?php endforeach ?>
			</select>
		</div>
      </div>
      <div class="modal-footer">
        <button type="button" id="encrypt" class="btn btn-primary" disabled>Encrypt & Upload</button>
		<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<script type="text/javascript" src="js/user.js"></script>