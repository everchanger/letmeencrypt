<?php

namespace model;

class UserFriend
{
    public $id = null;
    public $user_info = null;
    public $connected = false;
    public $requestSent = false;
    public $requestRecieved = false;
    public $accepted = false;
}

class Friend
{
    public function get($id, $user_id) 
    {
        if(!isset($id) && !isset($user_id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            // $stmt = DB::pdo()->prepare("SELECT u.id, u.email, u.alias, u.public_key FROM users as u WHERE u.id = :id ");
            $stmt = DB::pdo()->prepare("SELECT user_id_1, user_id_2, accepted FROM(
                SELECT user_id_1, user_id_2, accepted FROM friends WHERE user_id_1 = :id AND user_id_2 = :user_id 
                UNION
                SELECT user_id_1, user_id_2, accepted FROM friends WHERE user_id_1 = :user_id2 AND user_id_2 = :id2) as subquery");

            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":id2", $id);
            $stmt->bindParam(":user_id2", $user_id);

            $stmt->execute();

            if ($stmt->rowCount() <= 0){
                throw new \Exception("No friendship between users with id: ".$id." and ".$user_id." found", ERROR_CODE_FRIENDSHIP_NOT_FOUND);
            }

            $friendship = $stmt->fetch(\PDO::FETCH_OBJ);
        } 
        catch (\Exception $e) 
        {
            throw $e;
        } 

        $friend = new UserFriend(); 
        
        if($friendship && $friendship->accepted) 
        {
            $friend->accepted = true;
        } 
        else if($friendship) 
        {
            $friend->connected = true;
        }

        if($friend->connected && !$friend->accepted) {
            if($friendship->user_id_1 == $user_id) {
                $friend->requestRecieved = true;
            } else {
                $friend->requestSent = true;
            }
        }

        return $friend;
    }

     public function getAll($id) 
    {
        if(!isset($id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        try 
        {
            // $stmt = DB::pdo()->prepare("SELECT u.id, u.email, u.alias, u.public_key FROM users as u WHERE u.id = :id ");
            $stmt = DB::pdo()->prepare("SELECT user_id_1, user_id_2, accepted FROM friends WHERE user_id_1 = :id OR user_id_2 = :id2");

            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":id2", $id);

            $stmt->execute();

            if ($stmt->rowCount() <= 0){
                throw new \Exception("No friendships for user with id: ".$id." found", ERROR_CODE_FRIENDSHIP_NOT_FOUND);
            }

            $friendships = $stmt->fetchAll(\PDO::FETCH_OBJ);
        } 
        catch (\Exception $e) 
        {
            throw $e;
        } 

        $usersFriends = array();

        foreach($friendships as $friendship) {
            $friend = new UserFriend(); 
            if($friendship && $friendship->accepted) 
            {
                $friend->accepted = true;
            } 
            else if($friendship) 
            {
                $friend->connected = true;
            }

            if($friendship->user_id_1 == $id) {
                $friend->id = $friendship->user_id_2;
            } else {
                $friend->id = $friendship->user_id_1;
            }

            if($friend->connected && !$friend->accepted) {
                if($friendship->user_id_1 == $user_id) {
                    $friend->requestRecieved = true;
                } else {
                    $friend->requestSent = true;
                }
            }

            $usersFriends[] = $friend;
        }
        

        return $usersFriends;
    }

    public function addFriendRequest($id, $user_id) 
    {
        if(!isset($id) || !isset($user_id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        if($id == $user_id)
        {
            throw new \Exception("Can't send friend request to yourself, sorry", ERROR_CODE_INVALID_PARAMETERS);
        }

        $friendship = null;

        try 
        {
            $friendship = $this->get($id, $user_id);
        }
        catch(\Exception $e) 
        {
            if(intval($e->getCode()) != ERROR_CODE_FRIENDSHIP_NOT_FOUND)
            {
                throw $e;
            }
        }
        
        if($friendship)
        {
            throw new \Exception("These users are already friends or waiting to be friends!", ERROR_CODE_ALLREADY_FRIEND);
        }

        try 
        {
            $stmt = DB::pdo()->prepare("INSERT INTO friends (user_id_1, user_id_2) VALUES (:userid1, :userid2)");
            
            $stmt->bindParam(":userid1", $id);
            $stmt->bindParam(":userid2", $user_id);

            $stmt->execute();
        }
        catch(\Exception $e)
        {
            throw $e;
        }
    }

    public function acceptFriendRequest($id, $user_id)
    {
        if(!isset($id) || !isset($user_id)) 
        {
            throw new \Exception("One or more input parameters are not set", ERROR_CODE_INVALID_PARAMETERS);
        }

        if($id == $user_id)
        {
            throw new \Exception("Can't accept friendrequest to yourself, sorry", ERROR_CODE_INVALID_PARAMETERS);
        }

         try 
        {
            $stmt = DB::pdo()->prepare("UPDATE friends SET accepted=1 WHERE user_id_1 = :userid1 AND user_id_2 = :userid2");
            
            $stmt->bindParam(":userid1", $user_id);
            $stmt->bindParam(":userid2", $id);

            $stmt->execute();
        }
        catch(\Exception $e)
        {
            throw $e;
        }
    }
}