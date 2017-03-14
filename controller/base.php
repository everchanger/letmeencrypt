<?php

namespace controller;

class Base {

	public function __construct() {		
	}
		
	protected function respond($view, $args) {	
		respondWithView($view, $args);
	}
	
	protected function redirect($request) {		
		header("Location: " . $request);
		exit;
	}
	
	protected function respondWithController($controller, $action = "show", $parameters = array()) {		
		$query = '';
		if(count($parameters) > 0 ) {
			$query .= "&" . http_build_query($parameters);
		}
		$request = "?controller=" . $controller . "&action=" . $action . "&" . $query;
		
		$this->redirect($request);
	}
};

?>