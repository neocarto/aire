<?php

namespace Geonef\PgLinkBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;

class View extends AbstractDocumentQuery
{
  protected $documentClass = 'Geonef\PgLinkBundle\Document\View';

  protected $fieldTranslation = array('name' => 'title');

  protected $titleProp = 'title';

  protected function defineFilterLinkedView($value, $op, $not)
  {
    $table = $this->find($value)->getTable();
    $this->query->field('table.$id')->equals(new \MongoId($table->getId()));
  }

  protected function composeRowStructure($document)
  {
    $struct = parent::composeRowStructure($document);
    $struct['linkedViewCount'] = $document->getLinkedViewCount($this->container);
    $struct['rowCount'] = $document->getRowCount($this->container);
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

  public function createNewAction()
  {
    $this->checkArguments(array('title'));
    $title = $this->request['title'];
    $pglink = $this->container->get('zig_pglink.manager');
    $view = $pglink->createSeparateView();
    $view->setTitle($title);
    $view->createRealColumn('Test string column', 'varchar(255)');
    $view->createRealColumn('Test integer column', 'integer');
    $view->commitDdl($this->container);
    $this->response['viewId'] = $view->getId();
  }

  protected function duplicateDoc($view, $title)
  {
    $newView = $view->createLinkedView();
    $newView->setTitle($title);
    $newView->commitDdl($this->container);
    return $newView;
  }

  public function deleteAction()
  {
    $uuids = $this->request['uuids'];
    foreach ($uuids as $uuid) {
      $view = $this->find($uuid);
      $view->drop();
      $view->commitDdl($this->container);
    }
  }

  public function rebuildViewsAction()
  {
    $uuids = $this->request['uuids'];
    foreach ($uuids as $uuid) {
      $view = $this->find($uuid);
      $view->rebuildDdl($this->container);
    }
  }

}
