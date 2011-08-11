<?php

namespace Riate\AireBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Geonef\PloomapBundle\Document\Map;
use Geonef\PloomapBundle\Document\MapCollection\MultiRepr as MapCollectionMultiRepr;
use Geonef\Ploomap\Util\Geo;
use Riate\AireBundle\Display\AireMap;

use Funkiton\InjectorBundle\Annotation\Inject;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 *
 * @Route("/map")
 * @Inject("doctrine.odm.mongodb.documentManager", name="dm")
 * @Inject("session")
 */
class MapController extends Controller
{
  const DOC_PREFIX = 'Geonef\PloomapBundle\Document\\';
  const MAP_WIDTH = 598;
  const MAP_HEIGHT = 532;

  /**
   * @Inject("doctrine.odm.mongodb.document_manager")
   */
  public $dm;

  /**
   * Print export screen
   *
   * @Route("/{id}/print/{_locale}", name="aire_map_print_i18n")
   * @Template("RiateAireBundle:Map:print.twig.html")
   *  StaticCache(route="aire_map_print_i18n",
   *              file="{route}/{_locale}/{id}.html",
   *              deps={
   *                Dependency("Document\Map", Filter("id"))
   *              })
   */
  public function printAction(Map $map)
  {
    if (!$map->isPublished()) {
      throw new \Exception("map's publishing is not enabled for ".$id);
    }
    $request = $this->get('request');
    /* $extent = $request->query->get('extent'); */
    /* $params = array('WIDTH' => static::MAP_WIDTH, */
    /*                 'HEIGHT' => static::MAP_HEIGHT); */
    /* if ($extent) { */
    /*   $params['BBOX'] = $extent; */
    /* } */
    $loc = explode(',', $request->query->get('loc'));
    $res = $request->query->get('res');
    $params = array('lon' => $loc[0], 'lat' => $loc[1], 'resolution' => $res,
                    'width' => AireMap::MAP_WIDTH,
                    'height' => AireMap::MAP_HEIGHT,
                    'format' => 'image/png');
    $display = AireMap::getDisplay($this->container, $map);
    $url = $display->getImageUrl($this->container, $params);
    //$url = $map->getWmsMapUrl($this->container, $params, true);
    $this->dm->flush(); // if display was created
    $env = $this->container->getParameter('kernel.environment');

    return array('map' => $map,
                 'mapUrl' => $url,
                 'legend' => $map->getLegendData($this->container),
                 'resolution' => $res,//8855,
                 //'extent' => $extent,
                 'locale' => $this->session->getLocale(),
                 'env' => $env);
  }

}
