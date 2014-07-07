<?php

namespace Geonef\PloomapBundle\Document\Map;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\OgrLayer;
use Geonef\Zig\Util\Number;
use mapObj as MsMap;


use Doctrine\ODM\MongoDB\Mapping\Annotations as Doctrine;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Hash;
use Gedmo\Mapping\Annotation\Translatable;

/**
 * Base class for statistical maps
 *
 * @Doctrine\Document
 */
abstract class Statistics extends ModelBased
{
  //////////////////////////////////////////////////////////////////
  // MAPPED PROPERTIES

  /**
   * About the source reference (where the data comes from)
   *
   * @Translatable
   * @MongoString
   */
  public $source;

  /**
   * Copyright for the data
   *
   * @Translatable
   * @MongoString
   */
  public $copyright;


  //////////////////////////////////////////////////////////////////
  // NORMAL PROPERTIES

  /**
   * Name of MapScript layer within map to use for indicator value
   *
   * Must be specified by concrete class.
   */
  protected $statisticsValueLayer;

  /**
   * Field name within MapScript layer to use for indicator value
   *
   * Must be specified by concrete class.
   * It is an indexed array of field names
   * (belonging to the layer specified with statisticsValueLayer)
   */
  protected $statisticsValueFields = array();

  /**
   * Unpersisted cache for indicator values
   * @var array
   */
  private $cachedIndicatorValues;


  public function getSource()
  {
    return $this->source;
  }

  public function getCopyright()
  {
    return $this->copyright;
  }

  /* overloaded */
  public function clearInfoCache(ContainerInterface $container)
  {
    $this->cachedIndicatorValues = null;

    return parent::clearInfoCache($container);
  }

  /**
   * Check the validity of a layer and a field existence
   *
   * @see self::checkProperties
   * @param $container
   * @param $errors
   * @param $layer OgrLayer     Layer to check
   * @param $layerProp string   Name of layer property, for error reporting
   * @param $field string       Field name
   * @param $fieldProp string   Name of field property, for error reporting
   * @return boolean
   */
  protected function checkOgrField(ContainerInterface $container,
                                   &$errors, $layer, $layerProp,
                                   $field, $fieldProp) {

    return true; // DEBUG

    $state = true;
    if (!$layer) {
      $errors[$layerProp] = array('missing');
      $state = false;
    } else {
      $ogrDs = $layer->getOgrDataSource($container);
      if (!$ogrDs) {
        $errors[$layerProp] =
          array('invalid', "La source de données \""
                .$layer->getDataSource()->getName()."\""."n'a pu être ouverte");
        $state = false;
      } else {
        $ogr = $layer->getOgrLayer($container);
        if (!$ogr) {
          $errors[$layerProp] =
            array('invalid', "La source de données \""
                  .$layer->getDataSource()->getName()."\" a pu "
                  ."être ouverte, mais pas la couche \""
                  .$layer->getName()."\"");
          $state = false;
        } else {
          if (!$field) {
            $errors[$fieldProp] = array('missing');
            $state = false;
          } else {
            $defn = $ogr->getLayerDefn();
            $idx = $defn->getFieldIndex($field);
            if ($idx < 0) {
              $errors[$fieldProp] =
                array('invalid', "Champ \"".$field ."\" "
                      ."inexistant dans "."la couche \"".$layer->getName()
                      ."\" [".$layerProp."] (code ".$idx.")");
              $state = false;
            } else {
              $fieldDef = $defn->getFieldDefn($idx);
              $name = $fieldDef->GetNameRef();
              if ($name !== $field) {
                $errors[$fieldProp] =
                  array('invalid', "Champ \"".$field ."\" "
                        ."mal nommé pour la couche \"".$layer->getName()
                        ."\" [".$layerProp."] : vérifier la casse ! "
                        ."(\"".$name."\", plutôt ?)");
                $state = false;
              }
            }
          }
        }
      }
    }
    return $state;
  }

