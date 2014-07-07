<?php

namespace Geonef\PloomapBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;

/**
 * GeonefPloomapBundle Extension configuration structure.
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
        $rootNode = $treeBuilder->root('ploomap');

        $this->addGeoCacheSection($rootNode);

        return $treeBuilder->buildTree();
    }

    protected function addGeoCacheSection(ArrayNodeDefinition $rootNode)
    {
      //->useAttributeAsKey('name')
      //->treatFalseLike(array('mapping' => false))
      //->performNoDeepMerging()
      //->scalarNode('mapping')->defaultValue(true)->end()

        $rootNode
            ->children()
                ->arrayNode('geocache')
                    ->children()
                        ->scalarNode('local_wms_domain')->defaultValue(null)->end()
                    ->end()
                ->end()
            ->end()
          ;
    }

}
