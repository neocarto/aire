<?php

namespace Geonef\PloomapBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;
use Geonef\PloomapBundle\Document\Task\OgrLayer as OgrLayerTask;
use Geonef\Zig\Util\Dev;

class OgrLayer extends AbstractDocumentQuery
{
  protected $documentClass =
    'Geonef\PloomapBundle\Document\OgrLayer';


  ////////////////////////////////////////////////////////////////////////
  // LIST QUERY

  protected function composeRowStructure($document)
  {
    $struct = parent::composeRowStructure($document);
    $struct['source'] = $document->dataSource ?
      $document->dataSource->getName() : '(?)';
    return $struct;
  }


  ////////////////////////////////////////////////////////////////////////
  // OTHER ACTIONS

  public function getFilterForIdAction()
  {
    $id = $this->request['id'];
    $doc = $this->find($id, true);
    $this->response['document'] = $this->composeRowStructure($doc);
    $filter = array('name' => array('op' => 'beginWith',
                                    'value' => $doc->getName()));
    if ($doc->dataSource) {
      $filter['dataSource'] = array('op' => 'ref',
                                    'value' => $doc->dataSource->uuid);
    }
    $filter['geometryType'] = array
      ('op' => 'in', 'value' => array('none'),
       'not' => $doc->geometryType === 'none' ? false : true);
    $this->response['filter'] = $filter;
  }

  public function refreshStatsAction()
  {
    $uuids = $this->request['uuids'];
    $this->response['processed'] = 0;
    foreach ($uuids as $uuid) {
      $layer = $this->find($uuid);
      $layer->syncFromOgr($this->container); // this does not work appearently!
      $this->documentManager->persist($layer);
      //++$this->response['processed'];
    }
    // flush is done at postDispatch
    $this->response['status'] = 'ok';
  }

  public function preDeleteOne($layer)
  {
    if (!isset($this->request['soft']) || !$this->request['soft']) {
      $layer->deleteOgr($this->container);
    }
    return true;
  }

  public function getFieldsAction()
  {
    $this->checkArguments(array('uuid'));
    $layer = $this->find($this->request['uuid']);
    $this->response['fields'] = $layer->getFields();
  }

  public function copyAction()
  {
    $this->checkArguments(array('destDataSource', 'layers'));
    $uuid = $this->request['destDataSource'];
    $ds = $this->documentManager->find
      ('Geonef\PloomapBundle\Document\OgrDataSource', $uuid);
    if (!$ds) {
      throw new \Exception('invalid data source: '.$uuid);
    }
    $ds = Dev::getRealDocument($ds, $this->documentManager);
    $layers = $this->request['layers'];
    foreach ($layers as $layer) {
      $ogrLayer = $this->find($layer['uuid']);
      $task = new OgrLayerTask($this->container);
      $task->setDestLayerName($layer['name']);
      $task->setDestDataSource($ds);
      $task->setSourceLayer($ogrLayer);
      $task->setGeometryType(isset($layer['geometryType']) ?
                             $layer['geometryType'] : 'unknown');
      $task->setCopyFeatures(isset($layer['copyFeatures']) ?
                             $layer['copyFeatures'] : false);
      $task->execute($this->container);
      $this->response['layers'][$layer['uuid']] =
        array('state' => $task->getState(),
              'log' => $task->getLog());
      // $this->documentManager->persist($task);
      // $this->documentManager->flush();
      // $this->response['tasks'][] = $task->getId();
      //$this->response['layers'][$ogrLayer->uuid] = 'ok';
    }
  }

}
