<?php

namespace Geonef\ZigBundle\Api\ListQuery;

use Geonef\Zig\Api\ActionDispatcher;

/**
 * Base list class to manage a query, either document-based or table-based
 *
 * Extend Abstract{Table,Document}Query, depending on the kinf of DB you
 * use (Relation SQL or NoSQL).
 *
 * @package Zig
 * @subpackage Api_List
 * @author Okapi
 */
abstract class AbstractQuery extends ActionDispatcher
{
  /**
   * Number of rows on each page
   *
   * @var integer
   */
  const PAGE_LENGTH = 25;

  /**
   * Whether pagination is disabler, whatever parameters
   */
  protected $disablePagination = false;

  /**
   * Model query
   *
   * @var Zig_Model_Query
   */
  protected $query;

  /**
   * Defines correspondance between query name and model field name
   *
   * When overloading translateField()
   * this property may no longer be used.
   *
   * @var array
   */
  protected $fieldTranslation = array();

  /**
   * If not null, enable pagination and indicate current page
   *
   * @var integer
   */
  protected $page = null;

  /**
   * Action to get the list of entries
   */
  public function queryAction()
  {
    $this->processQuery();
  }

  /**
   * Process current query. Child classes need to implement its
   * own action methods, even though they may only call processQuery().
   */
  protected function processQuery()
  {
    $this->createQueryObject();
    //$this->defineSelect();
    $this->defineFilters();
    $this->defineSorting();
    $this->definePage();
    $this->fetchResult();
  }

  /**
   * Instanciate query and return the object
   */
  protected function createQueryObject()
  {
    $this->query = Zig_Model_Query::create();
  }

  protected function defineSelect()
  {

  }

  /**
   * Define WHERE conditions on query, from request defs
   *
   *
   */
  protected function defineFilters()
  {

    /*if (isset($this->request['filters'])) {

      foreach ($this->request['filters'] as $name => $value) {
        if ($value === null) {
          continue;
        }
        $method = 'processFilter' . ucfirst($name);
        if (!method_exists($this, $method)) {
          throw new \Exception('invalid query filter: '
                               . $name. ' (method: '.$method.')');
        }
        $this->$method($value);
      }
      }*/
  }

  abstract protected function defineSorting();

  /**
   * Translate column name from query def to model col name for Doctrine
   *
   * @param string $name
   * @return string
   */
  protected function translateField($name)
  {
    return isset($this->fieldTranslation[$name]) ?
      $this->fieldTranslation[$name] : $name;
  }

  protected function definePage()
  {
    if (isset($this->request['page'])) {
      $this->page = $this->request['page'];
    }
  }

  abstract protected function fetchResult();
  /*{
    //$this->response['sqlQuery'] = $this->query->getSql();
    if ($this->page === null || $this->disablePagination) {
      $collection = $this->query->execute();
    } else {
      $pager = new Doctrine_Pager($this->query, $this->page,
                                  self::ROWS_PER_PAGE);
      $collection = $pager->execute();
      $this->response['numResults'] = $pager->getNumResults();
      $this->response['pageLength'] = self::ROWS_PER_PAGE;
      $this->response['numPages'] = $pager->getLastPage();
      $this->response['currentPage'] = $pager->getPage();
    }
    $this->response['raw'] = $collection;
    //$this->response['count'] = $collection->count();
    $this->response['rows'] = array();
    foreach ($collection as $record) {
      $this->response['rows'][] = $this->composeRowStructure($record);
    }
    }*/

  /**
   * Create the response structure for given record
   *
   * @param Zig_Model_Record $record
   * @return array
   */
  abstract protected function composeRowStructure($record);

  /**
   * Generate an HTML list for spreadsheet
   *
   * It uses the same query system as the processQuery() method,
   * except there is no pagination.
   */
  public function htmlListAction()
  {
    $this->_isHtmlList = true;
    $this->createQueryObject();
    $this->defineSelect();
    $this->defineFilters();
    $this->defineSorting();
    $collection = $this->query->execute();
    $table = $this->generateHtmlList($collection);
    $this->request['outputMethod'] = 'raw';
    if (!isset($this->request['html'])) {
      Zend_Controller_Front::getInstance()
        ->getResponse()
        ->setHeader('Content-type', /*'application/excel'*/
                    'application/vnd.ms-excel', true);
    }
    echo '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/></head><body>';
    echo $table->render();
    echo '</body></html>';
  }

  protected function generateHtmlList(Doctrine_Collection $collection)
  {
    throw new \Exception('not yet implemented!');
    $table = new Zig_View_Helper_HtmlTable;
    $this->initializeHtmlList($table);
    foreach ($collection as $record) {
      $struct = $this->composeRowStructure($record);
      $this->generateHtmlListRow($table, $struct);
    }
    return $table;
  }

  /**
   * Hook: before HTML list generation
   * @todo
   */
  protected function initializeHtmlList(Zig_View_Helper_HtmlTable $table)
  {
  }

  /**
   * Hook: HTML list generation, for each row
   * @todo
   */
  protected function generateHtmlListRow(Zig_View_Helper_HtmlTable $table,
                                         Array $struct)
  {
  }

}
