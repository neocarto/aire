<?php

namespace Geonef\PloomapBundle\DependencyInjection;

use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader\XmlFileLoader;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Config\FileLocator;

class GeonefPloomapExtension extends Extension
{

  /**
   * Returns the base path for the XSD files.
   *
   * @return string The XSD base path
   */
  public function getXsdValidationBasePath()
  {
    return __DIR__.'/../Resources/config/';
  }

  /**
   * Returns the namespace to be used for this extension (XML namespace).
   *
   * @return string The XML namespace
   */
  public function getNamespace()
  {
    return 'http://ploomap.geonef.org/schema';
  }

  /**
   * Returns the recommanded alias to use in XML.
   *
   * This alias is also the mandatory prefix to use when using YAML.
   *
   * @return string The alias
   */
  public function getAlias()
  {
    return 'geonef_ploomap';
  }

  public function load(array $configs, ContainerBuilder $container)
  {
    $loader = new XmlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));

    $loader->load('ploomap.xml');

    $processor = new Processor();
    $configuration = new Configuration($container->getParameter('kernel.debug'));
    $config = $processor->process($configuration->getConfigTree(), $configs);

    // $config[..] args are passed as references (still fine if !isset)
    $this->registerGeoCacheConfig($config['geocache'], $container);
  }

  /**
   * @param array $config A configuration array
   * @return ContainerBuilder A ContainerBuilder instance
   */
  protected function registerGeoCacheConfig(&$config, ContainerBuilder $container)
  {
    foreach (array('local_wms_domain') as $p) {
      if (isset($config[$p])) {
        $container->setParameter('geonef.ploomap.geocache.'.$p, $config[$p]);
      }
    }
  }

}
