<?php

namespace Geonef\PloomapBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;
use Geonef\ZigBundle\Document\File;
use Geonef\PloomapBundle\Document\OgrDataSource as OgrDataSourceDocument;
use OGRSFDriverRegistrar;

class OgrDataSource extends AbstractDocumentQuery
{
  protected $documentClass =
    'Geonef\PloomapBundle\Document\OgrDataSource';


  ////////////////////////////////////////////////////////////////////////
  // LIST QUERY

  protected $disablePagination = false;

  protected function composeRowStructure($record)
  {
    $class = get_class($record);
    return array('uuid' => $record->uuid,
                 'name' => $record->name,
                 'module' => substr($class, strrpos($class, '\\') + 1),
                 'layerCount' => $record->layerCount,
                 'class' => get_class($record),
                 //'driver' => $record->getDriverName(),
                 );
  }


  ////////////////////////////////////////////////////////////////////////
  // OTHER ACTIONS

  public function driverListAction()
  {
    $drivers = array();
    $registrar = OGRSFDriverRegistrar::getRegistrar();
    OGRRegisterAll();
    //$registrar->AutoLoadDrivers();
    $count = $registrar->GetDriverCount();
    $this->response['registrarClass'] = get_class($registrar);
    $this->response['driverCount'] = $count;
    $this->response['openDSCount'] = $registrar->GetOpenDSCount();
    for ($i = 0; $i < $count; ++$i ) {
      $driver = $registrar->GetDriver($i);
      $struct = array('name' => $driver->GetName(),
                      'creation' => $driver->TestCapability('CreateDataSource'),
                      'deletion' => $driver->TestCapability('DeleteDataSource'));
      $drivers[] = $struct;
    }
    sort($drivers);
    $this->response['drivers'] = $drivers;
  }

  protected function beforePersist($document)
  {
    try {
      $document->updateStats($this->container);
      $document->syncKnownLayers($this->container);
    }
    catch (\Exception $e) {}
  }

  public function updateStatsAction()
  {
    foreach ($this->request['uuids'] as $uuid) {
      $doc = $this->find($uuid, true);
      //var_dump($doc);exit;
      try {
        $doc->updateStats($this->container);
      }
      catch (\Exception $e) {
        $this->response['errors'][$uuid] = array('message' => $e->getMessage());
      }
      $this->documentManager->persist($doc);
      $this->documentManager->flush();
      $this->documentManager->detach($doc);
      $this->response['docs'][$uuid] = array('class' => get_class($doc),
                                             'layerCount' => $doc->layerCount);
      $this->response['docs'][$uuid]['sourcePath'] = $doc->getSourcePath($this->container);
    }
    $this->response['status'] = 'ok';
  }

  public function updateLayersAction()
  {
    foreach ($this->request['uuids'] as $uuid) {
      try {
        $ds = $this->find($uuid, true);
        if (!$ds) {
          throw new \Exception('data source not found: '.$uuid);
        }
        $stats = $ds->syncKnownLayers($this->container);
        $this->response['stats'][$uuid] = $stats;
      }
      catch (\Exception $e) {
        $this->response['exceptions'][$uuid] = $e->getMessage();
        $lastE = $e;
      }
    }
    if (isset($lastE)) {
      throw $lastE;
    }
    $this->response['status'] = 'ok?';
  }

  public function uploadFileAction()
  {
    $key = $this->request['file'];
    $path = $HTTP_UPLOADED_FILES[$key]['filename']; // check, not sure :-/
    $file = new File\GridFs($this->container, $path);
    if ($temp->isSupportedByHandler('Zip')) {
      $zip = $temp->getHandler('Zip');
      $file = $zip->extract();
    }
    $dataSource = new Document\OgrDataSource\File();
    $dataSource->setFile($file);
    $this->documentManager->persist($dataSource);
    $this->documentManager->persist($file);
    $this->documentManager->flush();
    $this->documentManager->detach($file);
    $this->documentManager->detach($dataSource);
  }

  public function testAction()
  {
    foreach ($this->request['uuids'] as $uuid) {
      $ds = $this->find($uuid);
      if (!$ds) {
        throw new \Exception('data source not found: '.$uuid);
      }
      $layers = $ds->findKnownLayers($this->documentManager)->getResults();
      //$r = get_class($layers);
      //var_dump($layers);exit;
      $r = count($layers);
      //$r = gettype($layers);
      //$r = array_map(function($l) { return gettype($l); return $l->uuid; }, $layers);
      $this->response['docs'][$uuid] = $r;
    }
    $this->response['status'] = 'ok?';
  }

}
