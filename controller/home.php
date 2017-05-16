<?php

namespace controller;

class home extends Base 
{
	
	public function show() 
	{	
		respondWithView("home", array());
	}

	public function register() 
	{
		respondWithView("register", array());
	}

	public function faq() 
	{
		respondWithView("faq", array());
	}
};

?>