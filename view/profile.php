<div class="col-xs-12">
	<div class="row">
		<div class="col-xs-6">
			<h3><?=$user->email?></h3>
            <p>A small description would be nice here?</p>
			<?php if($user->friend->accepted): ?>
				<p>Friends!</p>
			<?php elseif($user->friend->connected && $user->friend->requestSent): ?>
				<p>Friend request sent, awaiting reply!</p>
			<?php elseif($user->friend->connected && $user->friend->requestRecieved): ?>
				<a href="?controller=user&action=acceptFriend&id=<?=$user->id?>" class="btn btn-primary">Accept request</a>
			<?php else: ?>
				<a href="?controller=user&action=addFriend&id=<?=$user->id?>" class="btn btn-primary">Add Friend</a>
			<?php endif; ?>
		</div>
	</div>
</div>

<script type="text/javascript" src="js/profile.js"></script>