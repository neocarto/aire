<?php

namespace Geonef\PloomapBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;
use Geonef\ZigBundle\Document\File;
use Geonef\PloomapBundle\Document\GdalDataset as GdalDatasetDocument;
use OGRSFDriverRegistrar;

class GdalDataset extends AbstractDocumentQuery
{
  protected $documentClass =
    'Geonef\PloomapBundle\Document\GdalDataset';


  ////////////////////////////////////////////////////////////////////////
  // LIST QUERY



  ////////////////////////////////////////////////////////////////////////
  // OTHER ACTIONS

  public function getFilterForIdAction()
  {
    $id = $this->request['id'];
    $doc = $this->find($id);
    $struct = $this->composeRowStructure($doc);
    $this->response['document'] = $struct;
    $filter = array('name' => array('op' => 'contains',
                                    'value' => $doc->getName()),
                    'module' => array('op' => 'in',
                                      'value' => array($struct['module'])));
    $this->response['filter'] = $filter;
  }

  public function driverListAction()
  {
    \GDALAllRegister();
    $manager = \GetGDALDriverManager();
    $manager->AutoLoadDrivers();
    $count = $manager->GetDriverCount();
    $this->response['managerClass'] = get_class($manager);
    $this->response['driverCount'] = $count;
    $drivers = array();
    for ($i = 0; $i < $count; ++$i ) {
      $driver = $manager->GetDriver($i);
      $struct = array('name' => $driver->GetDescription());
      $drivers[] = $struct;
    }
    sort($drivers);
    $this->response['drivers'] = $drivers;
  }

  protected function beforePersist($document)
  {
    try {
      $document->syncInfo($this->container);
    }
    catch (\Exception $e) {}
  }

  public function syncAction()
  {
    foreach ($this->request['uuids'] as $uuid) {
      $doc = $this->find($uuid, true);
      //var_dump($doc);exit;
      try {
        $doc->syncInfo($this->container);
      }
      catch (\Exception $e) {
        $this->response['errors'][$uuid] = array('message' => $e->getMessage());
      }
      $this->documentManager->persist($doc);
      $this->documentManager->flush();
      $this->documentManager->detach($doc);
      $this->response['docs'][$uuid] =
        array('class' => get_class($doc)/*,
                                          'layerCount' => $doc->layerCount*/);
      $this->response['docs'][$uuid]['sourcePath'] = $doc->getSourcePath($this->container);
    }
    $this->response['status'] = 'ok';
  }

  /* public function uploadFileAction() */
  /* { */
  /*   $key = $this->request['file']; */
  /*   $path = $HTTP_UPLOADED_FILES[$key]['filename']; // check, not sure :-/ */
  /*   $file = new File\GridFs($this->container, $path); */
  /*   if ($temp->isSupportedByHandler('Zip')) { */
  /*     $zip = $temp->getHandler('Zip'); */
  /*     $file = $zip->extract(); */
  /*   } */
  /*   $dataSource = new Document\OgrDataSource\File(); */
  /*   $dataSource->setFile($file); */
  /*   $this->documentManager->persist($dataSource); */
  /*   $this->documentManager->persist($file); */
  /*   $this->documentManager->flush(); */
  /*   $this->documentManager->detach($file); */
  /*   $this->documentManager->detach($dataSource); */
  /* } */

}
