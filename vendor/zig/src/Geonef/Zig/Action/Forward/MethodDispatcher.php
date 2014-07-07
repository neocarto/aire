<?php

namespace Geonef\Zig\Action\Forward;

use \X\Geonef\Zig\Action\AbstractAction;
use \X\Geonef\Zig\Action\Forward;

abstract class MethodDispatcher extends Dispatcher
{
	protected $propertyName = 'action';

	protected function formatMethodName($actionName)
	{
		return lcfirst($actionName) . 'Action';
	}

	protected function tryDispatch($name)
	{
		$method = $this->formatMethodName($name);
		if (!method_exists($this, $method)) {
			throw new Forward\NotFoundException(
				'method '.$method.' does not exist in dispatcher');
		}
		$this->$method();
	}
}
