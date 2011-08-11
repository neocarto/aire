<?php

namespace Riate\AireBundle\Display;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\PloomapBundle\Document\Map;
use Geonef\PloomapBundle\Document\Display;


/**
 * Provides the Display for necessary AIRE client maps
 */
abstract class AireOverview extends AireMap
{

  /**
   * Width of map <div>, to compute maxResolution
   */
  const MAP_WIDTH = 120;

  /**
   * Height of map <div>, to compute maxResolution
   */
  const MAP_HEIGHT = 100;

  /**
   * Number of zoom levels (AIRE 1.0 had 4, 2.0 has 5)
   */
  const NUM_ZOOM_LEVELS = 1;


}
