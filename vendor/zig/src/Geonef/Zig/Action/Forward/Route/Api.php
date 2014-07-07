<?php

namespace Geonef\Zig\Action\Forward\Route;

use \Geonef\Zig\Action\Request\Request;
use \Geonef\Zig\Action\Response\Response;
use \X\Geonef\Zig\Action\Forward;

class Api extends Forward\Route\Path
{
	/**
	 * Namespace for inflecting action class
	 *
	 * @var string
	 * @RegistryMapValue
	 */
	public $actionNamespace = 'X\Geonef\Zig\Action\Service\\';

	protected function matchParams(Request $request)
	{
		//static $a = 0;
		//printf("a = %d, class = %s, module = %s\n", $a++, get_class($this),
		//	isset($request['module']) ? $request['module'] : 'undefined');
		//printf("*** API\n");
		//var_dump($request);$x = 42;
		$match = false;
		if (isset($request['module'])) {
			if ($this->path === null) {
				return false;
			} else {
				if (strlen($this->path) &&
					strpos($request['module'], $this->path) !== 0) {
					return false;
				}
				$relative = trim(substr($request['module'], strlen($this->path)), '.');
				/*printf("hehehehe!!!!!!! %s\n",
					implode('\\', array_map('ucfirst', explode('.', $relative))));*/
				return array('module' =>
					implode('\\', array_map('ucfirst', explode('.', $relative))));
			}
		} else {
			if ($this->path === null) {
				return array();
			} else {
				return false;
			}
		}
	}

}
