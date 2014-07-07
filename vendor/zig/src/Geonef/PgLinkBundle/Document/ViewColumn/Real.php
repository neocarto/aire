<?php

namespace Geonef\PgLinkBundle\Document\ViewColumn;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PgLinkBundle\Document\TableColumn;
use Geonef\PgLinkBundle\Document\View;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Boolean;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Index;

/**
 * Column link of a view - targetting a real table column
 *
 * @EmbeddedDocument
 */
class Real
{
  /**
   * @Id
   */
  public $uuid;

  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\PgLinkBundle\Document\Table")
   * @Index
   */
  //public $table;

  /**
   * Name of table column
   *
   * @MongoString
   */
  public $name;

  /**
   * User title
   *
   * @MongoString
   */
  public $title;

  /**
   * RO/RW user limitation at view level for this column
   *
   * @Boolean
   */
  public $writeEnabled;

  /**
   * @Boolean
   */
  public $isNew;

  /**
   * @Boolean
   */
  public $isDropped;

  public function __construct(TableColumn $column)
  {
    $this->name = $column->getName();
    $this->writeEnabled = true;
    $this->isNew = true;
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
  public function getTitle()
  {
    return $this->title;
  }

  /**
   * @param $title string
   */
  public function setTitle($title)
  {
    $this->title = $title;
  }

  /**
   * @return boolean
   */
  public function isWriteAllowed()
  {
    return $this->writeEnabled;
  }

  /**
   * @param $enabled boolean
   */
  public function setWriteAllowed($enabled)
  {
    $this->writeEnabled = $enabled;
  }

  /**
   * @return string
   */
  public function getType(View $view)
  {
    return $view->getTable()->getColumn($this->name)->getType();
  }

  /**
   * @return string
   */
  public function getSqlValue(ContainerInterface $container, View $view, $value)
  {
    return $view->getTable()->getColumn($this->name)
      ->getSqlValue($container, $value);
  }


}
