<?php

namespace controller;

class User 
{
    public function register_user() 
    {
        $user = new \model\User();
        
        try 
        {
            $user->addUser("test@gmail.com", "dsaasdasd", "123456", "789101112");
        } 
        catch(\Exception $e) 
        {
            echo $e->getMessage();            
        }

        respondWithView("home", array());
    }

    
}