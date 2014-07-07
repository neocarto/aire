<?php

namespace Geonef\Zig\Action\Forward;

use \X\Geonef\Zig\Action\AbstractAction;
use \X\Geonef\Zig\Action\Request\StaticRequest;
use \X\Geonef\Zig\Action\Response\StaticResponse;
use \X\Geonef\Zig\Action\Response\Exception as ResponseException;

class Multiplex extends AbstractAction
{
	/**
	 * Class to instanciate for forwarding each sub-action
	 *
	 * @var string
	 * @RegistryMapValue
	 */
	public $forwardClass;

	const MAX_RECURSION_LOOP = 42;
	protected $entryRequests = array();
	protected $entryResponses = array();

	protected function initialize()
	{
		//var_dump($this);
		//if (isset($this->request['actionParameters']['actionClass'])) {
		//	$this->actionClass = $this->request['actionParameters']['actionClass'];
		//}
	}

	public function execute()
	{
		if (count(debug_backtrace()) > static::MAX_RECURSION_LOOP) {
			throw new \Exception('maximum recursion loop reached: '
									. static::MAX_RECURSION_LOOP);
		}
		//printf("multiplex execute\n");
		//var_dump($this->request);
		//printf("toArray: %s\n", print_r($this->request->toArray()));
		foreach ($this->request->toArray() as $n => $v) {
			//printf("key %s, value %s\n", $n , print_r($v));
			if (is_array($v) && $n !== 'actionClass') {
				/*printf("running action %s with params: %s\n",
						$n, print_r($v, true));*/
				$this->processEntryAction($n, $v);
			}
		}
		//var_dump($this->entryRequests);
		$this->compileResponse();
		return true;
	}

	protected function processEntryAction($name, $params)
	{
		$this->entryRequests[$name] = $this->makeEntryRequest($params);
		$this->entryResponses[$name] = $this->makeEntryResponse();
		//var_dump($this->entryResponses);
		$action = $this->makeEntryAction($name);
		try {
			//printf("running action %s\n", $name);
			//var_dump($action);
			$action->execute();
		}
		catch (\Exception $e) {
			printf("exception in action: %s\n", $name);
			$this->response[$name] = new ResponseException($e);
			throw $e;
		}
	}

	protected function makeEntryRequest($params)
	{
		$request = new StaticRequest();
		$request->mergeArray($params);
		//$request->mergeArray($this->actionParameters);
		return $request;

	}

	protected function makeEntryResponse()
	{
		return new StaticResponse();
	}

	protected function makeEntryAction($name)
	{
		$class = $this->forwardClass;
		//var_dump('use requ:', $this->entryRequests[$name]);
		return new $class(
					$this->entryRequests[$name], $this->entryResponses[$name]);
	}

	protected function compileResponse()
	{
		//var_dump($this->entryResponses);
		foreach ($this->entryResponses as $n => $resp) {
			$this->response[$n] = $resp->toArray();
		}
	}
}
