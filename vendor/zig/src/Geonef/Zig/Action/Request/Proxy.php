<?php

namespace Geonef\Zig\Action\Request;

class Proxy implements Request
{
	protected $_object = null;

	public function __construct($targetObject)
	{
		$this->_object = $targetObject;
	}

	public function __call($name, $args)
	{
		return call_user_func_array(array($this->_object, $name), $args);
	}

	public static function __callStatic($name, $args)
	{
		return call_user_func_array(
			array(get_class($this->_object), $name), $args);
	}
}
