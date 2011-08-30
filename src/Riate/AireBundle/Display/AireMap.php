<?php

namespace Riate\AireBundle\Display;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\Map;
use Geonef\PloomapBundle\Document\Display;


/**
 * Provides the Display for necessary AIRE client maps
 */
abstract class AireMap
{
  /**
   * Width of map <div>, to compute maxResolution
   */
  const MAP_WIDTH = 544;

  /**
   * Height of map <div>, to compute maxResolution
   */
  const MAP_HEIGHT = 483;

  /**
   * Number of zoom levels
   */
  const NUM_ZOOM_LEVELS = 4;

  const TYPE = 'wms';
  //const TYPE = 'tiled';

  /**
   * @return Display
   */
  public static function getDisplay(ContainerInterface $container, Map $map)
  {
    $extent = $map->getExtent($container);
    $resolutions = static::getResolutions($extent);
    $srs = $map->getMapProjection($container);
    $params = array('type' => static::TYPE, 'srs' => $srs,
                    'resolutions' => $resolutions);
    $display = $map->getDisplay($container, $params);

    return $display;
  }

  protected static function getResolutions($extent)
  {
    $maxResX = ($extent[2] - $extent[0]) / static::MAP_WIDTH;
    $maxResY = ($extent[3] - $extent[1]) / static::MAP_HEIGHT;
    $resolution = max($maxResX, $maxResY);
    $resolutions = array();
    for ($i = 0; $i < static::NUM_ZOOM_LEVELS; ++$i) {
      $resolutions[] = $resolution;
      $resolution /= 2;
    }

    return $resolutions;
  }

}