  /**
   * Check that layers belong to the same datasource
   *
   * @see self::checkProperties
   * @param $container
   * @param $errors
   * @param $ogrLayers array Array of OgrLayer
   * @param $ogrLayersProps array Array of layer property names (keys must match $ogrLayers')
   * @return boolean
   */
  protected function checkSameOgrDataSource(ContainerInterface $container,
                                            &$errors, $ogrLayers,
                                            $ogrLayersProps) {
    $msg = "Doivent appartenir à la même source de données : "
      . '['.implode('], [', $ogrLayersProps).']';
    $state = true;
    foreach ($ogrLayers as $k => $ogrLayer) {
      if ($ogrLayer && (($dataSource = $ogrLayer->getDataSource($container)))) {
        if (isset($commonDataSource)) {
          if ($commonDataSource->getId() !== $dataSource->getId()) {
            $errors[$ogrLayersProps[$k]] = array('invalid', $msg);
            $state = false;
          }
        } else {
          $commonDataSource = $dataSource;
        }
      }
    }
    return $state;
  }

  public function buildLegendData(ContainerInterface $container)
  {
    $statistics = $this->getIndicatorStatistics($container);
    $data = parent::buildLegendData($container);
    //$data['value']['average'] = $statistics['average'];
    $data['value']['hasNull'] = $statistics['nullCount'] > 0;
    return $data;
  }

  protected function addOwnLayers(MsMap $msMap,
                                  ContainerInterface $container)
  {
    $this->buildStatisticLayers($msMap, $container);
  }

  protected function buildStatisticLayers(MsMap $msMap,
                                          ContainerInterface $container)
  {
    throw new \Exception('must be implemented in concrete class');
  }

  public function getStatisticsValueLayer()
  {
    return $this->statisticsValueLayer;
  }

  public function getIndicatorValues(ContainerInterface $container,
                                     $field = null,
                                     $includeNull = false)
  {
    if (!$this->cachedIndicatorValues) {
      $this->cachedIndicatorValues = array();
    }
    if (!$field) {
      $field = $this->statisticsValueFields[0];
    }
    if (!isset($this->cachedIndicatorValues[$field])) {
      $msMap = $this->build($container);
      $msLayer = @$msMap->getLayerByName($this->statisticsValueLayer);
      if (!$msLayer) {
        throw new \Exception('layer not defined in mapObj: '
                             . $this->statisticsValueLayer);
      }
      $msLayer->open();
      $msLayer->whichShapes($msMap->extent);
      $values = array();
      while ($msShape = $msLayer->nextShape()) {
        $values[] = $msShape->values[$field];
      }
      $msLayer->close();
      $this->cachedIndicatorValues[$field] = $values;
    }
    $values = $this->cachedIndicatorValues[$field];
    if (!$includeNull) {
      Number::removeNullsFromList($values);
    }
    return $values;
  }

  /**
   * Retrieve statistics info for given data layer
   *
   * Returns an associative array like :
   *   array('average' => X, ... )
   *
   * The data is cached in $this->infoCache['indicatorStatistics']
   *
   * @param $container
   * @param $layerName string  name of layer to retrieve the stats from.
   *                           NULL assumes $this->statisticsValueLayer
   * @return array Associative array, like { average: X, ... }
   */
  public function getIndicatorStatistics(ContainerInterface $container,
                                         $field = null)
  {
    if (!$field) {
      $field = $this->statisticsValueFields[0];
    }
    if (!isset($this->infoCache['indicatorStatistics'][$field])) {
      $container->get('logger')->debug("Ploomap: computing statistics for ".get_class($this)
                                       ." [".$field."]");
      $values = $this->getIndicatorValues($container, $field, true);
      $this->infoCache['indicatorStatistics'][$field] =
        Number::getListStatistics($values);
    }
    return $this->infoCache['indicatorStatistics'][$field];
    /* //$container->get('logger')->debug('OKA '.$field); */
    /* if (!isset($this->indicatorStatistics[$field])) { */
    /*   $values = $this->getIndicatorValues($container, $field, true); */
    /*   $this->indicatorStatistics[$field] =  Number::getListStatistics($values); */
    /*   $this->indicatorStatisticsUpdated = true; */
    /*   $dm = $container->get('doctrine.odm.mongodb.documentManager'); */
    /*   $dm->persist($this); */
    /* } */
    /* return $this->indicatorStatistics[$field]; */
  }

}
