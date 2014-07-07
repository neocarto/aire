<?php

namespace Geonef\PloomapBundle\Document\Display;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ODM\MongoDB\Mapping\Annotations as Doctrine;

/**
 *
 * @Doctrine\Document
 */
class Tiled extends Wms
{
  const TILE_WIDTH = 255;

  const TILE_HEIGHT = 255;

  const META_TILE_X = 5;

  const META_TILE_Y = 5;

  const META_BUFFER =  10;

  const GEOCACHE_WMS_URL = 'http://__host__/geocache/wms?';


  public function getTileWidth()
  {
    return static::TILE_WIDTH;
  }

  public function getTileHeight()
  {
    return static::TILE_HEIGHT;
  }

  /** @return array */
  public function getMetaTileDims()
  {
    return array(static::META_TILE_X, static::META_TILE_Y);
  }

  public function getMetaBuffer()
  {
    return static::META_BUFFER;
  }

  /**
   * Overload WMS' and return the URL for GeoCache instead
   */
  protected function getWmsBaseUrl(ContainerInterface $container)
  {
    $context = $container->get('router')->getContext();
    return strtr(static::GEOCACHE_WMS_URL,
                 array('__host__' => $context->getHost()));
  }

  public function getLayerFactoryStruct(ContainerInterface $container)
  {
    $extent = $this->getExtent($container);
    $resolutions = $this->getResolutions();
    $options = array('title' => $this->map->getTitle(),
                     'url' => '/geocache/tms/',
                     'layername' => $this->uuid.'@'.$this->getGridId($container),
                     'type' => 'png',
                     'serverResolutions' => $resolutions,
                     'resolutions' => $resolutions,
                     'maxExtent' => $extent,
                     'restrictedExtent' => $extent,
                     'tileOrigin' => array($extent[0], $extent[1]), // bottom-left
                     //'tileOriginCorner' => 'bl',
                     //'maxResolution' => reset($resolutions),
                     //'minResolution' => end($resolutions),
                     'projection' => $this->srs,
                     'units' => $this->getUnits()
                     );
    $struct = array('class' => 'geonef.ploomap.OpenLayers.Layer.TMS',
                    'options' => $options);

    return $struct;
  }

  /**
   * Return an identifier unique for the grid definition
   *
   * @return string
   */
  public function getGridId(ContainerInterface $container)
  {
    $grid = $this->getGrid($container);

    return md5(json_encode($grid)); // serialize() may write too many decimals,
                                    // for numbers that just came out of a division
  }

  /**
   * Return the grid definition
   *
   * @return string
   */
  public function getGrid(ContainerInterface $container)
  {
    $grid = array('srs' => $this->srs,
                  'resolutions' => $this->getResolutions(),
                  'extent' => $this->getExtent($container),
                  'units' => $this->getUnits(),
                  'size' => $this->getTileWidth() . ' ' . $this->getTileHeight());

    return $grid;
  }

  /**
   * @return array of the WMS layers to be requested with GetMap
   */
  public function getWmsLayers(ContainerInterface $container)
  {
    return array($this->uuid);
  }

  /**
   * Return a structure used to build geocache.xml (by GeoCache service)
   *
   * Like: array('url' = 'http://..',
   *             'params' => array('FORMAT' => 'image/x', 'LAYERS' => 'a,b,c'))
   *
   * @param ContainerInterface $container
   * @return array      associative array
   */
  public function getCacheSource(ContainerInterface $container)
  {
    $layers = parent::getWmsLayers($container);
    $source = array();
    $source['url'] = parent::getWmsBaseUrl($container);
    $source['params']['LAYERS'] = implode(',', $layers);

    return $source;
  }

}
