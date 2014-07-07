<?php

namespace Geonef\PloomapBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;

/**
 * MapLayer is an embedded document - no list query with this class.
 *
 * So far, the class is only used to get metadata for given module.
 */
class MapLayer extends AbstractDocumentQuery
{
  protected $documentClass = 'Geonef\PloomapBundle\Document\MapLayer';

  protected $disablePagination = false;

  public function getFilterForIdAction()
  {
    $id = $this->request['id'];
    $doc = $this->find($id);
    $this->response['document'] = $this->composeRowStructure($doc);
    $this->response['filter'] =
      array('name' => array('op' => 'contains', 'value' => $doc->name));
  }

  protected function composeRowStructure($doc)
  {
    $doc = parent::composeRowStructure($doc);
    $doc->module = $doc::MODULE;
    return $doc;
  }

  public function dumpMapStringAction()
  {
    $data = $this->request['data'];
    $map = $this->arrayToModel($data);
    $this->response['mapString'] = $map->getMapString($this->container);
  }

}
