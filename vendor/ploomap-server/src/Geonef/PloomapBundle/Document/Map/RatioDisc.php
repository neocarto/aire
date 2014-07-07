<?php

namespace Geonef\PloomapBundle\Document\Map;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\OgrLayer;
use Doctrine\ODM\MongoDB\DocumentManager;
use Geonef\Ploomap\Util\Geo;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Float;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;

/**
 * Module for building Ratio+discontinuities maps
 *
 * @Document
 */
class RatioDisc extends Ratio
{
  const MODULE = 'RatioDisc';

  const FORCE_OGR_CONNECTION = false;

  /**
   * Datasource layer containing geo unit contiguities (lines)
   *
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $discOgrLayer;

  /**
   * Threshold
   *
   * @Float
   */
  public $discThreshold = 0.1;

  /**
   * Minimum width of discontinuity lines
   *
   * @Float
   */
  public $discMinWidth = 1.0;

  /**
   * Maximum width of discontinuity lines
   *
   * @Float
   */
  public $discMaxWidth = 10.0;

  /**
   * Width of discontinuity lines for NULL values
   *
   * @Float
   */
  public $discNullWidth = 5.0;

 /**
   * Color of discontinuity lines
   *
   * @MongoString
   */
  public $discColor = '#d00000';

  /**
   * Symbol fill color
   *
   * @MongoString
   */
  public $discNullColor = '#c0c0c0';

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
    // discOgrLayer has fields: id_a, id_b
    $state &= $this->checkOgrField($container, $errors,
                                   $this->discOgrLayer, 'discOgrLayer',
                                   'id_a', 'discOgrLayer');
    $state &= $this->checkOgrField($container, $errors,
                                   $this->discOgrLayer, 'discOgrLayer',
                                   'id_b', 'discOgrLayer');
    // check threshold and width parameters
    $state &= $this->checkCond(is_numeric($this->discThreshold) &&
                               $this->discThreshold != 0,
                               'discThreshold', 'invalid', $errors);
    $state &= $this->checkCond(is_numeric($this->discMaxWidth) &&
                               $this->discMaxWidth != 0,
                               'discMaxWidth', 'invalid', $errors);
    $state &= $this->checkCond(is_numeric($this->discMinWidth) &&
                               $this->discMinWidth < $this->discMaxWidth,
                               'discMinWidth', 'invalid', $errors);
    $state &= $this->checkCond(is_numeric($this->discNullWidth),
                               'discMaxWidth', 'invalid', $errors);
    // colors
    $state &= $this->checkColor($this->discColor,
                                'discColor', $errors);
    $state &= $this->checkColor($this->discNullColor,
                                'discNullColor', $errors);
    return $state;
  }

  public function buildLegendData(ContainerInterface $container)
  {
    $data = parent::buildLegendData($container);
    $data['widgetClass'] = 'geonef.ploomap.legend.RatioDisc';
    $data['value']['disc'] = array
      ('minWidth' => $this->discMinWidth,
       'maxWidth' => $this->discMaxWidth,
       'nullWidth' => $this->discNullWidth,
       'color' => $this->discColor,
       'nullColor' => $this->discNullColor,
       'hasNull' => $this->hasNullDisc($container)
       );
    return $data;
  }

  protected function hasNullDisc(ContainerInterface $container)
  {
    if (!isset($this->infoCache['hasNullDisc'])) {
      $msMap = $this->build($container);
      $msLayer = $msMap->getLayerByName('ratioDiscNull');
      $msLayer->open();
      $msLayer->whichShapes($msMap->extent);
      $msShape = $msLayer->nextShape();
      $this->infoCache['hasNullDisc'] = $msShape ? true : false;
      $msLayer->close();
    }

    return $this->infoCache['hasNullDisc'];
  }

  protected function buildStatisticLayers(\mapObj $msMap,
                                          ContainerInterface $container)
  {
    parent::buildStatisticLayers($msMap, $container);
    $msDiscLayer = ms_newLayerObj($msMap);
    $this->configureDiscLayer($msDiscLayer, $msMap, $container);
    $this->configureDiscStyle($msDiscLayer, $msMap, $container);
    $msDiscNullLayer = ms_newLayerObj($msMap);
    $this->configureDiscNullLayer($msDiscNullLayer, $msMap, $container);
    $this->configureDiscNullStyle($msDiscNullLayer, $msMap, $container);
  }

  protected function configureDiscLayer(\layerObj $msLayer,
                                        \mapObj $msMap,
                                        ContainerInterface $container)
  {
    $msLayer->set('name', 'ratioDisc');
    $msLayer->set('type', MS_LAYER_LINE);
    Geo::setLayerConnection($container, $msLayer, $this->discOgrLayer,
                            self::FORCE_OGR_CONNECTION);
    //$msLayer->setConnectionType(MS_OGR);
    //$dataSource = $this->discOgrLayer->getDataSource($container);
    //$msLayer->set('connection', $dataSource->getSourcePath($container));
    $msLayer->set('data', $this->getDiscConnectionData
                  ($this->discOgrLayer, $msMap, $msLayer));
    $msLayer->setProjection($msMap->getProjection());
    $msLayer->set('status', MS_ON);
  }

  protected function configureDiscNullLayer(\layerObj $msLayer,
                                        \mapObj $msMap,
                                        ContainerInterface $container)
  {
    $msLayer->set('name', 'ratioDiscNull');
    $msLayer->set('type', MS_LAYER_LINE);
    Geo::setLayerConnection($container, $msLayer, $this->discOgrLayer,
                            self::FORCE_OGR_CONNECTION);
    //$msLayer->setConnectionType(MS_OGR);
    //$dataSource = $this->discOgrLayer->getDataSource($container);
    //$msLayer->set('connection', $dataSource->getSourcePath($container));
    $msLayer->set('data', $this->getDiscNullConnectionData
                  ($this->discOgrLayer, $msMap, $msLayer));
    $msLayer->setProjection($msMap->getProjection());
    $msLayer->set('status', MS_ON);
  }

  protected function configureDiscStyle(\layerObj $msLayer,
                                           \mapObj $msMap,
                                           ContainerInterface $container)
  {
    $msLayer->set('sizeunits', MS_PIXELS);
    $msClass = ms_newClassObj($msLayer);
    $msStyle = ms_newStyleObj($msClass);
    $msStyle->setBinding(MS_STYLE_BINDING_WIDTH, 'data');
    Geo::setMsColor($msStyle->color, $this->discColor);
  }

  protected function configureDiscNullStyle(\layerObj $msLayer,
                                        \mapObj $msMap,
                                        ContainerInterface $container)
  {
    $msLayer->set('sizeunits', MS_PIXELS);
    $msClass = ms_newClassObj($msLayer);
    $msStyle = ms_newStyleObj($msClass);
    $msStyle->set('width', $this->discNullWidth);
    Geo::setMsColor($msStyle->color, $this->discNullColor);
  }

  protected function makeSymbol(\mapObj $msMap)
  {
    $uuid = uniqid();
    $symbolId = ms_newSymbolObj($msMap, $uuid);
    $msSymbol = $msMap->getSymbolObjectById($symbolId);
    $msSymbol->set('type', MS_SYMBOL_ELLIPSE);
    $msSymbol->set('filled', MS_TRUE);
    $msSymbol->setpoints(array(1, 1));
    $msSymbol->set('inmapfile', MS_TRUE);
    return $uuid;
  }

  protected function getDiscConnectionData(OgrLayer $geoTable,
                                           \mapObj $msMap,
                                           \layerObj $msLayer)
  {
    $sql = strtr
      ('SELECT g.ogc_fid, g.wkb_geometry, '
       .'GREATEST((n1._numeratorColumn_ * _numeratorMultiplier_) / '
       .'         (d1._denominatorColumn_ * _denominatorMultiplier_), '
       .'         (n2._numeratorColumn_ * _numeratorMultiplier_) / '
       .'         (d2._denominatorColumn_ * _denominatorMultiplier_)) / '
       .'   LEAST((n1._numeratorColumn_ * _numeratorMultiplier_) / '
       .'         (d1._denominatorColumn_ * _denominatorMultiplier_), '
       .'         (n2._numeratorColumn_ * _numeratorMultiplier_) / '
       .'         (d2._denominatorColumn_ * _denominatorMultiplier_))'
       .' AS data '
       .'FROM ((((_geoTable_ AS g INNER JOIN _infoTable_'
       .'          ON g.id_a=_infoTable_._joinField_)'
       .' LEFT JOIN _numeratorTable_ AS n1 ON g.id_a=n1._joinField_) '
       .' LEFT JOIN _numeratorTable_ AS n2 ON g.id_b=n2._joinField_) '
       .' LEFT JOIN _denominatorTable_ AS d1 ON g.id_a=d1._joinField_) '
       .' LEFT JOIN _denominatorTable_ AS d2 ON g.id_b=d2._joinField_ '
       .'WHERE _whereSql_'
       .' AND n1._numeratorColumn_ != 0 AND n2._numeratorColumn_ != 0 ',
       array('_geoTable_' => $geoTable->getName(),
             '_infoTable_' => $this->infoTable->getName(),
             '_joinField_' => $this->joinField,
             '_numeratorTable_' => $this->numeratorTable->getName(),
             '_numeratorColumn_' => $this->numeratorColumn,
             '_numeratorMultiplier_' => $this->numeratorMultiplier,
             '_denominatorTable_' => $this->denominatorTable->getName(),
             '_denominatorColumn_' => $this->denominatorColumn,
             '_denominatorMultiplier_' => $this->denominatorMultiplier,
             //'_geoInfoJoin_' => $this->getGeoInfoJoin($geoTable, 'g'),
             // to check...
             '_whereSql_' => $this->getSqlWhere('g')));
    $begin = $msLayer->connectiontype == MS_OGR ? '' : 'wkb_geometry from (';
    $end = $msLayer->connectiontype == MS_OGR ? '' :
      ') as subquery using unique ogc_fid using SRID='
      .Geo::getMapProjEpsg($msMap);
    $query = strtr('_begin_SELECT * FROM _discSqlFunc_('
                   .'_minWidth_, _maxWidth_, _threshold_, \'_sql_\')_end_',
                   array('_discSqlFunc_' => 'ploomap_ratiodisc_width',
                         '_minWidth_' => $this->discMinWidth,
                         '_maxWidth_' => $this->discMaxWidth,
                         '_threshold_' => $this->discThreshold,
                         '_sql_' => str_replace("'", "''", $sql),
                         '_begin_' => $begin,
                         '_end_' => $end));
    //file_put_contents('/tmp/z42', $query);
    return $query;
  }

  protected function getDiscNullConnectionData(OgrLayer $geoTable,
                                               \mapObj $msMap,
                                               \layerObj $msLayer)
  {
    $begin = $msLayer->connectiontype == MS_OGR ? '' : 'wkb_geometry from (';
    $end = $msLayer->connectiontype == MS_OGR ? '' :
      ') as subquery using unique ogc_fid using SRID='
      .Geo::getMapProjEpsg($msMap);
    $sql = strtr('_begin_SELECT g.ogc_fid, g.wkb_geometry '
                 .'FROM (((_geoTable_ AS g '
                 .' LEFT JOIN _numeratorTable_ AS n1 ON g.id_a=n1._joinField_) '
                 .' LEFT JOIN _numeratorTable_ AS n2 ON g.id_b=n2._joinField_) '
                 .' LEFT JOIN _denominatorTable_ AS d1 ON g.id_a=d1._joinField_) '
                 .' LEFT JOIN _denominatorTable_ AS d2 ON g.id_b=d2._joinField_ '
                 .'WHERE _whereSql_'
                 .' AND (n1._numeratorColumn_ = 0 OR n2._numeratorColumn_ = 0)'
                 .'_end_',
                 array('_geoTable_' => $geoTable->getName(),
                       '_joinField_' => $this->joinField,
                       '_numeratorTable_' => $this->numeratorTable->getName(),
                       '_numeratorColumn_' => $this->numeratorColumn,
                       '_numeratorMultiplier_' => $this->numeratorMultiplier,
                       '_denominatorTable_' =>
                                        $this->denominatorTable->getName(),
                       '_denominatorColumn_' => $this->denominatorColumn,
                       '_denominatorMultiplier_' => $this->denominatorMultiplier,
                       '_whereSql_' => $this->getSqlWhere('g'),
                       '_begin_' => $begin,
                       '_end_' => $end));
    return $sql;
  }

  /*


  CREATE TYPE ploomap_ratiodisc_row AS (ogc_fid integer, wkb_geometry geometry, data double precision);

  CREATE OR REPLACE FUNCTION ploomap_ratiodisc_width(ep_min integer, ep_max integer, seuil real, query character varying)
  RETURNS SETOF ploomap_ratiodisc_row AS
$BODY$
DECLARE
  r ploomap_ratiodisc_row;
  o ploomap_ratiodisc_row;
  ref refcursor;
  vmin float(8);
  vmax float(8);
  count integer := 0;
  keepf float(8);
  keep integer;
  q varchar;
BEGIN
 EXECUTE 'SELECT COUNT(*) FROM (' || query || ') AS a' INTO count;
 keep := round(count * seuil);
 q := query || ' ORDER BY data DESC LIMIT ' || keep;
 -- we get the count, min and max
 OPEN ref FOR EXECUTE q;
 LOOP
  FETCH ref INTO r;
  EXIT WHEN r IS NULL;
  IF vmin IS NULL OR r.data < vmin THEN
   vmin := r.data;
  END IF;
  IF vmax IS NULL OR r.data > vmax THEN
   vmax := r.data;
  END IF;
 END LOOP;
 CLOSE ref;
 -- we make the final data
 OPEN ref FOR EXECUTE q;
 LOOP
  FETCH ref INTO r;
  EXIT WHEN r IS NULL;
  o := r;
  o.data = round((o.data - vmin) * (ep_max - ep_min) / (vmax - vmin) + ep_min);
  IF o.data IS NOT NULL THEN
    RETURN NEXT o;
  END IF;
 END LOOP;
 CLOSE ref;
 RETURN;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
*/

}
