<?php

namespace Geonef\AireBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
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
   * @Route("/{id}/print", name="aire_map_print")
   * @Route("/{id}/print/{_locale}", name="aire_map_print_i18n")
   * @Template("GeonefAireBundle:Map:print.twig.html")
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

    return array('map' => $map,
                 'mapUrl' => $url,
                 'legend' => $map->getLegendData($this->container),
                 'resolution' => 8855,
                 'extent' => $extent,
                 'locale' => $this->session->getLocale(),
                 'env' => $env);
  }

  protected function getMap($id)
  {
    $class = self::DOC_PREFIX.'Map';
    $map = $this->dm->find($class, $id);
    if (!$map) {
      throw new \Exception('document not found in class '.$class.': '.$id);
    }
    if (!$map->isPublished()) {
      throw new \Exception("map's publishing is not enabled for ".$id);
    }

    return $map;
  }

}
