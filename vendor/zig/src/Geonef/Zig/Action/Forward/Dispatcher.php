<?php

namespace Geonef\Zig\Action\Forward;

use \X\Geonef\Zig\Action\AbstractAction;
use \X\Geonef\Zig\Action\Forward\NotFoundException;

/**
 * Abstract dispatcher
 *
 * Concrete classes just need to implement tryDispatch()
 *
 * @package Zig
 * @subpackage Action
 * @author okapi <okapi@lapatate.org>
 */
abstract class Dispatcher extends AbstractAction
{
	protected $notFoundFallbackAction = '_notFound';

	/**
	 * {@inheritdoc}
	 */
	public function execute()
	{
		$this->preDispatch();
		$this->dispatch();
		$this->postDispatch();
	}

	/**
	 * Hook: before dispatching
	 */
	protected function preDispatch() {}

	/**
	 * Hook: after dispatching
	 */
	protected function postDispatch() {}

	/**
	 * Take next action name and dispatch it, fallback to notFound if needed
	 *
	 */
	protected function dispatch()
	{
		$name = $this->getDispatchActionName();
		/*$propertyName = $this->propertyName;
		$name = isset($this->request[$propertyName]) ?
					$this->request[$propertyName] : '';*/
		try {
			//printf("tryDispatch for: %s (%s)\n", get_class($this), $name);
			//var_dump($this->request);
			$this->tryDispatch($name);
		} catch (NotFoundException $e) {
			try {
				$this->dispatchFallBack();
			} catch (NotFoundException $e2) {
				throw $e;
			}
		}
	}

	/**
	 * Get name for the action to dispatch
	 *
	 * @return string		action name
	 */
	protected function getDispatchActionName()
	{
		return isset($this->request['query'][1]) ?
				$this->request['query'][1] : null;
	}

	/**
	 * Actually try to dispatch action named $name
	 *
	 * @param string $name		name of action to dispatch
	 * @throw NotFoundException	to indicate an invalid action
	 */
	abstract protected function tryDispatch($name);

	protected function dispatchFallBack()
	{
		$this->tryDispatch($this->notFoundFallbackAction);
	}
}
