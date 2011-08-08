<?php

namespace Riate\AireBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Geonef\PloomapBundle\Document\Map;
use Geonef\PloomapBundle\Document\MapCollection\MultiRepr as MapCollectionMultiRepr;
use Geonef\Ploomap\Util\Geo;

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
    $extent = $request->query->get('extent');
    // if (preg_match('/^-?[0-9]+,-?[0-9]+,-?[0-9]+,-?[0-9]+/', $extent)) {
    //   $extent = explode(',', $extent);
    // }
    $params = array('WIDTH' => static::MAP_WIDTH,
                    'HEIGHT' => static::MAP_HEIGHT);
    if ($extent) {
      $params['BBOX'] = $extent;
    }
    //$map->getDisplay(array('resolutions' => array(8855)));
    $url = $map->getWmsMapUrl($this->container, $params, true);
    $env = $this->container->getParameter('kernel.environment');

    return array('map' => $map,
                 'mapUrl' => $url,
                 'legend' => $map->getLegendData($this->container),
                 'resolution' => 8855,
                 'extent' => $extent,
                 'locale' => $this->session->getLocale(),
                 'env' => $env);
  }

}
