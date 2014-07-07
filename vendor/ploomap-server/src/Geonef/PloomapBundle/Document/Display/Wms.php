<?php

namespace Geonef\PloomapBundle\Document\Display;

use Geonef\PloomapBundle\Document\Display as BaseDisplay;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ODM\MongoDB\Mapping\Annotations as Doctrine;

/**
 *
 * @Doctrine\Document
 */
class Wms extends BaseDisplay
{
  const UNITS = 'm';

  /**
   * @Doctrine\String
   */
  public $srs;

  /**
   * @Doctrine\Collection
   */
  public $resolutions;


  public function getSrs()
  {
    return $this->srs;
  }

  /**
   * @return array
   */
  public function getResolutions()
  {
    $resolutions = $this->resolutions instanceof ArrayCollection ?
      $this->resolutions->getValues() : $this->resolutions;
    return $resolutions;
  }

  public function getUnits()
  {
    return static::UNITS;
  }

  public function getExtent(ContainerInterface $container)
  {
    return $this->map->getExtent($container);
  }

  public function setParameters($params)
  {
    parent::setParameters($params);
    $this->srs = $params['srs'];
    $this->resolutions = $params['resolutions'];
  }

  protected function getMandatoryParameters()
  {
    $parameters = parent::getMandatoryParameters();
    $parameters[] = 'srs';
    $parameters[] = 'resolutions';

    return $parameters;
  }

  public function supportsParameters($params)
  {
    if (!parent::supportsParameters($params)) { return false; }
    if ($params['srs'] != $this->srs) { return false; }
    if ($params['resolutions'] != $this->getResolutions()) { return false; }

    return true;
  }

  protected function getWmsBaseUrl(ContainerInterface $container)
  {
    $rel = $container->get('router')->generate
      ('geonef_ploomap_ows', array('id' => $this->map->getId()), false).'?';
    $domain = $container->getParameter('geonef.ploomap.geocache.local_wms_domain');

    return 'http://' . $domain . $rel;
  }

  /**
   * $params is an associative array which must have the following keys:
   *    - resolution (float)
   *    - lon (float)
   *    - lat (float)
   *    - width (integer)
   *    - height (integer)
   *    - format (string)
   *
   * @param array
   */
  public function getImageUrl(ContainerInterface $container, $params)
  {
    $res = $params['resolution'];
    $extentWidth = $params['width'] * $res;
    $extentHeight = $params['height'] * $res;
    $lon = $params['lon'];
    $lat = $params['lat'];
    $extent = array($lon - $extentWidth / 2, $lat - $extentHeight / 2,
                    $lon + $extentWidth / 2, $lat + $extentHeight / 2);
    $url = $this->getWmsBaseUrl($container);
    $p['SERVICE'] = 'WMS';
    $p['VERSION'] = '1.1.1';
    $p['REQUEST'] = 'GetMap';
    $p['BBOX'] = implode(',', $extent);
    $p['SRS'] = $this->srs;
    $p['WIDTH'] = $params['width'];
    $p['HEIGHT'] = $params['height'];
    $p['FORMAT'] = $params['format'];
    $p['LAYERS'] = implode(',', $this->getWmsLayers($container));
    foreach ($p as $key => $val) {
      $url .= $key . '=' . urlencode($val) . '&';
    }

    return $url;
  }

  public function getWmsLayers(ContainerInterface $container)
  {
    return $this->map->getLayerNames($container, null, true /* visible only */);
  }

  public function getWmsInfo()
  {
    //$wms = array('url' =>);
    return $wms;
  }

  /* public function postBuild(ContainerInterface $container, */
  /*                           Map $map, \msMap $msMap) */
  /* { */
  /* } */

  public function getLayerFactoryStruct(ContainerInterface $container)
  {
    $extent = $this->getExtent($container);
    $resolutions = $this->getResolutions();
    $options = array('title' => $this->map->getTitle(),
                     'url' => $this->getWmsBaseUrl($container),
                     'format' => 'png',
                     'layers' => $this->getWmsLayers($container),
                     //'serverResolutions' => $resolutions,
                     'resolutions' => $resolutions,
                     'maxExtent' => $extent,
                     'restrictedExtent' => $extent,
                     //'maxResolution' => reset($resolutions),
                     //'minResolution' => end($resolutions),
                     'projection' => $this->srs,
                     'units' => $this->getUnits()
                     );
    $struct = array('class' => 'geonef.ploomap.OpenLayers.Layer.WMS',
                    'options' => $options);

    return $struct;
  }

}
