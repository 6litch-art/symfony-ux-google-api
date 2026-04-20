import "@glitchr/html2canvas";
import "./styles/js/tilemap.js";

// jQuery plugin wrapper for html2canvas with tiling support
const html2canvasPlugin = function(container, opts = {}, onrenderedCallback = null) {
    const $ = this.constructor;
    if (this.length === 0) return this;

    const element = $(container).length > 0 ? $(container)[0] : this[0];
    const insert = opts.insert || 'append';

    const options = {
        ...opts,
        onrendered: function(canvas) {
            if (onrenderedCallback && typeof onrenderedCallback === 'function') {
                onrenderedCallback(canvas);
            } else {
                if (insert === 'prepend') {
                    $(element).prepend(canvas);
                } else {
                    $(element).append(canvas);
                }
            }
        }
    };

    delete options.insert;
    window.html2canvas(element, options);
    return this;
};

// Register plugin on global jQuery (loaded from CDN)
if (window.jQuery) window.jQuery.fn.html2canvas = html2canvasPlugin;
if (window.$) window.$.fn.html2canvas = html2canvasPlugin;
