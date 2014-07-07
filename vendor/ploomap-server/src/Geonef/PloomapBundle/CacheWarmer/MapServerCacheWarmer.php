<?php

namespace Geonef\PloomapBundle\CacheWarmer;

use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\HttpKernel\CacheWarmer\CacheWarmerInterface;
use Geonef\Zig\Util\FileSystem;

class MapServerCacheWarmer implements CacheWarmerInterface
{
  /**
   * @var Container
   */
  protected $container;

  /**
   * @param Container $container
   */
  public function __construct(Container $container)
  {
    $this->container = $container;
  }

  /**
   * This cache warmer is not optional, without hydrators fatal error occurs!
   *
   * @return false
   */
  public function isOptional()
  {
    return false;
  }

  public function warmUp($cacheDir)
  {
    foreach (array('mapFile', 'mapTemp', 'mapImage', 'tiles') as $d) {
      $dir = FileSystem::makePath($cacheDir, $d);
      if (!is_dir($dir)) {
        FileSystem::mkdir($dir);
      }
    }
    $logDir = FileSystem::makePath
      ($this->container->getParameter('kernel.logs_dir'), 'map');
    if (!is_dir($logDir)) {
      mkdir($logDir);
    }
   }

}
