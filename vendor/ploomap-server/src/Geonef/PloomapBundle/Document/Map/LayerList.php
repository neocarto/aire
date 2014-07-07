<?php

namespace Geonef\PloomapBundle\Document\Map;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\Common\Collections\ArrayCollection;

use Doctrine\ODM\MongoDB\Mapping\Annotations\Document;
use Doctrine\ODM\MongoDB\Mapping\Annotations\EmbedMany;

/**
 *
 *
 * @Document
 */
class LayerList extends Standalone
{
  const MODULE = 'LayerList';

  /**
   * Layer collection
   *
   * __EmbedMany(
   *    targetDocument="Geonef\PloomapBundle\Document\GdalDataset")
   * @EmbedMany(
   *    discriminatorField="module",
   *    discriminatorMap={
   *      "MapFile"="Geonef\PloomapBundle\Document\MapLayer\MapFile",
   *      "StaticLayer"="Geonef\PloomapBundle\Document\MapLayer\StaticLayer",
   *      "OgrVector"="Geonef\PloomapBundle\Document\MapLayer\OgrVector",
   *      "Mark"="Geonef\PloomapBundle\Document\MapLayer\Mark"
   *    }
   * )
   */
  public $layers;

  public function __construct()
  {
    $this->layers = new ArrayCollection();
    //$this->initialize();
  }

  /** inherited */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    if (!$this->checkCond(count($this->layers) > 0, 'layers',
                          array('missing', 'au moins une couche doit '
                                .'être définie'), $errors)) {
      return false;
    }
    $errs = array();
    $layerCount = 0;
    $marks = 0;
    $names = array();
    $lstate = true;
    foreach ($this->layers as $layer) {
      if (isset($layer->isMark) && $layer->isMark) {
        ++$marks;
      } elseif ($layer->visible) {
        ++$layerCount;
      }
      if ($layer->checkProperties($container, $errs)) {
        $names[] = $layer->getName();
      } else {
        $errors['layers'] = array('invalid', 'La couche "'.
                                  $layer->getName().'" est invalide');
        $lstate = false;
      }
    }
    if ($lstate) {
      if (!$layerCount) {
        $errors['layers'] = array('invalid', 'Aucune couche visible');
        $lstate = false;
      } elseif ($marks > 1) {
        $errors['layers'] = array('invalid', 'Une couche marqueur '
                                  .'seulement ne peut être définie.');
        $lstate = false;
      }
    }
    $state &= $lstate;
    return $state;
  }

  /**
   * NOT CALLED! :( Really?
   * @  PostLoad
   */
  // public function initialize()
  // {
  //   if (is_array($this->layers)) {
  //     $this->layers = new ArrayCollection($this->layers);
  //   }
  // }

  protected function doBuild(ContainerInterface $container)
  {
    $msMap = $this->getNewMapObj();
    $this->configureMap($msMap, $container);
    $this->addLayers($msMap, $container);
    return $msMap;
  }

  protected function configureMap(\mapObj $msMap, ContainerInterface $container)
  {
    $msMap->set('name', $this->name);
    parent::configureMap($msMap, $container);
  }

  protected function addLayers(\mapObj $msMap, ContainerInterface $container)
  {
    foreach ($this->layers as $layer) {
      //if (!isset($layer->isMark) || !$layer->isMark) {
        $msLayer = $layer->build($msMap, $container);
        //}
    }

  }
}
