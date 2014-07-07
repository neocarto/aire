<?php

namespace Geonef\ZigBundle\Service;

use Symfony\Component\HttpKernel\CacheWarmer\CacheWarmerInterface;
use Geonef\ZigBundle\Service\StaticCacheManager;
use Symfony\Component\Routing\RouterInterface;
use Geonef\Zig\Util\FileSystem;


/**
 * Cache warmer for staticCache : dumping of Apache rewrite rules
 */
class StaticCacheWarmer implements CacheWarmerInterface
{
  protected $router;

  protected $manager;

  public function __construct(StaticCacheManager $manager, RouterInterface $router)
  {
    $this->manager = $manager;
    $this->router = $router;
  }

  public function isOptional()
  {
    return false;
  }

  public function warmUp($cacheDir)
  {
    $path = FileSystem::makePath($cacheDir, 'rewrite.conf');
    $conf = $this->manager->getAllApacheRewrite($this->router);
    file_put_contents($path, $conf);
  }

}
