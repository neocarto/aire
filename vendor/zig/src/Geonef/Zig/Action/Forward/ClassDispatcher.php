<?php

namespace Geonef\Zig\Action\Forward;

use \X\Geonef\Zig\Action\AbstractAction;
use \X\Geonef\Zig\Action\Forward\Exception;


class ClassDispatcher extends Dispatcher
{
	/**
	 * @var string
	 * @RegistryMapValue
	 */
	public $actionNamespace = 'X\Geonef\Zig\Action';
	protected $notFoundFallbackAction = 'NotFound';

	protected function formatClassName($actionName)
	{
		return $this->actionNamespace . '\\' . ucfirst($actionName);
	}

	protected function tryDispatch($name)
	{
		$class = $this->formatClassName($name);
		//printf("trying %s\n", $class);
		if (!class_exists($class)) {
			throw new NotFoundException(
				'class '.$class.' does not exist for dispatching');
		}
		$action = new $class(
			$this->getForwardRequest(), $this->getForwardResponse());
		$action->execute();
	}

	protected function getForwardRequest()
	{
		//var_dump ($this->request);
		$request = $this->request->getShiftedRequest();
		//$request->shiftMember();
		return $request;
	}

	protected function getForwardResponse()
	{
		return $this->response;
	}
}
