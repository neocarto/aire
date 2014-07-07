<?php

namespace Geonef\PloomapBundle\Document\GdalDataset;

use Geonef\PloomapBundle\Document\GdalDataset as AbstractGdalDataset;
use Geonef\Zig\Util\FileSystem;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Float;

/**
 * @Document
 */
class Generic extends AbstractGdalDataset
{
  /**
   * @MongoString
   */
  public $path;

  /**
   * @Float
   */
  public $average;

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

  public function getAverage()
  {
    return $this->average || null;
  }

}
