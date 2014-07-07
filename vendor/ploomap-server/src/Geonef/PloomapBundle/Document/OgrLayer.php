<?php

namespace Geonef\PloomapBundle\Document;

use Geonef\Zig\Util\Dev;
use Geonef\Ploomap\Util\Geo;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Index;
use Doctrine\ODM\MongoDB\Mapping\Annotations\PrePersist;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Int;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Hash;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Timestamp;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Collection;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;

/**
 * @Document
 */
class OgrLayer
{
  const EVENT_PREFIX = 'model.geonefPloomap.ogrLayer';

  /**
   * @Id
   */
  public $uuid;

  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrDataSource")
   * @Index
   */
  public $dataSource;

  /**
   * Layer name within the OGR data source
   * @MongoString
   * @Index
   */
  public $name;

  /**
   * Geometry type
   *
   * @MongoString
   */
  public $geometryType;

  /**
   * Geometry field
   *
   * @MongoString
   */
  public $geometryField;

  /**
   * Identifier field
   *
   * @MongoString
   */
  public $fidField;

  /**
   * Fields
   *
   * @Collection
   */
  public $fields = array();

  /**
   * Geographical extent (array like [minX,minY,maxX,maxY])
   *
   * @Collection
   */
  public $extent = array();

  /**
   * @Int
   */
  public $featureCount = -1;

  /**
   * @MongoString
   */
  public $spatialRef;

  /**
   * @Timestamp
   */
  public $ogrSyncTimestamp;


  public function getId()
  {
    return $this->uuid;
  }

  /**
   * Return the list of fields, sorted by name
   *
   * @return array of associative arrays container fields' name, type...
   */
  public function getFields()
  {
    $fields = $this->fields;
    usort($fields, function($v1, $v2) {
        return strcmp($v1['name'], $v2['name']); });
    return $fields;
  }

  public static function fromOgr(ContainerInterface $container,
                                 \OGRLayer $ogrLayer,
                                 OgrDataSource $source)
  {
    $object = new static;
    $object->dataSource = $source;
    $object->syncFromOgr($container, $ogrLayer);
    return $object;
  }

  /**
   * Warning: seems that this has to be called from
   * OgrDataSource::syncKnownLayers() or the call to OGR_L_GetLayerDefn()
   * will fail and exit the script with no output :-/
   */
  public function syncFromOgr(ContainerInterface $container,
                              \OGRLayer $ogrLayer = null)
  {
    set_time_limit(intval(ini_get('max_execution_time')));
    if (!$ogrLayer) {
      $ogrLayer = $this->getOgrLayer($container);
    }
    $ogrLayerDef = $ogrLayer->GetLayerDefn();
    $extent = $ogrLayer->GetExtent(true);
    $this->name = $ogrLayerDef->GetName();
    $this->featureCount = $ogrLayer->GetFeatureCount(true);
    $this->fields = $this->getFieldsInfo($ogrLayer, $ogrLayerDef);
    $this->fieldCount = $ogrLayerDef->GetFieldCount();
    $this->fidField = $ogrLayer->GetFIDColumn();
    $this->geometryField = $ogrLayer->GetGeometryColumn();
    $this->geometryType =
      static::getStringGeometryType($ogrLayerDef->GetGeomType());
    $this->setSpatialRefFromOgrLayer($ogrLayer);
    $this->ogrSyncTimestamp = time();
  }

  protected function setSpatialRefFromOgrLayer($ogrLayer)
  {
    $spatialRef = $ogrLayer->GetSpatialRef();
    //Dev::logDump($container, 'LAYER '.$this->name.' : OBJ ');
    //Dev::logDump($container, $spatialRef);
    $this->spatialRef = null;
    if ($spatialRef) {
      $epsg = Geo::identifyEpsg($spatialRef);
      if ($epsg) {
        $this->spatialRef = 'EPSG:'.$epsg;
      } else {
        $proj4 = $spatialRef->exportToProj4();
        if (is_string($proj4)) {
          $this->spatialRef = trim($proj4);
        }
      }
    }
  }

