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

// Register plugin on global jQuery. This file is injected into <head> (see
// GmListener) with `defer`, while window.jQuery/window.$ are only set by the
// consuming app's own entry files (app-async.js/app-defer.js), which - also
// deferred - can render later in the document (e.g. near the end of <body>).
// Deferred scripts execute in DOCUMENT ORDER, not load-completion order, so a
// one-shot "if (window.jQuery)" check at parse time can silently run before
// jQuery exists and never retry - exactly why tilemap.js (bundled in this
// same entry) waits for the 'load' event instead of checking synchronously.
// Attempt immediately (covers the case where jQuery happens to already be
// on window) AND again on 'load' (guaranteed safe timing), same as tilemap.js.
function registerHtml2CanvasPlugin() {
    var $ = window.jQuery || window.$;
    if ($ && !$.fn.html2canvas) $.fn.html2canvas = html2canvasPlugin;
}
registerHtml2CanvasPlugin();
window.addEventListener('load', registerHtml2CanvasPlugin);
