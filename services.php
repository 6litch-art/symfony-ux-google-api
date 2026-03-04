<?php

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\DependencyInjection\Reference;

return static function (ContainerConfigurator $container): void {
    $services = $container->services();

    $services->defaults()
        ->public(false);

    /*
     * Google Analytics API
     */
    $services->set('ga.controller', Google\Controller\GaController::class)
        ->public(true)
        ->call('setContainer', [new Reference('service_container')])
        ->tag('controller.service_arguments')
        ->arg(0, new Reference('ga.service'));

    $services->set('ga.cache_warmer', Google\DependencyInjection\CacheWarmer::class)
        ->tag('kernel.cache_warmer')
        ->arg(0, new Reference('ga.service'));

    $services->set('ga.service', Google\Service\GaService::class)
        ->arg(0, new Reference('parameter_bag'))
        ->arg(1, new Reference('cache.adapter'));

    $services->set('ga.listener', Google\Subscriber\GaListener::class)
        ->tag('kernel.event_listener', [
            'event' => 'kernel.request',
            'method' => 'onKernelRequest',
        ])
        ->tag('kernel.event_listener', [
            'event' => 'kernel.response',
            'method' => 'onKernelResponse',
        ])
        ->arg(0, new Reference('request_stack'))
        ->arg(1, new Reference('parameter_bag'))
        ->arg(2, new Reference('twig'));

    /*
     * Google Tag Manager API
     */
    $services->set('gtm.service', Google\Service\GtmService::class)
        ->arg(0, new Reference('parameter_bag'));

    $services->set(Google\Inspector\DataCollector::class)
        ->tag('data_collector', ['id' => 'gtm'])
        ->arg(0, new Reference('parameter_bag'));

    $services->set('gtm.listener', Google\Subscriber\GtmListener::class)
        ->tag('kernel.event_listener', [
            'event' => 'kernel.request',
            'method' => 'onKernelRequest',
            'priority' => 128,
        ])
        ->tag('kernel.event_listener', [
            'event' => 'kernel.response',
            'method' => 'onKernelResponse',
        ])
        ->arg(0, new Reference('request_stack'))
        ->arg(1, new Reference('parameter_bag'))
        ->arg(2, new Reference('twig'));

    /*
     * Google Maps API
     */
    $services->set('gm.builder', Google\Builder\GmBuilder::class)
        ->arg(0, new Reference('kernel'))
        ->arg(1, new Reference('twig'))
        ->arg(2, new Reference('cache.adapter'))
        ->arg(3, new Reference('flysystem.adapter.lazy.factory'))
        ->arg(4, new Reference('request_stack'))
        ->arg(5, new Reference('security.helper'))
        ->arg(6, new Reference('security.csrf.token_manager'));

    // Optional: alias for interface
    $services->alias(Google\Builder\GmBuilderInterface::class, 'gm.builder');

    $services->set(Google\Controller\GmController::class)
        ->tag('controller.service_arguments')
        ->tag('container.service_subscriber')
        ->call('setContainer', [new Reference('Psr\Container\ContainerInterface')])
        ->arg(0, new Reference('gm.builder'));

    $services->set('gm.twig_extension', Google\Twig\GmTwigExtension::class)
        ->tag('twig.extension');

    $services->set('gm.listener', Google\Subscriber\GmListener::class)
        ->tag('kernel.event_listener', [
            'event' => 'kernel.response',
            'method' => 'onKernelResponse',
        ])
        ->arg(0, new Reference('parameter_bag'))
        ->arg(1, new Reference('twig'))
        ->arg(2, new Reference('request_stack'));

    /*
     * Google ReCaptcha API
     */
    $services->set('gr.service', Google\Service\GrService::class)
        ->tag('twig.runtime')
        ->arg(0, new Reference('kernel'))
        ->arg(1, new Reference('twig'))
        ->arg(2, new Reference('parameter_bag'))
        ->arg(3, new Reference('request_stack'))
        ->arg(4, new Reference('cache.adapter'));

    $services->set(Google\Controller\GrController::class)
        ->arg(0, new Reference('gr.service'));

    $services->set(Google\Validator\Constraints\CaptchaValidator::class)
        ->tag('validator.constraint_validator')
        ->arg(0, new Reference('gr.service'));

    $services->set(Google\Form\Type\ReCaptchaV2Type::class)
        ->tag('form.type')
        ->arg(0, new Reference('gr.service'));

    $services->set(Google\Form\Type\ReCaptchaV3Type::class)
        ->tag('form.type')
        ->arg(0, new Reference('gr.service'));

    $services->set(Google\Form\Extension\FormTypeCaptchaExtension::class)
        ->tag('form.type_extension')
        ->arg(0, new Reference('gr.service'))
        ->arg(1, new Reference('validator'))
        ->arg(2, new Reference('translator'))
        ->arg(3, new Reference('EasyCorp\Bundle\EasyAdminBundle\Provider\AdminContextProvider'));

    $services->set(Google\Subscriber\CaptchaSubscriber::class)
        ->tag('kernel.event_subscriber')
        ->arg(0, new Reference('gr.service'))
        ->arg(1, new Reference('validator'))
        ->arg(2, new Reference('translator'));

    $services->set(Google\Subscriber\GrListener::class)
        ->tag('kernel.event_listener', [
            'event' => 'kernel.response',
            'method' => 'onKernelResponse',
        ])
        ->arg(0, new Reference('request_stack'))
        ->arg(1, new Reference('parameter_bag'))
        ->arg(2, new Reference('twig'));
};