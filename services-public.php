<?php

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $container): void {
    $services = $container->services();

    $services->defaults()
        ->public(true);

    // REAL definitions
    $services->set(Google\Service\GrService::class);
    $services->set(Google\Validator\Constraints\CaptchaValidator::class);
    $services->set(Google\Builder\GmBuilder::class);

    // Aliases
    $services->alias('gr.service', Google\Service\GrService::class);
    $services->alias('gr.validator', Google\Validator\Constraints\CaptchaValidator::class);
    $services->alias('gm.builder', Google\Builder\GmBuilder::class);
    $services->alias(Google\Builder\GmBuilderInterface::class, Google\Builder\GmBuilder::class);
};