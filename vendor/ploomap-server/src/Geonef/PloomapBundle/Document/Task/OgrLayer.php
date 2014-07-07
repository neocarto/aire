<?php

namespace Geonef\PloomapBundle\Document\Task;

use Geonef\ZigBundle\Document\Task as AbstractTask;
use Geonef\PloomapBundle\Document\OgrDataSource as OgrDataSourceDoc;
use Geonef\PloomapBundle\Document\OgrLayer as OgrLayerDoc;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\Zig\Util\Dev;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Boolean;

/**
 * Task related to OGRLayer
 *
 * @todo check that target layer does not exist
 * @todo field mapping
 *
 * @Document
 */
class OgrLayer extends AbstractTask
{
  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrDataSource")
   */
  public $destDataSource;

  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\OgrLayer")
   */
  public $sourceLayer;

  /**
   * @MongoString
   */
  public $destLayerName;

  /**
   * @MongoString
   */
  public $geometryType;

  /**
   * @Boolean
   */
  public $copyFeatures = false;

  public function setDestDataSource(OgrDataSourceDoc $dataSource)
  {
    $this->destDataSource = $dataSource;
    $ogrDs = $this->destDataSource->getOgr($this->container, true);
    if (!$ogrDs->TestCapability(ODsCCreateLayer)) {
      throw new \Exception('dest datasource does not support layer '
                           .'creation: '.$this->destDataSource->uuid);
    }
  }

  public function setSourceLayer(OgrLayerDoc $layer)
  {
    $this->sourceLayer = $layer;
  }

  public function setDestLayerName($name)
  {
    $this->destLayerName = $name;
  }

  public function setGeometryType($type)
  {
    $this->geometryType = $type;
  }

  public function setCopyFeatures($state)
  {
    $this->copyFeatures = $state;
  }

  protected function executeTask()
  {
    // loading
    $dm = $this->container->get('doctrine.odm.mongodb.documentManager');
    $sourceLayer = Dev::getRealDocument($this->sourceLayer, $dm);
    $ogrSourceLayer = $sourceLayer->getOgrLayer($this->container);
    $ogrSourceLayerDef = $ogrSourceLayer->GetLayerDefn();
    $destDataSource = Dev::getRealDocument($this->destDataSource, $dm);
    $ogrDestDataSource = $destDataSource->getOgr($this->container, true);
    $spatialRef = $ogrSourceLayer->GetSpatialRef();
    //$geometryType = $ogrSourceLayerDef->GetGeomType();
    $geometryType = OgrLayerDoc::getOgrGeometryType($this->geometryType);

    // create layer & fields
    $ogrDestLayer =
      $ogrDestDataSource->CreateLayer($this->destLayerName, $spatialRef,
                                      $geometryType);
    if (!$ogrDestLayer) {
      $this->logCpl();
      throw new \Exception('failed to create layer');
    }
    for ($i = 0, $fdcount = $ogrSourceLayerDef->GetFieldCount();
         $i < $fdcount; ++$i) {
      $fieldDef = $ogrSourceLayerDef->GetFieldDefn($i);
      if ($ogrDestLayer->CreateField($fieldDef) != OGRERR_NONE) {
        $this->logCpl();
        throw new \Exception('failed to create field: '.$fieldDef->getName());
      }
    }

    // copy features
    if ($this->copyFeatures) {
      $ogrDestLayerDef = $ogrDestLayer->GetLayerDefn();
      $ogrSourceLayer->ResetReading();
      $count = $fcount = 0;
      while ($feature = $ogrSourceLayer->GetNextFeature()) {
        $newfeature = \OGRFeature::CreateFeature($ogrDestLayerDef);
        if ($newfeature->SetFrom($feature) != OGRERR_NONE) {
          $this->log('error', 'featureTranslation',
                     'failed to translate feature (FID '
                     . $feature->GetFID().')');
          $this->logCpl();
          ++$fcount;
        } else {
          if ($ogrDestLayer->CreateFeature($newfeature) !== OGRERR_NONE) {
            $this->log('error', 'featureCreation',
                       'failed create feature (FID '.$feature->GetFID().')');
            $f = array();
            for ($i = 0, $fdcount = $ogrSourceLayerDef->GetFieldCount();
                 $i < $fdcount; ++$i) {
              //$fieldDef = $ogrSourceLayerDef->GetFieldDefn($i);
              $f[] = $fieldDef->GetNameRef() . '='
                . $feature->GetFieldAsString($i);
            }
            //Dev::logDump($this->container, $f, 'info');
            $this->log('error', 'featureCreation', 'grrr');
            $this->log('error', 'featureCreation',
                       'attributes were: '.implode(', ', $f));
            $this->logCpl();
            ++$fcount;
          } else {
            ++$count;
          }
        }
      }
      $this->log('info', 'stats', 'features creations: '.$count);
      $this->log('info', 'stats', 'features failures: '.$fcount);
    }

    // save mongo document
    $ogrLayer = OgrLayerDoc::fromOgr($this->container, $ogrDestLayer, $destDataSource);
    $destDataSource->updateStats($this->container);
    $dm->persist($ogrLayer);
    $dm->persist($destDataSource);
    $dm->flush();
    $this->log('info', 'stats', 'created layer named: '.$this->destLayerName);
    $this->log('info', 'stats', 'persisted created layer: '.$ogrLayer->getId());
  }

  protected function logCpl()
  {
    $msg = CPLGetLastErrorMsg();
    $this->log('error', 'OGR', $msg);
  }

}
