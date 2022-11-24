<?php

namespace Google\DependencyInjection;

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
        $this->treeBuilder = new TreeBuilder('google');

        $rootNode = $this->treeBuilder->getRootNode();
        $this->addTagManagerOptions($rootNode);
        $this->addAnalyticsOptions($rootNode);
        $this->addRecaptchaOptions($rootNode);
        $this->addMapsOptions($rootNode);

        return $this->treeBuilder;
    }

    private $treeBuilder;
    public function getTreeBuilder() : TreeBuilder { return $this->treeBuilder; }

    private function addRecaptchaOptions(ArrayNodeDefinition $rootNode)
    {
        $rootNode->children()
            ->arrayNode('recaptcha')
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
                ->scalarNode('onload')
                    ->info('On load function called when recaptche required')
                    ->defaultValue("onGoogleLoad")
                    ->end()
                ->arrayNode('form_themes')
                    ->addDefaultChildrenIfNoneSet()
                        ->prototype('scalar')
                        ->defaultValue('@Gr/form/form_div_layout.html.twig')
                        ->end()
                    ->end()
                ->arrayNode('apiv2')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->scalarNode('sitekey')
                            ->info('Client key (might be displayed, must use HTTP referrer restriction)')
                            ->defaultValue("6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI")
                            ->end()
                        ->scalarNode('secret')
                            ->info('Secret key (not shown)')
                            ->defaultValue("6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe")
                            ->end()
                        ->integerNode('min_attempts')
                            ->info('Minimum number of attempts before securing the page form')
                            ->defaultValue(5)
                            ->end()
                    ->end()
                ->end()
                ->arrayNode('apiv3')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->scalarNode('sitekey')
                            ->info('Client key (might be displayed, must use HTTP referrer restriction)')
                            ->defaultValue("")
                        ->end()
                        ->scalarNode('secret')
                            ->info('Secret key (not shown)')
                            ->defaultValue("")
                        ->end()
                        ->integerNode('min_attempts')
                            ->info('Minimum number of attempts before securing the page form')
                            ->defaultValue(0)
                        ->end()
                        ->scalarNode('score_threshold')
                            ->info('Server key (not shown)')
                            ->defaultValue("")
                        ->end()
                    ->end()
            ->end()
        ->end();
    }

    private function addMapsOptions(ArrayNodeDefinition $rootNode)
    {
        $rootNode->children()
            ->arrayNode('maps')
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
                ->scalarNode('cache_quality')
                    ->info('Cache quality (works for JPEG and WEBP)')
                    ->defaultValue(0.92)
                    ->end()
                ->scalarNode('cache_format')
                    ->info('Cache output format')
                    ->defaultValue("jpeg")
                    ->end()
                ->scalarNode('cache')
                    ->info('Place to store cache')
                    ->end()
                ->scalarNode('cache_pool')
                    ->info('Cache pool')
                    ->defaultValue("google")
                    ->end()
                ->scalarNode('cache_public')
                    ->info('Public place to store cache')
                    ->defaultValue("storage/default/google")
                    ->end()
                ->scalarNode('cache_only')
                    ->info('Cache only (display no-image if true)')
                    ->defaultValue(false)
                    ->end()
                ->scalarNode('cache_lifetime')
                    ->info('Cache lifetime')
                    ->defaultValue(86400)
                    ->end()
                ->scalarNode('cache_tilesize')
                    ->info('Cache maxtile size')
                    ->defaultValue(512)
                    ->end()
                ->scalarNode('cache_control')
                    ->info('Cache control for manual deletion')
                    ->defaultValue("ROLE_ADMIN")
                    ->end()
                ->scalarNode('stylesheet')
                    ->info('Google Maps custom CSS stylesheet')
                    ->defaultValue("")
                    ->end()
                ->scalarNode('callback')
                    ->info('Init callback function')
                    ->defaultValue("initMap")
                    ->end()
                ->scalarNode('libraries')
                    ->info('Additional libraries')
                    ->defaultValue("")
                    ->end()
                ->scalarNode('version')
                    ->info('Google Map API Version')
                    ->defaultValue("weekly")
                    ->end()
                ->scalarNode('secret')
                    ->info('Secret for signature (not shown)')
                    ->defaultValue("")
                    ->end()
                ->arrayNode('apikey')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->scalarNode('client')
                            ->info('Client key (might be displayed, must use HTTP referrer restriction)')
                            ->defaultValue("")
                            ->end()
                        ->scalarNode('server')
                            ->info('Server key (not shown)')
                            ->defaultValue("")
                            ->end()
                        ->end()
            ->end()
        ->end();
    }

    private function addAnalyticsOptions(ArrayNodeDefinition $rootNode)
    {
        $dataPath = dirname(__DIR__, 5)."/data";

        $rootNode
            ->children()
                ->arrayNode('analytics')
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
                    ->scalarNode('json')
                        ->info('JSON key location')
                        ->defaultValue($dataPath."/google-analytics-api.json")
                        ->end()
                    ->scalarNode('view_id')
                        ->info('View #ID to load (can be set later)')
                        ->defaultValue('')
                        ->end()
                    ->scalarNode('server_url')
                        ->info('View #ID to load (can be set later)')
                        ->defaultValue('https://www.googletagmanager.com')
                        ->end()
                ->end()
            ->end()
        ;
    }

    private function addTagManagerOptions(ArrayNodeDefinition $rootNode)
    {
        $rootNode
            ->children()
                ->arrayNode('tag_manager')
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
            ->end()
        ;
    }
}