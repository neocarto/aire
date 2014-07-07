<?php

namespace Geonef\ZigBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Geonef\ZigBundle\Document\File;

use Funkiton\InjectorBundle\Annotation\Inject;


class FileController extends Controller
{
  const FILE_DOC_CLASS = 'Geonef\\ZigBundle\\Document\\File';

  /**
   * @Inject("doctrine.odm.mongodb.document_manager")
   */
  public $dm;


  public function getAction(File $file)
  {
    $file->setContainer($this->container);
    //$file = $this->getFile($id);

    return $this->makeResponse($file);
  }

  protected function makeResponse(File $file)
  {
    $response = new Response(file_get_contents($file->getPath()));
    $response->headers->set('Content-Type', $file->getContentType());

    return $response;
  }

  protected function preDispatch()
  {
    parent::preDispatch();
    $this->dm = $this->container->get('doctrine.odm.mongodb.documentManager');
  }

  /* protected function getFile(&$id) */
  /* { */
  /*   $file = $this->dm->find(static::FILE_DOC_CLASS, $id); */
  /*   if (!$file) { */
  /*     throw new \InvalidArgumentException('file not found: '.$id); */
  /*   } */
  /*   $file->setContainer($this->container); */

  /*   return $file; */
  /* } */

}