  protected function getFieldsInfo($ogrLayer, $ogrLayerDef)
  {
    static $types = array(OFTInteger => 'integer',
                          OFTIntegerList => 'integerList',
                          OFTReal => 'real',
                          OFTRealList => 'realList',
                          OFTString => 'string',
                          OFTStringList => 'stringList',
                          OFTWideString => 'wideString',
                          OFTWideStringList => 'wideStringList',
                          OFTBinary => 'binary',
                          OFTDate => 'date',
                          OFTTime => 'time',
                          OFTDateTime => 'dateTime'
                          );
    static $justifies = array(OJUndefined => 'undefined',
                              OJLeft => 'left',
                              OJRight => 'right');
    $count = $ogrLayerDef->GetFieldCount();
    //$count = OGR_FD_GetFieldCount($ogrLayerDef);
    $fields = array();
    for ($i = 0; $i < $count; ++$i) {
      $ogrField = $ogrLayerDef->GetFieldDefn($i);
      $type = $ogrField->GetType();
      $typeName = isset($types[$type]) ? $types[$type] : 'unknown';
      $justify = $ogrField->GetJustify();
      $justifyName = isset($justifies[$justify]) ? $justifies[$justify] : 'unknown';
      //var_dump($ogrField);exit;
      //$ogrField = OGR_FD_GetFieldDefn($ogrLayerDef, $i);
      $fields[] = array('name' => $ogrField->GetNameRef(),
                        'type' => $typeName,
                        'width' => $ogrField->GetWidth(),
                        'precision' => $ogrField->GetPrecision(),
                        'justify' => $justifyName);
      // $fields[] = array('name' => OGR_Fld_GetNameRef($ogrField),
      //                   'type' => $types[OGR_Fld_GetType($ogrField)],
      //                   'width' => OGR_Fld_GetWidth($ogrField),
      //                   'precision' => OGR_Fld_GetPrecision($ogrField),
      //                   'justify' => $justifies[OGR_Fld_GetJustify($ogrField)]);
    }
    usort($fields, function($v1, $v2) {
        return strcmp($v1['name'], $v2['name']); });
    return $fields;
  }

  public function getName()
  {
    return $this->name;
  }

  public function getDataSource(ContainerInterface $container)
  {
    // getRealDocument() needed to respect discrminator map
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $doc = Dev::getRealDocument($this->dataSource, $dm);
    return $doc;
  }

  public function getOgrDataSource(ContainerInterface $container,
                                   $writeAccess = false)
  {
    return $this->getDataSource($container)->getOgr($container, $writeAccess);
  }

  public function getOgrLayer(ContainerInterface $container)
  {
    $ds = $this->getOgrDataSource($container);
    $ogrLayer = $ds->GetLayerByName($this->name);
    //$ogrLayer = OGR_DS_GetLayerByName($ds, $this->name);
    if (!$ogrLayer) {
      throw new \Exception('layer not defined in datasource: '.$this->name);
    }
    return $ogrLayer;
    // $count = OGR_DS_GetLayerCount($ds);
    // for ($i = 0; $i < $count; $i++) {
    //   $ogrLayer = OGR_DS_GetLayer($ds, $i);
    //   $def = OGR_L_GetLayerDefn($ogrLayer);
    //   $name = OGR_FD_GetName($def);
    //   if ($name == $this->name) {
    //     return $ogrLayer;
    //     //$this->
    //     //return OGR_DS_GetLayer($ds, $i);
    //   }
    // }
    // throw new \Exception('layer not found: '.$this->name);
  }

  public function getOgrIndex($container)
  {
    $ds = $this->getOgrDataSource($container);
    $count = $ds->GetLayerCount();
    for ($i = 0; $i < $count; ++$i) {
      $name = $ds->GetLayer($i)->GetLayerDefn()->GetName();
      if ($name == $this->name) {
        return $i;
      }
    }
    throw new \Exception('layer not found!');
  }

  public function deleteOgr(ContainerInterface $container,
                            $updateDataSource = true)
  {
    $ds = $this->getOgrDataSource($container, true);
    if ($ds->deleteLayer($this->getOgrIndex($container)) != OGRERR_NONE) {
      throw new \Exception('failed to remove OGR layer "'.$this->name
                           .'" ('.$this->uuid.') from datasource');
    }
    if ($updateDataSource) {
      $dataSource = $this->getDataSource($container);
      $dataSource->updateStats($container);
      $dm = $container->get('doctrine.odm.mongodb.documentManager');
      $dm->persist($dataSource);
    }
  }

  /**
   * Make a test connection to check the validity of settings
   *
   * @return boolean
   */
  public function testConnection()
  {
  }

  /**
   * @PrePersist
   */
  public function beforeSave()
  {
    // todo: need container
    /*if ($this->featureCount < 0) {
      $this->updateStats();
      }*/
  }

