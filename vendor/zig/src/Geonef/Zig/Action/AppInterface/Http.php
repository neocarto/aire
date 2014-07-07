<?php

namespace Geonef\Zig\Action\AppInterface;
use \X\Geonef\Zig\Action\Forward;
use \X\Geonef\Zig\Action\Request;
use \X\Geonef\Zig\Action\Response;

class Http extends Forward\ClassDispatcher
{
	protected $notFoundFallbackAction = 'NotFound';

	public function initialize()
	{
		parent::initialize();
		$this->request = new Request\Http;
		$this->response = new Response\Http;
	}

	protected function formatClassName($actionName)
	{
		return parent::formatClassName('Http\\' . ucfirst($actionName));
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
