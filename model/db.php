<?php 

namespace model;

DEFINE('DB_USER',       'root');
DEFINE('DB_PASSWORD',   '');
DEFINE('DB_HOST',       'localhost');
DEFINE('DB_NAME',       'crypto');

class DB
{
    protected static $connection   = null;

    public function __construct()
    {
    }

    public static function pdo()
    {
        if (self::$connection === null)
        {
            try 
            {
                self::$connection = new \PDO('mysql:host='.DB_HOST.'; dbname='.DB_NAME.'; charset=utf8', DB_USER, DB_PASSWORD);
                self::$connection->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
                self::$connection->setAttribute(\PDO::ATTR_EMULATE_PREPARES, false);
            }
            catch (\Exception $e) 
            {
                throw $e;
            }
        }
        
        return self::$connection;
    }
}