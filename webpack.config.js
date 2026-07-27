var Encore = require('@symfony/webpack-encore');

Encore
    // The consuming app's public/bundles/google symlink (assets:install,
    // named from the Bundle's short name "Google") resolves to ./public/ -
    // this must match, or a rebuild silently writes to a directory nothing
    // actually serves while the live site keeps the old compiled output.
    .setOutputPath('./public/')
    .setPublicPath('/bundles/google')
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
