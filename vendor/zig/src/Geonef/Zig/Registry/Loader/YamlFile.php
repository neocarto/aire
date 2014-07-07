<?php

namespace Geonef\Zig\Registry\Loader;

use \X\Geonef\Zig\Registry\Loader;

kghkhjkh
/**
 * UNUSED??
 *
 * @author okapi
 *
 */
class YamlFile extends Yaml
{
	protected $path;

	public function __construct($path)
	{
		$this->path = $path;
	}

	/**
	 * Must return FS path of the root YAML file
	 *
	 * @return string path of YAML file
	 */
	protected function getRootYamlPath()
	{
		return $this->path;
	}

}

