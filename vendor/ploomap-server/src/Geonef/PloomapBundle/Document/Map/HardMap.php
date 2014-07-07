<?php

namespace Geonef\PloomapBundle\Document\Map;

use Geonef\PloomapBundle\Document\Map as AbstractMap;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;

/**
 * Hardcoded map definition for testing purpose only.
 *
 * @Document
 */
class HardMap extends AbstractMap
{
  public function doBuild(ContainerInterface $container)
  {
  }
}
