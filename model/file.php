<?php

namespace model;

class File
{
    public function addEncryptedFile($filename, $org_filename, $size, $extension, $mimetype, $encrypter_id) 
    {
        if(!isset($filename) || !isset($org_filename) || !isset($size) || !isset($encrypter_id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            $stmt = DB::pdo()->prepare("INSERT INTO encrypted_files (file_name, original_name, size, extension, type, encrypter_user_id) VALUES (:filename, :org_filename, :size, :extension, :type, :encrypter)");
            
            $stmt->bindParam(":filename",       $filename);
            $stmt->bindParam(":org_filename",   $org_filename);
            $stmt->bindParam(":size",           $size);
            $stmt->bindParam(":extension",      $extension);
            $stmt->bindParam(":type",           $mimetype);
            $stmt->bindParam(":encrypter",      $encrypter_id);

            $stmt->execute();

            $fileID = DB::pdo()->lastInsertId();
        } 
        catch (\Exception $e) 
        {
            throw $e;
        }

        return $fileID;
    }

    public function addUserKeyIV($reciever_id, $file_id, $iv, $key)
    {
        if(!isset($file_id) || !isset($iv) || !isset($key) || !isset($reciever_id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

         try 
        {
            $stmt = DB::pdo()->prepare("INSERT INTO encrypted_keys_ivs (encrypted_key, encrypted_iv, file_id, user_id) VALUES (:key, :iv, :file, :user)");
            
            $stmt->bindParam(":key",    $key);
            $stmt->bindParam(":iv",     $iv);
            $stmt->bindParam(":file",   $file_id);
            $stmt->bindParam(":user",   $reciever_id);

            $stmt->execute();
        } 
        catch (\Exception $e) 
        {
            throw $e;
        }
    }

    public function get_users_files($user_id) 
    {
        if(!isset($user_id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            $stmt = DB::pdo()->prepare("SELECT ef.original_name, ef.id, ef.upload_date, ef.extension, ef.encrypter_user_id, ef.size, ef.type FROM encrypted_files AS ef INNER JOIN encrypted_keys_ivs AS eki WHERE eki.user_id = :user_id AND eki.file_id = ef.id");
            
            $stmt->bindParam(":user_id", $user_id);

            $stmt->execute();

            if ($stmt->rowCount() <= 0){
                return array();
            }

            return $stmt->fetchAll(\PDO::FETCH_OBJ);
        } 
        catch (\Exception $e) 
        {
            throw $e;
        } 
    }

    public function get($user_id, $file_id)
    {
        // We need the user ID to verify that the person making the request is the user that this file belongs to.
        if(!isset($user_id) || !isset($file_id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            $stmt = DB::pdo()->prepare("SELECT ef.file_name, eki.encrypted_key, eki.encrypted_iv FROM  encrypted_files AS ef JOIN encrypted_keys_ivs AS eki ON eki.file_id = ef.id WHERE eki.file_id = :file_id AND eki.user_id = :user_id");
            
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":file_id", $file_id);

            $stmt->execute();

            if ($stmt->rowCount() <= 0){
                throw new \Exception("No file with id: ".$file_id." found for user with id: ".$user_id, ERROR_CODE_NO_ENCRYPTED_FILES);
            }

            return $stmt->fetch(\PDO::FETCH_OBJ);
        } 
        catch (\Exception $e) 
        {
            throw $e;
        } 
    }

    // Deletes a file from the db, returns the filename to be deleted if no more references are found.
    public function delete($user_id, $file_id)
    {
        $filename = null;

         // We need the user ID to verify that the person making the request is the user that this file belongs to.
        if(!isset($user_id) || !isset($file_id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        // When we delete a file it's cruical that we delete the entry in the encrypted_iv_key table first. Then we can check if another user still has a reference to this file, else we delete it!
        try 
        {
            // Delete our reference to the file.
            $stmt = DB::pdo()->prepare("DELETE FROM encrypted_keys_ivs WHERE user_id = :user_id AND file_id = :file_id");
            
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":file_id", $file_id);

            $stmt->execute();

            // Find any other references to this file, if not found we can delete it, else we are done here.
            $stmt2 = DB::pdo()->prepare("SELECT * FROM encrypted_keys_ivs WHERE file_id = :file_id");
            
            $stmt2->bindParam(":file_id", $file_id);

            $stmt2->execute();

            if ($stmt2->rowCount() > 0){
                return null;
            }

            // Get the filename of the file we're deleting, we return this so the controller can delete the actual file off the disk.
            $stmt3 = DB::pdo()->prepare("SELECT file_name FROM encrypted_files WHERE id = :file_id");
            
            $stmt3->bindParam(":file_id", $file_id);

            $stmt3->execute();

            if ($stmt3->rowCount() <= 0){
                throw new \Exception("No file with id: ".$file_id." found for user with id: ".$user_id, ERROR_CODE_NO_ENCRYPTED_FILES);
            }

            $fileobj = $stmt3->fetch(\PDO::FETCH_OBJ);

            // Delete our reference to the file.
            $stmt4 = DB::pdo()->prepare("DELETE FROM encrypted_files WHERE id = :file_id");
            
            $stmt4->bindParam(":file_id", $file_id);

            $stmt4->execute();            
        } 
        catch (\Exception $e) 
        {
            throw $e;
        }

        return $fileobj->file_name;
    }
}