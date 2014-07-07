<?php

namespace Geonef\PloomapBundle\Document;

use Geonef\PloomapBundle\Document\Map\MapInterface;
use Geonef\PloomapBundle\Document\Display;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\Zig\Util\FileSystem;
use Geonef\Zig\Util\String;
use Geonef\Ploomap\Util\Geo;
use OGRCoordinateTransformation;

use Doctrine\ODM\MongoDB\Mapping\Annotations as Doctrine;
use Doctrine\ODM\MongoDB\Mapping\Annotations\InheritanceType;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorField;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorMap;
use Doctrine\ODM\MongoDB\Mapping\Annotations\PreUpdate;
use Doctrine\ODM\MongoDB\Mapping\Annotations\PrePersist;
use Doctrine\ODM\MongoDB\Mapping\Annotations\PostUpdate;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Boolean;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Hash;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Date;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Collection;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;
use Gedmo\Mapping\Annotation\Translatable;

/**
 * Base class for MAP objects
 *
 * It manages map persistent properties, prop validity,
 * and generation of the MapScript Map object (build() method).
 *
 * Specific events:
 *      - onChange:     any document property has been changed
 *      - onMapChange:  some relevant properties have changed, changing the
 *                      map somehow
 *
 * @Doctrine\Document
 * @InheritanceType("SINGLE_COLLECTION")
 * @DiscriminatorField(fieldName = "module")
 * @DiscriminatorMap({
 *   "LayerList"  = "Geonef\PloomapBundle\Document\Map\LayerList",
 *   "Stock"      = "Geonef\PloomapBundle\Document\Map\Stock",
 *   "Ratio"      = "Geonef\PloomapBundle\Document\Map\Ratio",
 *   "StockRatio" = "Geonef\PloomapBundle\Document\Map\StockRatio",
 *   "RatioDisc"  = "Geonef\PloomapBundle\Document\Map\RatioDisc",
 *   "Cartogram"  = "Geonef\PloomapBundle\Document\Map\Cartogram",
 *   "RatioGrid"  = "Geonef\PloomapBundle\Document\Map\RatioGrid",
 *   "Potential"  = "Geonef\PloomapBundle\Document\Map\Potential"
 *  })
 *
 *   "MapFile"    = "Geonef\PloomapBundle\Document\Map\MapFile",
 *   "HardMap"    = "Geonef\PloomapBundle\Document\Map\HardMap",
 *
 */
abstract class Map implements MapInterface
{
  const EVENT_PREFIX = 'model.geonefPloomap.map';

  /**
   * @Id
   */
  public $uuid;

  /**
   * @MongoString
   */
  public $name;

  /**
   * @ReferenceOne(targetDocument = "Geonef\PloomapBundle\Document\MapCollection")
   */
  public $mapCollection;

  /**
   * Scale level (ie. nuts0, nuts1, c100 ...)
   *
   * @MongoString
   */
  public $level;

  /**
   * Map title
   *
   * @Translatable
   * @MongoString
   */
  public $title;

  /**
   * Map extent, in projection units
   *
   * @Collection
   */
  public $extent;

  /**
   * User notes
   *
   * @MongoString
   */
  public $userNotes;

  /**
   * @Boolean
   */
  public $published = false;

  /**
   * @ReferenceOne(
   *    targetDocument = "Geonef\ZigBundle\Document\Template")
   */
  public $svgTemplate;

  /**
   * Hash
   */
  //public $propValidity = array();

  /**
   * @Date
   */
  public $lastEditedAt;

  /**
   * @Hash
   */
  //public $services = array();

  /**
   * MapServer MAP string cache
   *
   * Cleared at prePersist
   *
   * @MongoString
   */
  //public $msMapString;

  /**
   * MapServer MAP file path
   *
   * For direct use by MapServer CGI.
   * Cleared at prePersist.
   *
   * @MongoString
   */
  //public $msMapPath;

  /**
   * Cache for various information
   *
   * Particularly used for the map extent and layer list.
   *
   * @Hash
   */
  public $infoCache = array();

  /**
   * Unpersisted cache for MapScript mapObj
   *
   * @var \mapObj
   */
  protected $msMap;

  public function __construct()
  {
    $this->lastEditedAt = new \DateTime();
  }

  public function getId()
  {
    return $this->uuid;
  }

  public function getName()
  {
    return $this->title;
  }

