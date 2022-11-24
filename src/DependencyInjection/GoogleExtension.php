<?php

namespace Google\DependencyInjection;
use Google\Service\GtmService;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\XmlFileLoader;

use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

class GoogleExtension extends Extension
{
    /**
     * {@inheritdoc}
     */

    public function load(array $configs, ContainerBuilder $container)
    {
        //
        // Load service declaration (includes services, controllers,..)

        // Format XML
        $loader = new XmlFileLoader($container, new FileLocator(\dirname(__DIR__, 2).'/config'));
        $loader->load('services.xml');
        $loader->load('services-public.xml');

        //
        // Configuration file: ./config/package/Gtm_bundle.yaml
        $processor = new Processor();
        $configuration = new Configuration();
        $config = $processor->processConfiguration($configuration, $configs);
        $this->setConfiguration($container, $config, $configuration->getTreeBuilder()->getRootNode()->getNode()->getName());

        //
        // Alias declaration
        $container->setAlias(GaService::class, 'ga.service')->setPublic(true);
        $container->setAlias(GaController::class, 'ga.controller')->setPublic(true);
        $container->setAlias(GtmService::class, 'gtm.service')->setPublic(true);
        $container->setAlias(GmBuilder::class, 'gm.builder');
        $container->setAlias(GmBuilderInterface::class, 'gm.builder');

        $container->setParameter('twig.form.resources', array_merge(
            $config["form_themes"],
            $container->getParameter('twig.form.resources')
        ));
    }

    public function setConfiguration(ContainerBuilder $container, array $config, $globalKey = "")
    {
        foreach($config as $key => $value) {

            if (!empty($globalKey)) $key = $globalKey.".".$key;

            if (is_array($value)) $this->setConfiguration($container, $value, $key);
            else $container->setParameter($key, $value);
        }
    }
}
