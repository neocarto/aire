<?php

namespace Geonef\Zig\Action\Forward\Route;

use \X\Geonef\Zig\Action\Forward;
use \Geonef\Zig\Action\Request\Request;
use \Geonef\Zig\Action\Response\Response;

/**
 * Dummy route, used as a facility to debug the config
 *
 * @package Zig
 * @subpackage Action
 * @author okapi <okapi@lapatate.org>
 */
class Disabled implements Forward\Route\Route
{
	/**
	 * {@inheritdoc}
	 */
	public function matchRequest(Request $request, Response $response)
	{
		return false;
	}

}
