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
 * @Document
 */
class Ratio extends Statistics
{
  const MODULE = 'Ratio';

  const FORCE_OGR_CONNECTION = false;

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
   * Must belong to same data source than others layer properties (JOIN).
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $polygonOgrLayer;

  /**
   * Table to use for geometry names & level selection
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $infoTable;

  /**
   * Name of field for JOIN in ogrLayer
   *
   * @MongoString
   */
  public $joinField = 'id';

  /**
   * Name of indicator table used as numerator
   *
   * Must belong to same data source than others layer properties (JOIN).
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
   * Must belong to same data source than others layer properties (JOIN).
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
  public $denominatorMultiplier = 1.0;

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

  /**
   * Fill color for null-stock geometries (behind symbols)
   *
   * @MongoString
   */
  public $polygonNullFillColor = '#ffffff';

  /**
   * Outline color of polygons
   *
   * @MongoString
   */
  public $polygonOutlineColor = '#303030';

  /**
   * Outline width
   *
   * @Float
   */
  public $polygonOutlineWidth = 1.0;

  /** inherited */
  protected $statisticsValueLayer = 'ratioPolygons';

  /** inherited */
  protected $statisticsValueFields = array('ratio');


  /** inherited */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    $state &= $this->checkSameOgrDataSource($container, $errors,
                                            array($this->polygonOgrLayer,
                                                  $this->infoTable,
                                                  $this->numeratorTable,
                                                  $this->denominatorTable),
                                            array('polygonOgrLayer',
                                                  'infoTable',
                                                  'numeratorTable',
                                                  'denominatorTable'));
    // polygonOgrLayer has fields: joinField
    $state &= $this->checkOgrField($container, $errors,
                                   $this->polygonOgrLayer, 'polygonOgrLayer',
                                   $this->joinField, 'joinField');
    // infoTable has fields: joinField, level, "name"
    $state &= $this->checkOgrField($container, $errors,
                                   $this->infoTable, 'infoTable',
                                   $this->joinField, 'joinField');
    $state &= $this->checkOgrField($container, $errors,
                                   $this->infoTable, 'infoTable',
                                   'name', 'infoTable');
    $state &= $this->checkPropertyLevel($container, $errors);
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
    // misc
    $state &= $this->checkCond(strlen(trim($this->ratioUnit)) > 0,
                               'ratioUnit', array('invalid', "L'unité est obligatoire"), $errors);
    $state &= $this->checkCond(strlen(trim($this->ratioLegendTitle)) > 0,
                               'ratioLegendTitle', array('invalid', "Le titre de légende est obligatoire"), $errors);
    $state &= $this->checkCond(!$this->ratioUnit || strpos('(', $this->ratioUnit) === false,
                               'ratioUnit',
                               array('invalid', "L'unit ne doivent pas contenir les parenthèses"),
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
    $state &= $this->checkColor($this->polygonNullFillColor,
                                'polygonNullFillColor', $errors);
    return $state;
  }

  /**
   * Check property "level" (for overload, especially by the class RatioGrid)
   */
  public function checkPropertyLevel(ContainerInterface $container, &$errors)
  {
    return strlen($this->level) ?
      $this->checkOgrField($container, $errors,
                           $this->infoTable, 'infoTable',
                           $this->level, 'infoTable') : true;
  }

  public function buildLegendData(ContainerInterface $container)
  {
    $stats = $this->getIndicatorStatistics($container);
    $classes = array();
    $count = count($this->classBounds);
    $classColors = $this->colorFamily->getColorSet($count + 1);
    for ($i = -1; $i < $count; ++$i) {
      $classes[$i + 1]['color'] = $classColors[$i + 1];
      $classes[$i + 1]['minimum'] = $i >= 0 ?
          $this->classBounds[$i] : $stats['minimum'];
    }
    $data = parent::buildLegendData($container);
    $data['widgetClass'] = 'geonef.ploomap.legend.Intervals';
    $data['value']['classes'] = array
      ('title' => $this->ratioLegendTitle,
       'unit' => $this->ratioUnit,
       'average' => $stats['average'],
       'maximum' => $stats['maximum'],
       'intervals' => $classes,
       'hasNull' => $data['value']['hasNull'],
       'polygonOutlineColor' => $this->polygonOutlineColor,
       'polygonNullFillColor' => $this->polygonNullFillColor);
    return $data;
  }

  protected function buildStatisticLayers(MsMap $msMap,
                                          ContainerInterface $container)
  {
    $msPolygonLayer = ms_newLayerObj($msMap);
    $this->configurePolygonLayer($msPolygonLayer, $msMap, $container);
    $this->configurePolygonStyle($msPolygonLayer, $msMap, $container);
  }

  protected function configurePolygonLayer(MsLayer $msLayer,
                                           MsMap $msMap,
                                           ContainerInterface $container)
  {
    $msLayer->set('name', 'ratioPolygons');
    $msLayer->set('type', MS_LAYER_POLYGON);
    Geo::setLayerConnection($container, $msLayer, $this->polygonOgrLayer,
                            self::FORCE_OGR_CONNECTION);
    $msLayer->set('data', $this->getConnectionData
                  ($this->polygonOgrLayer, $msMap, $msLayer));
    $msLayer->setProjection($msMap->getProjection());
    $msLayer->set('status', MS_ON);
  }

