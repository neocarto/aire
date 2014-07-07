<?php

namespace Geonef\PloomapBundle\Document\Map;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\OgrLayer;
use Doctrine\ODM\MongoDB\DocumentManager;
use Geonef\Ploomap\Util\Geo;
use mapObj as MsMap;
use layerObj as MsLayer;
use symbolObj as MsSymbol;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Float;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Collection;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;
use Gedmo\Mapping\Annotation\Translatable;

/**
 * Statistical representation through propotional symbol
 *
 * @Document
 */
class Stock extends Statistics
{
  const MODULE = 'Stock';

  const FORCE_OGR_CONNECTION = false;

  /**
   * Legend title for stocks
   *
   * @Translatable
   * @MongoString
   */
  public $stockLegendTitle;

  /**
   * Unit for stocks
   *
   * @Translatable
   * @MongoString
   */
  public $stockUnit;

  /**
   * Datasource layer to take the background polygons from
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $polygonOgrLayer;

  /**
   * Datasource layer to take the centroids from
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $symbolOgrLayer;

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
  public $joinField;

  /**
   * Name of indicator table.
   *
   * Must belong to same data source than geographical layer
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $indicatorTable;

  /**
   * Name of column used for the main stock data
   *
   * @MongoString
   */
  public $stockColumn;

  /**
   * Value to multiply the stock value with.
   *
   * The stock becomes meaningful with the unit after the multiplication
   *
   * @Float
   */
  public $stockMultiplier = 1;

  /**
   * Symbol to use (simple shape coordinates or image)
   *
   * @Hash
   * @todo use it and develop graphical symbol editor
   */
  //public $symbol;

  /**
   * Value to multiply the stats value with to get the size
   *
   * @Float
   */
  public $sizeMultiplier = 1;

  /**
   * Symbol fill color
   *
   * @MongoString
   */
  public $symbolFillColor = '#a0a0f0';

  /**
   * Symbol outline color
   *
   * @MongoString
   */
  public $symbolOutlineColor = '#0000ff';

  /**
   * Symbol outline width
   *
   * @Float
   */
  public $symbolOutlineWidth = 10000; //3.0;

  /**
   * Fill color for geometries (behind symbols)
   *
   * @MongoString
   */
  public $polygonFillColor = '#c0c0c0';

  /**
   * Fill color for null-stock geometries (behind symbols)
   *
   * @MongoString
   */
  public $polygonNullFillColor = '#ffffff';

  /**
   * Outline color for geometries (behind symbols)
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

  /**
   * Bounds represented on legend's symbol
   *
   * @Collection
   */
  public $legendBounds;

  /** inherited */
  protected $statisticsValueLayer = 'stockSymbol';

  /** inherited */
  protected $statisticsValueFields = array('stock');

