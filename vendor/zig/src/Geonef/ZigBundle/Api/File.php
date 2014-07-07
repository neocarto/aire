<?php

namespace Geonef\ZigBundle\Api;

use Geonef\ZigBundle\Document\File as FileDocument;
use Geonef\ZigBundle\Api\ListQuery\File as FileQuery;

/**
 * Various operations related to file uploads
 *
 * @package Zig
 * @subpackage Api
 * @author Okapi
 */
class File extends FileQuery
{
  public function uploadAction()
  {
    $fileParam = $this->request['fileParam'];
    $file = FileDocument::createFromUpload($fileParam, $this->container);
    if ($file->isSupportedByHandler('Zip')) {
      $zip = $file->getHandler('Zip');
      $dir = $zip->extract();
      $file = $dir;
    }
    $this->documentManager->persist($file);
    $this->documentManager->flush();
    $this->response['fileParam'] = $fileParam;
    $this->response['uuid'] = $file->uuid;
    $this->response['name'] = $file->getName();
    $this->updateInDirectory($file);
  }

  public function getInfoAction($uuid = null)
  {
    $uuid = $uuid ?: $this->request['uuid'];
    $file = $this->find($uuid, true);
    $info = $this->modelToArray($file);
    $info['size'] = $file->getSize();
    $this->response['uuid'] = $file->uuid;
    $this->response['info'] = $info;
  }

  public function moveIntoNewDirectoryAction()
  {
    $uuid = $this->request['uuid'];
    $file = $this->find($uuid, true);
    $dir = new FileDocument\Directory($this->container);
    $dir->setName('From file '.$uuid);
    $dir->addChild($file);
    $this->documentManager->persist($dir);
    $this->documentManager->flush();
    $this->getInfoAction($dir->uuid);
  }

  public function shrinkDirectoryToFileAction()
  {
    $dirUuid = $this->request['directory'];
    $fileUuid = $this->request['file'];
    $dir = $this->find($dirUuid, true);
    $file = $this->find($fileUuid, true);
    // todo
    $this->getInfoAction($fileUuid);
  }

}
