<?php

namespace Geonef\PloomapBundle\Document\Map;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ODM\MongoDB\DocumentManager;
use Geonef\Ploomap\Util\Geo;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\String as MongoString;
use Gedmo\Mapping\Annotation\Translatable;

/**
 * Module for building ratio cartogram maps
 *
 * Actually, cartogram maps are no different from ratio maps.
 * Just specify a cartogram geographic layer for the "polygonOgr" property.
 *
 * @Document
 */
class Cartogram extends Ratio
{
  const MODULE = 'Cartogram';

  /**
   * @Translatable
   * @MongoString
   */
  public $cartogramLegendText;

  public function buildLegendData(ContainerInterface $container)
  {
    $data = parent::buildLegendData($container);
    $data['value']['text'] = $this->cartogramLegendText;
    return $data;
  }

}
