<?php

namespace Geonef\PloomapBundle\Document\Map;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\OgrLayer;
use Doctrine\ODM\MongoDB\DocumentManager;
use Geonef\Ploomap\Util\Geo;
use mapObj as MsMap;
use layerObj as MsLayer;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Float;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Collection;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;
use Gedmo\Mapping\Annotation\Translatable;

/**
 * Module for building Stock+Ratio maps
 *
 * This inherits from Stock, so many properties & code from Ratio
 * is copy-pasted from the Ratio document class.
 * (as we can't extend more than one class in PHP)
 *
 * @Document
 */
class StockRatio extends Stock
{
  const MODULE = 'StockRatio';

  /**
   * Legend title for ratios
   *
   * @Translatable
   * @MongoString
   */
  public $ratioLegendTitle;

  /**
   * Unit for ratios
   *
   * @Translatable
   * @MongoString
   */
  public $ratioUnit;

  /**
   * Name of indicator table used as numerator
   *
   * Must belong to same data source than geographical layer
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $numeratorTable;

  /**
   * Name of column used for the ratio denominator
   *
   * @MongoString
   */
  public $numeratorColumn;

  /**
   * Value to multiply the stats value with to get the size
   *
   * @Float
   */
  public $numeratorMultiplier = 1;

  /**
   * Name of indicator table used as denominator
   *
   * Must belong to same data source than geographical layer
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $denominatorTable;

  /**
   * Name of column used for the ratio denominator
   *
   * @MongoString
   */
  public $denominatorColumn;

  /**
   * Value to multiply the stats value with to get the size
   *
   * @Float
   */
  public $denominatorMultiplier = 1;

  /**
   * Ratio class bounds (excluding min & max)
   *
   * @Collection
   */
  public $classBounds;

  /**
   * Color family to use
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\ColorFamily")
   */
  public $colorFamily;

  // Unpersisted properties
  ///////

  /** inherited */
  protected $statisticsValueFields = array('stock', 'ratio');