  public function getTitle()
  {
    return $this->title;
  }

  public function isPublished()
  {
    return $this->published;
  }

  /**
   * Clears the infoCache, along with assets which depend on map properties
   *
   * This is called on preUpdate by the MapLister when changes
   * are pending about properties other than 'infoCache'.
   *
   * It can be called from anywhere to force clearing the cache,
   * for example, to get new cached info after changes but before flush.
   *
   * @return boolean    Whether the infoCache has been cleared (false if already empty)
   */
  public function clearInfoCache(ContainerInterface $container)
  {
    $container->get('logger')->info('Geonef Ploomap: clearing map infoCache: '.$this->getId());
    // clear the MAP file
    $path = $this->getRelPath($container, 'mapFile', 'map');
    if (file_exists($path)) {
      $container->get('logger')->info('Geonef Ploomap: removing map file: '.$path);
      unlink($path);
    }
    // clear infoCache
    if (count($this->infoCache)) {
      $this->infoCache = array();
      $ret = true;
    } else {
      $ret = false;
    }
    // also clear unpersisted caches
    $this->msMap = null;

    return $ret;
  }

  public function setExtent($extent)
  {
    if (is_array($extent) || is_object($extent)) {
      $this->extent = $extent;
    } else {
      $this->extent = array(0, 0, 0, 0);
    }
  }

