<?php

namespace Geonef\Zig\Api;

use \Exception;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\Zig\Util\Variable;

class Request
{
  //const MODULE_INTERFACE = ''
  /**
   * Zig API manager service
   *
   * @var Geonef\Zig\Api\Manager
   */
  protected $manager;

  protected $container;

  protected $_executed = false;

  /**
   * Exception that occured in module
   *
   * @var \Exception
   */
  protected $exception = null;

  public function __construct(ContainerInterface $container)
  {
    $this->container = $container;
    $this->manager = $this->container->get('zig.api.manager');
  }

  public function setRequest($request)
  {
    $this->request = $request;
  }

  /**
   * Execute the request
   */
  public function execute()
  {
    $module = isset($this->request['module']) ?
      $this->request['module'] : 'multiplexer';
    try {
      $this->module = $this->getModuleObject($module);
      $this->module->setRequest($this->request);
      $this->container->get('logger')->info('Zig: executing API module '
                                            .get_class($this->module));
      $this->module->execute();
    }
    catch (\Exception $e) {
      $this->exception = $e;
    }
    $this->_executed = true;
  }

  protected function getModuleObject($moduleName)
  {
    $slash = strpos($moduleName, '/');
    if ($slash !== false) {
      $bundle = ucfirst(substr($moduleName, 0, $slash)).'Bundle';
      if (!isset($this->manager->namespaces[$bundle])) {
        throw new \Exception('undefined bundle: '.$bundle);
      }
      $moduleName = substr($moduleName, $slash + 1);
    }
    $moduleNS = '\\'
      . implode('\\', array_map('ucfirst', explode('.', $moduleName)));
    $namespaces = isset($bundle) ? array($this->manager->namespaces[$bundle]) :
      $this->manager->namespaces;
    foreach ($namespaces as $ns) {
      $class = $ns . $moduleNS;
      if (class_exists($class)) {
        $refl = new \ReflectionClass($class);
        if (!$refl->implementsInterface('Geonef\Zig\\Api\\ModuleInterface')) {
          //if (!($class instanceof Geonef\Zig\Api\ModuleInterface)) {
          throw new Exception('class does not implement '
                              .'required interface: '.$class);
        }
        return $refl->newInstance($this->container);;
      }
    }
    throw new \Exception('undefined module: '.$moduleName
                         .(isset($bundle) ? (' (for bundle: '.$bundle.')') : ''));

  }

  protected function checkExecuted()
  {
    if (!$this->_executed) {
      throw new Exception('API request has not been executed');
    }
  }

  public function getResponse()
  {
    $this->checkExecuted();
    if ($this->exception) {
      throw $this->exception;
      return array('status' => 'error',
                   'error' => $this->exception->getMessage(),
                   //'explanation' => $this->exception->getExplanation(),
                   'backtrace' =>
                   Variable::backtraceToJsonValue($this->exception),
                   'originalRequest' => $this->request);
    } else {
      return $this->module->getResponse();
    }
  }

  public function getResponseAsJson()
  {
    $response = $this->getResponse();
    return json_encode($response);
  }

}
