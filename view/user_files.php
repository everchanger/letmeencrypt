	<?php 
		$count = 0;
		foreach($files as $file): 
		$even = false;
		if($count % 2 == 0) {
			$even = true;
		}

		$count++;
		$mime = splitMime($file->type);
		$filetype = $mime[0];
		$typeglyph = getGlyphMime($mime);
	?>
		<div id="file_<?=$file->id?>" class="col-xs-12 col-lg-3 col-sm-5 col-md-4 <?=$even ? 'col-sm-offset-1' : '' ?> col-md-offset-0">
			<div class="filebox">
				<div class="filebox-header" title="<?=$file->original_name?>">
					<div class="col-xs-2"> 
						<span class="glyphicon <?=$typeglyph?> filebox-filetype"></span>
					</div>
					<div class="col-xs-9">
						<?=formatFileString($file->original_name, 22)?>
					</div>
					<div class="col-xs-1"> 
						<a href="#" id="<?=$file->id?>" title="Delete file" class="remove_file"><span class="glyphicon glyphicon-remove filebox-remove"></span></a>
					</div>
					<div class="col-xs-9">
						<?=formatBytes($file->size)?>
					</div>
					
				</div>
				<div class="filebox-preview">
					<div class="col-xs-10">
						<?= ucfirst($filetype) . ' (.'.$file->extension.')'?>
					</div>
					
					<div class="col-xs-10">
						<?=$file->upload_date?>
					</div>
					<div class="col-xs-2 filebox-download-holder"> 
						<a href="#" name="<?=$file->original_name?>" id="<?=$file->id?>" class="download_file" title="Download file"><span class=" glyphicon glyphicon-download-alt filebox-download"></span></a>
					</div>
					<div class="col-xs-10">
						<?php 
							$friend = getFriendObject($friends, $file->encrypter_user_id);
							if($friend == null) {
								echo 'Myself';
							} else {
								echo "<a href='?controller=user&action=profile&id=".$friend->id."' title='".$friend->email."'>".formatString($friend->email, 22)."</a>";
							}
						?>
					</div>
				</div>
			</div>
		</div>
	<?php endforeach; ?>