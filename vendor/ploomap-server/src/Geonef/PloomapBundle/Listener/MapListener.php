<?php

namespace Geonef\PloomapBundle\Listener;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\EventSubscriber;
//use Doctrine\ODM\MongoDB\Event\LifecycleEventArgs;
use Doctrine\ODM\MongoDB\DocumentManager;
use Doctrine\ODM\MongoDB\Event\PreUpdateEventArgs;
use Doctrine\ODM\MongoDB\Event\OnFlushEventArgs;
use Geonef\PloomapBundle\Document\Map;

/**
 * NO LONGER USED!!! (okapi 2011-07-22)
 */
class MapListener implements EventSubscriber, ContainerAwareInterface
{

  /**
   * @var ContainerInterface
   */
  protected $container;


  public function setContainer(ContainerInterface $container = null)
  {
    $this->container = $container;
  }

  public function getSubscribedEvents()
  {
    return array('onFlush');
  }

  public function onFlush(OnFlushEventArgs $args)
  {
    $dm = $args->getDocumentManager();
    $uow = $dm->getUnitOfWork();
    foreach ($uow->getScheduledDocumentUpdates() as $doc) {
      if ($this->hasChanges($doc, $dm)) {
        $this->handleDocumentUpdate($doc, $dm);
      }
    }
  }

  protected function hasChanges($doc, DocumentManager $dm)
  {
    $set = $dm->getUnitOfWork()->getDocumentChangeSet($doc);
    //$id = method_exists($doc, 'getId') ? $doc->getId() : '-';
    foreach ($set as $n => $vals) {
      if (in_array($n, array('infoCache','lastEditedAt'))) { continue; }
      if ($vals[0] == $vals[1]) {
        continue;
      }
      return true;
    }
    return false;
  }

  protected function handleDocumentUpdate($map, DocumentManager $dm)
  {
    //$this->container->get('logger')->debug('ploomap MapListener');
    if (!($map instanceof Map)) { return; }
    if ($map->clearInfoCache($this->container)) {
      // the infoCache was modified, so recompute the changes
      $metadata = $dm->getClassMetadata(get_class($map));
      $dm->getUnitOfWork()->recomputeSingleDocumentChangeSet($metadata, $map);
    } else {
      // nothing changed actually
    }
  }

  /* public function preUpdate(PreUpdateEventArgs $args) */
  /* { */
  /*   $this->container->get('logger')->debug('ploomap MapListener'); */
  /*   $map = $args->getDocument(); */
  /*   if (!($map instanceof Map)) { return; } */
  /*   $dm = $args->getDocumentManager(); */
  /*   $uow = $dm->getUnitOfWork(); */
  /*   $set = $uow->getDocumentChangeSet($map); */
  /*   if (count($set) > (isset($set['infoCache']) ? 1 : 0)) { */
  /*     // changes have been made for properties other than 'infoCache' */
  /*     if ($map->clearInfoCache($this->container)) { */
  /*       // and indeed the infoCache was modified, so recompute the changes */
  /*       $metadata = $dm->getClassMetadata(get_class($map)); */
  /*       $uow->recomputeSingleDocumentChangeSet($metadata, $map); */
  /*       //$set = $uow->getDocumentChangeSet($map); */
  /*     } else { */
  /*     } */
  /*   } else { */
  /*   } */
  /* } */

}
