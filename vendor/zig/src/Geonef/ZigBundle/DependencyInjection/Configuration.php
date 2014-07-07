<?php

namespace Geonef\ZigBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;

/**
 * ZigExtension configuration structure.
 *
 */
class Configuration
{
    protected $debug;

    public function __construct($debug)
    {
        $this->debug = (Boolean) $debug;
    }

    /**
     * Generates the configuration tree.
     *
     * @param boolean $kernelDebug The kernel.debug DIC parameter
     *
     * @return \Symfony\Component\Config\Definition\ArrayNode The config tree
     */
    public function getConfigTree()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('zig');

        $this->addAppSection($rootNode);
        $this->addInstallSection($rootNode);
        $this->addApiSection($rootNode);
        $this->addStaticCacheSection($rootNode);
        //$this->addRegistrySection($rootNode);

        return $treeBuilder->buildTree();
    }

    protected function addAppSection(ArrayNodeDefinition $rootNode)
    {
      //->useAttributeAsKey('name')
      //->treatFalseLike(array('mapping' => false))
      //->performNoDeepMerging()
      //->scalarNode('mapping')->defaultValue(true)->end()

        $rootNode
            ->children()
                ->arrayNode('app')
                    ->children()
                        ->scalarNode('lib_dir_path')->end()
                        ->scalarNode('lib_web_path')->end()
                        ->scalarNode('public_dir')->end()
                        ->arrayNode('clients')
                            ->useAttributeAsKey('name')
                            ->prototype('array')
                                ->performNoDeepMerging()
                                ->treatNullLike(array())
                                ->children()
                                    ->scalarNode('copyright')->end()
                                    ->arrayNode('modules')
                                        ->prototype('array')
                                            ->beforeNormalization()
                                                ->ifString()
                                                ->then(function($v) { return array('name' => $v); })
                                            ->end()
                                            ->children()
                                                ->scalarNode('name')->end()
                                            ->end()
                                        ->end()
                                    ->end()
                                    ->arrayNode('css')
                                        ->prototype('array')
                                            ->beforeNormalization()
                                                ->ifString()
                                                ->then(function($v) { return array('path' => $v); })
                                            ->end()
                                            ->children()
                                                ->scalarNode('module')->end()
                                                ->scalarNode('path')->end()
                                            ->end()
                                        ->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('modulePaths')
                            ->useAttributeAsKey('ns')
                            ->prototype('array')
                                //->performNoDeepMerging()
                                ->treatNullLike(array())
                                ->beforeNormalization()
                                    ->ifString()
                                    ->then(function($v) { return array('path' => $v); })
                                ->end()
                                ->children()
                                    ->scalarNode('ns')->end()
                                    ->scalarNode('path')->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('supportedLocales')
                            ->prototype('array')
                                ->treatNullLike(array())
                                ->beforeNormalization()
                                    ->ifString()
                                    ->then(function($v) { return array('name' => $v); })
                                ->end()
                                ->children()
                                    ->scalarNode('name')->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('localizationModules')
                            ->prototype('array')
                                ->treatNullLike(array())
                                ->beforeNormalization()
                                    ->ifString()
                                    ->then(function($v) { return array('name' => $v); })
                                ->end()
                                ->children()
                                    ->scalarNode('name')->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('publicPaths')
                            ->prototype('scalar')
                                ->treatNullLike(array())
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end()
          ;
    }

    protected function addInstallSection(ArrayNodeDefinition $rootNode)
    {
        $rootNode
            ->children()
                ->arrayNode('install')
                    ->canBeUnset()
                    ->children()
                        ->scalarNode('app_version')->end()
                        ->scalarNode('public_dir')->end()
                        ->arrayNode('public_mappings')
                            ->prototype('array')
                                ->treatNullLike(array())
                                ->children()
                                    ->scalarNode('location')->end()
                                    ->scalarNode('directory')->end()
                                ->end()
                            ->end()
                        ->end()
                        ->arrayNode('shrinksafe')
                            ->children()
                                ->scalarNode('buildscripts_dir')->end()
                                ->scalarNode('release_name')->end()
                                ->scalarNode('release_dir')->end()
                                ->scalarNode('build_version')->end()
                                ->arrayNode('profileData')
                                    ->children()
                                        ->arrayNode('prefixes')
                                            ->prototype('array')
                                                ->treatNullLike(array())
                                                ->children()
                                                    ->scalarNode('ns')->end()
                                                    ->scalarNode('path')->end()
                                                ->end()
                                            ->end()
                                        ->end()
                                        ->arrayNode('layers')
                                            ->prototype('array')
                                                ->treatNullLike(array())
                                                ->children()
                                                    ->scalarNode('name')->end()
                                                    ->scalarNode('resourceName')->end()
                                                    ->scalarNode('copyrightFile')->end()
                                                    ->arrayNode('dependencies')
                                                        ->prototype('array')
                                                            ->beforeNormalization()
                                                                ->ifString()
                                                                ->then(function($v) { return array('module' => $v); })
                                                            ->end()
                                                            ->treatNullLike(array())
                                                            ->children()
                                                                ->scalarNode('module')->end()
                                                            ->end()
                                                        ->end()
                                                    ->end()
                                                ->end()
                                            ->end()
                                        ->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end()
        ;
    }

    protected function addApiSection(ArrayNodeDefinition $rootNode)
    {
        $rootNode
            ->children()
                ->arrayNode('api')
                    ->canBeUnset()
                    ->children()
                        ->arrayNode('namespaces')->end()
                    ->end()
                ->end()
            ->end()
        ;
    }

    protected function addStaticCacheSection(ArrayNodeDefinition $rootNode)
    {
        $rootNode
            ->children()
                ->arrayNode('static_cache')
                    ->canBeUnset()
                    ->children()
                        ->scalarNode('enabled')->end()
                        ->arrayNode('routes')
                            ->useAttributeAsKey('route')
                            ->prototype('array')
                                ->children()
                                    ->scalarNode('cachePattern')->end()
                                    ->arrayNode('dependencies')
                                        ->prototype('array')
                                            ->treatNullLike(array())
                                            ->children()
                                                ->scalarNode('class')->end()
                                                ->arrayNode('properties')
                                                    ->prototype('scalar')->end()
                                                ->end()
                                                ->arrayNode('filter')
                                                    ->useAttributeAsKey('property')
                                                    ->prototype('scalar')->end()
                                                ->end()
                                            ->end()
                                        ->end()
                                    ->end()
                                    ->arrayNode('clearingEvents')
                                        ->prototype('array')
                                            ->treatNullLike(array())
                                            ->children()
                                                ->scalarNode('event')->end()
                                                ->arrayNode('filter')
                                                    ->useAttributeAsKey('property')
                                                    ->prototype('scalar')->end()
                                                ->end()
                                            ->end()
                                        ->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end()
        ;
    }

}
