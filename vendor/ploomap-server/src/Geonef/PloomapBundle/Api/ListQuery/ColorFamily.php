<?php

namespace Geonef\PloomapBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;
use Geonef\Ploomap\Util\Geo;

class ColorFamily extends AbstractDocumentQuery
{
  protected $documentClass =
    'Geonef\PloomapBundle\Document\ColorFamily';

  protected $fieldTranslation = array('name' => 'title');

  protected $titleProp = 'title';

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
