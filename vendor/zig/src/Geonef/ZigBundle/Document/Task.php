<?php

namespace Geonef\ZigBundle\Document;

use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\InheritanceType;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorField;
use Doctrine\ODM\MongoDB\Mapping\Annotations\DiscriminatorMap;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Index;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Id;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Doctrine\ODM\MongoDB\Mapping\Annotations\Collection;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;

/**
 * Asynchronous task
 *
 * @Document(collection="tasks")
 * @InheritanceType("SINGLE_COLLECTION")
 * @DiscriminatorField(fieldName="module")
 * @DiscriminatorMap({
 *    "OgrLayer" = "Geonef\PloomapBundle\Document\Task\OgrLayer",
 *    "OgrFeature" = "Geonef\PloomapBundle\Document\Task\OgrFeature"
 *  })
 */
abstract class Task
{
  const STATE_WAITING = 'waiting';
  const STATE_READY = 'ready';
  const STATE_PROCESSING = 'processing';
  const STATE_COMPLETE = 'complete';
  const STATE_FAILED = 'failed';

  /**
   * @Id
   */
  public $uuid;

  /**
   * Current task state
   *
   * One of the STATE_* constants
   *
   * @MongoString
   */
  public $state = self::STATE_READY;

  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\ZigBundle\Document\Task")
   */
  protected $remainingDeps;

  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\ZigBundle\Document\Task")
   */
  protected $satisfiedDeps;

  /**
   * @Collection
   */
  protected $fullLog = array();

  protected $container;

  public function getId()
  {
    return $this->uuid;
  }

  public function getState()
  {
    return $this->state;
  }

  public function setState($state)
  {
    $this->state = $state;
  }

  public function __construct(ContainerInterface $container)
  {
    $this->container = $container;
    $this->state = self::STATE_READY;
  }

  public function execute(ContainerInterface $container)
  {
    $this->container = $container;
    try {
      $this->setState(self::STATE_PROCESSING);
      $this->executeTask();
      $this->setState(self::STATE_COMPLETE);
    }
    catch (\Exception $e) {
      $this->log('error', 'fatal', $e->getMessage());
      $this->setState(self::STATE_FAILED);
    }
  }

  abstract protected function executeTask();

  protected function log($level, $name, $message)
  {
    $this->fullLog[] = array('level' => $level, 'name' => $name,
                             'message' => $message);
  }

  public function getLog()
  {
    return $this->fullLog;
  }

  public function dependsOn(Task $task)
  {
    $this->remainingDeps[] = $task;
    $this->checkDeps();
  }

  public function checkDeps()
  {
    // todo
  }

}
