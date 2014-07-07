<?php

namespace Geonef\PloomapBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Int;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Boolean;
use Gedmo\Mapping\Annotation\Translatable;
use Gedmo\Mapping\Annotation\Locale;

/**
 * @Document
 */
class MapCategory
{
  const EVENT_PREFIX = 'model.geonefPloomap.mapCategory';

  /**
   * @Id
   */
  public $uuid;

  /**
   * @Int
   */
  public $position = 0;

  /**
   * @Translatable
   * @MongoString
   */
  public $title;

  /**
   * @Boolean
   */
  public $published = false;

  /**
   * @Locale
   */
  public $locale;

  public function getId()
  {
    return $this->uuid;
  }

  public function getTitle()
  {
    return $this->title;
  }

  public function isPublished()
  {
    return $this->published;
  }

  public function getMapCollectionCount(ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    return $dm->createQueryBuilder
        ('Geonef\PloomapBundle\Document\MapCollection')
      ->field('category.$id')->equals(new \MongoId($this->uuid))
      ->getQuery()->execute()->count();
  }

  /**
   * Fetch published categories from MongoDB and their map collections
   *
   * @param $container ContainerInterface
   * @return array
   */
  public static function getCategories(ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $qCats = $dm
      ->createQueryBuilder(__CLASS__)
      ->field('published')->equals(true)
      ->sort('position', 'asc');
    $cats = $qCats->getQuery()->execute();
    $categories = array();
    foreach ($cats as $cat) {
      $qColls = $dm
        ->createQueryBuilder(__NAMESPACE__ . '\\MapCollection')
        ->field('category.$id')->equals(new \MongoId($cat->getId()))
        ->field('published')->equals(true)
        ->sort('position', 'asc');
      $it = $qColls->getQuery()->execute();
      $colls = array();
      foreach ($it as $coll) {
        $colls[] = array('id' => $coll->getId(),
                         'title' => $coll->getTitle(),
                         'hasComment' => isset($coll->comment) && strlen($coll->comment) > 0);
      }
      $categories[] =
        array('id' => $cat->getId(),
              'title' => $cat->getTitle(),
              'collections' => $colls);
    }
    return $categories;
  }

}
