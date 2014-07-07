<?php

namespace Geonef\Ploomap\Builder\Map;

use \Geonef\Ploomap\Builder\Map\MapInterface;

class MapFile implements MapInterface
{
	/**
	 *
	 * @RegistryMapValue(required=true)
	 * @var unknown_type
	 */
	public $path;

	public function __construct()
	{

	}

	/**
	 * {@inheritdoc}
	 *
	 */
	public function buildMap()
	{
		if (!file_exists($this->path)) {
			throw new \Exception('map file does not exist: '.$this->path);
		}
		$mapObj = ms_newMapObj($this->path);
		return $mapObj;
	}
}
