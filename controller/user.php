<?php

namespace controller;

class User extends Base
{
    public function show() 
    {
        $user = new \model\User();
        $file = new \model\File();

        $files = array();

        try 
        {
            $signedInUser = $user->get($_SESSION['username']);
            $files = $file->get_users_files($signedInUser->id);
        } 
        catch(\Exception $e)
        {
            if(intval($e->getCode()) != ERROR_CODE_NO_ENCRYPTED_FILES)
            {
                $this->respondWithError("Database error, please try again later"); 
            }
        }

        $friends   = array(); 
        $friends[] = "tasty@stuff.com";
        $friends[] = "nasty@jet.com";
        $friends[] = "zasty@shuffle.com";

        respondWithView("user", array("user" => $signedInUser, "files" => $files, "friends" => $friends));
    }

    public function get_binary_data() 
    {
        $user = new \model\User();

        $signedInUser = $user->get($_SESSION['username']);    

        echo $signedInUser->public_key;
        echo SPLITTER;
        echo $signedInUser->private_key;
        echo SPLITTER;
        echo $signedInUser->private_iv;
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
        $private_iv     = file_get_contents($_FILES['private_iv']['tmp_name']);
        
        if(!strlen($email)) 
        {
            $this->respondWithError("Please enter a valid email address");
        }

        if((!strlen($password1) || !strlen($password2)) || $password1 != $password2) 
        {
            $this->respondWithError("Passwords didn't match, please make sure you written the same password in both the password fields.");
        }

        $password_hash = hash_password($password1);
        $user = new \model\User();

        try 
        {
            $user->addUser($email, $password_hash, $public_key, $private_key, $private_iv);
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