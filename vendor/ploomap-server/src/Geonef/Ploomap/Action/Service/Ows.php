<?php

namespace Geonef\Ploomap\Action\Service;

use \X\Geonef\Zig\Action\AbstractAction;

abstract class Ows extends AbstractAction
{
	public function execute()
	{
		$mapName = $this->getMapName();
		$mapObj = $this->loadMapObj($mapName);
		exit;
		$req = \ms_newOwsrequestObj();
		$req->loadParams();
		$status = $mapObj->owsdispatch($req);
		if ($status === MS_FAILURE) {
			throw new \Exception('failed to process request');
		}
	}

	/**
	 * Provide the name of the requested map
	 *
	 * @return string
	 */
	protected function getMapName()
	{
		if (!isset($this->request['map'])) {
			throw new \Exception('missing param: map');
		}
		return $this->request['map'];
	}

	/**
	 * Load the MapScript MapObj object
	 *
	 * @param string $mapName		name of the map
	 * @return ms_MapObj
	 */
	abstract protected function loadMapObj($mapName);

}
