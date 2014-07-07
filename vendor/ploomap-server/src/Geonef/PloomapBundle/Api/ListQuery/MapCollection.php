<?php

namespace Geonef\PloomapBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;
use Geonef\Zig\Util\Mongo;

class MapCollection extends AbstractDocumentQuery
{
  protected $documentClass = 'Geonef\PloomapBundle\Document\MapCollection';

  protected $fieldTranslation = array('name' => 'title');

  protected $titleProp = 'title';

  protected function composeRowStructure($document)
  {
    $struct = parent::composeRowStructure($document);
    $struct['category'] = isset($document->category) && $document->category ?
      $document->category->getTitle() : null;
    $struct['mapCount'] = $document->getMapCount($this->container);
    return $struct;
  }

  public function getFilterForIdAction()
  {
    $id = $this->request['id'];
    $doc = $this->find($id);
    $this->response['document'] = $this->composeRowStructure($doc);
    $filter = array('name' => array('op' => 'contains', 'value' => $doc->title));
    if (isset($doc->category) && $doc->category) {
      $filter['category'] = array('op' => 'ref',
                                  'value' => $doc->category->uuid);
    }
    $this->response['filter'] = $filter;
  }

  /**
   * Overloaded to copy maps as well
   */
  protected function duplicateDoc($doc, $title)
  {
    $dup = parent::duplicateDoc($doc, $title);
    $maps = $doc->getMaps($this->container);
    foreach ($maps as $map) {
      $dupMap = Mongo::duplicateDocument($this->container, $map);
      $dupMap->mapCollection = $dup;
    }
    $this->documentManager->flush();
  }

  /**
   * @inheritsDoc
   */
  protected function preDeleteOne($doc)
  {
    $maps = $doc->getMaps($this->container);
    foreach ($maps as $map) {
      $this->documentManager->remove($map);
    }
    return true;
  }

}
