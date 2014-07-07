<?php

namespace Geonef\PloomapBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ODM\MongoDB\Mapping\Annotations as Doctrine;

/**
 *
 * @Doctrine\EmbeddedDocument
 */
class Location
{
  /** @Doctrine\Float */
  public $longitude;

  /** @Doctrine\Float */
  public $latitude;

  public static function fromArray($array)
  {
    $location = new static;
    $location->longitude = $array[0];
    $location->latitude = $array[1];

    return $location;
  }

  public function toArray()
  {
    return array($this->longitude, $this->latitude);
  }

  /**
   *
   * @throws \InvalidArgumentException if $array is not a valid location
   * @return boolean    true if $array is a valid location
   */
  public static function validateArray($array)
  {
    if (!is_array($array) || count($array) != 2 ||
        !is_numeric($array[0]) || !is_numeric($array[1])) {
      throw new \InvalidArgumentException("invalid location array");
    }

    return true;
  }

}