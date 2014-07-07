<?php

namespace Geonef\PloomapBundle\Document\Task;

use Geonef\ZigBundle\Document\Task as AbstractTask;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;

/**
 * @Document
 */
class OgrFeature extends AbstractTask
{
  protected function executeTask()
  {
  }
}
