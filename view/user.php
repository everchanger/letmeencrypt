<div class="col-xs-12">
	<div class="row">
		<div class="col-xs-6">
			<h3>Encrypt file</h3>
			<div class="col-xs-12">
				<p class="help-block">Encrypt a file for storage, either for yourself or for a friend.</p>
				<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">ENCRYPT</button>
			</div>
		</div>
	</div>
	<div id="files" class="row">
		<?php include 'view/user_files.php' ?>
	</div>
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
				<option value="<?=$friend->id?>"><?=$friend->user_info->email?></option>
				<?php endforeach ?>
			</select>
		</div>
      </div>
      <div class="modal-footer">
        <button type="button" id="encrypt" class="btn btn-primary" disabled data-dismiss="modal">Encrypt & Upload</button>
		<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<script type="text/javascript" src="js/user.js"></script>