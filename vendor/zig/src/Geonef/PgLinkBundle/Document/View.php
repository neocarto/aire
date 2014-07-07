<?php

namespace Geonef\PgLinkBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Geonef\PgLinkBundle\Document\Table;
use Geonef\PgLinkBundle\Document\TableColumn;
use Geonef\PgLinkBundle\Document\ViewColumn;
use Geonef\PgLinkBundle\Query;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Boolean;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;
use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbedMany;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Index;

/**
 * Physical PG view
 *
 * http://www.postgresql.org/docs/8.4/interactive/rules-views.html
 * http://www.postgresql.org/docs/8.4/interactive/sql-createview.html
 * http://www.postgresql.org/docs/8.4/interactive/sql-createrule.html
 *
 * @Document
 */
class View
{
  /**
   * @Id
   */
  public $uuid;

  /**
   * @String
   */
  public $title;

  /**
   * True means the view does not yet exist in PG
   *
   * @Boolean
   */
  public $isNew;

  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\PgLinkBundle\Document\View")
   * @Index
   */
  //public $parentView;

  /**
   * The table this view is build upon
   *
   * @property Table
   * @ReferenceOne(
   *    targetDocument="Geonef\PgLinkBundle\Document\Table")
   * @Index
   */
  public $table;

  /**
   * Columns
   *
   * 2 types: physical and virtual
   *
   * @EmbedMany(
   *    discriminatorField="type",
   *    discriminatorMap={
   *      "Real" = "Geonef\PgLinkBundle\Document\ViewColumn\Real"
   *    }
   * )
   *      "Virtual" = "Geonef\PgLinkBundle\Document\ViewColumn\Virtual"
   */
  public $columns;

  /**
   * Indicate whether DDL changes are pending
   *
   * It is TRUE if "isNew" is TRUE OR "isDropped" is TRUE OR
   * any column has "isNew" TRUE OR "isDropped" TRUE.
   *
   * @Boolean
   */
  public $isDirty;

  /**
   * @Boolean
   */
  public $isDropped;



  /**
   * @param $table Table The table is the "data identity" of the view
   *                     (even though additional tables may be joined later)
   */
  public function __construct(Table $table)
  {
    $this->table = $table;
    $this->isNew = true;
    $this->isDirty = true;
    $this->isDropped = false;
    $this->columns = new ArrayCollection();
  }


  ////////////////////////////////////////////////////////////////////
  // Getters/setters

  public function getId()
  {
    return $this->uuid;
  }

  public function getTitle()
  {
    return $this->title;
  }

  public function setTitle($title)
  {
    $this->title = $title;
  }

  public function getTable()
  {
    return $this->table;
  }

  public function isDdlDirty()
  {
    return $this->isDirty;
  }

  /**
   * It is writable if and only if there is no join, or a one-to-one join,
   * and at least one column is writable
   *
   * @return boolean
   */
  public function isWriteAllowed()
  {
    $allow = false;
    foreach ($this->columns as $link) {
      if ($link->isWriteAllowed()) {
        $allow = true;
        break;
      }
    }
    return $allow;
  }

  /**
   * @return ArrayCollection
   */
  public function getColumns()
  {
    return $this->columns;
  }

  public function getColumn($name)
  {
    foreach ($this->columns as $column) {
      if ($column->getName() == $name) {
        return $column;
      }
    }
    return null;
  }

  public function getLinkedViews(ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $id = $this->getId();
    return $dm->createQueryBuilder
        ('Geonef\PgLinkBundle\Document\View')
      ->field('table.$id')->equals(new \MongoId($this->table->getId()))
      ->field('_id')->where('function() { return this._id != \''.$id.'\'; }')
      //->field('uuid')->notEqual(new \MongoId($this->getId()))
      ->getQuery()->execute();
  }

  public function getLinkedViewCount(ContainerInterface $container)
  {
    return $this->getLinkedViews($container)->count();
  }