  public function updateStats(ContainerInterface $container)
  {
    $ogrLayer = $this->getOgrLayer($container);
    $this->featureCount = $ogrLayer->GetFeatureCount(true);
  }

  public static function getOgrGeometryType($string)
  {
    $hash = static::getGeometryTypeHash();
    $key = array_search($string, $hash);
    if ($key === false) {
      throw new \Exception('invalid geometry type string: '.$string);
    }
    return $key;
  }

  public static function getStringGeometryType($ogrType)
  {
    $hash = static::getGeometryTypeHash();
    if (!isset($hash[$ogrType])) {
      throw new \Exception('invalid geometry type value: '.$ogrType);
    }
    return $hash[$ogrType];
  }

  public static function getGeometryTypeHash()
  {
    return array(wkbUnknown => 'unknown', // 'unknown'
                 // attribute-only PG tables are reported as wkbUnknown
                 // instead of wkbNone, so we cheat here until
                 // side-effects will be met.
                 wkbPoint => 'point',
                 wkbLineString => 'lineString',
                 wkbPolygon => 'polygon',
                 wkbMultiPoint => 'multiPoint',
                 wkbMultiLineString => 'multiLineString',
                 wkbMultiPolygon => 'multiPolygon',
                 wkbGeometryCollection => 'geometryCollection',
                 wkbNone => 'none',
                 wkbLinearRing => 'linearRing',
                 wkbPoint25D => 'point25D',
                 wkbLineString25D => 'lineString25D',
                 wkbPolygon25D => 'polygon25D',
                 wkbMultiPoint25D => 'multiPoint25D',
                 wkbMultiLineString25D => 'multiLineString25D',
                 wkbMultiPolygon25D => 'multiPolygon25D',
                 wkbGeometryCollection25D => 'geometryCollection25D');
  }

}

      /* $v = $spatialRef->exportToWkt(); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' WKT: '.$v); */
      /* $v = $spatialRef->exportToProj4(); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' Proj.4: '.$v); */
      /* /\* $v = $spatialRef->exportToPrettyWkt(); *\/ */
      /* /\* Dev::logDump($container, 'LAYER '.$this->name.' WKT pretty: '.$v); *\/ */
      /* /\* $v = $spatialRef->exportToPrettyWkt(true); *\/ */
      /* /\* Dev::logDump($container, 'LAYER '.$this->name.' WKT prettyS: '.$v); *\/ */
      /* /\* $v = $spatialRef->exportToXML(); *\/ */
      /* /\* Dev::logDump($container, 'LAYER '.$this->name.' XML: '.$v); *\/ */
      /* $v = $spatialRef->GetAuthorityCode(); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : '.$v); */
      /* $v = $spatialRef->GetAuthorityCode('PROJCS'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : '.$v); */
      /* $v = $spatialRef->GetAuthorityCode('GEOGCS'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : '.$v); */
      /* $v = $spatialRef->GetAuthorityCode('GEOGCS|UNIT'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : '.$v); */
      /* $v = $spatialRef->GetAuthorityName(); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : name '.$v); */
      /* $v = $spatialRef->GetAuthorityName('PROJCS'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : name '.$v); */
      /* $v = $spatialRef->GetAuthorityName('GEOGCS'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : name '.$v); */
      /* $v = $spatialRef->GetAuthorityName('GEOGCS|UNIT'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : name '.$v); */
      /* $v = $spatialRef->AutoIdentifyEPSG(); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : AUTO '); */
      /* Dev::logDump($container, $v); */
      /* $v = $spatialRef->GetAuthorityCode(); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : '.$v); */
      /* $v = $spatialRef->GetAuthorityCode('PROJCS'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : '.$v); */
      /* $v = $spatialRef->GetAuthorityCode('GEOGCS'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : '.$v); */
      /* $v = $spatialRef->GetAuthorityCode('GEOGCS|UNIT'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : '.$v); */
      /* $v = $spatialRef->GetAuthorityName(); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : name '.$v); */
      /* $v = $spatialRef->GetAuthorityName('PROJCS'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : name '.$v); */
      /* $v = $spatialRef->GetAuthorityName('GEOGCS'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : name '.$v); */
      /* $v = $spatialRef->GetAuthorityName('GEOGCS|UNIT'); */
      /* Dev::logDump($container, 'LAYER '.$this->name.' : name '.$v); */
