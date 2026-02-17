# Glitchr UX Google

Google Maps integration with html2canvas support for Symfony applications.

## Requirements

- jQuery 3.0+ must be loaded globally before this bundle's scripts
- Symfony Webpack Encore for asset compilation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build assets:
```bash
make assets APP_DEBUG=0
# or
npm run prod
```

## jQuery Configuration

**Important:** This package expects jQuery to be available globally as `window.jQuery` and `window.$`.

### In your main application

Make sure your `webpack.config.js` treats jQuery as an external dependency:

```javascript
Encore
    .addExternals({
        jquery: 'jQuery'
    })
```

And load jQuery from CDN in your base template **before** loading this bundle's scripts:

```html
<script src="https://code.jquery.com/jquery-3.6.2.min.js"></script>
<script src="/bundles/google/maps.js"></script>
```

## Usage

### In Twig templates:

```twig
{{ google_maps("myMap", {
    "html2canvas": true,
    "style": "height:400px; width:100%;"
}) }}
```

### Export/Suppress buttons:

```twig
{{ google_maps_export("myMap", {
    "text": "Export"
}) }}

{{ google_maps_suppress("myMap", {
    "text": "×"
}) }}
```

### jQuery Plugin API

The bundle provides a jQuery plugin for html2canvas:

```javascript
$('#myMap').html2canvas('#myMap', {
    insert: 'prepend'
}, function(canvas) {
    // Callback when canvas is ready
    console.log('Canvas generated:', canvas);
});
```

## Troubleshooting

### `$.fn.html2canvas is not a function`

This error means jQuery was not loaded before maps.js, or jQuery is being replaced after maps.js loads.

**Solution:**
1. Ensure jQuery is loaded from CDN in your base template
2. Configure Webpack to use external jQuery (see "jQuery Configuration" above)
3. Don't import jQuery in your bootstrap.js or other entry files

## License

LGPL-3.0-or-later
