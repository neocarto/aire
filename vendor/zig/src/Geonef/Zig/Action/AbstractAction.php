<?php

namespace Geonef\Zig\Action;
use Geonef\Zig\Action\Request\Request;
use Geonef\Zig\Action\Response\Response;

abstract class AbstractAction implements Action
{
	protected $request;
	protected $response;

	public function __construct(Request $request, Response $response)
	{
		$this->request = $request;
		$this->response = $response;
		$this->initialize();
	}

	protected function initialize() {}

}
