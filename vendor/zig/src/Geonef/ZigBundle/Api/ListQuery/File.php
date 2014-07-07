<?php

namespace Geonef\ZigBundle\Api\ListQuery;

use Geonef\ZigBundle\Api\ListQuery\AbstractDocumentQuery;
use Geonef\ZigBundle\Document\File\Directory;

class File extends AbstractDocumentQuery
{
  protected $documentClass = 'Geonef\ZigBundle\Document\File';

  protected $inDirectory;

  protected function preDispatch()
  {
    parent::preDispatch();
    if (isset($this->request['inDirectory'])) {
      $this->inDirectory = $this->find($this->request['inDirectory']);
    }
  }

  protected function defineFilters()
  {
    if ($this->inDirectory &&
        !isset($this->request['filters']['children'])) {
      $this->request['filters']['children'] =
        array('op' => 'referredByMany', 'value' => $this->inDirectory->uuid);
    }
    parent::defineFilters();
  }

  protected function updateInDirectory($file)
  {
    if (!$this->inDirectory) {
      return;
    }
    $this->inDirectory->addChild($file);
    $this->documentManager->persist($this->inDirectory);
  }

  public function getFilterForIdAction()
  {
    $id = $this->request['id'];
    $doc = $this->find($id);
    $this->response['document'] = $this->composeRowStructure($doc);
    $filter = array('name' => array('op' => 'equals', 'value' => $doc->name));
    $this->response['filter'] = $filter;
  }

  public function createDirectoryAction()
  {
    $name = $this->request['name'];
    $doc = new Directory($this->container);
    $doc->setName($name);
    $this->documentManager->persist($doc);
    $this->documentManager->flush();
    $this->response['uuid'] = $doc->uuid;
    $this->updateInDirectory($doc);
  }

  public function updateStatAction()
  {
    foreach ($this->request['uuids'] as $uuid) {
      $doc = $this->find($uuid);
      $doc->setContainer($this->container);
      $doc->stat();
      $this->response['stat'][$uuid]['contentType'] = $doc->getContentType();
      $this->documentManager->persist($doc);
    }
  }

}
