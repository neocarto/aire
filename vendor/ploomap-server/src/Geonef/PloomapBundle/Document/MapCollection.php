<?php

namespace Geonef\PloomapBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\InheritanceType;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorField;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorMap;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Index;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Int;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;
use Gedmo\Mapping\Annotation\Translatable;

/**
 * @Document
 * @InheritanceType("SINGLE_COLLECTION")
 * @DiscriminatorField(fieldName = "module")
 * @DiscriminatorMap({
 *   "MultiRepr"      = "Geonef\PloomapBundle\Document\MapCollection\MultiRepr",
 *   "SingleRepr"     = "Geonef\PloomapBundle\Document\MapCollection\SingleRepr",
 *   "FreeCollection" = "Geonef\PloomapBundle\Document\MapCollection\FreeCollection"
 *  })
 */
abstract class MapCollection
{
  const EVENT_PREFIX = 'model.geonefPloomap.mapCollection';

  /**
   * @Id
   */
  public $uuid;

  /**
   * @MongoString
   * @Translatable
   */
  public $title;

  /**
   * @Int
   */
  public $position = 0;

  /**
   * @Int
   */
  public $zoomBarX = 4;

  /**
   * @Int
   */
  public $zoomBarY = 4;

  /**
   * @MongoString
   */
  public $userNotes;

  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\MapCategory")
   * @Index
   */
  public $category;

  public function getId()
  {
    return $this->uuid;
  }

  public function getTitle()
  {
    return $this->title;
  }

  /**
   * (overloaded by MapCollection\Published)
   *
   * @return boolean whether it can be published
   */
  public function isPublished()
  {
    return false;
  }

  public function getMaps(ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    return $dm->createQueryBuilder
        ('Geonef\PloomapBundle\Document\Map')
      ->field('mapCollection.$id')->equals(new \MongoId($this->uuid))
      ->getQuery()->execute();
  }

  public function getMapCount(ContainerInterface $container)
  {
    return $this->getMaps($container)->count();
  }

  /**
   * Check validity of document properties
   *
   * @param $container ContainerInterface
   * @param $errors    array
   * @return boolean    Whether the map properties are valid
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    return $this->checkCond(strlen(trim($this->title)),
                            'title', 'missing', $errors);
  }

  /**
   * Facility for checkProperties()
   *
   * @param $cond boolean
   * @param $prop string
   * @param $msg string
   * @param $errors array
   */
  protected function checkCond($cond, $prop, $msg, &$errors)
  {
    if (!$cond) {
      $errors[$prop] = $msg;
      return false;
    }
    return true;
  }

}
