<?php

namespace Geonef\ZigBundle\EventListener;

use Symfony\Component\EventDispatcher\Event;
use Doctrine\ODM\MongoDB\DocumentManager;


class DocumentEventArgs extends Event
{

  protected $name;

  protected $document;


  public function __construct($document)
  {
    $this->document = $document;
  }

  public function getDocument()
  {
    return $this->document;
  }

  public function setEventName($name)
  {
    $this->name = $name;
  }

  public function getEventName()
  {
    return $this->name;
  }

  public function recomputeChangeSet(DocumentManager $dm)
  {
    $metadata = $dm->getClassMetadata(get_class($this->document));
    $dm->getUnitOfWork()
      ->recomputeSingleDocumentChangeSet($metadata, $this->document);
  }

}
