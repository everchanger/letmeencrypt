<?php

namespace controller;

class home extends Base {
	
	public function show() {	
		respondWithView("home", array());
	}
};

?>