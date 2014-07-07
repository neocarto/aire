<?php

namespace Geonef\PloomapBundle\Document;

use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\DependencyInjection\ContainerInterface;


use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\InheritanceType;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorField;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorMap;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Int;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Collection;

/**
 * @Document
 * @InheritanceType("SINGLE_COLLECTION")
 * @DiscriminatorField(fieldName="module")
 * @DiscriminatorMap({
 *    "Generic" = "Geonef\PloomapBundle\Document\GdalDataset\Generic"
 *  })
 */
abstract class GdalDataset
{
  const EVENT_PREFIX = 'model.geonefPloomap.gdalDataset';

  /**
   * @Id
   */
  public $uuid;

  /**
   * @MongoString
   */
  public $name;

  /**
   * @Int
   */
  public $width;

  /**
   * @Int
   */
  public $height;

  /**
   * Geom transformation info
   *
   * Formula (Xp,Yp)=proj coord; (P,L)=pixel coord:
   *  Xp = geoTransform[0] + P*geoTransform[1] + L*geoTransform[2];
   *  Yp = geoTransform[3] + P*geoTransform[4] + L*geoTransform[5];
   *
   * @see http://www.gdal.org/classGDALDataset.html (method GetGeoTransform)
   * @Collection
   */
  public $geoTransform;

  /**
   * @var GDALDataset
   */
  protected $gdal;

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
    return $this->checkCond($this->width > 0, '_general_',
                            'Width must be strictly positive', $errors) &&
      $this->checkCond($this->height > 0, '_general_',
                       'Height must be strictly positive', $errors);
    // $ogr = $this->getOgr($container);
    // return $this->checkCond(!!$ogr, '_general_', 'Cannot open data source', $errors);
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
   * Open datasource with GDAL
   *
   * @return \GDALDataset (check GDAL API)
   */
  public function getGdal(ContainerInterface $container, $writeAccess = false)
  {
    if (!$this->gdal || $this->gdalWriteAccess != $writeAccess) {
      $this->gdal = $this->openGdal($container, $writeAccess);
      $this->gdalWriteAccess = $writeAccess;
    }
    return $this->gdal;
  }

  /**
   * Open GDAL dataset
   *
   * @return \GDALDataset
   */
  protected function openGdal(ContainerInterface $container,
                             $writeAccess = false)
  {
    GDALAllRegister();
    $manager = GetGDALDriverManager();
    $manager->AutoLoadDrivers();
    $path = $this->getSourcePath($container);
    //$container->get('logger')->info('Ploomap GDALOpen: '.$path);
    $ds = GDALOpen($path, $writeAccess ? GA_Update : GA_ReadOnly);
    if (!($ds instanceof \GDALDataset)) {
      $error = CplGetLastErrorMsg();
      $msg = 'GDAL dataset opening failed for ' . $this->uuid.' "'.
        $this->name.'" with path: "'.$path.'": '.$error;
      $container->get('logger')->err('Ploomap: '.$msg);
      throw new \Exception($msg);
    }
    return $ds;
  }

  abstract public function getSourcePath(ContainerInterface $container);

  public function getGdalDriver(ContainerInterface $container)
  {
    $ds = $this->getGdal($container);
    return $ds->GetDriver();
  }

  /**
   * Sync info from GDALDataset. Not persisted nor flushed.
   */
  public function syncInfo(ContainerInterface $container)
  {
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $ds = $this->getGdal($container);
    $this->width = $ds->GetRasterXSize();
    $this->height = $ds->GetRasterYSize();
    //$this->geoTransform = $ds->GetGeoTransform();

  }

  public function getAverage()
  {
    return null;
  }

}
