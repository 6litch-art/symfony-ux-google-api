var Encore = require('@symfony/webpack-encore');

Encore
    .setOutputPath('./src/Resources/public/')
    .setPublicPath('/bundles/google-api')
    .setManifestKeyPrefix('.')

    .cleanupOutputBeforeBuild()

    .enableSassLoader((options) => {
        options.sassOptions = {
            quietDeps: true
        };
    })

    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(false)

    .configureCssMinimizerPlugin((options) => {
        options.minimizerOptions = { preset: ['default', { svgo: false }] };
    })

    .disableSingleRuntimeChunk()

    // Use external jQuery instead of bundling it
    .addExternals({
        jquery: 'jQuery'
    })

    .addEntry('maps', './assets/maps.js')
    .addEntry('analytics', './assets/analytics.js')
    .addEntry('recaptcha', './assets/recaptcha.js')
    .addEntry('tag_manager', './assets/tag_manager.js');

module.exports = Encore.getWebpackConfig();
