<?php

namespace controller;

class home extends Base 
{
	
	public function show() 
	{	
		$user = new \model\user();

		try 
		{
			$current_user = $user->get("test@gmail.com");
			var_dump($current_user);
		} 
		catch(\Exception $e) 
		{
			echo $e->getMessage();
		}
		
		respondWithView("home", array());
	}
};

?>