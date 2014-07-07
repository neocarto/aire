<?php

namespace Geonef\Zig\Registry\Loader;

use \Geonef\Zig\Registry\Loader\Yaml;
use \Geonef\Zig\Util\FileSystem;
use \Geonef\Zig\Util\ArrayAssoc;

/**
 * Registry loader for multiple YAML files within an FS directory
 *
 * @package Zig
 * @subPackage Registry
 * @author okapi <okapi@lapatate.org>
 */
class YamlDir extends Yaml
{
  /**
   * {@inheritsdoc}
   */
  public function load($path = null)
  {
    if ($path === null) {
      $path = $this->path;
    }
    if (substr($path, 0, 1) !== '/') {
      $path = $this->getAbsoluteYamlPath($path);
    }
    if (is_dir($path)) {
      return $this->mergeDir($path);
    } else {
      return parent::load($path);
    }
  }

  protected function mergeDir($path)
  {
    $files = array_filter(scandir($path),
                          function ($f) { return
                              strpos('_.', substr($f, 0, 1)) === false; });
    $list = array();
    foreach ($files as $file) {
      //printf("found: %s\n", $file);exit;
      $p = FileSystem::makePath($path, $file);
      if (substr($file, 0, 1) !== '_') {
        $list[!is_dir($p)][$file] = $p;
      }
    }
    //print_r($list);
    $node = array();
    foreach ($list as $isFile => $g) {
      foreach ($g as $fn => $path) {
        if ($isFile) {
          $key = basename($fn, '.yml');
          if ($key == $fn) {
            continue;
          }
        } else {
          $key = $fn;
        }
        //printf("pr: %s\n", $path);
        ArrayAssoc::replaceRecursive(
                                     ArrayAssoc::getPath($node, $key),
                                     $this->load($path));
      }
    }
    return $node;
  }

}
