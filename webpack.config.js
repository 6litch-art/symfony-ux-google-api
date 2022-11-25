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

    // uncomment if you're having problems with a jQuery plugin
    .autoProvidejQuery()

    .addEntry('maps', './assets/maps.js')
    .addEntry('analytics', './assets/analytics.js')
    .addEntry('recaptcha', './assets/recaptcha.js')
    .addEntry('tag_manager', './assets/tag_manager.js');

module.exports = Encore.getWebpackConfig();
