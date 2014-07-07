<?php

namespace Geonef\ZigBundle\EventListener;

use Doctrine\Common\EventSubscriber;
use Symfony\Component\HttpKernel\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Doctrine\ODM\MongoDB\Event\OnFlushEventArgs;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\EventDispatcher\Event;
use Geonef\ZigBundle\EventListener\DocumentEventArgs;
use JMS\DiExtraBundle\Annotation as DI;
use JMS\DiExtraBundle\Annotation\Service;
use JMS\DiExtraBundle\Annotation\Tag;

/**
 * Subscribes to Doctrine onFlush event, then dispatch model events
 * corresponding to each operations.
 *
 * Listener classes to these model events are likely to be based
 * on Geonef\ZigBundle\EventListener\Document\AbstractDocumentListener
 *
 *
 * // ("geonef_zig.doctrine_dispatch_listener")
 * Service
 * Tag("doctrine.odm.mongodb.default_event_subscriber",attributes={"priority"="10"})
 * Tag("doctrine.odm.mongodb.default_event_listener",attributes={"event"="onFlush"})
 */
class DoctrineDispatchListener implements EventSubscriber
{

  /**
   * @var EventDispatcher
   */
  protected $eventDispatcher;

  /**
   * @var LoggerInterface
   */
  protected $logger;


  /**
   *  @DI\InjectParams({
   *            "logger"=@DI\Inject("monolog.logger.event"),
   *            "eventDispatcher"=@DI\Inject("event_dispatcher")
   *   })
   */
  public function __construct(EventDispatcherInterface $eventDispatcher,
                              LoggerInterface $logger)
  {
    $this->eventDispatcher = $eventDispatcher;
    $this->logger = $logger;
  }

  public function getSubscribedEvents()
  {
    return array('onFlush');
  }

  /**
   * Dispatch event about document
   *
   * The real event which is dispatched is prefixed with a string unique
   * to the documentclass.
   *
   * @param object $doc         Related document
   * @param string $event       Name
   * @param Event $args         Event arguments
   */
  public function dispatchDocumentEvent($doc, $event, DocumentEventArgs $args)
  {
    $class = get_class($doc);
    $constant = $class.'::EVENT_PREFIX';
    if (!defined($constant)) {
      $this->logger->debug("dispatchDocumentEvent: class doesn't have "
                           ."the EVENT_PREFIX constant: ".$class);

      return;
    }
    $fevent = constant($constant) . '.' . $event;
    $this->logger->debug("dispatchDocumentEvent: dispatching event ".$fevent
                         ." on doc ".$class.':'.$doc->getId());
    $args->setEventName($fevent);
    $this->eventDispatcher->dispatch($fevent, $args);
    $this->eventDispatcher->dispatch('model.document.onDispatch', $args);
  }

  /**
   * Listener for "onFlush" event
   */
  public function onFlush(OnFlushEventArgs $args)
  {
    $dm = $args->getDocumentManager();
    $uow = $dm->getUnitOfWork();
    foreach ($uow->getScheduledDocumentUpdates() as $doc) {
      $this->handleDocumentUpdate($doc, $dm);
    }
    $processed = array();
    do { // iterate in case handleDocumentDeletion() orders other deletions
      $p = false;
      foreach ($uow->getScheduledDocumentDeletions() as $doc) {
        if (!in_array($doc, $processed)) {
          $this->handleDocumentDeletion($doc, $dm);
          $processed[] = $doc;
          $p = true;
        }
      }
    } while ($p);


  }

  /**
   * Dispatch onChange event (from onFlush)
   */
  protected function handleDocumentUpdate($doc, DocumentManager $dm)
  {
    $set = $dm->getUnitOfWork()->getDocumentChangeSet($doc);
    $args = new OnDocumentChangeEventArgs($doc, $set);
    $this->dispatchDocumentEvent($doc, 'onChange', $args);
  }

  /**
   * Dispatch onDelete event (from onFlush)
   */
  protected function handleDocumentDeletion($doc, DocumentManager $dm)
  {
    $set = $dm->getUnitOfWork()->getDocumentChangeSet($doc);
    $args = new DocumentEventArgs($doc, $set);
    $this->dispatchDocumentEvent($doc, 'onDelete', $args);
  }

}
