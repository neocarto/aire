<?php

namespace Geonef\PgLinkBundle\Document\Ddl;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PgLinkBundle\Document\Table;
use Geonef\PgLinkBundle\Document\TableColumn;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * Physical PG table
 *
 * @EmbeddedDocument
 */
class DropColumn extends AbstractDdl
{
  /**
   * @MongoString
   */
  public $columnName;

  public function __construct($columnName)
  {
    $this->columnName = $columnName;
  }

  public function getSql(ContainerInterface $container, Table $table)
  {
    return 'ALTER TABLE '.$table->getSqlName()
      .' DROP COLUMN '.$this->columnName;
  }

  public function finalise(ContainerInterface $container, Table $table)
  {
    $done = false;
    foreach ($table->columns as $key => $column) {
      if ($column->getName() == $this->columnName) {
        $table->columns->remove($key);
        $done = true;
        break;
      }
    }
    if (!$done) {
      // no exception, it's fine, especially in recovery situations
    }
  }

  public function recover(ContainerInterface $container, Table $table)
  {
    $db = $container->get('zig_pglink.database');
    if (!$db->columnExists($table->getSqlName(), $this->columnName)) {
      $this->finalise($container, $table);
    } // else: just forget about the field
    $table->dirtyDdl->removeElement($this);
  }

}
