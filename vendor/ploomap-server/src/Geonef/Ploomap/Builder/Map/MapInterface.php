<?php

namespace Geonef\Ploomap\Builder\Map;

interface MapInterface
{
	/**
	 * Build MapScript map object
	 *
	 * @return ms_mapObj
	 */
	public function buildMap();
}
