<?php

require_once __DIR__.'/../src/autoload.php';
require_once __DIR__.'/../src/cartapatate/symfony/src/Symfony/Foundation/bootstrap.php';

use Symfony\Foundation\Kernel as BaseKernel;
use Symfony\Components\DependencyInjection\Loader\YamlFileLoader as ContainerLoader;
use Symfony\Components\Routing\Loader\YamlFileLoader as RoutingLoader;

class Kernel extends BaseKernel
{
  public function registerRootDir()
  {
    return __DIR__;
  }

  public function registerBundles()
  {
    return array(
                 new Symfony\Foundation\Bundle\KernelBundle(),
                 new Symfony\Framework\WebBundle\Bundle(),

                 // third-party : Symfony-related
                 new Symfony\Framework\ZendBundle\Bundle(),
                 new Symfony\Framework\SwiftmailerBundle\Bundle(),
                 new Symfony\Framework\DoctrineBundle\Bundle(),

                 // third-party : my owns
                 new Zig\Framework\ZigBundle\Bundle(),
                 new Ploomap\Bundle\PloomapBundle\Bundle(),
                 new HurepoixBundle\Bundle(),
                 );
  }

  public function registerBundleDirs()
  {
    return array(
                 //'Application'        => __DIR__.'/../src/Application',
                 //'Bundle'             => __DIR__.'/../src/Bundle',
                 //'HurepoixBundle'             => __DIR__.'/../src/hurepoix/HurepoixBundle',
                 'HurepoixBundle'           => __DIR__.'/../src/hurepoix',
                 'Symfony\\Framework' => __DIR__.'/../src/cartapatate/symfony/src/Symfony/Framework',
                 'Zig\\Framework'     => __DIR__.'/../src/cartapatate/zig/lib/Zig/Framework',
                 'Ploomap\\Bundle'     => __DIR__.'/../src/cartapatate/ploomap/lib/Ploomap/Bundle',
                 );
  }

  public function registerContainerConfiguration()
  {
    $loader = new ContainerLoader($this->getBundleDirs());

    return $loader->load(__DIR__.'/config/config_'.$this->getEnvironment().'.yml');
  }

  public function registerRoutes()
  {
    $loader = new RoutingLoader($this->getBundleDirs());

    return $loader->load(__DIR__.'/config/routing.yml');
  }
}
