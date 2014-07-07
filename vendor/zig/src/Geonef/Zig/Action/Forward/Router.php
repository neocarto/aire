<?php

namespace Geonef\Zig\Action\Forward;

use \X\Geonef\Zig\Action\AbstractAction;
use \X\Geonef\Zig\Action\Forward\Route\Route;
use \X\Geonef\Zig\Action\Forward\NotFoundException;

/**
 *
 *
 * @RegistryFactory(class="Default")
 * @author okapi
 */
class Router extends AbstractAction
{
	protected $routes = array();

	/**
	 * @RegistryMapForEach(key="defaultParams",type="array")
	 * @param array $name	array of parameters
	 */
	public function setDefaultParams($params)
	{

	}

	/**
	 * Add a route
	 *
	 * @RegistryMapForEach(key="routes",type="object",prefix="Geonef\Zig\Action\Forward\Route\")
	 * @param Geonef\Zig\Action\Forward\Route\Route $route		route to add
	 */
	public function addRoute(Route $route)
	{
		//printf("%s: add route: %s\n", get_class($this), get_class($route));
		$this->routes[] = $route;
	}

	/**
	 * {@inheritdoc}
	 *
	 */
	public function execute()
	{
		$routes = array_reverse($this->routes);
		$_executed = false;
		foreach ($routes as $route) {
			$targetAction = $route->matchRequest(
										$this->request, $this->response);
			if ($targetAction) {
				//printf("match route %s: <<<%s>>>\n", get_class($route), print_r($route, true));
				//var_dump($route);
				$targetAction->execute();
				$_executed = true;
				break;
			}
		}
		if ($_executed) {
			$this->postExecute();
		} else {
			$this->failureExecute();
		}
	}

	/**
	 * Hook : after successful execute()
	 *
	 */
	protected function postExecute()
	{
	}

	protected function failureExecute()
	{
		throw new NotFoundException('no route matches this request');
	}
}
