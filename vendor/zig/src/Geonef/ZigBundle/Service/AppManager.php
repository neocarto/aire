<?php

namespace Geonef\ZigBundle\Service;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\ZigBundle\Exception;
use Geonef\Zig\Util\FileSystem;
use Symfony\Component\Finder\Finder;

/**
 * Management of client browser assets
 *
 * This should be renamed to ClientManager
 */
class AppManager
{
  /**
   * @var ContainerInterface
   */
  protected $container;

  public function __construct(ContainerInterface $container)
  {
    $this->container = $container;
  }

  public function getSupportedLocales()
  {
    $locales = array();
    $list = $this->container->getParameter('zig.app.supportedLocales');
    foreach ($list as $locale) {
      $locales[] = $locale['name'];
    }
    return $locales;
  }

  public function getLocalizationModules()
  {
    $modules = array();
    $mods = $this->container->getParameter('zig.app.localizationModules');
    foreach ($mods as $mod) {
      $modules[] = $mod['name'];
    }
    return $modules;
  }

  /**
   * Return the path to the given module
   *
   * It can be a root module like "dijit", or a submodule
   * (like "geonef.jig"), following dojo's module dot notation.
   *
   * @param string $module
   */
  public function getModulePath($name)
  {
    $list = $this->container->getParameter('zig.app.modulePaths');
    //var_dump($list);
    foreach ($list as $ns => $module) {
      if (strpos($name, $ns) === 0) {
        //$rel = substr($name, strlen($ns));
        $path = FileSystem::makePath($module['path'], explode('.', $name));

        return FileSystem::cleanPath($path);
      }
    }
    throw new Exception("Module not configured (modulePaths): ".$name);
  }

  /**
   * Return the path to the NLS file
   *
   * If $domain is not provided, return the path to the
   * directory for this particular $module and $locale.
   *
   * @param string $module
   * @param string $locale
   */
  public function getNlsPath($module, $locale, $domain = null)
  {
    $base = $this->getModulePath($module);
    $path = FileSystem::makePath($base, 'nls', $locale);
    if ($domain) {
      $path = FileSystem::makePath($path, $domain . '.js');
    }
    return $path;
  }

  public function cleanPublic()
  {
    $paths = $this->container->getParameter('zig.app.publicPaths');
    $public_dir = $this->container->getParameter('zig.app.public_dir');
    $it = Finder::create()->files()->in($public_dir);
    $count = 0;
    foreach ($it as $file) {
      $rel = $file->getRelativePathname();
      $abs = $file->getPathname();
      $keep = false;
      foreach ($paths as $regex) {
        if (preg_match('#'.$regex.'#', $rel)) {
          $keep = true;
          break;
        }
      }
      if ($keep) {
        ++$count;
      } else {
        unlink($abs);
      }
    }
    // clean empty directories
    $it = Finder::create()->directories()->in($public_dir);
    $dirs = array();
    foreach ($it as $dir) {
      $dirs[] = $dir->getRelativePathname();
    }
    rsort($dirs, SORT_STRING);
    foreach ($dirs as $dir) {
      try {
        @rmdir(FileSystem::makePath($public_dir, $dir));
      }
      catch (\Exception $e) {}
    }
    return $count;
  }

}
