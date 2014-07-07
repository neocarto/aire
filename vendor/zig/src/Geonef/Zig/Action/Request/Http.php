<?php

namespace Geonef\Zig\Action\Request;

use \X\Geonef\Zig\Action\Request\Exception;
use \X\Geonef\Zig\Util\String;

/**
 * HTTP-specific request
 *
 * @package Zig
 * @subpackage Action
 * @author okapi
 */
class Http extends StaticRequest
{
	/**
	 * {@inheritdoc}
	 */
	public function initialize()
	{
		$this->checkValidSource();
		$this->defineParameters();
	}

	/**
	 * Check whether the source environment is suitable for this request
	 *
	 */
	protected function checkValidSource()
	{
		if (!isset($_SERVER['REQUEST_URI'])) {
			throw new Exception(
				'Request\Http must be instanciated only within HTTP server context');
		}
	}

	protected function defineParameters()
	{
		$qu = explode('/', $_SERVER['SCRIPT_NAME']);
		array_shift($qu);
		$this['query'] = $qu;
		foreach ($_SERVER as $key => $val) {
			$newkey = lcfirst(
				String::dashesToUcwords(strtolower(strtr($key,'_','-'))));
			$this[$newkey] = $val;
		}
		$this->params = $_GET;
	}
}
