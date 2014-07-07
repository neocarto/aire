<?php

namespace Geonef\Zig\Action\Request;

use \X\Geonef\Zig\Action\Request\Exception;

/**
 * CLI-specific request
 *
 * @package Zig
 * @subpackage Action
 * @author okapi
 */
class Cli extends StaticRequest
{
	/**
	 * {@inheritdoc}
	 */
	public function initialize()
	{
		$this->checkValidSource();
		$this['query'] = $_SERVER['argv'];
	}

	/**
	 * Check whether the source environment is suitable for this request
	 *
	 */
	protected function checkValidSource()
	{
		if (!isset($_SERVER['argv'])) {
			throw new Exception(
				'Request\Cli must be instanciated when PHP interface is CLI');
		}
	}

}
