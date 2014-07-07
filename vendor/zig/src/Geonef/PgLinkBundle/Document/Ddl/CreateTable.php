<?php

namespace Geonef\PgLinkBundle\Document\Ddl;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PgLinkBundle\Document\Table;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;

/**
 * Creation of a PG table
 *
 * @EmbeddedDocument
 */
class CreateTable extends AbstractDdl
{

  public function __construct()
  {
  }

  public function getSql(ContainerInterface $container, Table $table)
  {
    $tableName = $table->getSqlName();
    $cols = array('id serial NOT NULL');
    foreach ($table->columns as $column) {
      $cols[] = $column->getSqlDescription();
    }
    $cols[] = 'CONSTRAINT '.$tableName.'_pk PRIMARY KEY (id)';
    return 'CREATE TABLE '.$tableName.' ('
      .implode(', ', $cols).') WITH(OIDS=FALSE)';
  }

  public function finalise(ContainerInterface $container, Table $table)
  {
    $table->isNew = false;
  }

  public function recover(ContainerInterface $container, Table $table)
  {
    $db = $container->get('zig_pglink.database');
    if ($db->tableExists($table->getSqlName())) {
      $this->finalise($container, $table);
    } else {
      $dm = $container->get('doctrine.odm.mongodb.documentManager');
      $dm->remove($table);
      $table->_deleted = true;
    }
    $table->dirtyDdl->removeElement($this);
  }

}
