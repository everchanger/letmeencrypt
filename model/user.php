<?php

namespace model;

class User
{
    public function addUser($username, $password_hash, $public_key, $private_key) 
    {
        if(!isset($username) || !isset($password_hash) || !isset($public_key) || !isset($private_key)) 
        {
            throw new \Exception("One or more input parameters are not set");
        }

        try 
        {
            $stmt = DB::pdo()->prepare("INSERT INTO users (email, pwd_hash, public_key, private_key) VALUES (:email, :pwd_hash, :public_key, :private_key)");
            
            $stmt->bindParam(":email", $username);
            $stmt->bindParam(":pwd_hash", $password_hash);
            $stmt->bindParam(":public_key", $public_key);
            $stmt->bindParam(":private_key", $private_key);

            $stmt->execute();
        } 
        catch (\Exception $e) 
        {
            throw $e;
        }
    }

    public function get($username) {
        if(!isset($username)) 
        {
            throw new \Exception("One or more input parameters are not set");
        }

        try 
        {
            $stmt = DB::pdo()->prepare("SELECT id, email, pwd_hash, public_key, private_key FROM users WHERE email = :email");
            
            $stmt->bindParam(":email", $username);

            $stmt->execute();

            if ($stmt->rowCount() <= 0){
                throw new \Exception("No user with username: ".$username." found");
            }

            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } 
        catch (\Exception $e) 
        {
            throw $e;
        } 
    }
}