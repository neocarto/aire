<?php

namespace Geonef\PgLinkBundle\Query;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PgLinkBundle\Document\View;

abstract class ViewQuery
{

  /**
   * @var View
   */
  protected $view;

  /**
   * @var ContainerInterface
   */
  protected $container;


  public function __construct(ContainerInterface $container, View $view)
  {
    $this->container = $container;
    $this->db = $this->container->get('zig_pglink.database');
    $this->view = $view;
  }

}
