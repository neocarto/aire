<?php

namespace Geonef\PloomapBundle\Document\Map;

use Geonef\PloomapBundle\Document\Map as AbstractMap;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Geonef\Zig\Util\Dev;

use Doctrine\ODM\MongoDB\Mapping\Annotations as Doctrine;
use Doctrine\ODM\MongoDB\Mapping\Annotations\ReferenceOne;

/**
 * @Doctrine\Document
 */
abstract class ModelBased extends AbstractMap
{
  /**
   * @ReferenceOne(
   *    targetDocument="Geonef\PloomapBundle\Document\Map")
   *  OnChange(method="clearInfoCache")
   */
  public $modelMap;

  /**
   * Check validity of this map properties
   *
   * This tests properties values as well as whether all checks
   * whose success garanties a build success
   * (ex: datasource as valid, can be opened...)
   *
   * @param $container ContainerInterface
   * @param $errors    array
   * @return boolean    Whether the map properties are valid
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    $errs = array();
    $state &= $this->checkCond($this->modelMap,
                               'modelMap', array('missing', "La carte modèle doit être spécifiée"), $errors);
    if ($state) {
      try {
        $id = $this->modelMap->getId();
      }
      catch (\Exception $e) {
        $id = null;
      }
      $state &= $this->checkCond($id, 'modelMap',
                                 array('invalid', "La carte modèle a été supprimée"),
                                 $errors);
    }
    if ($state) {
      $sub = $this->modelMap->getPropValidity($container);
      $state &= $this->checkCond($sub['valid'], 'modelMap', array('invalid', "La carte modèle est invalide"), $errors);
    }
    return $state;
  }

  protected function doBuild(ContainerInterface $container)
  {
    $msMap = $this->buildModelMap($container);
    $this->configureMap($msMap, $container);
    $order1 = $msMap->getLayersDrawingOrder();
    $this->addOwnLayers($msMap, $container);
    //$container->get('logger')->debug('oka z '.json_encode($msMap->getAllLayerNames()));
    if (in_array('__mark__', $msMap->getAllLayerNames())) {
      $mark = $msMap->getLayerByName('__mark__');
      if ($mark) {
        $order2 = $msMap->getLayersDrawingOrder();
        $new = array_slice($order2, count($order1));
        $order3 = array();
        foreach ($order1 as $idx) {
          $order3[] = $idx;
          if ($idx == $mark->index) {
            foreach ($new as $nidx) {
              $order3[] = $nidx;
            }
          }
        }
        $msMap->setLayersDrawingOrder($order3);
        $msMap->removeLayer($mark->index);
      }
    }
    return $msMap;
  }

  protected function buildModelMap(ContainerInterface $container)
  {
    if (!$this->modelMap || !$this->modelMap->getId()) {
      throw new \Exception('Model map is not defined for map: '.$this->getId());
    }
    $dm = $container->get('doctrine.odm.mongodb.documentManager');
    $modelMap = Dev::getRealDocument($this->modelMap, $dm);
    //var_dump($this->modelMap->getId());exit;
    $msMap = $modelMap->build($container);
    return $msMap;
  }

  protected function addOwnLayers(\mapObj $msMap,
                                  ContainerInterface $container)
  {
    throw new \Exception('must be implemented in concrete class');
  }

}