  public function getRowCount(ContainerInterface $container)
  {
    $db = $container->get('zig_pglink.database');
    $res = $db->query('SELECT COUNT(*) FROM '.$this->getSqlName());
    $row = pg_fetch_array($res);
    return $row[0];
  }

  public function getSqlName()
  {
    if (!$this->uuid) {
      throw new \Exception('cannot generate table SQL name: '
                           .'document has not yet been persisted.');
    }
    return '_'.$this->uuid;
  }


  ////////////////////////////////////////////////////////////////////
  // Data operations

  public function createSelectQuery(ContainerInterface $container)
  {
    $query = new Query\Select($container, $this);
    return $query;
  }

  public function insertRow(ContainerInterface $container, $data)
  {
    $db = $container->get('zig_pglink.database');
    $values = $this->prepareValues($container, $data);
    $res = $db->query('INSERT INTO '.$this->getSqlName().' ('
                      .implode(',', array_keys($values)).') VALUES ('
                      .implode(',', $values).') RETURNING id');
    $row = pg_fetch_array($res);
    $id = $row[0];
    return $id;
  }

  public function updateRow(ContainerInterface $container, $data, $id)
  {
    $db = $container->get('zig_pglink.database');
    $values = $this->prepareValues($container, $data);
    $sets = array();
    foreach ($values as $k => $v) {
      $sets[] = $k.'='.$v;
    }
    $res = $db->query('UPDATE '.$this->getSqlName().' SET '
                      .implode(',', $sets).' WHERE id='.$id);
    $count = pg_affected_rows($res);
    if (!$count) {
      throw new \Exception('SQL update dit not affect any row (ID='.$id.')');
    }
  }

  public function deleteRow(ContainerInterface $container, $id)
  {
    $db = $container->get('zig_pglink.database');
    $sql = 'DELETE FROM '.$this->getSqlName().' WHERE ID='.$id;
    $num = pg_affected_rows($res);
    return $num;
  }

  public function deleteRows(ContainerInterface $container, $ids)
  {
    if (!count($ids)) { return; }
    $db = $container->get('zig_pglink.database');
    $sql = 'DELETE FROM '.$this->getSqlName().' WHERE ID IN ('
      .implode(',', $ids).')';
    $res = $db->query($sql);
    $num = pg_affected_rows($res);
    return $num;
  }

  /**
     * Used by insertRow() and updateRow() to build the query
   * @return array associative array, keys are col names, values are SQL exp
   */
  protected function prepareValues(ContainerInterface $container, $data)
  {
    $values = array();
    foreach ($data as $key => $value) {
      $column = $this->getColumn($key);
      if (!$column) {
        throw new \Exception('Column '.$key.' does not exist on view '
                             .$this->uuid);
      }
      $name = $column->getName();
      $values[$name] = $column->getSqlValue($container, $this, $value);
    }
    return $values;
  }

  ////////////////////////////////////////////////////////////////////
  // DDL operations

  public function createLinkedView()
  {
    $view = new static($this->table);
    foreach ($this->columns as $column) {
      $dup = clone $column;
      $view->addViewColumn($dup);
    }
    return $view;
  }

  public function createRealColumn($title, $type)
  {
    $column = $this->table->createColumn($type);
    $link = new ViewColumn\Real($column);
    $link->setTitle($title);
    $this->columns->add($link);
    $this->isDirty = true;
    return $link;
  }

  public function addRealColumn(TableColumn $column, $title = null)
  {
    $link = new ViewColumn\Real($column);
    $link->setTitle($title ?: $column->getName());
    $this->columns->add($link);
    $this->isDirty = true;
    return $link;
  }

  public function addViewColumn($column)
  {
    $this->columns->add($column);
  }

  public function createExprColumn($title, $type)
  {
    $column = $this->table->createColumn($type);
    $link = new ViewColumn\Real($column);
    $link->setTitle($title);
    $this->columns->add($link);
    $this->isDirty = true;
    return $link;
  }

  public function drop()
  {
    $this->isDropped = true;
    $this->isDirty = true;
  }

