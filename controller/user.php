<?php

namespace controller;

class lameFriend 
{
    public function  __construct($n, $i) 
    {
        $this->name = $n;
        $this->id = $i;
    }

    public $name;
    public $id;
}

class User extends Base
{
    public function show() 
    {
        $user = new \model\User();
        $file = new \model\File();

        $files = array();

        try 
        {
            $signedInUser = $user->get($_SESSION['signed_in_user_id']);
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
        $friends[] = new lameFriend("tasty@stuff.com", 0);
        $friends[] = new lameFriend("nasty@jet.com", 1);
        $friends[] = new lameFriend("zasty@shuffle.com", 2);

        respondWithView("user", array("user" => $signedInUser, "files" => $files, "friends" => $friends));
    }

    public function profile()
    {
        $id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_STRING);

        $user = new \model\User();
        try 
        {
            $userProfile = $user->getProfile($_SESSION['signed_in_user_id'], $id);
        }
        catch(\Exception $e)
        {
            if(intval($e->getCode()) != ERROR_CODE_NO_ENCRYPTED_FILES)
            {
                $this->respondWithError("Database error, please try again later ".$e->getCode()); 
            }
        }

        respondWithView("profile", array("user" => $userProfile));
    }

    public function get_binary_data() 
    {
        $user = new \model\User();

        $signedInUser = $user->get($_SESSION['signed_in_user_id']);    

        echo $signedInUser->public_key;
        echo SPLITTER;
        echo $signedInUser->private_key;
        echo SPLITTER;
        echo $signedInUser->private_iv;
        die();
    }

    public function get_public_key() 
    {
        $user = new \model\User();

        $friend_ids = filter_input(INPUT_GET, 'friend_ids', FILTER_SANITIZE_STRING, FILTER_REQUIRE_ARRAY);
        $friend_blobs = array();

        $first = true;
        foreach($friend_ids as $friend_id) 
        {
            if($first)
            {
                $first = false;
            }
            else 
            {
                echo SPLITTER;
            }

            $friend = $user->get(intval($friend_id));
            echo $friend->public_key;
        }
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
            $user_id = $user->addUser($email, $password_hash, $public_key, $private_key, $private_iv);
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

        $_SESSION['signed_in_user_id'] = intval($user_id);

        respondWithStatus();
    }

    public function login() 
	{
		$email 		= filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
        $password  	= filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);

		if(!strlen($email) || !strlen($password)) {
            respondWithView("home", $this->userMessage("Please enter a valid email address and a password", USER_MESSAGE_ERROR));
        }

		$user = new \model\user();

		try 
		{
			$current_user = $user->get($email);
			$match = validate_password($current_user->pwd_hash, $password);
            if(!$match) {
                throw new \Exception("Wrong password", ERROR_CODE_WRONG_PASSWORD);
            }

            $_SESSION['signed_in_user_id'] = intval($current_user->id);
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

            respondWithView("home", $this->userMessage($errorMsg, USER_MESSAGE_ERROR));
		}

		$this->respondWithController("user");
	}

    public function logout() 
    {
         unset($_SESSION['signed_in_user_id']);

         respondWithView("home", array());
    }

    public function find()
    {
        $query = filter_input(INPUT_GET, 'query', FILTER_SANITIZE_STRING);
        $user = new \model\user();
        $users = array();

		try 
		{
			$users = $user->find($query);
		} 
		catch(\Exception $e) 
		{
            if($e->getCode() != ERROR_CODE_USER_NOT_FOUND) {
                $errorMsg = "Database error, please try again later: ".$e->getCode();
                $this->respondWithError($errorMsg);   
            } 
		}

        $objects = array();
        foreach($users as $u) 
        {
            if($u->id == $_SESSION['signed_in_user_id'])
            {
                continue;
            }

            if(isset($u->alias)) 
            {
                $objects[] = array("name" => ($u->alias . ': ' . $u->email), "id" => $u->id);
            }
            else
            {
                $objects[] = array("name" => $u->email, "id" => $u->id);
            }
            
        }

        echo json_encode($objects);
    }

    public function addFriend()
    {
        $id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_STRING);

        $user = new \model\User();
        $friend = new \model\Friend();

        try 
        {
            $friend->addFriendRequest($_SESSION['signed_in_user_id'], $id);
        }
        catch(\Exception $e)
        {
            if(intval($e->getCode()) == ERROR_CODE_ALLREADY_FRIEND) {
                $this->respondWithError($e->getMessage()); 
            }

            $this->respondWithError("Database error, please try again later ".$e->getCode()); 
        }

        $this->respondWithController("user", "profile", array("id" => $id));
    }

    public function acceptFriend()
    {
        $id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_STRING);

        $user = new \model\User();
        $friend = new \model\Friend();

        try 
        {
            $friend->acceptFriendRequest($_SESSION['signed_in_user_id'], $id);
        }
        catch(\Exception $e)
        {
            $this->respondWithError("Database error, please try again later ".$e->getCode()); 
        }

        $this->respondWithController("user", "profile", array("id" => $id));
    }
}