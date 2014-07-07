<?php

namespace Geonef\PloomapBundle\Document\OgrDataSource;

use Geonef\PloomapBundle\Document\OgrDataSource as BaseClass;
use Geonef\PloomapBundle\Document\OgrLayer;
use Geonef\Zig\Util\FileSystem;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * @Document
 */
class Generic extends BaseClass
{
  /**
   * @MongoString
   */
  public $path;

  /**
   * @MongoString
   */
  public $type;

  /**
   * Check validity of document properties
   *
   * @param $container ContainerInterface
   * @param $errors    array
   * @return boolean    Whether the map properties are valid
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = $this->checkCond(strlen($this->path) > 0,
                              'path', 'missing', $errors);
    if ($state) {
      $state &= parent::checkProperties($container, $errors);
    }
    return $state;
  }

  public function getSourcePath(ContainerInterface $container)
  {
    $path = $this->path;
    if ($path[0] !== '/') {
      $path = FileSystem::makePath
        ($container->getParameter('kernel.root_dir'),
         'data', $path);
    }
    return $path;
  }

  public function getMsLayerConnection(ContainerInterface $container, OgrLayer $layer)
  {
    $path = $this->getSourcePath($container);
    if ($this->type == 'shapedir') {
      return array(MS_SHAPEFILE, null, FileSystem::makePath($path, $layer->getName()));
    }
    return array(MS_OGR, $this->getSourcePath($container), $layer->getName());
  }

  public function getModuleName()
  {
    return 'Generic';
  }

}
