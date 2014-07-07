<?php

namespace Geonef\PloomapBundle\Document\MapCollection;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\MapCollection\Published;
use Geonef\Ploomap\Util\Geo;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * Multiple representations & levels
 *
 * @Document
 */
class MultiRepr extends Published
{
  /**
   * Map to show at mapCollection start (ex: "stock/nuts2", "ratio/nuts0")
   *
   * @MongoString
   */
  public $startMap;

  //////

  public static $mapTypes = array
    ('stock' => array('nuts0', 'nuts1', 'nuts2', 'nuts23', 'nuts3', 'nuts3'),
     'ratio' => array('nuts0', 'nuts1', 'nuts2', 'nuts23', 'nuts3', 'nuts3'),
     'stockRatio' => array('nuts0', 'nuts1', 'nuts2', 'nuts23', 'nuts3'),
     'ratioDisc' => array('nuts0', 'nuts1', 'nuts2', 'nuts23', 'nuts3'),
     'cartogram' => array('nuts0', 'nuts1', 'nuts2', 'nuts23', 'nuts3'),
     'ratioGrid' => array('50km', '100km', '200km', '300km'),
     'potential' => array('50km', '100km', '200km', '300km')
     );

  /* to delete */
  public static $reprLabels = array
    ('stock' => "Stock",
     'ratio' => "Ratio",
     'stockRatio' => "Stock & Ratio",
     'ratioDisc' => "Discontinuités",
     'cartogram' => "Anamorphoses",
     'ratioGrid' => "Carroyages",
     'potential' => "Potentiels"
     );

  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    $s = $this->checkCond(strlen(trim($this->startMap)) > 0,
                               'startMap', 'missing', $errors);
    if ($s) {
      $d = explode('/', $s);
      $s &= $this->checkCond(count($d) == 2,
                             'startMap', 'invalid', $errors);
      if ($s) {
        $s &= $this->checkCond(isset(static::$mapTypes[$d[0]]) &&
                               in_array($d[1], static::$mapTypes[$d[0]]),
                               'startMap', 'invalid', $errors);
      }
    }
    $state =& $s;
    return $state;
  }

  /**
   * Fetch map of this map collection having the given representation and level
   *
   * @param $container
   * @param $representation     representation name ('stock', 'ratio'...)
   * @param $level              level name ('nuts0','nuts1'...)
   */
  public function getMap(ContainerInterface $container,
                         $representation, $level, $autoCreate = false)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $discr = ucfirst($representation);
    $map = $dm->createQueryBuilder
        ('Geonef\PloomapBundle\Document\Map')
      ->field('mapCollection.$id')->equals(new \MongoId($this->uuid))
      ->field('module')->equals($discr)
      ->field('level')->equals($level)
      ->getQuery()->execute()->getSingleResult();
    if (!$map && $autoCreate) {
      $class = 'Geonef\PloomapBundle\Document\Map\\' . $discr;
      $map = new $class;
      $map->mapCollection = $this;
      $map->level = $level;
      $dm->persist($map);
      $dm->flush();
    }
    return $map;
  }

  public function getMapsInfo(ContainerInterface $container)
  {
    $mapTypes = static::$mapTypes;
    $maps = array();
    foreach ($mapTypes as $repr => $unitScales) {
      foreach ($unitScales as $unitScale) {
        $map = $this->getMap($container, $repr, $unitScale, true);
        $msMap = $map->build($container);
        $maps[$repr][$unitScale] = array
          ('id' => $map->getId(),
           'extent' => Geo::msRectToExtent($msMap->extent),
           'projection' => strtoupper(Geo::getMsMapSrs($msMap)),
           'layers' => $map->getLayerNames($container, $msMap, true)
           /*, 'legend' => $legend*/);
      }
    }
    return $maps;
  }
}
