<?php

namespace Geonef\PgLinkBundle\Query;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * SQL SELECT query
 *
 * @package PgLink
 */
class Select extends ViewQuery
{
  /**
   * Row count limit - for pagination, set by limit()
   *
   * @var Iterator
   */
  protected $limit = null;

  /**
   * Number of rows skipped - for pagination, set by limit()
   *
   * @var Iterator
   */
  protected $offset = 0;

  /**
   * Cached result iterator
   *
   * @var Iterator
   */
  protected $iterator = null;

  /**
   * Cached total count
   *
   * @var integer
   */
  protected $totalCount = null;


  /**
   * @return static
   */
  public function sort($column, $desc)
  {
    return $this;
  }

  /**
   * @return static
   */
  public function limit($count, $offset = 0)
  {
    $this->limit = $count;
    $this->offset = $offset;
    return $this;
  }

  public function getTotalCount()
  {
    if ($this->totalCount === null) {
      if ($this->limit === null && !$this->offset) {
        $this->totalCount = $this->execute()->count();
      } else {
        $sql = 'SELECT count(*) FROM '.$this->getSqlFrom()
          .' WHERE '.$this->getSqlWhere();

        $res = $this->db->query($sql);
        $row = pg_fetch_array($res);
        $this->totalCount = $row[0];
      }
    }
    return $this->totalCount;
  }

  public function getSql()
  {
    $sql = 'SELECT * FROM '.$this->getSqlFrom()
      .' WHERE '.$this->getSqlWhere();
    if ($this->limit !== null) {
      $sql .= ' LIMIT '.$this->limit;
    }
    if ($this->offset) {
      $sql .= ' OFFSET '.$this->offset;
    }
    return $sql;
  }

  protected function getSqlSelect()
  {
  }

  protected function getSqlFrom()
  {
    return $this->view->getSqlName();
  }

  protected function getSqlWhere()
  {
    return 'TRUE';
  }

  protected function getSqlPaging()
  {
    return false;
  }

  /**
   * @return ResultIterator
   */
  public function execute()
  {
    if (!$this->iterator) {
      $sql = $this->getSql();
      $res = $this->db->query($sql);
      $this->iterator = new ResultIterator($res);
    }
    return $this->iterator;
  }

}
