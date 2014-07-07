<?php

namespace Geonef\PloomapBundle\Document\MapLayer;

use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbeddedDocument;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;

/**
 * @EmbeddedDocument
 */
class MapFile
{
  /**
   * @MongoString
   */
  public $content;

  protected function doBuild(\mapObj $msMap, ContainerInterface $container)
  {
    $msLayer = new ms_newLayerObj($msMap);
    $msLayer->updateFromString($content);
    return $msLayer;
  }

}
