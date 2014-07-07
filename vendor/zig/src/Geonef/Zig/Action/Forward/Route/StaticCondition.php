<?php

namespace Geonef\Zig\Action\Forward\Route;

use \X\Geonef\Zig\Action\Forward;
use \X\Geonef\Zig\Action\Action as ActionInterface;
use \Geonef\Zig\Action\Request\Request;
use \Geonef\Zig\Action\Response\Response;
use \X\Geonef\Zig\Util\String;
use \X\Geonef\Zig\Registry\Mapper;

class StaticCondition implements Forward\Route\Route
{
	/**
	 * Action object
	 *
	 * (if null, will be guessed and may be inflected from params)
	 *
	 * var Geonef\Zig\Action\Action
	 * @RegistryMapValue(type="object")
	 */
	public $action;

	/**
	 * Action class
	 *
	 * If set, will be used directly (no inflection),
	 * and self::$actionNamespace won't be used.
	 *
	 * @var string
	 * @RegistryMapValue
	 */
	public $actionClass;

	/**
	 * Namespace for inflecting action class
	 *
	 * @var string
	 * @RegistryMapValue
	 */
	public $actionNamespace = 'X\Geonef\Zig\Action\Http\\';

	/**
	 * Holder of parameters for registry-mapping on action object
	 *
	 * @var array of mixed values
	 * @RegistryMapValue
	 */
	public $actionSettings = array();

	/**
	 * Array of static conditions
	 *
	 * They are mere associations name => value for equality test
	 * against the request.
	 *
	 * Registry-mapped through method addEqualityCondition().
	 *
	 * @var array of mixed values
	 */
	public $conditions = array();

	/**
	 * Holder of parameters to merge into the target action request
	 *
	 * Old name was: actionParameters
	 *
	 * @var array of mixed values
	 * @RegistryMapValue
	 */
	public $params = array();

	/**
	 *
	 * @var Geonef\Zig\Action\Action
	 * @RegistryMapValue(type="object")
	 */
	//public $action;

	public function __construct()
	{
		$this->initialize();
	}

	protected function initialize()
	{
	}

	/**
	 * Add simple equality condition on parameter's value
	 *
	 * @RegistryMapForEach(key="conditions",passName=true)
	 * @param string $name
	 * @param string $value
	 */
	public function addEqualityCondition($name, $value)
	{
		if (isset($this->conditions[$name])) {
			throw new \Exception(
				'condition already defined for parameter "'.$name.'"');
		}
		$this->conditions[$name] = $value;
	}

	/**
	 * Add parameter to action request
	 *
	 * @RegistryMapForEach(key="actionParameters",passName=true)
	 * @param string $name
	 * @param string $value
	 */
	/*public function addActionParameter($name, $value)
	{
		//printf("add param (%s): %s = %s\n", get_class($this), $name, $value);
		$this->actionParams[$name] = $value;
	}*/

	/**
	 * {@inheritdoc}
	 */
	public function matchRequest(Request $request, Response $response)
	{
		//var_dump($request);
		if (!$this->checkSimpleConditions($request)) {
			return false;
		}
		$targetRequest = $this->buildTargetRequest($request, $this->actionParams);
		return $this->buildTargetAction($targetRequest, $response);
	}

	protected function checkSimpleConditions(Request $request)
	{
		foreach ($this->conditions as $name => $value) {
			//printf("testing cond '%s' => '%s'\n", $name, $value);
			if (!isset($request[$name])  || $request[$name] != $value) {
				return false;
			}
		}
		return true;
	}


	/**
	 * Build action matching this route
	 *
	 * @return Geonef\Zig\Action\Action
	 */
	protected function buildTargetAction(Request $targetRequest, Response $response)
	{
		if ($this->action instanceof ActionInterface) {
			return $this->action;
		}
		$class = $this->getActionClass($targetRequest);
		/*printf("*** StaticCond\n");
		var_dump($targetRequest);
		printf("*** StaticCond WAS: %s\n", $class);*/
		if (!class_exists($class)) {
			//printf("not found: %s\n", $class);
			return null;
		}
		$action = new $class($targetRequest, $response);
		//var_dump('mapping props:', $this->actionSettings);
		Mapper::mapObject($this->actionSettings, $action);
		return $action;
	}

	/**
	 * Build name of class, given the request
	 *
	 * May use local properties and inflect some request parameters.
	 * Called by self::buildTargetAction()
	 *
	 * @return string
	 */
	protected function getActionClass($targetRequest)
	{
		//printf("%s\n", get_class($this));
		//var_dump($this->actionParams);
		//var_dump($targetRequest);
		if (strlen($this->actionClass)) {
			$class = $this->actionClass;
		} elseif (strlen($this->actionNamespace)) {
			//die('hehe');
			/*printf("class: %s\n", get_class($this));
			var_dump($this);exit;
			var_dump($this->params);exit;
			var_dump($targetRequest);*/
			if (isset($targetRequest['module'])) {
				$class = $this->actionNamespace
					   . String::classify($targetRequest['module']);
				unset($targetRequest['module']);  // we don't want to pass this thru requ
			}
		}
		if (!isset($class)) {
			//var_dump($targetRequest);
			throw new \Exception(
				'"action" not defined in route params');
		}
		return $class;
	}

	/**
	 * Build target request
	 *
	 * @return Geonef\Zig\Action\Request\Request
	 */
	protected function buildTargetRequest(
							Request $sourceRequest, $params = null)
	{
		$request = clone $sourceRequest;
		$request->mergeArray(array_merge($this->params, $params ?: array()));
		return $request;
	}


}
