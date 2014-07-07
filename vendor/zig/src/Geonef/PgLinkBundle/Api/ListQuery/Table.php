<?php

namespace Geonef\PgLinkBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;

class Table extends AbstractDocumentQuery
{
  protected $documentClass = 'Geonef\PgLinkBundle\Document\Table';

  protected function composeRowStructure($document)
  {
    $struct = parent::composeRowStructure($document);
    $struct['viewCount'] = $document->getViewCount($this->container);
    return $struct;
  }

  /* public function getFilterForIdAction() */
  /* { */
  /*   $id = $this->request['id']; */
  /*   $doc = $this->find($id); */
  /*   $this->response['document'] = $this->composeRowStructure($doc); */
  /*   $filter = array('name' => array('op' => 'equals', 'value' => $doc->name)); */
  /*   $this->response['filter'] = $filter; */
  /* } */

}
