<?php

namespace Geonef\PloomapBundle\Document;

use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use OGRSFDriverRegistrar;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\PrePersist;
use Doctrine\ODM\MongoDB\Mapping\Annotations\InheritanceType;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorField;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorMap;
use Doctrine\ODM\MongoDB\Mapping\Annotations\PostLoad;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Int;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * @Document
 * @InheritanceType("SINGLE_COLLECTION")
 * @DiscriminatorField(fieldName="module")
 * @DiscriminatorMap({
 *      "File" = "Geonef\PloomapBundle\Document\OgrDataSource\File",
 *      "PostgreSql" = "Geonef\PloomapBundle\Document\OgrDataSource\PostgreSql",
 *      "Generic" = "Geonef\PloomapBundle\Document\OgrDataSource\Generic",
 *      "PgLink" = "Geonef\PloomapBundle\Document\OgrDataSource\PgLink"
 *  })
 */
abstract class OgrDataSource
{
  /**
   * @Id
   */
  public $uuid;

  /**
   * @MongoString
   */
  public $name;

  /**
   * @var OGRDataSource
   */
  protected $roOgr;

  /**
   * @var OGRDataSource
   */
  protected $rwOgr;

  /**
   * @MongoString
   */
  //public $module;

  /**
   * @Int
   */
  public $layerCount = -1;

  /**
   * Updated by ogrOpen()
   *
   * var resource
   */
  //protected $driver;

  public function __construct()
  {
    error_log('__construct!! '.get_class($this).' '.$this->uuid);
  }

  /**
   * TODO: preSerialize...
   */
  // public function __destruct()
  // {
  //   error_log('__destruct!! '.get_class($this).' '.$this->uuid);
  //   //unset($this);
  //   //parent::__destruct();
  //   // Dev::logDump($this->container, $this->ogr);
  //   // if ($this->ogr) {
  //   //   $this->ogr->Close();
  //   // }
  // }

  /**
   *
   * @PostLoad
   */
  // public function _test()
  // {
  //   error_log('PostLoad '.get_class($this).' '.$this->uuid);
  // }

  public function getId()
  {
    return $this->uuid;
  }

  public function getName()
  {
    return $this->name;
  }

  public function setName($name)
  {
    $this->name = $name;
  }

  /**
   * Check validity of document properties
   *
   * @param $container ContainerInterface
   * @param $errors    array
   * @return boolean    Whether the map properties are valid
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    return true; // debug
    $ogr = $this->getOgr($container);
    return $this->checkCond(!!$ogr, '_general_', 'Cannot open data source', $errors);
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

  /**
   * Open datasource with OGR
   *
   * @return \OGRDataSource (check OGR API)
   */
  public function getOgr(ContainerInterface $container, $writeAccess = false)
  {
    $p = $writeAccess ? 'rwOgr' : 'roOgr';
    if (!$this->$p) {
      error_log('openOgr '.$p.' '.$this->uuid);
      $this->$p = $this->openOgr($container, $writeAccess);
    }
    return $this->$p;
  }

  /**
   * @deprecated
   */
  public function ogrOpen(ContainerInterface $container, $writeAccess = false)
  {
    return $this->getOgr($container, $writeAccess);
  }

  /**
   * Open OGR datasource
   *
   * @return \OGRDataSource
   */
  protected function openOgr(ContainerInterface $container,
                             $writeAccess = false)
  {
    //throw new \Exception('hehe!');
    CplSetConfigOption('PG_LIST_ALL_TABLES', 'YES');
    OGRRegisterAll();
    $path = $this->getSourcePath($container);
    //$container->get('logger')->info('Ploomap OGROpen: '.$path);
    $ds = OGRSFDriverRegistrar::Open($path, $writeAccess);
    if (!$ds) {
      //$msg = CplGetLastErrorMsg();
      throw new \Exception
        ('OGR source opening failed for ' . $this->uuid.' "'.
         $this->name.'" with path: '.$path);
    }
    return $ds;
  }

  abstract public function getSourcePath(ContainerInterface $container);
  /* public function getSourcePath(ContainerInterface $container) */
  /* { */
  /*   throw new \Exception */
  /*     ('method must be implemented by concrete class [' */
  /*      .$this->uuid.']'); */
  /* } */

  public function getDriverName(ContainerInterface $container)
  {
    $this->ogrOpen($container);
    return $this->driver;
  }

  /*public function ogrGetDriver()
  {
    OGRRegisterAll();
    $count = OGRGetDriverCount();
    for ($i = 0; $i < $count; $i++ ) {
      $driver = OGRGetDriver($i);
      if (OGR_DR_GetName($driver) == $this->driver) {
        return $driver;
      }
    }
    throw new \Exception('OGR driver not found: '.$this->driver);
    //$driver = OGRGetDriverByName($this->driver);
    }*/

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
    // todo need container
    /*if ($this->layerCount < 0) {
      $this->updateStats();
      }*/
  }

  public function updateStats(ContainerInterface $container)
  {
    try {
      $this->layerCount = $this->getOgr($container)->GetLayerCount();
    }
    catch (\Exception $e) {
      $this->layerCount = -1;
    }
  }

  /**
   * Sync ODM layers with OGR layers. Flushed.
   */
  public function syncKnownLayers(ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    // make array of found OGR layer name
    $ogrLayerNames = array();
    $ds = $this->getOgr($container);
    $this->layerCount = $ds->GetLayerCount();
    for ($i = 0; $i < $this->layerCount; $i++) {
      $ogrLayer = $ds->GetLayer($i);
      $defn = $ogrLayer->GetLayerDefn();
      $ogrLayerNames[] = $defn->GetName();
    }
    //return array('names' => $ogrLayerNames); ////
    $dm->persist($this);
    // find ODM layers and iterate
    $found = $this->findKnownLayers($dm);
    $removeCount = 0;
    foreach ($found as $layer) {
      $key = array_search($layer->name, $ogrLayerNames);
      if ($key === false) {
        $dm->remove($layer);
        ++$removeCount;
      } else {
        $ogrLayer = $ds->GetLayerByName($ogrLayerNames[$key]);
        //$ogrLayer = OGR_DS_GetLayerByName($ds, $ogrLayerNames[$key]);
        $layer->syncFromOgr($container, $ogrLayer);
        $dm->persist($layer);
        unset($ogrLayerNames[$key]);
      }
    }
    // add missing
    $ogrLayerNames_count = count($ogrLayerNames);
    foreach ($ogrLayerNames as $layerName) {
      $ogrLayer = $ds->GetLayerByName($layerName);
      //$ogrLayer = OGR_DS_GetLayerByName($ds, $layerName);
      $layer = OgrLayer::fromOgr($container, $ogrLayer, $this);
      $dm->persist($layer);
    }
    //
    $dm->flush();
    return array('total' => $this->layerCount,
                 'added1' => $ogrLayerNames_count,
                 'added2' => count($ogrLayerNames),
                 'removed' => $removeCount,
                 'foundOdm' => $found->count());
  }

  /**
   *
   * @return Doctrine\ODM\MongoDB\MongoCursor
   */
  public function findKnownLayers(DocumentManager $dm)
  {
    return $dm
      ->createQueryBuilder('Geonef\PloomapBundle\Document\OgrLayer')
      //->field('dataSource')->equals(new \MongoId($this))
      ->field('dataSource.$id')->equals(new \MongoId($this->uuid))
      ->getQuery()->execute();
  }

}
