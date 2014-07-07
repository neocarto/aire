<?php

namespace Geonef\PloomapBundle\Api\ListQuery\MapCollection;

use Geonef\PloomapBundle\Api\ListQuery\MapCollection as BaseMapCollection;
use Geonef\PloomapBundle\Document\MapCollection\MultiRepr
  as MultiReprDoc;

class MultiRepr extends BaseMapCollection
{
  public function loadInfoAction()
  {
    $id = $this->request['uuid'];
    $mapCollection = $this->find($id);
    $mapTypes = MultiReprDoc::$mapTypes;
    $this->response['mapTypes'] = $mapTypes;
    foreach ($mapTypes as $repr => $unitScales) {
      foreach ($unitScales as $unitScale) {
        $map = $mapCollection->getMap($this->container, $repr, $unitScale, true);
        $this->response['maps'][$repr][$unitScale] = $map->uuid;
      }
    }
  }

  /**
   *
   */
  public function getMapsInfoAction()
  {
    $id = $this->request['uuid'];
    $mapCollection = $this->find($id);
    $this->response['maps'] = $mapCollection->getMapsInfo($this->container);
    // $mapTypes = MultiReprDoc::$mapTypes;
    // $this->response['mapTypes'] = $mapTypes;
    // foreach ($mapTypes as $repr => $unitScales) {
    //   foreach ($unitScales as $unitScale) {
    //     $map = $mapCollection->getMap($this->container, $repr, $unitScale, true);
    //     $this->response['maps'][$repr][$unitScale] = $map->uuid;
    //   }
    // }
  }

}
