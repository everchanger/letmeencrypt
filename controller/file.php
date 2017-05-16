<?php

namespace controller;

class file extends Base 
{
	public function add() 
	{
		$recievers  	= filter_input(INPUT_POST, 'recievers', FILTER_SANITIZE_STRING);
		$filename  		= filter_input(INPUT_POST, 'filename', FILTER_SANITIZE_STRING);
		$mimetype  		= filter_input(INPUT_POST, 'type', FILTER_SANITIZE_STRING);

		if($mimetype == null || strlen($mimetype) <= 0)
		{
			$mimetype = 'unknown/unknown';
		}

		// Check if file uploads went OK
		if($_FILES['data']['error']) 
		{
			$this->respondWithError("Error with file upload, file not uploaded"); 
		}

		$encryptedData 	= file_get_contents($_FILES['data']['tmp_name']);

		// Store file on the server before we add references in the db to it.
		$target_dir 	= UPLOAD_PATH;
		$newFileName 	= uniqid();
		$targetFile 	= $target_dir . $newFileName;
		$fileSize 		= $_FILES['data']['size'];

		move_uploaded_file($_FILES['data']['tmp_name'], $targetFile);

		// Extract extension from string
        $extension = pathinfo($filename, PATHINFO_EXTENSION);

		if($extension == null || strlen($extension) <= 0)
		{
			$extension = 'unknown';
		}
		
		$user = new \model\User();
		$file = new \model\File();

		try 
        {
			$signedInUser = $user->get($_SESSION['signed_in_user_id']);
            $file_id = $file->addEncryptedFile($newFileName, $filename, $fileSize, $extension, $mimetype, $signedInUser->id);
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

		respondWithStatus($file_id);
	}

	public function addEncryptedKeyIV()
	{
		$file_id 	 = filter_input(INPUT_POST, 'file_id', FILTER_SANITIZE_STRING);
		$reciever_id = filter_input(INPUT_POST, 'reciever_id', FILTER_SANITIZE_STRING);

		if($reciever_id == 0) {
			$reciever_id = intval($_SESSION['signed_in_user_id']);
		}

		// Check if file uploads went OK
		if($_FILES['key']['error'] || $_FILES['iv']['error']) 
		{
			$this->respondWithError("Error with file upload, file not uploaded"); 
		}

		$encryptedKey   = file_get_contents($_FILES['key']['tmp_name']);
        $encryptedIV    = file_get_contents($_FILES['iv']['tmp_name']);

		$file = new \model\File();

		try 
		{
			$file->addUserKeyIV($reciever_id, $file_id, $encryptedIV, $encryptedKey);
		}
		catch(\Exception $e) 
        {
			var_dump($e);die();
            $errorMsg = "Database error, please try again later";
            $this->respondWithError($errorMsg);
		}

		respondWithStatus();
	}

	public function get()
	{
		$id	= filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

		// We need to fetch the file requested + the encrypted key and iv.
		$user = new \model\User();
		$file = new \model\File();
		$fileObj = null;

		try 
        {
			$signedInUser = $user->get($_SESSION['signed_in_user_id']);
            $fileObj = $file->get($signedInUser->id, $id);
        } 
		catch(\Exception $e) 
        {
            $errorMsg = "Database error, please try again later";
            $this->respondWithError($errorMsg);            
        }

		// Now we need to read the file from disk, then dump the data of the file!
		$filePath = UPLOAD_PATH . $fileObj->file_name;

		// TODO Check that this path is actually inside the upload folder.
		
		echo file_get_contents($filePath);
		echo SPLITTER;
		echo $fileObj->encrypted_key;
		echo SPLITTER;
		echo $fileObj->encrypted_iv;
		
		die();
	}

	public function delete() 
	{
		$id	= filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
		$file = new \model\File();

		try 
        {
            $file_name = $file->delete($_SESSION['signed_in_user_id'], $id);
        } 
		catch(\Exception $e) 
        {
            $errorMsg = "Database error, please try again later";
            $this->respondWithError($errorMsg);            
        }

		if(isset($file_name))
		{
			$filePath = UPLOAD_PATH . $file_name;

			// TODO Check that this path is actually inside the upload folder.
			unlink($filePath);
		}

		die();
	}
};

?>