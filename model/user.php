<?php

namespace model;

class User
{
    public function addUser($email, $password_hash, $public_key, $private_key, $private_iv) 
    {
        if(!isset($email) || !isset($password_hash) || !isset($public_key) || !isset($private_key)|| !isset($private_iv)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            $stmt = DB::pdo()->prepare("INSERT INTO users (id, email, pwd_hash, public_key, private_key, private_iv) VALUES (:email, :pwd_hash, :public_key, :private_key, :private_iv)");
            
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":pwd_hash", $password_hash);
            $stmt->bindParam(":public_key", $public_key);
            $stmt->bindParam(":private_key", $private_key);
            $stmt->bindParam(":private_iv", $private_iv);

            $stmt->execute();
        } 
        catch (\Exception $e) 
        {
            throw $e;
        }

        return DB::pdo()->lastInsertId();
    }

    public function get($email) {
        if(!isset($email)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            $stmt = DB::pdo()->prepare("SELECT id, email, alias, pwd_hash, public_key, private_key, private_iv FROM users WHERE email = :email");
            
            $stmt->bindParam(":email", $email);

            $stmt->execute();

            if ($stmt->rowCount() <= 0){
                throw new \Exception("No user with email: ".$email." found", ERROR_CODE_USER_NOT_FOUND);
            }

            return $stmt->fetch(\PDO::FETCH_OBJ);
        } 
        catch (\Exception $e) 
        {
            throw $e;
        } 
    }

    public function getProfile($id) {
        if(!isset($id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            $stmt = DB::pdo()->prepare("SELECT id, email, alias, pwd_hash, public_key FROM users WHERE id = :id");
            
            $stmt->bindParam(":id", $id);

            $stmt->execute();

            if ($stmt->rowCount() <= 0){
                throw new \Exception("No user with id: ".$id." found", ERROR_CODE_USER_NOT_FOUND);
            }

            return $stmt->fetch(\PDO::FETCH_OBJ);
        } 
        catch (\Exception $e) 
        {
            throw $e;
        } 
    }

    public function find($query)
    {
         if(!isset($query)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            $stmt = DB::pdo()->prepare("SELECT id, alias, email FROM users WHERE email LIKE :email_query OR alias LIKE :alias_query");
            
            $email_query = "%".$query."%";
            $alias_query = "%".$query."%";
            $stmt->bindParam(":email_query", $email_query);
            $stmt->bindParam(":alias_query", $alias_query);

            $stmt->execute();

            if ($stmt->rowCount() <= 0){
                throw new \Exception("No user with email: ".$email." found", ERROR_CODE_USER_NOT_FOUND);
            }

            return $stmt->fetchAll(\PDO::FETCH_OBJ);
        } 
        catch (\Exception $e) 
        {
            throw $e;
        } 
    }
}