  protected function configurePolygonStyle(MsLayer $msLayer,
                                           MsMap $msMap,
                                           ContainerInterface $container)
  {
    // "nodata" polygons
    $msClass = ms_newClassObj($msLayer);
    $msClass->setExpression('("[ratio]" = "")');
    $msStyle = ms_newStyleObj($msClass);
    Geo::setMsColor($msStyle->color, $this->polygonNullFillColor);
    if ($this->polygonOutlineWidth > 0) {
      $msStyle->set('width', $this->polygonOutlineWidth);
      Geo::setMsColor($msStyle->outlinecolor, $this->polygonOutlineColor);
    }
    // interval classes
    $count = count($this->classBounds);
    $classColors = $this->colorFamily->getColorSet($count + 1);
    for ($i = -1; $i < $count; ++$i) {
      $conds = array();
      if ($i >= 0) {
        $conds[] = '[ratio] >= '.$this->classBounds[$i].'';
      }
      if ($i + 1 < $count) {
        $conds[] = '[ratio] < '.$this->classBounds[$i + 1].'';
      }
      $msClass = ms_newClassObj($msLayer);
      $msClass->setExpression('('.implode(' AND ', $conds).')');
      $msStyle = ms_newStyleObj($msClass);
      Geo::setMsColor($msStyle->color, $classColors[$i + 1]);
      if ($this->polygonOutlineWidth > 0) {
        $msStyle->set('width', $this->polygonOutlineWidth);
        Geo::setMsColor($msStyle->outlinecolor, $this->polygonOutlineColor);
      }
    }
  }

  protected function getConnectionData(OgrLayer $geoTable,
                                       MsMap $msMap,
                                       MsLayer $msLayer,
                                       $whereCond = null)
  {
    $begin = $msLayer->connectiontype == MS_OGR ? '' : 'wkb_geometry from (';
    $end = $msLayer->connectiontype == MS_OGR ? '' :
      ') as subquery using unique ogc_fid using SRID='
      .Geo::getMapProjEpsg($msMap);
    $sql = strtr('_begin_'
                 .'SELECT _geoTable_.ogc_fid, _geoTable_._joinField_, '
                 .'_geoTable_.wkb_geometry, _infoTable_.name,'
                 .' (_numTable_._numColumn_::float'
                 .'  * _numMultiplier_) /'
                 .' (_denomTable_._denomColumn_::float'
                 .'  * _denomMultiplier_) AS ratio '
                 .'FROM _geoInfoJoin_ LEFT JOIN _joinTable_'
                 .' ON _geoTable_._joinField_=_numTable_._joinField_ '
                 .'WHERE _whereSql_ '
                 .'_end_',
                 array('_geoTable_' => $geoTable->getName(),
                       '_infoTable_' => $this->infoTable->getName(),
                       '_joinTable_' => $this->getJoinTable(),
                       '_joinField_' => $this->joinField,
                       '_numTable_' => $this->numeratorTable->getName(),
                       '_numColumn_' => $this->numeratorColumn,
                       '_numMultiplier_' => $this->numeratorMultiplier,
                       '_denomTable_' => $this->denominatorTable->getName(),
                       '_denomColumn_' => $this->denominatorColumn,
                       '_denomMultiplier_' => $this->denominatorMultiplier,
                       '_geoInfoJoin_' => $this->getGeoInfoJoin($geoTable),
                       '_whereSql_' => $whereCond ?: $this->getSqlWhere(),
                       '_level_' => $this->level,
                       '_begin_' => $begin,
                       '_end_' => $end));
    //file_put_contents('/tmp/z42', $sql);
    return $sql;
  }

  protected function getJoinTable()
  {
    return $this->numeratorTable->getId() == $this->denominatorTable->getId() ?
      $this->numeratorTable->getName() :
      strtr('(_numTable_ LEFT JOIN _denomTable_ '
            .'ON _numTable_._joinField_ = _denomTable_._joinField_)',
            array('_numTable_' => $this->numeratorTable->getName(),
                  '_denomTable_' => $this->denominatorTable->getName(),
                  '_joinField_' => $this->joinField));
  }

  protected function getGeoInfoJoin(OgrLayer $geoTable)
  {
    return $geoTable->getId() == $this->infoTable->getId() ?
      $geoTable->getName() :
      strtr('(_geoTable_ INNER JOIN _infoTable_'
            .' ON _geoTable_._joinField_=_infoTable_._joinField_)',
            array('_geoTable_' => $geoTable->getName(),
                  '_infoTable_' => $this->infoTable->getName(),
                  '_joinField_' => $this->joinField));
  }

  // protected function getGeoInfoJoin(OgrLayer $geoTable, $geoAlias = null)
  // {
  //   $alias = $geoAlias ? ' AS '.$geoAlias : '';
  //   return $geoTable->getId() == $this->infoTable->getId() ?
  //     $geoTable->getName().$alias :
  //     strtr('(_geoTable_ _alias_INNER JOIN _infoTable_'
  //           .' ON _geoRef_._joinField_=_infoTable_._joinField_)',
  //           array('_geoTable_' => $geoTable->getName(),
  //                 '_alias_' => $alias,
  //                 '_infoTable_' => $this->infoTable->getName(),
  //                 '_geoRef_' => $geoAlias ? $alias : $geoTable->getName(),
  //                 '_joinField_' => $this->joinField));
  // }

  protected function getSqlWhere($table = null)
  {
    if (!strlen($this->level)) {
      return 'TRUE';
    }
    return strtr('_infoTable_._level_ = 1',
                 array('_infoTable_' => $table ?
                       $table : $this->infoTable->getName(),
                       '_level_' => $this->level));
  }


}
