<?php

namespace Geonef\PgLinkBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * Column of a table
 *
 * This should be instanciated from Table::createColumn() only.
 * (the 'name' property must be unique within a table)
 *
 * @EmbeddedDocument
 */
class TableColumn
{
  /**
   * @MongoString
   */
  public $name;

  /**
   * @MongoString
   */
  public $type;

  public function __construct($name, $type)
  {
    $this->name = $name;
    $this->type = $type;
  }

  public function getId()
  {
    return $this->uuid;
  }

  /**
   * @return string
   */
  public function getName()
  {
    return $this->name;
  }

  /**
   * @return string
   */
  public function getType()
  {
    return $this->type;
  }

  public function getSqlDescription()
  {
    return $this->name.' '.$this->type;
  }

  public function getSqlValue(ContainerInterface $container, $value)
  {
    if (is_bool($value)) {
      return $value ? 't' : 'f';
    } elseif (is_float($value) || is_int($value)) {
      $container->get('logger')->debug('PgLink: number '.$this->name);
      return $value;
    } elseif (is_string($value)) {
      $container->get('logger')->debug('PgLink: string '.$this->name);
      return "'".pg_escape_string($value)."'";
    } elseif (is_null($value)) {
      return 'NULL';
    } else {
      throw new \Exception('invalid value for field '.$this->getName()
                           .': '.json_encode($value));
    }
  }

}
