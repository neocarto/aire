<?php

namespace Geonef\ZigBundle\EventListener\Document;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpKernel\Log\LoggerInterface;
use Doctrine\ODM\MongoDB\DocumentManager;
use Geonef\ZigBundle\EventListener\DoctrineDispatchListener;
use Geonef\ZigBundle\EventListener\DocumentEventArgs;
use JMS\DiExtraBundle\Annotation as DI;
use MongoId;

/**
 * Base class for document-related listeners
 *
 * The events are dispatched by Geonef\ZigBundle\EventListener\DoctrineDispatchListener
 *
 * @DI\Service("geonef_zig.document_listener.abstract", public=false)
 * @DI\Tag("monolog.logger", attributes={"channel"="cache"})
 */
abstract class AbstractDocumentListener
{

  /**
   * @var EventDispatcherInterface
   */
  protected $eventDispatcher;

  /**
   * @var DocumentManager
   */
  protected $dm;

  /**
   * @var DoctrineDispatchListener
   */
  protected $doctrineDispatchListener;

  /**
   * @var LoggerInterface
   */
  protected $logger;


  /**
   *  @DI\InjectParams({
   *            "eventDispatcher"=@DI\Inject("event_dispatcher"),
   *            "logger"=@DI\Inject("logger"),
   *            "dm"=@DI\Inject("doctrine.odm.mongodb.document_manager"),
   *            "doctrineDispatchListener"=@DI\Inject("geonef_zig.listener.doctrine_dispatch")
   *   })
   */
  public function __construct(EventDispatcherInterface $eventDispatcher,
                              LoggerInterface $logger, DocumentManager $dm,
                              DoctrineDispatchListener $doctrineDispatchListener)
  {
    $this->eventDispatcher = $eventDispatcher;
    $this->logger = $logger;
    $this->dm = $dm;
    $this->doctrineDispatchListener = $doctrineDispatchListener;
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
  protected function dispatchDocumentEvent($doc, $event, DocumentEventArgs $args)
  {
    $this->doctrineDispatchListener->dispatchDocumentEvent($doc, $event, $args);
  }

  protected function checkReferences($target, $targetName, $sourceClasses, $sourceName, $prop)
  {
    $id = $target->getId();
    $q = $this->dm->createQueryBuilder($sourceClasses)
      ->field($prop.'.$id')->equals(new MongoId($id))
      ->hydrate(false)->getQuery();
    $it = $q->execute();
    if ($it->count() > 0) {
      throw new \Exception("cannot delete ".$targetName." ".$id
                           .": still referenced by ".$it->count() ." ".$sourceName." (through prop ".$prop.")");
    }
  }

}
