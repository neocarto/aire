<?php

namespace Geonef\PloomapBundle\Document\Map;

use Geonef\PloomapBundle\Document\Map as AbstractMap;
use Geonef\Zig\Util\FileSystem;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * Simple map builder to simply use a static MAP file
 *
 * @Document(collection="maps")
 */
class MapFile extends AbstractMap
{
  /**
   * Path of MAP file
   *
   * @MongoString
   */
  public $path;

  /**
   * MapFile content
   *
   * @MongoString
   */
  public $content;

  protected function doBuild(ContainerInterface $container)
  {
    $path = $this->getAbsolutePath($container);
    if (!file_exists($path)) {
      throw new \Exception('MAP file does not exist: '.$path);
    }
    //die('load path: '.$path);
    return ms_newMapobj($path);
  }

  public function getAbsolutePath(ContainerInterface $container)
  {
    return 0 === strpos('/', $this->path) ? $this->path :
      FileSystem::makePath($container->getParameter('kernel.root_dir'),
                           $this->path);
  }

}
