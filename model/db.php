<?php 

DEFINE('DB_USER',       'root');
DEFINE('DB_PASSWORD',   '');
DEFINE('DB_HOST',       'localhost');
DEFINE('DB_NAME',       'crypto');

class DB
{
    protected $connection   = null;
    protected $statement    = null;

    public function __construct()
    {
    }

    public function query($query)
    {
        if ($this->connection === null)
        {
            $this->connection = new PDO('mysql:host='.DB_HOST.'; dbname='.DB_NAME.'; charset=utf8', 'DB_USER', 'DB_PASSWORD');
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        }

        return $this->connection->prepare($query);
    }
}

$g_db = new DB();