<?php

namespace Geonef\ZigBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;

class Template extends AbstractDocumentQuery
{
  protected $documentClass =
    'Geonef\ZigBundle\Document\Template';


  ////////////////////////////////////////////////////////////////////////
  // LIST QUERY

  protected function composeRowStructure($document)
  {
    $struct = parent::composeRowStructure($document);
    $struct['type'] = implode(', ', $document->getSupportedClasses());
    return $struct;
  }

  public function getFilterForIdAction()
  {
    $id = $this->request['id'];
    $doc = $this->find($id);
    $struct = $this->composeRowStructure($doc);
    $this->response['document'] = $struct;
    $filter = array('name' => array('op' => 'contains',
                                    'value' => $doc->getName()),
                    'module' => array('op' => 'in',
                                      'value' => array($struct['module'])));
    $this->response['filter'] = $filter;
  }



  ////////////////////////////////////////////////////////////////////////
  // OTHER ACTIONS


}
