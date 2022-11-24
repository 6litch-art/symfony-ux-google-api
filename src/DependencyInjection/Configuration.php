<?php

namespace Google\Tag\Manager\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;

class Configuration implements ConfigurationInterface
{
    /**
     * @inheritdoc
     */
    public function getConfigTreeBuilder() : TreeBuilder
    {
        $this->treeBuilder = new TreeBuilder('gtm');

        $rootNode = $this->treeBuilder->getRootNode();
        $this->addGlobalOptionsSection($rootNode);

        return $this->treeBuilder;
    }

    private $treeBuilder;
    public function getTreeBuilder() : TreeBuilder { return $this->treeBuilder; }

    private function addGlobalOptionsSection(ArrayNodeDefinition $rootNode)
    {
        $rootNode
            ->children()
                ->booleanNode('enable')
                    ->info('Enable feature')
                    ->defaultValue(True)
                ->end()
                ->booleanNode('enable_on_admin')
                    ->info('Enable feature')
                    ->defaultValue(False)
                ->end()
                ->booleanNode('autoappend')
                    ->info('Auto-append required dependencies into HTML page')
                    ->defaultValue(True)
                    ->end()

                ->arrayNode('containers')
                    ->useAttributeAsKey('name')
                    ->defaultValue([
                        "name" => "default",
                        "type" => "web",
                        "id"   => null,
                        "url"  => 'https://www.googletagmanager.com'
                    ])
                    ->arrayPrototype()
                        ->children()
                            ->scalarNode("name")
                            ->end()
                            ->scalarNode("id")
                                ->isRequired()
                            ->end()
                            ->scalarNode("url")
                                ->info('Server container url')
                                ->defaultValue('https://www.googletagmanager.com')
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end()
        ;
    }
}