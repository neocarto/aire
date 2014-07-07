<?php

namespace Geonef\PgLinkBundle\Document\Ddl;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PgLinkBundle\Document\Table;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;

/**
 * Dropping of a PG table. Also remove the Mongo document.
 *
 * @EmbeddedDocument
 */
class DropTable extends AbstractDdl
{

  public function __construct()
  {
  }

  public function getSql(ContainerInterface $container, Table $table)
  {
    $tableName = $table->getSqlName();
    return 'DROP TABLE '.$tableName;
  }

  public function finalise(ContainerInterface $container, Table $table)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $dm->remove($table);
  }

}
