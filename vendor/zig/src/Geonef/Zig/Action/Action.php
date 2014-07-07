<?php

namespace Geonef\Zig\Action;

use Geonef\Zig\Action\Request\Request;
use Geonef\Zig\Action\Response\Response;

interface Action
{

	public function __construct(Request $request, Response $response);

	public function execute();

}
