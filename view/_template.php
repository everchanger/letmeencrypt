<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Let me encrypt</title>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
		<!-- CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
		<link rel="stylesheet" href="css/bootstrap-yeti-min.css">
		<link rel="stylesheet" href="css/style.css">
	</head>
	<body>
		<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>

		<nav class="navbar navbar-default no-margin-bottom" id='main_navbar'>
		  <div class="container-fluid">
			<!-- Brand and toggle get grouped for better mobile display -->
			<div class="navbar-header">
			  <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			  </button>
			  <a class="navbar-brand" href="?controller=<?= isset($_SESSION['username']) ? 'user' : 'home' ?>">Let me encrypt </a>
			</div>

			<!-- Collect the nav links, forms, and other content for toggling -->
			<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
			  <ul class="nav navbar-nav">
				<?php if(!isset($_SESSION['username'])): ?>
				<li class="active">
					<a href="?controller=home&action=register">Sign Up</a>
				</li>
				<?php else: ?>
				<li>
					<a href="#"><span class="glyphicon glyphicon-user"></span> Friends</a>
				</li>
				<li>
					<a href="?controller=user&action=files"><span class="glyphicon glyphicon-file"></span> Files</a>
				</li>
				<?php endif; ?>
			  </ul>
				<?php if(isset($_SESSION['username'])): ?>
				<form class="navbar-form navbar-left">
					<div class="form-group input-group">
						<input id="friend-search" type="text" class="form-control" placeholder="Find a friend" autocomplete="off">
						<span class="input-group-btn">
							<button id="navbar-search-btn" class="btn btn-primary" type="button"><span class="glyphicon glyphicon-search"></span></button>
						</span>
					</div>
				</form>
				<?php endif; ?>
				
				<?php if(!isset($_SESSION['username'])): ?>
				<form class="navbar-form navbar-right" action="?controller=user&action=login" method="POST">
        	<div class="form-group">
          	<input type="email" class="form-control" placeholder="user@mail.net" name="email" id="email">
        	</div>
					<div class="form-group">
          	<input type="password" class="form-control" placeholder="Password" name="password" id="user-password">
        	</div>
        	<button type="submit" class="btn btn-xs btn-success" id="sign-in-button">Sign in</button>
				</form>
				<?php endif; ?>

			  <ul class="nav navbar-nav navbar-right">
					<?php if(isset($_SESSION['username'])): ?>
						<li>
							<a href="?controller=user&action=logout">Logout</a>
						</li>
					<?php endif; ?>
			  </ul>
			</div>
		  </div>
		</nav>
		
		<!-- Message handling -->
		<?php 
			$panel_type = "";
			if(isset($message_to_user)) 
			{
				switch($message_to_user->type) 
				{
						case USER_MESSAGE_SUCCESS:
							$panel_type = "panel-success";
						break;
						case USER_MESSAGE_WARNING:
							$panel_type = "panel-warning";
						break;
						case USER_MESSAGE_ERROR:
							$panel_type = "panel-danger";
						break;
				}
			}
		?>

		<!-- Loading bar under main navbar, please fix! -->

		<div id="loading">
				<div id="loading-bar">
				</div>
		</div>

		<div class="panel no-margin-bottom <?=$panel_type?> hidden-elm" id="message_field">
			<div class="panel-heading">
				<div id="user_message">
				<?=isset($message_to_user) ? $message_to_user->message : '' ?>
				</div>
				<span id="close-message-btn" class="pull-right glyphicon glyphicon-remove clickable"></span>
			</div>
		</div>
		
		<div class="container-fluid" id="content">
			<!-- INCLUDE THE SELECTED VIEW! -->
			<?php include $view_file_name;?>
		</div>
		
		<!--<footer class="footer">
			<div class="container-fluid footer-content">
				<p class="text-muted">Copyright Joakim Rosenstam 2017</p>
			</div>
		</footer>-->	

		<!-- JAVASCRIPT -->
		<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="js/bootstrap3-typeahead.min.js"></script>
		<script type="text/javascript" src="js/crypto.js"></script>
		<script type="text/javascript" src="js/FileSaver.js"></script>
		<script type="text/javascript" src="js/keystore.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/messages.js"></script>
	</body>
</html>