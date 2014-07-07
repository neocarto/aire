<?php

namespace Geonef\PloomapBundle\Document\Map;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Panorama, for fake 3D view
 *
 *   Doctrine\ODM\MongoDB\Mapping\Document
 */
class Panorama extends Standalone
{
  const MODULE = 'Panorama';

  /**
   * Layer collection
   *
   * @Doctrine\ODM\MongoDB\Mapping\
   */
  public $layers = array();

  /**
   * @inheritsDoc
   */
  public function checkProperties(ContainerInterface $container, &$errors)
  {
    $state = parent::checkProperties($container, $errors);
    return $state;
  }

  protected function doBuild(ContainerInterface $container)
  {
    $msMap = $this->getNewMapObj();
    $this->configureMap($msMap, $container);
    $this->buildLayer($msMap, $container);
    return $msMap;
  }

  protected function configureMap(\mapObj $msMap, ContainerInterface $container)
  {
    //$msMap->set('name', $this->name);
    parent::configureMap($msMap, $container);
  }

  protected function buildLayer(\mapObj $msMap, ContainerInterface $container)
  {
  }
}
