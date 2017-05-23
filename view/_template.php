<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Let me encrypt</title>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
		<!-- CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
		<link rel="stylesheet" href="css/bootstrap-yeti-min.css">
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.2/css/bootstrap-select.min.css">
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
			  <a class="navbar-brand" href="?controller=<?= isset($_SESSION['signed_in_user_id']) ? 'user' : 'home' ?>">Let me encrypt </a>
			</div>

			<!-- Collect the nav links, forms, and other content for toggling -->
			<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
			  <ul class="nav navbar-nav">
				<?php if(!isset($_SESSION['signed_in_user_id'])): ?>
				<li>
					<a href="?controller=home&action=register">Sign Up</a>
				</li>
				<?php else: ?>
				<li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-lock"></span> Key status</span></a>
          <ul class="dropdown-menu">
            <li>
							<div >
									<p class="help-block-navbar">View the current status of your keys.</p>
									<p>Public key:  <span class="glyphicon key_status glyphicon-remove-circle" id="public_key_loaded"></span></p>
									<p>Private key: <span class="glyphicon key_status glyphicon-remove-circle" id="private_key_loaded"></span></p>
									<div>
										<a href="#" id="show_load_private_key" class="btn btn-primary btn-xs" data-toggle="modal" data-target="#privateModal" title="Load your private key, this is only nessesary if you choose to store your private key offline.">Load private key</a>
										<a href="#" id="clear_loaded_keys" class="btn btn-primary btn-xs" title="Clear your keys if you're using a shared computer to minimize risk of private key compromises">Clear keys</a>
									</div>
							</div>				
						</li>
          </ul>
        </li>
				<?php endif; ?>
				<li>
					<a href="?controller=home&action=faq">FAQ</a>
				</li>
			  </ul>
				<?php if(isset($_SESSION['signed_in_user_id'])): ?>
				<form class="navbar-form navbar-left">
					<div class="form-group input-group">
						<input id="friend-search" type="text" class="form-control" placeholder="Find a friend" autocomplete="off">
						<span class="input-group-btn">
							<button id="navbar-search-btn" class="btn btn-primary" type="button"><span class="glyphicon glyphicon-search"></span></button>
						</span>
					</div>
				</form>
				<?php endif; ?>
				
				<?php if(!isset($_SESSION['signed_in_user_id'])): ?>
				<form class="navbar-form navbar-right" action="?controller=user&action=login" method="POST">
        	<div class="form-group">
          	<input type="email" class="form-control" placeholder="user@mail.net" name="email" id="email">
        	</div>
					<div class="form-group">
          	<input type="password" class="form-control" placeholder="Password" name="password" id="user-password">
        	</div>
        	<button type="submit" class="btn btn-xs btn-primary" id="sign-in-button">Sign in</button>
				</form>
				<?php endif; ?>

			  <ul class="nav navbar-nav navbar-right">
					<?php if(isset($_SESSION['signed_in_user_id'])): ?>
						<li>
							<a href="?controller=user&action=logout"><span class="glyphicon glyphicon-off"></span> Logout</a>
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

		<div id="loading" class="hidden-elm">
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

		<div id="email" class="hidden">
			<?php if(isset($_SESSION['signed_in_user_email'])): ?>
			<?=$_SESSION['signed_in_user_email']?>
			<?php endif; ?>
		</div>
		
		<!--<footer class="footer">
			<div class="container-fluid footer-content">
				<p class="text-muted">Copyright Joakim Rosenstam 2017</p>
			</div>
		</footer>-->	

		<?php include 'view/load_private_key.php' ?>

		<!-- JAVASCRIPT -->
		<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="js/bootstrap3-typeahead.min.js"></script>
		<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.2/js/bootstrap-select.min.js"></script>
		<script type="text/javascript" src="js/FileSaver.js"></script>
		<script type="text/javascript" src="js/keystore.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/messages.js"></script>
	</body>
</html>