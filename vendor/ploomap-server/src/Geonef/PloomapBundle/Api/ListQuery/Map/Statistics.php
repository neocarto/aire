<?php

namespace Geonef\PloomapBundle\Api\ListQuery\Map;

use Geonef\PloomapBundle\Api\ListQuery\Map as BaseMap;
use Geonef\PloomapBundle\Document\Map\Statistics as StatisticsDoc;

class Statistics extends BaseMap
{
  public function getValuesAction()
  {
    $uuid = $this->request['uuid'];
    $mapDoc = $this->find($uuid);
    if (!($mapDoc instanceOf StatisticsDoc)) {
      throw new \Exception('map must be an instance of Statistics: '.$uuid);
    }
    $values = $mapDoc->getIndicatorValues($this->container);
    sort($values);
    $this->response['values'] = $values;
    $this->response['statistics'] =
      $mapDoc->getIndicatorStatistics($this->container);
  }

}
