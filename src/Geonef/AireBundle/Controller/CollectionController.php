<?php

namespace Geonef\AireBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Geonef\PloomapBundle\Document\MapCategory;
use Geonef\PloomapBundle\Document\MapCollection\MultiRepr as MapCollectionMultiRepr;
use Geonef\PloomapBundle\Document\MapCollection\SingleRepr as MapCollectionSingleRepr;
use Geonef\Ploomap\Util\Geo;

class CollectionController extends Controller
{
  const DOC_PREFIX = 'Geonef\PloomapBundle\Document\\';
  const COLLECTION_CLASS = 'Geonef\PloomapBundle\Document\MapCollection';

  /**
   * Main action of application - screen of one collection
   *
   * @param $id string  ID of collection to show
   */
  public function visuAction($id)
  {
    $categories = MapCategory::getCategories($this->container);
    $coll = $this->getCollection($id);
    $maps = $this->getMaps($coll);
    $collData = array('maps' => $maps,
                      'startMap' => $coll->startMap);
    $env = $this->container->getParameter('kernel.environment');

    return $this->render('GeonefAireBundle:Collection:visu.twig.html',
                         array('categories' => $categories,
                               'collection' => $coll,
                               'collection_json' => json_encode($collData),
                               'maps' => $maps,
                               'env' => $env,
                               ));
  }

  /**
   * @return Geonef\PloomapBundle\Document\MapCollection
   */
  protected function getCollection($id)
  {
    $dm = $this->container->get('doctrine.odm.mongodb.documentManager');
    $coll = $dm->find(static::COLLECTION_CLASS, $id);
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

  /* /\** */
  /*  * @return Geonef\PloomapBundle\Document\MapCollection\SingleRepr */
  /*  *\/ */
  /* protected function getHomeCollection() */
  /* { */
  /*   $dm = $this->container->get('doctrine.odm.mongodb.documentManager'); */
  /*   $query = $dm->getRepository(static::COLLECTION_CLASS.'\SingleRepr')->createQueryBuilder(); */
  /*   $it = $query->field('published')->equals(true)->getQuery()->execute(); */
  /*   if ($it->count() == 0) { */
  /*     throw new \Exception("aucune collection SingleRepr publiée"); */
  /*     //throw new \Exception("cannot find a 'published' SigleRepr MapCollection doc for home map"); */
  /*   } */
  /*   return $it->getSingleResult(); */
  /* } */

  /* protected function getHomeMaps(MapCollectionSingleRepr $coll) */
  /* { */
  /*   return array($coll->autoGetMap($this->container)); */
  /* } */

}
