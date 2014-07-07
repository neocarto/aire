<?php

namespace Geonef\PgLinkBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Geonef\PgLinkBundle\Document\TableColumn;
use Geonef\PgLinkBundle\Document\View;
use Geonef\PgLinkBundle\Document\Ddl;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Boolean;
use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbedMany;

/**
 * Physical PG table
 *
 * @Document
 */
class Table
{
  /**
   * @Id
   */
  public $uuid;

  /**
   * TRUE means the TABLE deos not exist in PG
   *
   * @Boolean
   */
  public $isNew;

  /**
   * Columns
   *
   * 2 types: physical and virtual
   *
   * @EmbedMany(
   *    targetDocument="Geonef\PgLinkBundle\Document\TableColumn")
   */
  public $columns;

  /**
   * Changes being made to the DDL
   *
   * @EmbedMany(
   *    discriminatorField="type",
   *    discriminatorMap={
   *      "CreateTable"="Geonef\PgLinkBundle\Document\Ddl\CreateTable",
   *      "AddColumn"="Geonef\PgLinkBundle\Document\Ddl\AddColumn",
   *      "DropColumn"="Geonef\PgLinkBundle\Document\Ddl\DropColumn"
   *    }
   * )
   */
  public $dirtyDdl;

  public $_deleted = false;

  /**
   * Constructor
   *
   * @param $rawObject boolean Prevent initialisation as a new DB table
   */
  public function __construct($rawObject = false)
  {
    $this->isNew = true;
    $this->columns = new ArrayCollection();
    $this->dirtyDdl = new ArrayCollection();
    if (!$rawObject) {
      $this->dirtyDdl->add(new Ddl\CreateTable());
    }
  }


  ////////////////////////////////////////////////////////////////////
  // Getters/setters

  public function getId()
  {
    return $this->uuid;
  }

  /**
   * @return TableColumn
   */
  public function getColumn($name)
  {
    foreach ($this->columns as $column) {
      if ($column->getName() == $name) {
        return $column;
      }
    }
    return null;
  }

  /**
   * @return ArrayCollection
   */
  public function getColumns()
  {
    return $this->columns;
  }

  public function getColumnsNames()
  {
    $names = array();
    foreach ($this->columns as $column) {
      $names[] = $column->getName();
    }
    return $names;
  }

  public function isDdlDirty()
  {
    return $this->isNew || $this->dirtyDdl->count() > 0;
  }

  public function getViews(ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    return $dm->createQueryBuilder
        ('Geonef\PgLinkBundle\Document\View')
      ->field('table.$id')->equals(new \MongoId($this->uuid))
      ->getQuery()->execute();
  }

  public function getViewCount(ContainerInterface $container)
  {
    return $this->getViews($container)->count();
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

  public function insertRow(ContainerInterface $container, $data)
  {
    $db = $container->get('zig_pglink.database');
    $fields = array();
    $values = array();
    foreach ($data as $key => $value) {
      $fields[] = $key;
      $column = $this->getColumn($key);
      if (!$column) {
        throw new \Exception('Column '.$key.' does not exist on table '
                             .$this->uuid);
      }
      $values[] = $column->getSqlValue($value);
    }
    $res = $db->query('INSERT INTO '.$this->getSqlName().' ('
                      .implode(',', $fields).') VALUES ('
                      .implode(',', $values).') RETURNING id');
    $row = pg_fetch_array($res);
    $id = $row[0];
    return $id;
  }

  public function deleteRow(ContainerInterface $container, $id)
  {
    $db = $container->get('zig_pglink.database');
    $res = $db->query('DELETE FROM '.$this->getSqlName().' WHERE id='.$id);
    $num = pg_affected_rows($res);
    return $num;
  }

  public function fetch(ContainerInterface $container)
  {
    $db = $container->get('zig_pglink.database');
    $columns = $this->getColumnsNames();
    $res = $db->query('SELECT id, '.implode(',', $columns)
                      .' FROM '.$this->getSqlName());
    $data = array();
    while (($row = pg_fetch_assoc($res))) {
      $data[] = $row;
    }
    return $data;
  }


  ////////////////////////////////////////////////////////////////////
  // DDL operations

  public function createView()
  {
    $view = new View($this);
    foreach ($this->columns as $column) {
      $view->addRealColumn($column);
    }
    return $view;
  }

  public function createColumn($type)
  {
    $name = $this->generateColumnName();
    $column = new TableColumn($name, $type);
    if ($this->isNew) {
      $this->columns->add($column);
    } else {
      $ddl = new Ddl\AddColumn($column);
      $this->dirtyDdl->add($ddl);
    }
    return $column;
  }

  public function dropColumn($columnName)
  {
    $column = $this->getColumn($columnName);
    if (!$column) {
      throw new \Exception('column '.$columnName.' missing on table '
                           .$this->getId());
    }
    if ($this->columns->count() > 1) {
      $ddl = new Ddl\DropColumn($columnName);
      $this->dirtyDdl->add($ddl);
    } else {
      $this->drop();
    }
  }

  public function drop()
  {
    $ddl = new Ddl\DropTable();
    $this->dirtyDdl->add($ddl);
  }

  protected function generateColumnName()
  {
    return uniqid('z');
  }

  public function recover(ContainerInterface $container)
  {
    if (!$this->uuid) {
      throw new \Exception('document was never persisted. '.
                           'It makes no sense to try recovering.');
    }
    foreach ($this->dirtyDdl->slice(0) as $ddl) {
      if (!method_exists($ddl, 'recover')) {
        throw new \Exception('Recovering not supported by '.get_class($ddl).'');
      }
      $ddl->recover($container, $this);
    }
  }

  /**
   * Commit the DDL changes to this table
   *
   * DocumentManager::flush() is invoked one or many times.
   */
  public function commitDdl(ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    if (!$this->_deleted) {
      $dm->persist($this);
    }
    $dm->flush();
    $sql = array();
    $tableName = $this->getSqlName();
    foreach ($this->dirtyDdl as $ddl) {
      $sql[] = $ddl->getSql($container, $this);
    }
    if (!count($sql)) {
      return;
    }
    $db = $container->get('zig_pglink.database');
    $db->runInTransaction($sql);
    foreach ($this->dirtyDdl as $ddl) {
      $ddl->finalise($container, $this);
    }
    $this->dirtyDdl->clear();
    $dm->flush();
  }

}
