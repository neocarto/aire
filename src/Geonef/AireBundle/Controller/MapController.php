<?php

namespace Geonef\AireBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Geonef\PloomapBundle\Document\MapCollection\MultiRepr as MapCollectionMultiRepr;
use Geonef\Ploomap\Util\Geo;

class MapController extends Controller
{
  const DOC_PREFIX = 'Geonef\PloomapBundle\Document\\';
  const MAP_WIDTH = 598;
  const MAP_HEIGHT = 532;

  /**
   * Print export screen
   *
   * @extra:Routes({
   *   @extra:Route("/print", defaults={}),
   *   @extra:Route("/print/{extent}", name="map_export_print")
   * })
   * @extra:Template()
   */
  public function printAction($id)
  {
    $map = $this->getMap($id);
    $request = $this->get('request');
    $extent = $request->query->get('extent');
    // if (preg_match('/^-?[0-9]+,-?[0-9]+,-?[0-9]+,-?[0-9]+/', $extent)) {
    //   $extent = explode(',', $extent);
    // }
    $params = array('WIDTH' => static::MAP_WIDTH,
                    'HEIGHT' => static::MAP_HEIGHT);
    if ($extent) {
      $params['BBOX'] = $extent;
    }
    $url = $map->getWmsMapUrl($this->container, $params);
    $env = $this->container->getParameter('kernel.environment');

    return $this->render
       ('GeonefAireBundle:Map:print.twig.html',
        array('map' => $map,
              'mapUrl' => $url,
              'legend' => $map->getLegendData($this->container),
              'resolution' => 8855,
              'extent' => $extent,
              'env' => $env,
              ));
  }

  protected function getMap($id)
  {
    $dm = $this->container->get('doctrine.odm.mongodb.documentManager');
    $class = self::DOC_PREFIX.'Map';
    $map = $dm->find($class, $id);
    if (!$map) {
      throw new \Exception('document not found in class '.$class.': '.$id);
    }
    if (!$map->isPublished()) {
      throw new \Exception("map's publishing is not enabled for ".$id);
    }

    return $map;
  }

}
