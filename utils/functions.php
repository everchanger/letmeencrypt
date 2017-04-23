<?php

if(!function_exists('hash_equals')) 
{
	function hash_equals($str1, $str2) 
	{
		if(strlen($str1) != strlen($str2)) 
		{
			return false;
		} 
		else 
		{
			$res = $str1 ^ $str2;
			$ret = 0;
			for($i = strlen($res) - 1; $i >= 0; $i--) $ret |= ord($res[$i]);
				return !$ret;
		}
	}
}

function hash_password($password) 
{
	// https://alias.io/2010/01/store-passwords-safely-with-php-and-mysql/
	// A higher "cost" is more secure but consumes more processing power
	$cost = 10;

	// Create a random salt
	$salt = strtr(base64_encode(mcrypt_create_iv(16, MCRYPT_DEV_URANDOM)), '+', '.');

	// Prefix information about the hash so PHP knows how to verify it later.
	// "$2a$" Means we're using the Blowfish algorithm. The following two digits are the cost parameter.
	$salt = sprintf("$2a$%02d$", $cost) . $salt;

	// Hash the password with the salt
	$hash = crypt($password, $salt);
	
	return $hash;
}

function validate_password($pwd_hash, $password)
{
	// Hashing the password with its hash as the salt returns the same hash
	$crypt = crypt($password, $pwd_hash);
	$equals = hash_equals($pwd_hash, $crypt);
	return $equals;
}

function sendFileToClient($file, $new_filename = NULL) 
{
	header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
	if($new_filename != NULL) 
	{
		header('Content-Disposition: attachment; filename='.$new_filename);
	}
	else 
	{
		header('Content-Disposition: attachment; filename='.basename($file));
	}
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    readfile($file);
}

function loadController($controller, $action) 
{
	// find the requested controller and use the action on it
	
	$filename 	= __DIR__.'/controller/'.$controller.'.php';
	$classname 	= '\controller\\'.$controller;
	
	$instance = new $classname();	
	$instance->$action();
}

function loadViewWithTemplate($view, $args, $usetemplate) 
{
	$view_file_name = "view/".$view.'.php';

	if (! file_exists($view_file_name)) 
	{
		// FIX: ADD ERROR HANDLING
		die("FILE DOESNT EXIST: ". $view_file_name);
		return 0;
	}

	extract($args);
	
	if($usetemplate) 
	{
		ob_start();
		
		include "view/_template.php";
		return ob_get_clean(); 
	} 
	else 
	{
		include $view_file_name;	
	}
}

function respondWithView($view, $args, $status = 200, $usetemplate = true) 
{
	date_default_timezone_set ("Europe/Stockholm");

	header('Pragma: no-cache');
    header("Expires: Sat, 1 Jan 2000 00:00:00 GMT");
	header("Cache-Control: max-age=0, must-revalidate, no-store, no-cache");

	header('Status: '.$status);
    header($_SERVER['SERVER_PROTOCOL'].' 200');
	
    echo loadViewWithTemplate($view, $args, $usetemplate);
	exit;
}

function respondWithStatus($message = OK, $status = 200) 
{
	date_default_timezone_set ("Europe/Stockholm");

	header('Pragma: no-cache');
    header("Expires: Sat, 1 Jan 2000 00:00:00 GMT");
	header("Cache-Control: max-age=0, must-revalidate, no-store, no-cache");

	header('Status: '.$status);
    header($_SERVER['SERVER_PROTOCOL'].' '.$status);

	echo $message;
	exit;
}

?>