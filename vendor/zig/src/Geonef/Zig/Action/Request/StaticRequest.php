<?php

namespace Geonef\Zig\Action\Request;
use \X\Geonef\Zig\Common\Container\Hash;

class StaticRequest extends Hash implements Request
{
	protected $body;

	public function __construct()
	{
		$this->initialize();
	}

	protected function initialize() {}

	public function getBody()
	{
		return $this->body;
	}


	/*public function getShiftedRequest()
	{
		$request = clone $this;
		$array = $this['argv'];
		array_shift($array);
		$request['argv'] = $array;
		$request['action'] = isset($request['argv'][1]) ?
								$request['argv'][1] : null;
		//printf("new action is: %s\n", $request['action']);
		return $request;
	}*/
}
