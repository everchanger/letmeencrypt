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
		<nav class="navbar navbar-default <?= isset($error_msg) ? 'no-margin' : '' ?>">
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
				<?php endif; ?>
			  </ul>
				
				<?php if(!isset($_SESSION['username'])): ?>
				<form class="navbar-form navbar-right" action="?controller=user&action=login" method="POST">
        	<div class="form-group">
          	<input type="email" class="form-control" placeholder="user@mail.net" name="email">
        	</div>
					<div class="form-group">
          	<input type="password" class="form-control" placeholder="Password" name="password">
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
		
		<!-- Error handling -->
		<?php if(isset($error_msg)): ?>
		<div class="col-xs-12 error-field">
			<p class="error_message"><?= $error_msg ?></p>
		</div>
		<?php endif; ?>
		
		<div class="container-fluid">
			<!-- INCLUDE THE SELECTED VIEW! -->
			<?php include $view_file_name;?>
		</div>
		
		<footer class="footer">
			<div class="container-fluid footer-content">
				<p class="text-muted">Copyright Joakim Rosenstam 2017</p>
			</div>
		</footer>	

		<!-- JAVASCRIPT -->
		<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
		<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="js/crypto.js"></script>
		<script type="text/javascript" src="js/FileSaver.js"></script>
		<script type="text/javascript" src="js/keystore.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
	</body>
</html>