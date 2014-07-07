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
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;

/**
 * Module for building ratio squares as a grid
 *
 * @Document
 */
class RatioGrid extends Ratio
{
  const MODULE = 'RatioGrid';

  /**
   * Datasource layer to use as grid geometry
   *
   * Must belong to same data source than others layer properties (JOIN).
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $gridOgrLayer;

  /**
   * Name of field for JOIN between gridOgrLayer and matchTable
   *
   * @MongoString
   */
  public $gridJoinField = 'id';

  /**
   * Name of table to use to JOIN polygonOgrLayer (nuts) and gridOgrLayer
   *
   * Must belong to same data source than others layer properties (JOIN).
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $matchTable;

  ///////

  protected $gridNutsField = 'nuts';

  protected $gridPctField = 'pct';

  /** inherited */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    $state &= $this->checkOgrField($container, $errors,
                                   $this->gridOgrLayer, 'gridOgrLayer',
                                   $this->gridJoinField, 'gridJoinField');
    $state &= $this->checkOgrField($container, $errors,
                                   $this->matchTable, 'matchTable',
                                   $this->gridNutsField, 'matchTable'); // hardcoded
    $state &= $this->checkOgrField($container, $errors,
                                   $this->matchTable, 'matchTable',
                                   $this->gridPctField, 'matchTable'); // hardcoded
    $state &= $this->checkOgrField($container, $errors,
                                   $this->matchTable, 'matchTable',
                                   $this->gridJoinField, 'gridJoinField');
    /* if ($state && !count($this->getIndicatorValues($container))) { */
    /*   $tot = count($this->getIndicatorValues($container, null, true)); */
    /*   $errors['gridOgrLayer'] = 'Toutes les '.$tot.' valeurs sont NULL !'; */
    /*   $state = false; */
    /* } */
    return $state;
  }

  /**
   * Check property "level" (for overload, especially by the class RatioGrid)
   */
  public function checkPropertyLevel(ContainerInterface $container, &$errors)
  {
    return $this->checkOgrField($container, $errors,
                                $this->gridOgrLayer, 'gridOgrLayer',
                                $this->level, 'gridOgrLayer');
  }

  protected function buildStatisticLayers(MsMap $msMap,
                                          ContainerInterface $container)
  {
    parent::buildStatisticLayers($msMap, $container);
    $msNullPolygonLayer = ms_newLayerObj($msMap);
    $this->configureNullPolygonLayer($msNullPolygonLayer, $msMap, $container);
    $this->configureNullPolygonStyle($msNullPolygonLayer, $msMap, $container);
  }

  protected function configureNullPolygonLayer(MsLayer $msLayer,
                                               MsMap $msMap,
                                               ContainerInterface $container)
  {
    $msLayer->set('name', 'ratioNullPolygons');
    $msLayer->set('type', MS_LAYER_POLYGON);
    Geo::setLayerConnection($container, $msLayer, $this->polygonOgrLayer,
                            self::FORCE_OGR_CONNECTION);
    $msLayer->set('data', parent::getConnectionData
                  ($this->polygonOgrLayer, $msMap, $msLayer,
                   $this->getNullSqlWhere()));
    $msLayer->setProjection($msMap->getProjection());
    $msLayer->set('status', MS_ON);
  }

  protected function configureNullPolygonStyle(MsLayer $msLayer,
                                               MsMap $msMap,
                                               ContainerInterface $container)
  {
    // "nodata" polygons
    $msClass = ms_newClassObj($msLayer);
    $msStyle = ms_newStyleObj($msClass);
    Geo::setMsColor($msStyle->color, $this->polygonNullFillColor);
    if ($this->polygonOutlineWidth > 0) {
      $msStyle->set('width', $this->polygonOutlineWidth);
      Geo::setMsColor($msStyle->outlinecolor, $this->polygonOutlineColor);
    }
  }

  protected function getNullSqlWhere()
  {
    $sql = strtr('(_numTable_._numColumn_ IS NULL OR '
                 .'_denomTable_._denomColumn_ IS NULL) AND '
                 .'_nutsTable_._joinField_ IN ('
                 .' SELECT _matchTable_._nutsField_'
                 .' FROM _matchTable_ INNER JOIN _geoTable_'
                 .'   ON _matchTable_._gridJoinField_='
                 .'      _geoTable_._gridJoinField_'
                 .')', array
                 ('_geoTable_' => $this->gridOgrLayer->getName(),
                  '_nutsTable_' => $this->polygonOgrLayer->getName(),
                  '_matchTable_' => $this->matchTable->getName(),
                  '_gridJoinField_' => $this->gridJoinField,
                  '_joinField_' => $this->joinField,
                  '_nutsField_' => $this->gridNutsField,
                  '_numTable_' => $this->numeratorTable->getName(),
                  '_numColumn_' => $this->numeratorColumn,
                  '_denomTable_' => $this->denominatorTable->getName(),
                  '_denomColumn_' => $this->denominatorColumn));
    return $sql;
  }

  protected function getConnectionData(OgrLayer $geoTable,
                                       MsMap $msMap,
                                       MsLayer $msLayer,
                                       $andWhere = '')
  {
    $begin = $msLayer->connectiontype == MS_OGR ? '' : 'wkb_geometry from (';
    $end = $msLayer->connectiontype == MS_OGR ? '' :
      ') as subquery using unique ogc_fid using SRID='
      .Geo::getMapProjEpsg($msMap);
    // $ratioExpr =   // Old expr - 1st algorithm (NULL if one value is NULL)
    //   ' CASE bool_or(_numTable_._numColumn_ IS NULL)'
    //   .'  WHEN TRUE THEN NULL'
    //   .'  ELSE SUM(_numTable_._numColumn_ *'
    //   ./*      */' _matchTable_._pctField_ * _numMultiplier_)'
    //   .' END /'
    //   .' CASE bool_or(_denomTable_._denomColumn_ IS NULL)'
    //   .'  WHEN TRUE THEN NULL'
    //   .'  ELSE SUM(_denomTable_._denomColumn_ *'
    //   ./*      */' _matchTable_._pctField_ * _denomMultiplier_)'
    //   .' END';
    $ratioExpr =  // Old expr - 1st algorithm (NULL if all values are NULL)
       'SUM(CASE WHEN _denomTable_._denomColumn_ IS NULL'
      .'         THEN NULL '
      .'         ELSE _numTable_._numColumn_::float *'
      .'              _matchTable_._pctField_ * _numMultiplier_'
      .'         END) /'
      .'SUM(CASE WHEN _numTable_._numColumn_ IS NULL'
      .'         THEN NULL '
      .'         ELSE _denomTable_._denomColumn_::float *'
      .'              _matchTable_._pctField_ * _denomMultiplier_'
      .'         END)';

    $sql = strtr('_begin_'
                 .'SELECT _geoTable_.ogc_fid, _geoTable_._gridJoinField_, '
                 .'_geoTable_.wkb_geometry, ' .$ratioExpr.' AS ratio '
                 .'FROM'
                 .' (_geoTable_ INNER JOIN'
                 .'  (_matchTable_ INNER JOIN _nutsTable_'
                 .'   ON _matchTable_._nutsField_ = _nutsTable_._joinField_)'
                 .'  ON _geoTable_._gridJoinField_ = _matchTable_._gridJoinField_)'
                 .' INNER JOIN _joinTable_ ON _nutsTable_._joinField_ = _numTable_._joinField_ '
                 .'WHERE _geoTable_."_level_" = 1 _andWhere_'
                 .'GROUP BY _geoTable_.ogc_fid, _geoTable_.wkb_geometry, _geoTable_._gridJoinField_'
                 .'_end_',
                 array('_geoTable_' => $this->gridOgrLayer->getName(),
                       '_nutsTable_' => $geoTable->getName(),
                       '_matchTable_' => $this->matchTable->getName(),
                       '_gridJoinField_' => $this->gridJoinField,
                       '_nutsField_' => $this->gridNutsField,
                       '_pctField_' => $this->gridPctField,
                       '_joinField_' => $this->joinField,
                       '_joinTable_' => $this->getJoinTable(),
                       '_numTable_' => $this->numeratorTable->getName(),
                       '_numColumn_' => $this->numeratorColumn,
                       '_numMultiplier_' => $this->numeratorMultiplier,
                       '_denomTable_' => $this->denominatorTable->getName(),
                       '_denomColumn_' => $this->denominatorColumn,
                       '_denomMultiplier_' => $this->denominatorMultiplier,
                       '_level_' => $this->level,
                       '_andWhere_' => $andWhere,
                       '_begin_' => $begin,
                       '_end_' => $end));
    return $sql;
  }

}
