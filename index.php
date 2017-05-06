<?php
	include_once('utils/constants.php');
	include_once('utils/functions.php');
	include_once('utils/autoloader.php');
	include_once('model/db.php');
	
	session_start();

	// the use of this module is to catch the incoming requests and push them in the right direction.
	$control = "home";
	$action  = "show";
	
	if(isset($_SESSION['username']))
	{
		$control = "user";
	}

	if(array_key_exists("controller", $_GET)) 
	{
		$control = $_GET["controller"];
	}

	if(array_key_exists("action", $_GET)) 
	{
		$action = $_GET["action"];
	}
		
	loadController($control, $action);
?>