var Encore = require('@symfony/webpack-encore');

Encore
    .setOutputPath('./src/Resources/public/')
    .setPublicPath('/bundles/google-api')
    .setManifestKeyPrefix('.')

    .cleanupOutputBeforeBuild()
    .enableSassLoader()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    
    .configureCssMinimizerPlugin((options) => {
        options.minimizerOptions = { preset: ['default', { svgo: false }] };
    })

    .disableSingleRuntimeChunk()

    // enables and configure @babel/preset-env polyfills
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = '3.23';
    })

    // uncomment if you're having problems with a jQuery plugin
    .autoProvidejQuery()

    .addEntry('google.maps', './assets/google.maps.js')
    .addEntry('google.analytics', './assets/google.analytics.js')
    .addEntry('google.recaptcha', './assets/google.recaptcha.js')
    .addEntry('google.tag_manager', './assets/google.tag_manager.js');

module.exports = Encore.getWebpackConfig();
