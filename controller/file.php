<?php

namespace controller;

class file extends Base 
{
	public function add() 
	{
		$recievers  	= filter_input(INPUT_POST, 'recievers', FILTER_SANITIZE_STRING);
		$filename  		= filter_input(INPUT_POST, 'filename', FILTER_SANITIZE_STRING);

		$encryptedKey   = file_get_contents($_FILES['key']['tmp_name']);
        $encryptedIV    = file_get_contents($_FILES['iv']['tmp_name']);
		$encryptedData 	= file_get_contents($_FILES['data']['tmp_name']);

		// Store file on the server before we add references in the db to it.
		$target_dir 	= "uploads/";
		$newFileName 	=  uniqid();
		$targetFile 	= $target_dir . $newFileName;
		$fileSize 		= $_FILES['data']['size'];

		move_uploaded_file($_FILES['data']['tmp_name'], $targetFile);

		$user = new \model\User();
		$file = new \model\File();

		try 
        {
			$signedInUser = $user->get($_SESSION['username']);
            $file->addEncryptedFile($newFileName, $filename, $fileSize, $encryptedIV, $encryptedKey, $signedInUser->id, $signedInUser->id);
        } 
        catch(\Exception $e) 
        {
            $errorMsg = "Database error, please try again later";
            switch(intval($e->getCode())) {
                case 23000:
                    $errorMsg = "This file has already been added, weird!";
                break;
                default:
                break;
            }
            $this->respondWithError($errorMsg);            
        }

		respondWithStatus();
	}

	public function get()
	{
		"test123";
		die();
	}
};

?>