  /**
   * Check validity of this map properties
   *
   * This tests properties values as well as whether all checks
   * whose success garanties a build success
   * (ex: datasource as valid, can be opened...)
   *
   * @param $container ContainerInterface
   * @param $errors    array
   * @return boolean    Whether the map properties are valid
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    $state &= $this->checkSameOgrDataSource($container, $errors,
                                            array($this->polygonOgrLayer,
                                                  $this->numeratorTable,
                                                  $this->denominatorTable),
                                            array('polygonOgrLayer',
                                                  'numeratorTable',
                                                  'denominatorTable'));
    // numerator and denominator's tables, fields and multipliers
    $state &= $this->checkOgrField($container, $errors,
                                   $this->numeratorTable, 'numeratorTable',
                                   $this->numeratorColumn, 'numeratorColumn');
    $state &= $this->checkOgrField($container, $errors,
                                   $this->numeratorTable, 'numeratorTable',
                                   $this->joinField, 'joinField');
    $state &= $this->checkOgrField($container, $errors,
                                   $this->denominatorTable, 'denominatorTable',
                                   $this->denominatorColumn, 'denominatorColumn');
    $state &= $this->checkOgrField($container, $errors,
                                   $this->denominatorTable, 'denominatorTable',
                                   $this->joinField, 'joinField');
    $state &= $this->checkCond(is_numeric($this->numeratorMultiplier) &&
                               $this->numeratorMultiplier > 0,
                               'numeratorMultiplier',
                               array('invalid', "Doit être un réel non null"),
                               $errors);
    $state &= $this->checkCond(is_numeric($this->numeratorMultiplier) &&
                               $this->denominatorMultiplier > 0,
                               'denominatorMultiplier',
                               array('invalid', "Doit être un réel non null"),
                               $errors);
    // class bounds & colors
    $s = is_array($this->classBounds) && count($this->classBounds) > 0;
    if ($s) {
      foreach ($this->classBounds as $val) {
        if (!is_numeric($val)) {
          $s = false;
          break;
        }
      }
    }
    $state &= $this->checkCond($s, 'classBounds',
                               array('invalid', "Doit être une liste de réels "
                                     ."séparés par des virgules"), $errors);
    $errs = array();
    $state &= $this->checkCond($this->colorFamily,
                               'colorFamily', 'missing', $errors) &&
      $this->checkCond($this->colorFamily->checkProperties($container, $errs),
                       'colorFamily', 'invalid', $errors);
    return $state;
  }

  public function buildLegendData(ContainerInterface $container)
  {
    $stats = $this->getIndicatorStatistics($container, 'ratio');
    $classes = array();
    $count = count($this->classBounds);
    $classColors = $this->colorFamily->getColorSet($count + 1);
    for ($i = -1; $i < $count; ++$i) {
      $classes[$i + 1]['color'] = $classColors[$i + 1];
      $classes[$i + 1]['minimum'] = $i >= 0 ?
          $this->classBounds[$i] : $stats['minimum'];
    }
    $data = parent::buildLegendData($container);
    $data['widgetClass'] = 'geonef.ploomap.legend.CircleIntervals';
    $data['value']['circle']['hasNull'] = $data['value']['hasNull'];
    $data['value']['classes'] = array
      ('title' => $this->ratioLegendTitle,
       'unit' => $this->ratioUnit,
       'average' => $stats['average'],
       'maximum' => $stats['maximum'],
       'intervals' => $classes,
       'polygonOutlineColor' => $this->symbolOutlineColor,
       'polygonNullFillColor' => $this->polygonNullFillColor,
       'hasNull' => $stats['nullCount'] > 0);
    return $data;
  }

  protected function configureSymbolStyle(MsLayer $msLayer,
                                          MsMap $msMap,
                                          ContainerInterface $container)
  {
    // null ratio (but non-null stock)
    $msClass = $this->buildClass($msLayer, $msMap, $this->polygonNullFillColor);
    $msClass->setExpression('("[ratio]" = "" AND "[symbolsize]" != "")');
    // interval classes
    $count = count($this->classBounds);
    $classColors = $this->colorFamily->getColorSet($count + 1);
    for ($i = -1; $i < $count; ++$i) {
      $conds = array('"[symbolsize]" != ""');
      if ($i >= 0) {
        $conds[] = '[ratio] >= '.$this->classBounds[$i].'';
      }
      if ($i + 1 < $count) {
        $conds[] = '[ratio] < '.$this->classBounds[$i + 1].'';
      }
      $msClass = $this->buildClass($msLayer, $msMap, $classColors[$i + 1]);
      $msClass->setExpression('('.implode(' AND ', $conds).')');
    }
  }

  protected function getConnectionData(OgrLayer $geoTable,
                                       MsMap $msMap,
                                       MsLayer $msLayer)
  {
    $joinTable = $this->indicatorTable->getName();
    $set = array($this->indicatorTable->getId());
    foreach (array('numeratorTable', 'denominatorTable') as $p) {
      if (!in_array($this->$p->getId(), $set)) {
        $set[] = $this->$p->getId();
        $joinTable = strtr
          ('(_joinTable_ LEFT JOIN _table_ '
           .'ON _table_.id = _indicTable_.id)',
           array('_joinTable_' => $joinTable,
                 '_table_' => $this->$p->getName(),
                 '_indicTable_' => $this->indicatorTable->getName()
                 /*, '_joinField_' => $this->joinField*/));;
      }
    }
    $begin = $msLayer->connectiontype == MS_OGR ? '' : 'wkb_geometry from (';
    $end = $msLayer->connectiontype == MS_OGR ? '' :
      ') as subquery using unique ogc_fid using SRID='
      .Geo::getMapProjEpsg($msMap);
    $sql = strtr('_begin_'
                 .'SELECT _geoTable_.ogc_fid, _geoTable_._joinField_, '
                 .'_geoTable_.wkb_geometry,  _infoTable_.name,'
                 .' _indicTable_._stockColumn_::float * _stockMultiplier_ AS stock, '
                 .'sqrt(_indicTable_._stockColumn_::float * _stockMultiplier_ '
                 .'     * _sizeMultiplier_ / pi()) AS symbolsize, '
                 .'(_numeratorTable_._numeratorColumn_::float * _numeratorMultiplier_) / '
                 .'(_denominatorTable_._denominatorColumn_::float * _denominatorMultiplier_) AS ratio '
                 .'FROM _geoInfoJoin_ LEFT JOIN _joinTable_ '
                 .' ON _geoTable_._joinField_=_indicTable_.id '
                 .'WHERE _whereSql_ '
                 .'ORDER BY stock DESC'
                 .'_end_',
                 array('_geoTable_' => $geoTable->getName(),
                       '_infoTable_' => $this->infoTable->getName(),
                       '_indicTable_' => $this->indicatorTable->getName(),
                       '_joinTable_' => $joinTable,
                       '_joinField_' => $this->joinField,
                       '_stockColumn_' => $this->stockColumn,
                       '_stockMultiplier_' => $this->stockMultiplier,
                       '_sizeMultiplier_' => $this->sizeMultiplier,
                       '_numeratorTable_' => $this->numeratorTable->getName(),
                       '_numeratorColumn_' => $this->numeratorColumn,
                       '_numeratorMultiplier_' => $this->numeratorMultiplier,
                       '_denominatorTable_' =>
                                        $this->denominatorTable->getName(),
                       '_denominatorColumn_' => $this->denominatorColumn,
                       '_denominatorMultiplier_' => $this->denominatorMultiplier,
                       '_geoInfoJoin_' => $this->getGeoInfoJoin($geoTable),
                       '_whereSql_' => $this->getSqlWhere(),
                       '_begin_' => $begin,
                       '_end_' => $end));
    return $sql;
  }

}

