<?php

namespace Geonef\Zig\Registry\Loader;

use \Geonef\Zig\Registry\Loader\AbstractLoader;
use \Symfony\Component\Yaml\Yaml as Yaml_;
use \Exception;

/**
 * Registry loader for YAML format
 *
 * Starts from one file (self::getRootYamlPath)
 *
 * @author okapi <okapi@lapatate.org>
 *
 */
abstract class Yaml extends AbstractLoader
{
  /**
   * Must return FS path of the root YAML file
   *
   * @return string path of YAML file
   */
  protected function getAbsoluteYamlPath($path)
  {
    return $path;
  }

  public function loadRaw($path = null)
  {
    if (substr($path, 0, 1) !== '/') {
      $path = $this->getAbsoluteYamlPath($path);
    }
    if (!file_exists($path)) {
      throw new Exception('YAML file does not exist: ' . $path);
    }
    $data = Yaml_::parse($path);
    //printf("\nfrom sfYaml of %s: %s\n", $path, substr(print_r($data, true),0,40));
    return $data;
  }

}
