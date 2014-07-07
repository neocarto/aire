<?php

namespace Geonef\Zig\Action\AppInterface;
use \X\Geonef\Zig\Action\Forward;
use \X\Geonef\Zig\Action\Request;
use \X\Geonef\Zig\Action\Response;

class Cli extends Forward\ClassDispatcher
{
	protected $notFoundFallbackAction = 'Help';

	public function initialize()
	{
		parent::initialize();
		$this->request = new Request\Cli;
		$this->response = new Response\Cli;
	}

	protected function formatClassName($actionName)
	{
		return parent::formatClassName('Cli\\' . ucfirst($actionName));
	}

	protected function getForwardRequest()
	{
		$request = clone $this->request;
		$query = $request['query'];
		array_shift($query);
		$request['query'] = $query;
		return $request;
		//return new Request\Proxy($this->request);
	}

}
