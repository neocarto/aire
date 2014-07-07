<?php

namespace Geonef\Zig\Api;

use Symfony\Component\DependencyInjection\ContainerInterface;

class Manager
{
  protected $container;

  public $namespaces = array();

  public function __construct(ContainerInterface $container,
                              $namespaces = array())
  {
    $this->namespaces = $namespaces;
    $this->container = $container;
  }

  /**
   * Dispatch the request
   */
  public function newRequest($struct)
  {
    $request = new Request($this->container);
    $request->setRequest($struct);
    return $request;
  }
}
