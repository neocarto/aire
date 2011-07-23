<?php

require_once __DIR__.'/autoload.php';

use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Config\Loader\LoaderInterface;

class AppKernel extends Kernel
{
  const APP_VERSION = '0.3.0';
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
        $bundles = array(
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),

            new Geonef\ZigBundle\GeonefZigBundle(),
            new Geonef\PgLinkBundle\GeonefPgLinkBundle(),
            new Geonef\PloomapBundle\GeonefPloomapBundle(),
            new Riate\AireBundle\RiateAireBundle(),

            // http://symfony.com/doc/2.0/bundles/SensioFrameworkExtraBundle/index.html
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),
            //new Symfony\Bundle\DoctrineBundle\DoctrineBundle(),
            new Symfony\Bundle\DoctrineMongoDBBundle\DoctrineMongoDBBundle(),
            //new Symfony\Bundle\AsseticBundle\AsseticBundle(),
            new Funkiton\InjectorBundle\FunkitonInjectorBundle(), // to remove
            new JMS\DiExtraBundle\JMSDiExtraBundle($this),
            // https://github.com/l3pp4rd/DoctrineExtensions/blob/master/doc/translatable.md
            // https://github.com/stof/DoctrineExtensionsBundle/blob/master/Resources/doc/index.rst
            new Stof\DoctrineExtensionsBundle\StofDoctrineExtensionsBundle(),

            // interesting:
            // http://symfony2bundles.org/ninethousand/NineThousandJobqueueBundle
            // http://symfony2bundles.org/steves/MongoAdminBundle
            // http://symfony2bundles.org/Bazinga/ExposeRoutingBundle
            // http://symfony2bundles.org/moreweb/ImagineBundle
            // http://symfony2bundles.org/schmittjoh/CommandBundle (generate License & Exception for PHP classes)
            // http://symfony2bundles.org/schmittjoh/SecurityExtraBundle
            //
        );

        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            //$bundles[] = new Symfony\Bundle\WebConfiguratorBundle\SymfonyWebConfiguratorBundle();
        }

        return $bundles;
  }

  public function registerContainerConfiguration(LoaderInterface $loader)
  {
    //$this->container->setParameter('app.version', static::APP_VERSION);
    $loader->load(__DIR__.'/config/config_'.$this->getEnvironment().'.yml');
  }

}
