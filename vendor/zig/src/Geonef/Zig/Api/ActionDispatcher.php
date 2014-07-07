<?php

namespace Geonef\Zig\Api;

use Geonef\Zig\Util\Variable;

abstract class ActionDispatcher extends AbstractModule
{
  /**
   * Hook: code to call before action is called
   *
   */
  protected function preDispatch()
  {
  }

  /**
   * Hook: code to call after action is called
   *
   */
  protected function postDispatch()
  {
  }

  /**
   * Dispatch request in this API controller
   */
  public function execute()
  {
    try {
      if (!isset($this->request['action'])) {
        throw new \Exception('action:missing');
      }
      $action = $this->request['action'];
      $method = $this->inflectMethodName($action);
      if (!method_exists($this, $method)) {
        $this->container->get('logger')->err('Zig: invalid API action '
                                              .$action);
        throw new \Exception('action:invalid:'.$this->request['action']);
      }
      $this->container->get('logger')->info('Zig: dispatching to action '
                                            .$action);
      $this->preDispatch();
      $this->$method();
      $this->postDispatch();
    }
    catch (\Exception $e) {
      $this->response['status'] = 'exception';
      $this->response['exception'] = array
        ('code' => $e->getCode(),
         'message' => $e->getMessage(),
         'backtrace' => Variable::backtraceToJsonValue($e)
         );
    }
  }

  protected function inflectMethodName($name)
  {
    return $name . 'Action';
  }

  /**
   * Check the presence of given arguments
   *
   * @param $args array array of arg names to check
   */
  protected function checkArguments($args)
  {
    foreach ($args as $arg) {
      if (!isset($this->request[$arg]))
        throw new \InvalidArgumentException('missing argument:'.$arg);
    }
  }

}
