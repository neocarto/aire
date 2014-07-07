<?php

namespace Geonef\PloomapBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;
use Geonef\Ploomap\Util\Geo;

class MapCategory extends AbstractDocumentQuery
{
  protected $documentClass =
    'Geonef\PloomapBundle\Document\MapCategory';

  protected $fieldTranslation = array('name' => 'title');

  protected $titleProp = 'title';

  protected function composeRowStructure($document)
  {
    $struct = parent::composeRowStructure($document);
    $struct['mapCollectionCount'] =
      $document->getMapCollectionCount($this->container);
    return $struct;
  }

  public function getFilterForIdAction()
  {
    $id = $this->request['id'];
    $doc = $this->find($id);
    $this->response['document'] = $this->composeRowStructure($doc);
    $this->response['filter'] =
      array('name' => array('op' => 'contains', 'value' => $doc->title));
  }

  public function createNewAction()
  {
    $title = $this->request['title'];
    $class = $this->documentClass;
    $doc = new $class();
    $doc->title = $title;
    $this->documentManager->persist($doc);
    $this->documentManager->flush();
    $this->response['uuid'] = $doc->uuid;
  }

}