  /** inherited */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    $state &= $this->checkSameOgrDataSource($container, $errors,
                                            array($this->polygonOgrLayer,
                                                  $this->symbolOgrLayer,
                                                  $this->infoTable,
                                                  $this->indicatorTable),
                                            array('polygonOgrLayer',
                                                  'symbolOgrLayer',
                                                  'infoTable',
                                                  'indicatorTable'));
    // polygonOgrLayer has fields: joinField
    $state &= $this->checkOgrField($container, $errors,
                                   $this->polygonOgrLayer, 'polygonOgrLayer',
                                   $this->joinField, 'joinField');
    // symbolOgrLayer has fields: joinField
    $state &= $this->checkOgrField($container, $errors,
                                   $this->polygonOgrLayer, 'symbolOgrLayer',
                                   $this->joinField, 'joinField');
    // infoTable has fields: joinField, level, "name"
    $state &= $this->checkOgrField($container, $errors,
                                   $this->infoTable, 'infoTable',
                                   $this->joinField, 'joinField');
    if (strlen($this->level)) {
      $state &= $this->checkOgrField($container, $errors,
                                     $this->infoTable, 'infoTable',
                                     $this->level, 'infoTable');
    }
    $state &= $this->checkOgrField($container, $errors,
                                   $this->infoTable, 'infoTable',
                                   'name', 'infoTable');
    // indicator table as field: stockColumn
    $state &= $this->checkOgrField($container, $errors,
                                   $this->indicatorTable, 'indicatorTable',
                                   $this->stockColumn, 'stockColumn');
    // stock & size multipliers
    $state &= $this->checkCond(is_numeric($this->stockMultiplier) &&
                               $this->stockMultiplier > 0,
                               'stockMultiplier', array('invalid'), $errors);
    $state &= $this->checkCond(is_numeric($this->sizeMultiplier) &&
                               $this->sizeMultiplier > 0,
                               'sizeMultiplier', array('invalid'), $errors);
    // bounds
    $s = is_array($this->legendBounds) && count($this->legendBounds) > 0;
    if ($s) {
      foreach ($this->legendBounds as $val) {
        if (!is_numeric($val)) {
          $s = false;
          break;
        }
      }
    }
    $state &= $this->checkCond($s, 'legendBounds',
                               array('invalid', "Doit être une liste de réels "
                                     ."séparés par des virgules"), $errors);
    // misc
    $state &= $this->checkCond(!$this->stockUnit || strpos('(', $this->stockUnit) === false,
                               'stockUnit',
                               array('invalid', "L'unit ne doivent pas contenir les parenthèses"),
                               $errors);
    // colors
    $state &= $this->checkColor($this->symbolFillColor,
                                'symbolFillColor', $errors);
    $state &= $this->checkColor($this->symbolOutlineColor,
                                'symbolOutlineColor', $errors);
    $state &= $this->checkColor($this->polygonFillColor,
                                'polygonFillColor', $errors);
    $state &= $this->checkColor($this->polygonNullFillColor,
                                'polygonNullFillColor', $errors);
    $state &= $this->checkColor($this->polygonOutlineColor,
                                'polygonOutlineColor', $errors);
    return $state;
  }

  public function buildLegendData(ContainerInterface $container)
  {
    $stats = $this->getIndicatorStatistics($container);
    $thresholds = array_map('floatval', $this->legendBounds);
    sort($thresholds);
    $data = parent::buildLegendData($container);
    $data['widgetClass'] = 'geonef.ploomap.legend.Circle';
    $data['value']['circle'] = array
      ('title' => $this->stockLegendTitle,
       'unit' => $this->stockUnit,
       'average' => $stats['average'],
       'thresholds' => $thresholds,
       'sizeMultiplier' => $this->sizeMultiplier,
       'symbolFillColor' => $this->symbolFillColor,
       'symbolOutlineColor' => $this->symbolOutlineColor,
       'symbolOutlineWidth' => $this->symbolOutlineWidth,
       'polygonNullFillColor' => $this->polygonNullFillColor);
    return $data;
  }

  protected function buildStatisticLayers(MsMap $msMap,
                                          ContainerInterface $container)
  {
    $msPolygonLayer = ms_newLayerObj($msMap);
    $this->configurePolygonLayer($msPolygonLayer, $msMap, $container);
    $this->configurePolygonStyle($msPolygonLayer, $msMap, $container);
    $msSymbolLayer = ms_newLayerObj($msMap);
    $this->configureSymbolLayer($msSymbolLayer, $msMap, $container);
    $this->configureSymbolStyle($msSymbolLayer, $msMap, $container);
  }

  protected function configurePolygonLayer(MsLayer $msLayer,
                                           MsMap $msMap,
                                           ContainerInterface $container)
  {
    $msLayer->set('name', 'backgroundPolygons');
    $msLayer->set('type', MS_LAYER_POLYGON);
    Geo::setLayerConnection($container, $msLayer, $this->polygonOgrLayer,
                            self::FORCE_OGR_CONNECTION);
    $msLayer->set('data', $this->getConnectionData
                  ($this->polygonOgrLayer, $msMap, $msLayer));
    $msLayer->setProjection($msMap->getProjection());
    $msLayer->set('status', MS_ON);
  }

  protected function configureSymbolLayer(MsLayer $msLayer,
                                          MsMap $msMap,
                                          ContainerInterface $container)
  {
    $msLayer->set('name', 'stockSymbol');
    $msLayer->set('type', MS_LAYER_POINT);
    Geo::setLayerConnection($container, $msLayer, $this->symbolOgrLayer,
                            self::FORCE_OGR_CONNECTION);
    $msLayer->set('data', $this->getConnectionData
                  ($this->symbolOgrLayer, $msMap, $msLayer));
    $msLayer->setProjection($msMap->getProjection());
    $msLayer->set('sizeunits', MS_METERS);
    $msLayer->set('status', MS_ON);
    $msLayer->set('tolerance', 30);
    $msLayer->set('toleranceunits', MS_PIXELS);
  }

  protected function configurePolygonStyle(MsLayer $msLayer,
                                           MsMap $msMap,
                                           ContainerInterface $container)
  {
    // "nodata" polygons
    $msClass = ms_newClassObj($msLayer);
    $msClass->setExpression('("[symbolsize]" = "")');
    $msStyle = ms_newStyleObj($msClass);
    Geo::setMsColor($msStyle->color, $this->polygonNullFillColor);
    if ($this->polygonOutlineWidth > 0) {
      $msStyle->set('width', $this->polygonOutlineWidth);
      Geo::setMsColor($msStyle->outlinecolor, $this->polygonOutlineColor);
    }
    // normal polygons
    $msClass = ms_newClassObj($msLayer);
    $msStyle = ms_newStyleObj($msClass);
    Geo::setMsColor($msStyle->color, $this->polygonFillColor);
    if ($this->polygonOutlineWidth > 0) {
      Geo::setMsColor($msStyle->outlinecolor, $this->polygonOutlineColor);
      $msStyle->set('width', $this->polygonOutlineWidth);
    }
  }

  protected function configureSymbolStyle(MsLayer $msLayer,
                                          MsMap $msMap,
                                          ContainerInterface $container)
  {
    $msClass = $this->buildClass($msLayer, $msMap, $this->symbolFillColor);
  }

  protected function buildClass(MsLayer $msLayer, MsMap $msMap,
                                $fillColor)
  {
    $msClass = ms_newClassObj($msLayer);
    $msClass->setExpression('([symbolsize] > 0)');
    $msStyle = ms_newStyleObj($msClass);
    $msStyle->setBinding(MS_STYLE_BINDING_SIZE, 'symbolsize');
    Geo::setMsColor($msStyle->color, $fillColor);
    Geo::setMsColor($msStyle->outlinecolor, $this->symbolOutlineColor);
    $uuid = $this->makeSymbol($msMap);
    $msStyle->set('symbolname', $uuid);
    $msStyle->set('width', $this->symbolOutlineWidth);
    //$msStyle->set('outlinewidth', 2);
    return $msClass;
  }

  protected function makeSymbol(MsMap $msMap)
  {
    // $symbolId = ms_newSymbolObj($msMap, $uuid);
    // $msSymbol = $msMap->getSymbolObjectById($symbolId);
    //throw new \Exception('grr - '.get_class($msSymbol));
    //$msSymbol->set('type', MS_SYMBOL_ELLIPSE);
    //$msSymbol->set('filled', MS_TRUE);
    $uuid = uniqid();
    $msSymbol = new MsSymbol($msMap, $uuid);
    $msSymbol->type = MS_SYMBOL_ELLIPSE;
    $msSymbol->filled = MS_TRUE;
    $msSymbol->setPoints(array(1, 1));
    $msSymbol->inmapfile = MS_TRUE;
    return $uuid;
  }

  protected function getConnectionData(OgrLayer $geoTable,
                                       MsMap $msMap,
                                       MsLayer $msLayer)
  {
    $begin = $msLayer->connectiontype == MS_OGR ? '' : 'wkb_geometry from (';
    $end = $msLayer->connectiontype == MS_OGR ? '' :
      ') as subquery using unique ogc_fid using SRID='
      .Geo::getMapProjEpsg($msMap);
    $sql = strtr('_begin_SELECT _geoTable_.ogc_fid, _geoTable_._joinField_, '
                 .'_geoTable_.wkb_geometry, _infoTable_.name, '
                 .'_indicTable_._stockColumn_::float * _stockMultiplier_ AS stock, '
                 .'sqrt(_indicTable_._stockColumn_::float * _stockMultiplier_ '
                 .'     * _sizeMultiplier_ / pi()) AS symbolsize '
                 .'FROM _geoInfoJoin_ LEFT JOIN _indicTable_ '
                 .' ON _geoTable_._joinField_=_indicTable_.id '
                 .'WHERE _whereSql_ '
                 .'ORDER BY stock DESC_end_',
                 array('_geoTable_' => $geoTable->getName(),
                       '_infoTable_' => $this->infoTable->getName(),
                       '_indicTable_' => $this->indicatorTable->getName(),
                       '_joinField_' => $this->joinField,
                       '_stockColumn_' => $this->stockColumn,
                       '_stockMultiplier_' => $this->stockMultiplier,
                       '_sizeMultiplier_' => $this->sizeMultiplier,
                       '_geoInfoJoin_' => $this->getGeoInfoJoin($geoTable),
                       '_whereSql_' => $this->getSqlWhere(),
                       '_begin_' => $begin,
                       '_end_' => $end));
    return $sql;
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

  protected function getSqlWhere()
  {
    if (!strlen($this->level)) {
      return 'TRUE';
    }
    return strtr('_infoTable_._level_ = 1',
                 array('_infoTable_' => $this->infoTable->getName(),
                       '_level_' => $this->level));
  }

}
