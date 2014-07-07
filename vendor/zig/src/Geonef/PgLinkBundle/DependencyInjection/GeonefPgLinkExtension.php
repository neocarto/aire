<?php

namespace Geonef\PgLinkBundle\DependencyInjection;

use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader\XmlFileLoader;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;

class GeonefPgLinkExtension extends Extension
{
  /**
   * Returns the recommanded alias to use in XML.
   *
   * This alias is also the mandatory prefix to use when using YAML.
   *
   * @return string The alias
   */
  public function getAlias()
  {
    return 'geonef_pg_link';
  }

  /**
   * Returns the namespace to be used for this extension (XML namespace).
   *
   * @return string The XML namespace
   */
  public function getNamespace()
  {
    return 'http://pglink.geonef.org/schema';
  }

  /**
   * Loads the Zip PgLink configuration.
   *
   * @param array $config An array of configuration settings
   * @param ContainerBuilder $container A ContainerBuilder instance
   */
  public function load(array $configs, ContainerBuilder $container)
  {
    foreach ($configs as $config) {
      $this->configLoad($config, $container);
    }
  }

  public function configLoad($config, ContainerBuilder $container)
  {
    if (!$container->hasDefinition('zig_pglink.manager.class')) {
      $loader = new XmlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));
      $loader->load('pglink.xml');
    }

    // Allow these application configuration options to override the defaults
    $options = array('database', 'user', 'password');
    foreach ($options as $key) {
      if (isset($config[$key])) {
        $container->setParameter('zig_pglink.connection.'.$key, $config[$key]);
      }
    }
  }

  /**
   * Returns the base path for the XSD files.
   *
   * @return string The XSD base path
   */
  public function getXsdValidationBasePath()
  {
    return __DIR__.'/../Resources/config/';
  }

}
