<?php

namespace Geonef\Zig\Api;

use Symfony\Component\DependencyInjection\ContainerInterface;

abstract class AbstractModule implements ModuleInterface
{
  /**
   * Zig API manager service
   *
   * @var Geonef\Zig\Api\Manager
   */
  protected $manager;

  /**
   * Structure of request
   */
  protected $request = array();

  /**
   * Structure of response
   */
  protected $response = array();


  public function __construct(ContainerInterface $container)
  {
    $this->container = $container;
    $this->init();
  }

  /**
   * Hook: init function: called from end of constructor
   *
   * Overload this method when needed
   */
  protected function init()
  {
  }

  public function setRequest($request)
  {
    $this->request = $request;
  }

  public function getResponse()
  {
    return $this->response;
  }

  /**
   * (declared in interface)
   */
  //abstract public function execute();

}
