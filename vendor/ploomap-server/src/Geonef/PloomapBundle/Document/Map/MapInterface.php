<?php

namespace Geonef\PloomapBundle\Document\Map;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 */
interface MapInterface
{
  /**
   * Return MapScript ms_Map object
   *
   * @return ms_Map
   */
  public function build(ContainerInterface $container);
}
