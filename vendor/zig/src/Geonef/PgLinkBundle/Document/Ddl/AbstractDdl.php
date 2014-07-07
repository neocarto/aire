<?php

namespace Geonef\PgLinkBundle\Document\Ddl;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PgLinkBundle\Document\Table;

use Doctrine\ODM\MongoDB\Mapping\Annotations\MappedSuperClass;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;

/**
 * Physical PG table
 *
 * @MappedSuperClass
 */
abstract class AbstractDdl
{
  /**
   * @Id
   */
  public $uuid;

  abstract public function getSql(ContainerInterface $container, Table $table);

  abstract public function finalise(ContainerInterface $container, Table $table);

  //abstract public function recover(ContainerInterface $container, Table $table);

}
