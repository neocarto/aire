<?php

namespace Geonef\PgLinkBundle\Query;

use Symfony\Component\DependencyInjection\ContainerInterface;

class ResultIterator implements \Countable, \Iterator
{
  /**
   * The PG result resource, returned by the query
   */
  protected $pg_result;

  protected $count = -1;

  protected $index = -1;

  protected $current = null;

  protected $end = false;

  public function __construct($pg_result)
  {
    $this->pg_result = $pg_result;
    $this->count = pg_num_rows($pg_result);
  }

  /**
   * Required by interface Iterator
   */
  public function current()
  {
    return $this->current;
  }

  /**
   * Required by interface Iterator
   */
  public function key()
  {
    return $this->index;
  }

  /**
   * Required by interface Iterator
   */
  public function next()
  {
    ++$this->index;
    $this->current = pg_fetch_assoc($this->pg_result);
  }

  /**
   * Required by interface Iterator
   */
  public function rewind()
  {
    if ($this->index >= 0) {
      throw new \Exception('PG ResultIterator cannot be rewound again');
    }
    $this->next();
  }

  /**
   * Required by interface Iterator
   */
  public function valid()
  {
    return $this->index < $this->count;
  }

  /**
   * Required by interface Countable
   */
  public function count()
  {
    return $this->count;
  }
}
