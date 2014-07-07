<?php

namespace Geonef\PloomapBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\Map;
use Doctrine\ODM\MongoDB\Mapping\Annotations as Doctrine;

/**
 *
 * @Doctrine\Document
 * @Doctrine\InheritanceType("SINGLE_COLLECTION")
 * @Doctrine\DiscriminatorField(fieldName = "type")
 * @Doctrine\DiscriminatorMap({
 *   "Wms" = "Geonef\PloomapBundle\Document\Display\Wms",
 *   "Tiled" = "Geonef\PloomapBundle\Document\Display\Tiled"
 * })
 */
abstract class Display
{
  /**
   * Used by createFromParameters() and supportsParameters() to inflect class name
   */
  const NS = 'Geonef\\PloomapBundle\\Document\\Display\\';

  /**
   * @Doctrine\Id
   */
  public $uuid;

  /**
   * @Doctrine\ReferenceOne(targetDocument = "Geonef\PloomapBundle\Document\Map")
   */
  public $map;



  public function __construct(Map $map)
  {
    $this->map = $map;
  }

  public function getId()
  {
    return $this->uuid;
  }

  /**
   * Analyse parameters and instanciate the Display class that best suits them
   *
   * @return Display
   */
  public static function createFromParameters(ContainerInterface $container, Map $map, $params)
  {
    $class = static::NS . ucFirst($params['type']);
    if (!class_exists($class)) {
      throw new \InvalidArgumentException
        ("invalid type, class does not exist: ".$class);
    }
    $display = new $class($map);
    $display->setParameters($params);

    return $display;

  }

  public function supportsParameters($params)
  {
    if (isset($params['type']) &&
        $params['type'] !==
        strtolower(str_replace(static::NS, '', get_class($this)))) {

      return false;
    }

    return true;
  }

  public function setParameters($params)
  {
    foreach ($this->getMandatoryParameters() as $p) {
      if (!isset($params[$p])) {
        throw new \InvalidArgumentException("missing param for ".get_class($this).": ".$p);
      }
    }
  }

  protected function getMandatoryParameters()
  {
    return array();
  }

  abstract public function getLayerFactoryStruct(ContainerInterface $container);

}
