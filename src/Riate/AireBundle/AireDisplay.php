<?php

namespace Riate\AireBundle;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\Map;
use Geonef\PloomapBundle\Document\Display;


/**
 * Provides the Display for necessary AIRE client maps
 */
abstract class AireDisplay
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
   * Number of zoom levels (AIRE 1.0 had 4, 2.0 has 5)
   */
  const NUM_ZOOM_LEVELS = 5;


  /**
   * @return Display
   */
  public static function getDisplay(ContainerInterface $container, Map $map)
  {
    $extent = $map->getExtent($container);
    $resolutions = static::getResolutions($extent);
    $srs = $map->getMapProjection($container);
    $params = array('type' => 'tiled', 'srs' => $srs,
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
