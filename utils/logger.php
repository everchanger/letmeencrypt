<?php

namespace utils;

class Logger 
{

	const DEFAULT_LOG_FILE = "logs/log.txt";
	
	private static function log($msg) 
	{
		$msg = date('y-m-d H:i:s ::') . "$msg\r\n";
		
		$dirname = dirname(self::DEFAULT_LOG_FILE);
		if (!is_dir($dirname)) 
		{
			mkdir($dirname, 0755, true);
		}
		
		// try to open up the log file
		$logFile = fopen(self::DEFAULT_LOG_FILE, 'a');
		if($logFile == FALSE) 
		{
			return FALSE;
		}
		
		$ret = fwrite($logFile, $msg);
		if($ret == FALSE) 
		{
			return FALSE;
		}
		
		$ret = fclose($logFile);
		if($ret == FALSE) 
		{
			return FALSE;
		}
		
		return TRUE;
	}
	
	private static function prepare($message) 
	{
		$tmp = $message;
		
		if(is_array($message)) 
		{
			$tmp = "Array:\r\n";
			foreach($message as $key => $value) 
			{
				$tmp .= "\t" . $key ." => " .$value. "\r\n";
			}
		}
		
		return $tmp;
	}
	
	public static function logError($message)
	{		
		return self::log("ERROR:: ". self::prepare($message));
	}
	
	public static function logWarning($message)
	{
		return self::log("WARNING:: ". self::prepare($message));
	}
	
	public static function logDebug($message) 
	{
		//$message .= " ". debug_print_backtrace();
		return self::log("DEBUG:: ". self::prepare($message));
	}
};

?>