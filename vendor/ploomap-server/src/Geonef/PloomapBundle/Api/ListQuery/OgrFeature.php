<?php

namespace Geonef\PloomapBundle\Api\ListQuery;

use Geonef\Zig\Api\ActionDispatcher;

class SourceLayer extends ActionDispatcher
{
  protected $layerUuid;

  /**
   * Action to get the list of entries
   */
  public function queryAction()
  {
    $this->ogrSourceDocument = $this->findSourceDocument();
    $this->ogrSource = $this->ogrSourceDocument->ogrOpen($this->container);
    $this->processQuery();
  }

  public function findSourceDocument()
  {
    $docClass = 'Geonef\Ploomap\\Bundle\\PloomapBundle\\Document\\OgrDataSource';
    $this->ogrSourceUuid = $this->request['ogrSource'];
    $dm = $this->container->getDoctrine_Mongo_DocumentManagerService();
    $ogrSourceDocument = $dm->find($docClass, $this->ogrSourceUuid);
    if (!$ogrSourceDocument) {
      throw new \Exception('bad source uuid: '.$this->ogrSourceUuid);
    }
    return $ogrSourceDocument;
  }

  protected function processQuery()
  {
    //$this->createQueryObject();
    //$this->defineSelect();
    //$this->defineFilters();
    //$this->defineSorting();
    //$this->definePage();
    $this->fetchResult();
  }

  protected function fetchResult()
  {

  }

}
