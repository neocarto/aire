<?php

require_once __DIR__.'/../src/autoload.php';
//require_once __DIR__.'/../src/cartapatate/symfony/src/Symfony/Foundation/bootstrap.php';

use Symfony\Framework\Kernel as BaseKernel;
use Symfony\Component\DependencyInjection\Loader\LoaderInterface;

use Symfony\Framework\KernelBundle;
use Symfony\Bundle\FrameworkBundle\FrameworkBundle;
use Symfony\Bundle\ZendBundle\ZendBundle;
use Symfony\Bundle\DoctrineBundle\DoctrineBundle;
use Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle;
use Symfony\Bundle\DoctrineMongoDBBundle\DoctrineMongoDBBundle;

use Zig\Bundle\ZigBundle\ZigBundle;
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
    $this->name = 'catapatate';
  }

  public function registerRootDir()
  {
    return __DIR__;
  }

  public function registerBundles()
  {
    $bundles = array(
                     // essential bundles
                     new KernelBundle(),
                     new FrameworkBundle(),

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
    if ($this->isDebug()) {
      $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
    }

    return $bundles;
  }

  public function registerBundleDirs()
  {
    return array(
                 //'Application'        => __DIR__.'/../src/Application',
                 //'Bundle'             => __DIR__.'/../src/Bundle',
                 //'CatapatateBundle'             => __DIR__.'/../src/catapatate/CatapatateBundle',
                 'CatapatateBundle'           => __DIR__.'/../src/catapatate',
                 'Symfony\\Bundle' => __DIR__.'/../src/cartapatate/symfony/src/Symfony/Bundle',
                 'Zig\\Bundle'     => __DIR__.'/../src/cartapatate/zig/lib/Zig/Bundle',
                 'Ploomap\\Bundle'     => __DIR__.'/../src/cartapatate/ploomap/lib/Ploomap/Bundle',
                 );
  }

  public function registerContainerConfiguration(LoaderInterface $loader)
  {
    $loader->load(__DIR__.'/config/config_'.$this->getEnvironment().'.yml');
  }

}
