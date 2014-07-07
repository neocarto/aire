<?php

namespace Geonef\Zig\FileSystem\Mapping;

class Directory
{
	/**
	 * Logical path, as seen from mapped tree
	 *
	 * @var string
	 */
	protected $mappedPath;

	public function getMappedPath()
	{
		return $this->mappedPath;
	}

	/**
	 * Set logical path
	 *
	 * @RegistryMapSetter(key="mappedPath",type="string")
	 */
	public function setMappedPath($path)
	{
		$this->mappedPath = $path;
	}
}