  public function recover(ContainerInterface $container)
  {
    if (!$this->uuid) {
      throw new \Exception('document was never persisted. '.
                           'It makes no sense to try recovering.');
    }
    if (!$this->isDirty) {
      throw new \Exception('Nothing to recover; this view is clean: '
                           .$this->uuid);
    }
    if ($this->isNew) {
      throw new \Exception('View isNew recovering not supported yet');
    } elseif ($this->isDropped) {
      throw new \Exception('View isDropped recovering not supported yet');
    } else {
      throw new \Exception('View column change recovering not supported yet');
    }
  }

  /**
   * Commit DDL changes to this view
   *
   * DocumentManager::flush() is invoked one or many times.
   * The SQL VIEW is dropped first, then re-created, since PG
   * does not allow the modification of existing columns.
   */
  public function commitDdl(ContainerInterface $container)
  {
    $db = $container->get('zig_pglink.database');
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $dm->persist($this);
    $dm->flush();
    if ($this->isDropped) {
      $this->dropDbView($container);
      $dm->remove($this);
      if ($this->getLinkedViewCount($container) == 0) {
        // We were the last view. So drop the table as well.
        $this->table->drop();
      }
    }
    if ($this->table->isDdlDirty()) {
      $this->table->commitDdl($container);
    }
    if (!$this->isDdlDirty()) { return; }
    if (!$this->isDropped) {
      if (!$this->isNew) {
        $this->dropDbView($container);
      }
      $this->createDbView($container);
      $this->isNew = false;
      $this->isDirty = false;
    }
    $dm->flush();
  }

  public function rebuildDdl(ContainerInterface $container)
  {
    if ($this->isDropped) {
      throw new \Exception("invalid call to rebuildDdl(): "
                           ."view is to be dropped: ".$this->uuid);
    }
    $this->dropDbView($container);
    $this->createDbView($container);
  }

  protected function createDbView(ContainerInterface $container)
  {
    $db = $container->get('zig_pglink.database');
    $sql = 'CREATE VIEW '.$this->getSqlName().' AS '.$this->buildQuery();
    $db->query($sql);
    $values = array();
    foreach ($this->columns as $column) {
      $name = $column->getName();
      $values[$name] = 'NEW.'.$name;
    }
    // RULE INSERT
    $sql = 'CREATE RULE '.$this->getSqlName().'_insert '
      .'AS ON INSERT TO '.$this->getSqlName().' DO INSTEAD'
      .' INSERT INTO '.$this->table->getSqlName()
      .' ('.implode(',', array_keys($values)).')'
      .' VALUES ('.implode(',', $values).') '
      .'RETURNING id, '.implode(',', array_keys($values));
    $db->query($sql);
    // RULE UPDATE
    $sets = array();
    foreach ($values as $k => $v) {
      $sets[] = $k.'='.$v;
    }
    $sql = 'CREATE RULE '.$this->getSqlName().'_update '
      .'AS ON UPDATE TO '.$this->getSqlName().' DO INSTEAD'
      .' UPDATE '.$this->table->getSqlName()
      .' SET id=NEW.id, '.implode(',', $sets)
      .' WHERE id=OLD.id';
    $db->query($sql);
    // RULE DELETE
    $sql = 'CREATE RULE '.$this->getSqlName().'_delete '
      .'AS ON DELETE TO '.$this->getSqlName().' DO INSTEAD'
      .' DELETE FROM '.$this->table->getSqlName()
      .' WHERE id=OLD.id';
    $db->query($sql);
  }

  protected function dropDbView(ContainerInterface $container)
  {
    $db = $container->get('zig_pglink.database');
    $db->query('DROP VIEW '.$this->getSqlName());
  }

  /**
   * Return SELECT SQL expression string
   */
  public function buildQuery()
  {
    $select = array();
    foreach ($this->columns as $link) {
      $select[] = $link->getName();
    }
    $query = 'SELECT id, '.implode(',',$select).' FROM '
      .$this->table->getSqlName();
    return $query;
  }

}
