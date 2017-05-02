<?php

namespace model;

class File
{
    public function addEncryptedFile($filename, $org_filename, $size, $iv, $key, $receiver_id, $encrypter_id) 
    {
        if(!isset($filename) || !isset($org_filename) || !isset($iv) || !isset($key) 
        || !isset($size) || !isset($receiver_id) || !isset($encrypter_id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            $stmt = DB::pdo()->prepare("INSERT INTO encrypted_files (file_name, original_name, size, encrypter_user_id) VALUES (:filename, :org_filename, :size, :encrypter)");
            
            $stmt->bindParam(":filename",       $filename);
            $stmt->bindParam(":org_filename",   $org_filename);
            $stmt->bindParam(":size",           $size);
            $stmt->bindParam(":encrypter",      $encrypter_id);

            $stmt->execute();

            $fileID = DB::pdo()->lastInsertId();

            $stmt2 = DB::pdo()->prepare("INSERT INTO encrypted_keys_ivs (encrypted_key, encrypted_iv, file_id, user_id) VALUES (:key, :iv, :file, :user)");
            
            $stmt2->bindParam(":key",    $key);
            $stmt2->bindParam(":iv",     $iv);
            $stmt2->bindParam(":file",   $fileID);
            $stmt2->bindParam(":user",   $receiver_id);

            $stmt2->execute();
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
            $stmt = DB::pdo()->prepare("SELECT ef.original_name, ef.id, ef.upload_date, ef.encrypter_user_id, ef.size FROM encrypted_files AS ef INNER JOIN encrypted_keys_ivs AS eki  WHERE eki.user_id = :user_id AND eki.file_id = ef.id");
            
            $stmt->bindParam(":user_id", $user_id);

            $stmt->execute();

            if ($stmt->rowCount() <= 0){
                throw new \Exception("No files found for user with id: ".$user_id." found", ERROR_CODE_NO_ENCRYPTED_FILES);
            }

            return $stmt->fetchAll(\PDO::FETCH_OBJ);
        } 
        catch (\Exception $e) 
        {
            throw $e;
        } 
    }
}