<?php

require_once __DIR__.'/autoload.php';

use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Config\Loader\LoaderInterface;

//use Symfony\Bundle\FrameworkBundle\FrameworkBundle;
//use Symfony\Bundle\TwigBundle\TwigBundle;
//use Symfony\Bundle\ZendBundle\ZendBundle;
//use Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle;
//use Symfony\Bundle\DoctrineBundle\DoctrineBundle;
//use Symfony\Bundle\DoctrineMongoDBBundle\DoctrineMongoDBBundle;
/* use Geonef\ZigBundle\GeonefZigBundle; */
/* use Geonef\PgLinkBundle\GeonefPgLinkBundle; */
/* use Geonef\PloomapBundle\GeonefPloomapBundle; */
/* use Geonef\CarnetsBundle\GeonefCarnetsBundle; */

class AppKernel extends Kernel
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
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
            //new Symfony\Bundle\DoctrineBundle\DoctrineBundle(),
            new Symfony\Bundle\DoctrineMongoDBBundle\DoctrineMongoDBBundle(),
            //new Symfony\Bundle\AsseticBundle\AsseticBundle(),
            //new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),
            new Geonef\ZigBundle\GeonefZigBundle(),
            new Geonef\PgLinkBundle\GeonefPgLinkBundle(),
            new Geonef\PloomapBundle\GeonefPloomapBundle(),
            new Geonef\CarnetsBundle\GeonefCarnetsBundle(),
        );

        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            //$bundles[] = new Symfony\Bundle\WebConfiguratorBundle\SymfonyWebConfiguratorBundle();
        }

        return $bundles;

    /* $bundles = array( */
    /*                  // essential bundles */
    /*                  new FrameworkBundle(), */
    /*                  new TwigBundle(), */

    /*                  // third-party : Symfony-related */
    /*                  //new ZendBundle(), */
    /*                  new SwiftmailerBundle(), */
    /*                  //new DoctrineBundle(), */
    /*                  //new DoctrineMigrationsBundle(), */
    /*                  new DoctrineMongoDBBundle(), */

    /*                  // third-party : my owns */
    /*                  new GeonefZigBundle(), */
    /*                  new GeonefPgLinkBundle(), */
    /*                  new GeonefPloomapBundle(), */
    /*                  new GeonefCarnetsBundle(), */
    /*                  ); */
    /* if ($this->isDebug()) { */
    /*   $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle(); */
    /* } */

    /* return $bundles; */
  }

  /* public function registerBundleDirs() */
  /* { */
  /*   return array */
  /*     ('Symfony\\Bundle' => __DIR__.'/../vendor/symfony/src/Symfony/Bundle', */
  /*      'Geonef\\ZigBundle' => __DIR__.'/../vendor/zig/src/Geonef/ZigBundle', */
  /*      'Geonef\\PloomapBundle' => __DIR__.'/../vendor/ploomap-server/src/Geonef/PloomapBundle', */
  /*      'Geonef\\CarnetsBundle' => __DIR__.'/../src/Geonef/CarnetsBundle'); */
  /* } */

  public function registerContainerConfiguration(LoaderInterface $loader)
  {
    $loader->load(__DIR__.'/config/config_'.$this->getEnvironment().'.yml');
  }

}
