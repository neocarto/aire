<?php

require_once __DIR__.'/../src/autoload.php';
require_once __DIR__.'/../src/cartapatate/symfony/src/Symfony/Foundation/bootstrap.php';

use Symfony\Foundation\Kernel as BaseKernel;
use Symfony\Components\DependencyInjection\Loader\YamlFileLoader as ContainerLoader;
use Symfony\Components\Routing\Loader\YamlFileLoader as RoutingLoader;

use Symfony\Foundation\Bundle\KernelBundle;
use Symfony\Framework\FoundationBundle\FoundationBundle;
use Symfony\Framework\ZendBundle\ZendBundle;
use Symfony\Framework\DoctrineBundle\DoctrineBundle;
use Symfony\Framework\SwiftmailerBundle\SwiftmailerBundle;
use Symfony\Framework\DoctrineMigrationsBundle\DoctrineMigrationsBundle;
use Bundle\DoctrineMongoDBBundle\DoctrineMongoDBBundle;
use Zig\Framework\ZigBundle\ZigBundle;
use Ploomap\Bundle\PloomapBundle\PloomapBundle;
use CatapatateBundle\CatapatateBundle;

class Kernel extends BaseKernel
{
  /**
   * Overloaded, only to provide an app name
   */
  public function __construct($environment, $debug)
  {
    parent::__construct($environment, $debug);
    $this->name = 'aire';
  }

  public function registerRootDir()
  {
    return __DIR__;
  }

  public function registerBundles()
  {
    return array(
                 // essential bundles
                 new KernelBundle(),
                 new FoundationBundle(),

                 // third-party : Symfony-related
                 new ZendBundle(),
                 new SwiftmailerBundle(),
                 new DoctrineBundle(),
                 //new DoctrineMigrationsBundle(),
                 new DoctrineMongoDBBundle(),

                 // third-party : my owns
                 new ZigBundle(),
                 new PloomapBundle(),
                 new CatapatateBundle(),
                 );
  }

  public function registerBundleDirs()
  {
    return array(
                 //'Application'        => __DIR__.'/../src/Application',
                 //'Bundle'             => __DIR__.'/../src/Bundle',
                 //'CatapatateBundle'             => __DIR__.'/../src/catapatate/CatapatateBundle',
                 'CatapatateBundle'           => __DIR__.'/../src/catapatate',
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
