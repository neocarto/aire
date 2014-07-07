<?php

namespace Geonef\Zig\Action\Forward\Route;

use \Geonef\Zig\Action\Request\Request;
use \Geonef\Zig\Action\Response\Response;
use \X\Geonef\Zig\Action\Forward;

/**
 *
 *
 * @X\Geonef\Zig\Class\MapRegistry("x.zig.action.forward.route")
 *
 * @X\Geonef\Zig\Class\MapRegistry
 */
class Path extends Forward\Route\StaticCondition
{
	/**
	 * URL-like param to filter, with :paramName substitutions
	 *
	 * @var string
	 * @RegistryMapValue
	 */
	public $path = null;

	/**
	 * {@inheritdoc}
	 */
	public function matchRequest(Request $request, Response $response)
	{
		//var_dump($request);
		if (!$this->checkSimpleConditions($request)) {
			return false;
		}
		$params = $this->matchParams($request);
		if ($params === false) {
			return false;
		}
		//var_dump($params);
		$targetRequest = $this->buildTargetRequest($request, $params);
		//printf("matched: %s\n", $this->path);
		$action = $this->buildTargetAction($targetRequest, $response);

		//var_dump($action);
		return $action;
	}

	protected function matchParams(Request $request)
	{
		$uri = explode('/', trim($request['scriptUrl'], '/'));
		$expected = explode('/', trim($this->path, '/'));
		if (count($uri) != count($expected)) {
			return false;
		}
		//var_dump($uri);
		//var_dump($expected);
		$params = array();
		reset($uri);
		$uriPart = current($uri);
		foreach ($expected as $part) {
			if ($uriPart === false) {
				return false;
			}
			$param = $this->getParamName($part);
			if ($param === false) {
				if ($part != $uriPart) {
					return false;
				}
			} else {
				$params[$param] = $uriPart;
			}
			$uriPart = next($uri);
		}
		return $params;
	}

	/**
	 * Get parameter name from representation like ":foo"
	 *
	 * @return mixed parameter name or false if none
	 */
	protected function getParamName($repr)
	{
		if (!strlen($repr) || $repr[0] != ':') {
			return false;
		}
		return substr($repr, 1);
	}
}
