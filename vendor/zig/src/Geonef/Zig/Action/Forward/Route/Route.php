<?php

namespace Geonef\Zig\Action\Forward\Route;

use \Geonef\Zig\Action\Request\Request;
use \Geonef\Zig\Action\Response\Response;

/**
 * Interface for route classes dealt with by \X\Geonef\Zig\Action\Forward\Router
 *
 * @package Zig
 * @subpackage Action
 * @author okapi <okapi@lapatate.org>
 */
interface Route
{

	/**
	 * Return matching request for given request.
	 *
	 * @return Geonef\Zig\Action\Action	target action if the route matches $request,
	 * 								FALSE otherwise
	 */
	public function matchRequest(Request $sourceRequest, Response $response);

}
