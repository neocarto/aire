<?php

namespace Geonef\ZigBundle\DependencyInjection;

use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader\XmlFileLoader;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Config\FileLocator;

class GeonefZigExtension extends Extension
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
    return 'http://zig.geonef.org/schema';
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
    return 'geonef_zig';
  }

  public function load(array $configs, ContainerBuilder $container)
  {
    $loader = new XmlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));

    $loader->load('app.xml');
    $loader->load('static_cache.xml');
    $loader->load('registry.xml');
    $loader->load('api.xml');
    $loader->load('listeners.xml');

    $processor = new Processor();
    $configuration = new Configuration($container->getParameter('kernel.debug'));
    $config = $processor->process($configuration->getConfigTree(), $configs);

    // $config[..] args are passed as references (still fine if !isset)
    $this->registerInstallConfig($config['install'], $container);
    $this->registerAppConfig($config['app'], $container);
    $this->registerStaticCacheConfig($config['static_cache'], $container);
    $this->registerRegistryConfig($config['registry'], $container);
    $this->registerApiConfig($config['api'], $container);
  }

  /**
   * @param array $config A configuration array
   * @return ContainerBuilder A ContainerBuilder instance
   */
  protected function registerInstallConfig(&$config, ContainerBuilder $container)
  {
    foreach (array('public_dir', 'public_mappings', 'shrinksafe') as $p) {
      if (isset($config[$p])) {
        $container->setParameter('zig.install.'.$p, $config[$p]);
      }
    }
  }

  /**
   * @param array $config A configuration array
   * @return ContainerBuilder A ContainerBuilder instance
   */
  protected function registerAppConfig(&$config, ContainerBuilder $container)
  {
    foreach (array('lib_dir_path', 'lib_web_path', 'public_dir', 'clients',
                   'modulePaths', 'supportedLocales', 'localizationModules',
                   'publicPaths') as $p) {
      if (isset($config[$p])) {
        $container->setParameter('zig.app.'.$p, $config[$p]);
      }
    }
  }

  /**
   * @param array $config A configuration array
   * @return ContainerBuilder A ContainerBuilder instance
   */
  protected function registerStaticCacheConfig(&$config, ContainerBuilder $container)
  {
    //var_dump($config);exit;
    $managerService = 'geonef_zig.static_cache.manager';
    if ($container->hasDefinition($managerService)) {
      $managerDef = $container->getDefinition($managerService);
      $managerDef->addMethodCall('setEnabled', array($config['enabled']));
      if (isset($config['routes'])) {
        foreach ($config['routes'] as $route => $props) {
          $deps = $props['dependencies'];
          foreach ($deps as &$dep) {
            if (isset($dep['properties'][0]) && $dep['properties'][0] == '*') {
              unset($dep['properties']);
            }
          }
          $events = $props['clearingEvents'];
          $args = array($route, $props['cachePattern'], $deps, $events);
          $managerDef->addMethodCall('addRouteCache', $args);
        }
      }
    }
  }

  /**
   * @param array $config A configuration array
   * @return ContainerBuilder A ContainerBuilder instance
   */
  protected function registerRegistryConfig(&$config, ContainerBuilder $container)
  {
    // not yet written in Configuration
  }

  /**
   * @param array $config A configuration array
   * @return ContainerBuilder A ContainerBuilder instance
   */
  protected function registerApiConfig(&$config, ContainerBuilder $container)
  {
    $container->setparameter
      ('zig.api.namespaces', isset($config['namespaces']) ?
       $config['namespaces'] : $this->findBundleApiNamespaces($container));
  }

  protected function findBundleApiNamespaces($container)
  {
    $namespaces = array();
    foreach ($container->getParameter('kernel.bundles') as $bundle) {
      $name = substr($bundle, strrpos($bundle, '\\') + 1);
      $bundleNS = dirname(strtr($bundle, '\\', '/'));
      $ns = strtr($bundleNS . '/Api', '/', '\\');
      $namespaces[$name] = $ns;
    }
    return $namespaces;
  }

}