  public function getPropValidity(ContainerInterface $container, $locale = null)
  {
    if (!$locale) {
      $translatable = $container->get('stof_doctrine_extensions.listener.translatable');
      $locale = $translatable->getListenerLocale();
    }
    if (!isset($this->infoCache['propValidity'][$locale]['valid'])) {
      $container->get('logger')->debug("okapi, computing prop validity on map: ".$this->getId());
      $errors = array();
      $isValid = $this->checkProperties($container, $errors);
      $this->infoCache['propValidity'][$locale] =
        array('valid' => $isValid, 'errors' => $errors);
    }
    return $this->infoCache['propValidity'][$locale];
    /* if (!isset($this->propValidity['valid'])) { */
    /*   $this->updatePropValidity($container); */
    /* } */
    /* return $this->propValidity; */
  }

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
    return true;
  }

  /**
   * Facility for checkProperties()
   *
   * @param $cond boolean
   * @param $prop string
   * @param $msg string
   * @param $errors array
   */
  protected function checkCond($cond, $prop, $msg, &$errors)
  {
    if (!$cond) {
      $errors[$prop] = $msg;
      return false;
    }
    return true;
  }

  protected function checkColor($color, $prop, &$errors)
  {
    if (!$color && !strlen($color)) {
      $errors[$prop] = 'missing';
      return false;
    }
    if (!preg_match('/#[0-9a-fA-F]{6}/', $color)) {
      $errors[$prop] = 'invalid';
      return false;
    }
    return true;
  }

  /**
   * Build MapScript map object for this map document
   *
   * The 'msMapString' property is used if set, otherwise,
   * the prop is set and this doc is automatically persisted,
   * but not flushed.
   *
   * @param $container ContainerInterface
   * @return \msmap_obj
   */
  public function build(ContainerInterface $container, $limited = false)
  {
    /* if ($this->msMap) { */
    /*   return $this->msMap; */
    /* } */
    $logger = $container->get('logger');
    $v = $this->getPropValidity($container, 'en');
    if (!$v['valid']) {
      throw new \Exception('properties are not valid!');
    }
    $msMap = true;
    $cacheMapFile = $this->getRelPath($container, 'mapFile', 'map');
    if (file_exists($cacheMapFile)) {
      //$logger->debug("file ".$cacheMapFile." exists!");
      $msMap = ms_newMapObj($cacheMapFile);
      $logger->info('ploomap: map '.$this->getId().' built from cache map file');
    }
    if (!is_object($msMap)) {
      $msMap = $this->doBuild($container);
      if ($limited) {

        return $msMap;
      }
      $this->postBuild($msMap, $container);
      $dm = $container->get('doctrine.odm.mongodb.documentManager');
      $dm->persist($this);
      $msMap->save($cacheMapFile);
      $logger->info('ploomap: map '.$this->getId().' built, mapfile persisted');
    }
    $this->msMap = $msMap;

    return $msMap;
  }

  /**
   * Kind of abstract method - build the MapScript map object
   *
   * Usually, the method will call static::configureMap() at some point.
   */
  protected function doBuild(ContainerInterface $container)
  {
    throw new \Exception('must be implemented on concrete class');
  }

  /**
   * Get legend data for this map
   *
   * The data is cached.
   *
   * @param $container ContainerInterface
   * @return string
   */
  public function getLegendData(ContainerInterface $container)
  {
    return $this->buildLegendData($container);
    /* if (!isset($this->infoCache['legendData'])) { */
    /*   $this->infoCache['legendData'] = $this->buildLegendData($container); */
    /* } */
    /* return $this->infoCache['legendData']; */
  }

  /**
   * Build legend data for this map
   *
   * @param $container ContainerInterface
   * @return string
   */
  public function buildLegendData(ContainerInterface $container)
  {
    return array('value' => array());
  }

  /**
   * Build SVG for this map
   *
   * @param $container ContainerInterface
   * @param $format string (ex: 'html' or 'svg')
   * @param $resolution float
   * @return string
   */
  public function buildSvg(ContainerInterface $container)
  {
    throw new \Exception('no legend is available for this map: '.$this->uuid);
  }

  /**
   * Configure maps
   *
   * Called by children classes whenever needed
   */
  protected function configureMap(\mapObj $msMap,
                                  ContainerInterface $container)
  {
    if (Geo::isExtentValid($this->extent)) {
      list($x0, $y0, $x1, $y1) =
        array_map('floatval', $this->extent);
      $msMap->setExtent($x0, $y0, $x1, $y1);
    }
  }

  protected function postBuild(\mapObj $msMap,
                               ContainerInterface $container)
  {
    $name = strtr(String::removeAccents($this->getName()),
                  ' ?,;:!?./*','__________');//$msMap->name;
    $class = get_class($this);
    $name = 'map_' .strtolower(substr($class, strrpos($class, '\\')+1))
      . '_'.$this->getId();
    $msMap->set('name', $name);
    $logDir = FileSystem::makePath
      ($container->getParameter('kernel.logs_dir'), 'map');
    $log = FileSystem::makePath($logDir, $this->getId().'.log');
    if (!is_dir($logDir)) {
      mkdir($logDir);
    }
    $msMap->setConfigOption('MS_ERRORFILE', $log);
    //$msMap->setConfigOption('CPL_DEBUG', 'ON');
    //$msMap->setConfigOption('PROJ_DEBUG', 'ON');
    //$msMap->set('debug', 3);
    if (!Geo::isExtentValid(Geo::msRectToExtent($msMap->extent))) {
      // if extent is invalid or not defined, so compute it
      Geo::extentToMsRect($this->computeExtent($container, $msMap),
                          $msMap->extent);
    }
    $imagePath = $this->getRelPath($container, 'public/mapImage', null);
    $msMap->web->set('imagepath', $imagePath);
    $msMap->web->set('imageurl', '/mapImage');
    $msMap->web->set('temppath', $this->getRelPath($container, 'mapTemp', null));
    $url = $container->get('router')->generate
      ('geonef_ploomap_ows', array('id' => $this->uuid), true).'?';
    $wmsSrs = $wfsSrs =
      array(strtoupper(str_replace('+init=', '', $msMap->getProjection())));
    //$srs .= ' EPSG:4326 EPSG:900913';
    $displays = $this->getDisplays($container);
    foreach ($displays as $display) {
      if ($display instanceof Display\Wms) {
        $_srs  = $display->getSrs();
        if (!in_array($_srs, $wmsSrs)) {
          $wmsSrs[] = $_srs;
        }
      }
    }
    $props = array('onlineresource' => $url,
                   'ows_updatesequence' => time(),
                   'ows_enable_request' => '*',
                   'wms_onlineresource' => $url,
                   'wms_srs' => implode(' ', $wmsSrs),
                   'wms_title' => $this->title,
                   //'wms_feature_info_mime_type' => 'text/csv',
                   'wfs_onlineresource' => $url,
                   'wfs_srs' => implode(' ', $wfsSrs),
                   'wfs_title' => $this->title,
                   'wfs_abstract' => $this->title
                   );
    foreach ($props as $p => $n) {
      $msMap->setMetaData($p, $n);
    }
    $geomTypes = array(MS_LAYER_POINT => 'multipoint',
                       MS_LAYER_LINE => 'multiline',
                       MS_LAYER_POLYGON => 'multipolygon',
                       MS_LAYER_RASTER => null,
                       MS_LAYER_ANNOTATION => null,
                       MS_LAYER_QUERY => null,
                       MS_LAYER_CIRCLE => null,
                       MS_LAYER_TILEINDEX => null,
                       MS_LAYER_CHART => null);
    for ($i = 0; $i < $msMap->numlayers; ++$i) {
      $msLayer = $msMap->getLayer($i);
      $n = $msLayer->name;
      $msLayer->set('name', strtr(String::removeAccents($n),' ','_'));
      $msLayer->metadata->set('wms_title', $n);
      $msLayer->metadata->set('wfs_title', $n);
      $msLayer->metadata->set('gml_include_items', 'all');
      $msLayer->metadata->set('gml_geometries', 'geom');
      $msLayer->metadata->set('gml_types', 'auto');
      $msLayer->metadata->set('wfs_getfeature_formatlist', 'csv,csvzip,shapezip,kml,kmz');
      $geomType = isset($geomTypes[$msLayer->type]) ?
        $geomTypes[$msLayer->type] : null;
      if ($geomType) {
        $msLayer->metadata->set('gml_geom_type', $geomType);
      }
      $msLayer->set('dump', 1);
      $msLayer->set('template', '/tmp/nothing');
    }
  }

  public function getMapString(ContainerInterface $container,
                               \mapObj $msMap = null)
  {
    $cacheMapFile = $this->getRelPath($container, 'mapFile', 'map');
    if (file_exists($cacheMapFile)) {

      return file_get_contents($cacheMapFile);
    }
    if (!$msMap) {
      $msMap = $this->build($container);
    }
    $path = tempnam(sys_get_temp_dir(), 'map_');
    $msMap->save($path);
    $string = file_get_contents($path);
    unlink($path);

    return $string;
  }

  public function getRelPath(ContainerInterface $container, $dir, $ext, $createFile = false)
  {
    $absDir = FileSystem::makePath
      ($container->getParameter('kernel.cache_dir'), $dir);
    $path = !$ext ? $absDir :
      FileSystem::makePath($absDir, $this->getId().'.'.$ext);
    if (!is_dir($absDir)) {
      mkdir($absDir);
    }
    if ($createFile && !file_exists($path)) {
      touch($path);
    }

    return $path;
  }

  /**
   * Returned (cached) projection, from the built msMap
   *
   * @return string     Probably something like "EPSG:3035"
   */
  public function getMapProjection(ContainerInterface $container)
  {
    if (!isset($this->infoCache['mapProjection'])) {
      $msMap = $this->build($container);
      $this->infoCache['mapProjection'] = strtoupper(Geo::getMsMapSrs($msMap));
    }
    return $this->infoCache['mapProjection'];
  }

  /**
   * Returned the computed extent for the map
   *
   * The value is cached.
   *
   * @return array      extent as array(4) : [minX, minY, maxX, maxY]
   */
  public function getExtent(ContainerInterface $container)
  {
    if (!isset($this->infoCache['extent'])) {
      $msMap = $this->build($container);
      $this->infoCache['extent'] = Geo::msRectToExtent($msMap->extent);
    }
    return $this->infoCache['extent'];
  }

  /**
   * Compute map extent
   *
   * This method does not change the doc 'extent' poperty
   * containing the possible already cached extent.
   *
   * Warning! seems to fail and return default extent (-25000;-25000; ..)
   *          when map has not been rendered (noticed in SvgMap::computeRes..)
   * @param ContainerInterface $container
   * @param MsMap $map  MapScript map object, if already build
   * @return array      Extent as [x0, y0, x1, y1]
   */
  public function computeExtent(ContainerInterface $container,
                                \mapObj $msMap = null)
  {
    if (!$msMap) {
      $savedExtent = $this->extent;
      $this->extent = null;
      $msMap = $this->build($container);
      $this->extent = $savedExtent;
    }
    $mapProj = $msMap->getProjection();
    $extent = array(null, null, null, null);
    for ($i = 0, $count = $msMap->numlayers; $i < $count; ++$i) {
      $msLayer = $msMap->getLayer($i);
      if ($msLayer->status == MS_ON) {
        $layerExtent = Geo::msRectToExtent($msLayer->getExtent());
        $proj = $msLayer->getProjection();
        if ($proj !== $mapProj) {
          $container->get('logger')->debug
            ('OKA layer '.$msLayer->name.' has diff proj "'.$proj
             .'" than map\'s ('.$mapProj.'"): reprojecting');
          if (!isset($mapSpatialRef)) {
            $mapSpatialRef = Geo::parseSpatialRef($mapProj);
          }
          $reproject = new OGRCoordinateTransformation
            (Geo::parseSpatialRef($proj), $mapSpatialRef);
          $x = array($layerExtent[0], $layerExtent[2]);
          $y = array($layerExtent[1], $layerExtent[3]);
          if (!$reproject->Transform($x, $y)) {
            throw new \Exception('failed to reproject!');
          }
          $layerExtent = array($x[0], $y[0], $x[1], $y[1]);
        }
        $extent = Geo::totalExtent($extent, $layerExtent);
      }
    }
    if (!$count) {
      throw new \Exception('no layer defined for map: '.$this->uuid);
    }

    return $extent;
  }

  public function getLayerNames(ContainerInterface $container,
                                \mapObj $msMap = null, $onlyVisible = false)
  {
    if (!isset($this->infoCache['layers']) ||
        !isset($this->infoCache['visibleLayers'])) {
      if (!$msMap) {
        $msMap = $this->build($container);
      }
      $this->infoCache['layers'] = array();
      $this->infoCache['visibleLayers'] = array();
      $order = $msMap->getLayersDrawingOrder();
      foreach ($order as $idx) {
        $msLayer = $msMap->getLayer($idx);
        $this->infoCache['layers'][] = $msLayer->name;
        if ($msLayer->status == MS_ON) {
          $this->infoCache['visibleLayers'][] = $msLayer->name;
        }
      }
    }
    return $this->infoCache[$onlyVisible ? 'visibleLayers' : 'layers'];
  }

  public function getWmsMapUrl(ContainerInterface $container,
                               $params = array())
  {
    $p['SERVICE'] = 'WMS';
    $p['VERSION'] = '1.1.1';
    $p['REQUEST'] = 'GetMap';
    $p['EXCEPTIONS'] = 'application/vnd.ogc.se_inimage';
    $p['FORMAT'] = 'image/png';
    $msMap = $this->build($container);
    if (!isset($params['BBOX'])) {
      $p['BBOX'] = implode(',', Geo::msRectToExtent($msMap->extent));
    }
    if (!isset($params['LAYERS'])) {
      $layers = $this->getlayerNames($container, $msMap, true);
      $p['LAYERS'] = implode(',', $layers);
    }
    if (!isset($params['SRS'])) {
      $srs = $msMap->getProjection();
      $p['SRS'] = strtoupper(str_replace('+init=', '', $srs));
    }
    $params = array_merge($p, $params);
    $url = $msMap->getMetaData('wms_onlineresource');
    foreach ($params as $key => $val) {
      $url .= $key . '=' . urlencode($val) . '&';
    }

    return $url;
  }

  public function getWfsUrl(ContainerInterface $container,
                            $params = array())
  {
    $p['SERVICE'] = 'WFS';
    $p['VERSION'] = '1.0.0';
    $p['REQUEST'] = 'GetFeature';
    //$p['FORMAT'] = 'image/png';
    $msMap = $this->build($container);
    if (!isset($params['TYPENAME'])) {
      $layers = $this->getlayerNames($container, $msMap, true);
      $p['TYPENAME'] = implode(',', $layers);
    }
    $params = array_merge($p, $params);
    $url = $msMap->getMetaData('wfs_onlineresource');
    foreach ($params as $key => $val) {
      $url .= $key . '=' . urlencode($val) . '&';
    }

    return $url;
  }

  /**
   * Find suitable display, or create one
   *
   * If created, the display is persisted to DM before being returned
   *
   * @return DocumentManager
   */
  public function getDisplay(ContainerInterface $container, $params)
  {
    $displays = $this->getDisplays($container);
    foreach ($displays as $display) {
      if ($display->supportsParameters($params)) {

        return $display;
      }
    }
    $display = Display::createFromParameters($container, $this, $params);
    $dm = $container->get('doctrine.odm.mongodb.document_manager');
    $dm->persist($display);

    return $display;
  }

  public function getDisplays(ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.document_manager');
    $it = $dm->createQueryBuilder('Geonef\PloomapBundle\Document\Display')
      ->field('map.$id')->equals(new \MongoId($this->uuid))
      ->getQuery()->execute();

    return $it;
  }

}
