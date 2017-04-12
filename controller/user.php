<?php

namespace controller;

class User 
{
    public function show() {
        respondWithView("user", array());
    }

    public function register() 
    {
        $email      = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
        $password1  = filter_input(INPUT_POST, 'password1', FILTER_SANITIZE_STRING);
        $password2  = filter_input(INPUT_POST, 'password2', FILTER_SANITIZE_STRING);

        if(!strlen($email)) {
            respondWithView("register", array("error_msg" => "Please enter a valid email address"));
        }

        if((!strlen($password1) || !strlen($password2)) || $password1 != $password2) {
            respondWithView("register", array("error_msg" => "Passwords didn't match, please make sure you written the same password in both the password fields."));
        }

        $password_hash = hash_password($password1);
        $user = new \model\User();

        try 
        {
            $user->addUser($email, $password_hash, "123456", "789101112");
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
            respondWithView("register", array("error_msg" => $errorMsg));            
        }

        respondWithView("home", array());
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
			$match = validate_password($current_user['pwd_hash'], $password);
            if(!$match) {
                throw new \Exception("Wrong password", ERROR_CODE_WRONG_PASSWORD);
            }

            $_SESSION['username'] = $current_user['email'];
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

		respondWithView("user", array());
	}

    public function logout() 
    {
         unset($_SESSION['username']);

         respondWithView("home", array());
    }
    
}