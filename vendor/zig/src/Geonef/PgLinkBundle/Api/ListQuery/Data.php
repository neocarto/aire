<?php

namespace Geonef\PgLinkBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractQuery;

class Data extends AbstractQuery
{
  ///////////////////////////////////////////////////////////////
  // INIT - HOOKS
  //

  protected function preDispatch()
  {
    $this->checkArguments(array('viewId'));
    $this->db = $this->container->get('zig_pglink.database');
    $this->view = $this->db->getView($this->container, $this->request['viewId']);
    $this->documentManager =
      $this->container->get('doctrine.odm.mongodb.documentManager');
    parent::preDispatch();
  }


  ///////////////////////////////////////////////////////////////
  // LIST QUERY
  //

  protected function createQueryObject()
  {
    $this->query = $this->view->createSelectQuery($this->container);
  }

  protected function defineSelect()
  {
    // Unused
  }

  protected function defineFilters()
  {
    // TODO
  }

  protected function defineSorting()
  {
    if (isset($this->request['sort']) &&
        isset($this->request['sort']['name'])) {
      $desc = isset($this->request['sort']['desc']) &&
        $this->request['sort']['desc'];
      $col = $this->translateField($this->request['sort']['name']);
      $this->query->sort($col, $desc);
    }
  }

  protected function fetchResult()
  {
    $pageLength = isset($this->request['pageLength']) ?
      intval($this->request['pageLength']) : static::PAGE_LENGTH;
    if (!$pageLength) {
      throw new \Exception('list query: pageLength is null');
    }
    //$cursor = $this->query->getQuery()->execute();
    if ($this->page !== null && !$this->disablePagination) {
      $this->query->limit($pageLength, ($this->page - 1) * $pageLength);
      $count = $this->query->getTotalCount();
      $numPages = intval(ceil($count / $pageLength));
      if ($this->page > $numPages) {
        $this->page = $numPages;
      }
      $this->response['numResults'] = $count;
      $this->response['pageLength'] = $pageLength;
      $this->response['numPages'] = $numPages;
      $this->response['currentPage'] = $this->page;
      /* $cursor = $this->query */
      /*   ->skip(($this->page - 1) * $pageLength) */
      /*   ->limit($pageLength) */
      /*   ->getQuery()->execute(); */
    }

    $it = $this->query->execute();
    $this->response['rows'] = array();
    if ($it->count() > 0) {
      foreach ($it as $row) {
        $this->response['rows'][] = $this->composeRowStructure($row);
      }
    }
  }

  /**
   * @inheritsDoc
   */
  protected function composeRowStructure($row)
  {
    return $row;
  }


  ////////////////////////////////////////////////////////////////////
  // Operations on the VIEW

  public function getMetaAction()
  {
    $this->response['view'] =
      array('title' => $this->view->getTitle(),
            'writeAccess' => $this->view->isWriteAllowed(),
            'linkedViewCount' => $this->view->getLinkedViewCount($this->container));
    $columns = $this->view->getColumns();
    foreach ($columns as $column) {
      $this->response['columns'][] =
        array('name' => $column->getName(),
              'title' => $column->getTitle(),
              'writeAccess' => $column->isWriteAllowed());
    }
  }

  public function renameViewAction()
  {
    $this->checkArguments(array('title'));
    $title = $this->request['title'];
    $this->view->setTitle($title);
    $this->view->commitDdl($this->container);
    $this->response['title'] = $this->view->getTitle();
  }

  public function duplicateViewAction()
  {
    $this->checkArguments(array('title'));
    $title = $this->request['title'];
    $uuid = $this->view->getId();
    $newView = $this->view->createLinkedView();
    $newView->setTitle($title);
    $newView->commitDdl($this->container);
    $this->response['viewId'] = $newView->getId();
  }

  public function deleteViewAction()
  {
    $uuid = $this->view->getId();
    $this->view->drop();
    $this->view->commitDdl($this->container);
    $this->response['dropped'] = $uuid;
  }


  ////////////////////////////////////////////////////////////////////
  // Operations on ROWS

  public function commitRowAction()
  {
    $this->checkArguments(array('row'));
    $row = $this->request['row'];
    if (isset($row['id']) && $row['id']) {
      $id = $row['id'];
      unset($row['id']);
      $this->view->updateRow($this->container, $row, $id);
      $this->response['type'] = 'update';
    } else {
      $id = $this->view->insertRow($this->container, $row);
      $this->response['type'] = 'insert';
      $this->response['insertId'] = $id;
    }
  }

  public function deleteRowsAction()
  {
    $this->checkArguments(array('ids'));
    $ids = $this->request['ids'];
    $num = $this->view->deleteRows($this->container, $ids);
    $this->response['affectedRows'] = $num;
  }

}
