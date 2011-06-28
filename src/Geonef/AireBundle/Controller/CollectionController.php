<?php

namespace Geonef\AireBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Geonef\PloomapBundle\Document\MapCategory;
use Geonef\PloomapBundle\Document\MapCollection\MultiRepr as MapCollectionMultiRepr;
use Geonef\PloomapBundle\Document\MapCollection\SingleRepr as MapCollectionSingleRepr;
use Geonef\Ploomap\Util\Geo;

use Funkiton\InjectorBundle\Annotation\Inject;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

/**
 *
 * @Route("/collection")
 * @Inject("doctrine.odm.mongodb.documentManager", name="dm")
 * @Inject("session")
 */
class CollectionController extends Controller
{
  const DOC_PREFIX = 'Geonef\PloomapBundle\Document\\';
  const COLLECTION_CLASS = 'Geonef\PloomapBundle\Document\MapCollection';

  /**
   * Main action of application - screen of one collection
   *
   * @Route("/{id}", name="aire_collection_visu")
   * @Route("/{id}/{_locale}", name="aire_collection_visu_i18n")
   * @Template("GeonefAireBundle:Collection:visu.twig.html")
   *
   * @param $id string  ID of collection to show
   */
  public function visuAction($id)
  {
    $categories = MapCategory::getCategories($this->container);
    $coll = $this->getCollection($id);
    $maps = $this->getMaps($coll);
    $collData = array('maps' => $maps,
                      'startMap' => $coll->startMap,
                      'zoomBarX' => $coll->zoomBarX,
                      'zoomBarY' => $coll->zoomBarY);
    $env = $this->container->getParameter('kernel.environment');
    $this->container->get('doctrine.odm.mongodb.documentManager')
      ->flush();
    $comment = $this->processComment($coll);
    return array('categories' => $categories,
                 'collection' => $coll,
                 'comment' => $comment,
                 'collection_json' => json_encode($collData),
                 'maps' => $maps,
                 'locale' => $this->session->getLocale(),
                 'env' => $env);
  }

  /**
   * @return Geonef\PloomapBundle\Document\MapCollection
   */
  protected function getCollection($id)
  {
    $coll = $this->dm->find(static::COLLECTION_CLASS, $id);
    if (!$coll) {
      throw new \Exception('document not found in class '.static::COLLECTION_CLASS.': '.$id);
    }
    if (!$coll->isPublished()) {
      throw new \Exception("collection's publishing is not enabled for ".$id);
    }
    return $coll;
  }

  protected function getMaps(MapCollectionMultiRepr $coll)
  {
    $maps = array();
    $mapTypes = MapCollectionMultiRepr::$mapTypes;
    foreach ($mapTypes as $repr => $unitScales) {
      foreach ($unitScales as $unitScale) {
        $map = $coll->getMap($this->container, $repr, $unitScale, false);
        if (!$map || !$map->isPublished()) {
          continue;
        }
        $msMap = $map->build($this->container);
        try {
          //$legend = null;
          $legend = $map->getLegendData($this->container);
        }
        catch (\Exception $e) {
          $legend = null;
        }
        $struct = array
          ('id' => $map->getId(),
           'extent' => Geo::msRectToExtent($msMap->extent),
           'projection' => strtoupper(Geo::getMsMapSrs($msMap)),
           'layers' => $map->getLayerNames($this->container, $msMap, true),
           'legend' => $legend);
        $maps[$repr][$unitScale] = $struct; //json_encode($struct);
      }
    }
    return $maps;
  }

  protected function processComment(MapCollectionMultiRepr $coll)
  {
    return $this->_substitComment($coll->comment);
  }

  protected function _substitComment($str)
  {
    $start = strpos($str, '{');
    if ($start !== false) {
      $end = strpos($str, '}', $start);
      if ($end !== false) {
        $c = substr($str, $start + 1, $end - $start - 1);
        $subst = $this->_processSubstitComment(explode(':', $c));
        if ($subst !== null) {
          $str = substr($str, 0, $start) . $subst
            . $this->_substitComment(substr($str, $end + 1));
        }
      }
    }
    return $str;
  }

  protected function _processSubstitComment($cmd)
  {
    $t = '';
    if ($cmd[0] == 'move' && isset($cmd[1])) {
      $code = strtr($cmd[1], array('_' => '/',
                                   'stockandratio' => 'stockRatio',
                                   'disc' => 'ratioDisc',
                                   'carroyage' => 'ratioGrid',
                                   'smooth' => 'potential',
                                   'c40' => '50km',
                                   'c80' => '100km',
                                   'c160' => '200km',
                                   'c320' => '300km',
                                   'p40' => '50km',
                                   'p80' => '100km',
                                   'p160' => '200km',
                                   'p320' => '300km',
                                   ));
      $onclick = 'aire.app.showLayer(\''.$code.'\');';
      if (isset($cmd[3])) /* avec coordonnes */ {
        $lonlat = 'new OpenLayers.LonLat('.$cmd[2].','.$cmd[3].')';
        if (isset($cmd[4])) /* avec zoom */ {
          $onclick .= 'aire.app.setCenter('.$lonlat.', '.$cmd[4].');';
        } else {
          $onclick .= 'aire.app.setCenter('.$lonlat.');';
        }
      }
      $onclick .= 'return false;';
      $t = '<a href="#" onclick="'.$onclick.'" class="moveAction">';
    }
    if ($cmd[0] == '/move') {
      $t = '</a>';
    }
    return $t;
  }

}
