<div class="col-xs-12">
	<div class="row">
		<div class="col-xs-6">
			<h3><?=$user->email?></h3>
            <p>A small description would be nice here?</p>
            <a href="?controller=user&action=addFriend&id=<?=$user->id?>" class="btn btn-primary">Add Friend</a>
		</div>
	</div>
</div>

<script type="text/javascript" src="js/profile.js"></script>