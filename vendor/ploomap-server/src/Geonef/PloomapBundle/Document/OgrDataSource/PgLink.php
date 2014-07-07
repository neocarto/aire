<?php

namespace Geonef\PloomapBundle\Document\OgrDataSource;

use Geonef\PloomapBundle\Document\OgrDataSource as BaseClass;
use Geonef\PloomapBundle\Document\OgrLayer;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;

/**
 * @Document
 */
class PgLink extends BaseClass
{

  public function getSourcePath(ContainerInterface $container)
  {
    $props = array('database' => 'dbname', 'user' => 'user',
                   'password' => 'password', 'host' => 'host',
                   'port' => 'port');
    $args = array();
    $db = $container->get('zig_pglink.database');
    return "PG:" . $db->getConnectionString();
  }

  public function getMsLayerConnection(ContainerInterface $container, OgrLayer $layer)
  {
    return array(MS_POSTGIS, substr($this->getSourcePath($container), 3),
                 $layer->getName());
  }

  public function getModuleName()
  {
    return 'PgLink';
  }

}
