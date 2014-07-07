<?php

namespace Geonef\Ploomap\Builder\Map;

use \Geonef\Ploomap\Builder\Map\MapInterface;

class Wrapper implements MapInterface
{
	/**
	 * MapScript map object
	 *
	 * @var ms_mapObj;
	 */
	public $mapObj;

	/**
	 * Trigger for registry map
	 *
	 * @var callback
	 */
	public $afterMapObjCreation;

	public function __construct()
	{
	}

	/**
	 * {@inheritdoc}
	 *
	 */
	public function buildMap()
	{
		return $this->buildMapObj();
	}

	protected function buildMapObj()
	{
		$this->mapObj = ms_newMapObj(null);
		//printf("after new mapObj\n");
		call_user_func($this->afterMapObjCreation);
		//printf("after trigger\n");
		return $this->mapObj;
	}

	/**
	 * Set map member
	 *
	 * @LateMapping(trigger="afterMapObjCreation", action=
	 * 			@RegistryMapForEach(key="settings",passName=true))
	 */
	public function set($name, $value)
	{
		printf("setter: %s = %s\n", $name, $value);
		$this->mapObj->set($name, $value);
	}

	/**
	 *
	 * @LateMapping(trigger="afterMapObjCreation", action=
	 * 			@RegistryMapSetter(key="outputFormat",type="string"))
	 */
	public function selectOutputFormat($format) {
		printf("format: %s\n", $format);
		$this->mapObj->selectOutputFormat($format);
	}

}
