<?php

namespace Geonef\PloomapBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Loader;
//use Geonef\Zig\Framework\ZigBundle\DependencyInjection\ZigExtension;

class GeonefPloomapBundle extends Bundle
{
  /**
   * Customizes the Container instance.
   *
   * @param Symfony\Component\DependencyInjection\ContainerInterface $container A ContainerInterface instance
   *
   * @return Symfony\Component\DependencyInjection\BuilderConfiguration A BuilderConfiguration instance
   */
  /*public function buildContainer(ContainerInterface $container)
  {
    Loader::registerExtension(new ZigExtension());
    }*/
}
