<?php

namespace controller;

class file 
{
    public $id             = "";
    public $filename       = "";
    public $uploaded_by    = "";
    public $upload_date    = "";
    public $size           = "";

    public function __construct($id, $filename, $uploaded_by, $upload_date, $size) 
    {
        $this->id             = $id;
        $this->filename       = $filename;
        $this->uploaded_by    = $uploaded_by;
        $this->upload_date    = $upload_date;
        $this->size           = $size;
    }
}

class User extends Base
{
    public function show() 
    {
        $user = new \model\User();

        $signedInUser = $user->get($_SESSION['username']);

        $friends   = array(); 
        $files     = array();

        $friends[] = "tasty@stuff.com";
        $friends[] = "nasty@jet.com";
        $friends[] = "zasty@shuffle.com";

        $file = new \controller\file(0, "prettyphoto.jpg", "test.testsson@gmail.com", "2017-04-25", "2048");

        $files[] = $file;
        respondWithView("user", array("user" => $signedInUser, "files" => $files, "friends" => $friends));
    }

    public function get_public_key() 
    {
        $user = new \model\User();

        $signedInUser = $user->get($_SESSION['username']);    

        echo $signedInUser->public_key;
        die();
    }

    public function get_private_key() 
    {
        $user = new \model\User();

        $signedInUser = $user->get($_SESSION['username']);    

        echo $signedInUser->private_key;
        die();
    }

    public function test() 
    {
        respondWithView("test", array());
    }

    public function register() 
    {
        $email      = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
        $password1  = filter_input(INPUT_POST, 'password1', FILTER_SANITIZE_STRING);
        $password2  = filter_input(INPUT_POST, 'password2', FILTER_SANITIZE_STRING);

        // Validate the public and private keys before storing them.

        $public_key     = file_get_contents($_FILES['public_key']['tmp_name']);
        $private_key    = file_get_contents($_FILES['private_key']['tmp_name']);
        
        if(!strlen($email)) {
            $this->respondWithError("Please enter a valid email address");
        }

        if((!strlen($password1) || !strlen($password2)) || $password1 != $password2) {
            $this->respondWithError("Passwords didn't match, please make sure you written the same password in both the password fields.");
        }

        $password_hash = hash_password($password1);
        $user = new \model\User();

        try 
        {
            $user->addUser($email, $password_hash, $public_key, $private_key);
        } 
        catch(\Exception $e) 
        {
            $errorMsg = "Database error, please try again later";
            switch(intval($e->getCode())) {
                case 23000:
                    $errorMsg = "This email is already in use, please enter another adress.";
                break;
                default:
                break;
            }
            $this->respondWithError($errorMsg);            
        }

        $_SESSION['username'] = $email;

        respondWithStatus();
    }

    public function login() 
	{
		$email 		= filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
        $password  	= filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);

		if(!strlen($email) || !strlen($password)) {
            respondWithView("home", array("error_msg" => "Please enter a valid email address and a password"));
        }

		$user = new \model\user();

		try 
		{
			$current_user = $user->get($email);
			$match = validate_password($current_user->pwd_hash, $password);
            if(!$match) {
                throw new \Exception("Wrong password", ERROR_CODE_WRONG_PASSWORD);
            }

            $_SESSION['username'] = $current_user->email;
		} 
		catch(\Exception $e) 
		{
			$errorMsg = "Database error, please try again later";
            switch(intval($e->getCode())) {
                case ERROR_CODE_WRONG_PASSWORD:
                case ERROR_CODE_USER_NOT_FOUND:
                    $errorMsg = $e->getMessage();
                break;
                default:
                    $errorMsg .= " " . $e->getCode();
                break;
            }

            respondWithView("home", array("error_msg" => $errorMsg));
		}

		$this->respondWithController("user");
	}

    public function logout() 
    {
         unset($_SESSION['username']);

         respondWithView("home", array());
    }
    
}