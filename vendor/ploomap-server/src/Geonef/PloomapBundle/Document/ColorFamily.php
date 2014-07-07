<?php

namespace Geonef\PloomapBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Collection;

/**
 * @Document
 */
class ColorFamily
{
  const EVENT_PREFIX = 'model.geonefPloomap.colorFamily';

  /**
   * @Id
   */
  public $uuid;

  /**
   * @MongoString
   */
  public $title;

  /**
   * @Collection
   */
  public $colors;

  public function getId()
  {
    return $this->uuid;
  }

  public function getTitle()
  {
    return $this->title;
  }

  public function getColors()
  {
    return $this->colors;
  }

  public function getColorSet($length)
  {
    $sets = $this->getColors();
    if (!count($sets)) {
      throw new \Exception('no color set defined in family: '.$this->uuid);
    }
    foreach ($sets as $set) {
      if (!isset($best) ||
          abs($length - count($set)) < abs($length - count($best))) {
        $best = $set;
      }
    }
    if (count($best) >= $length) {
      return $best = array_slice($best, 0, $length);
    }
    while (count($best) < $length) {
      $best[] = $best[count($best)-1];
    }
    return $best;
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
    if (!count($this->getColors())) {
      $errors['colors'] = 'missing';
      return false;
    }
    return true;
  }

}
