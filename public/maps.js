/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/styles/js/tilemap.js"
/*!*************************************!*\
  !*** ./assets/styles/js/tilemap.js ***!
  \*************************************/
() {

// Container-level visibility gate. Without this, every .google-tilemap in the
// DOM gets its tile <span>s created at module init — and each tile then
// requests its background-image as soon as IntersectionObserver decides it's
// in viewport. For maps that are display:none in night mode (or otherwise
// hidden via parent CSS), the tile geometry can still satisfy the
// intersection test depending on the layout, triggering N tile webp requests
// for content the user can never see.
//
// The IntersectionObserver-on-the-container approach is more conservative
// than a one-shot getComputedStyle() check: it handles tabs/accordions that
// reveal the map later (lazy reveal), AND it doesn't run any work for maps
// that the user never scrolls to. `rootMargin: 200px` pre-warms the map ~1
// viewport before it's actually visible, balancing perceived responsiveness
// against bandwidth waste.
function _gmTilemapShouldInit(el) {
  if (!el.isConnected) return false;
  var style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  // offsetParent === null when the element or an ancestor is display:none.
  // Position:fixed elements have null offsetParent but ARE rendered, so
  // exempt those.
  if (el.offsetParent === null && style.position !== 'fixed') return false;
  return true;
}
function initTileMap() {
  var $ = window.jQuery || window.$;
  if (!$) return; // jQuery not yet attached to window; safe no-op
  var container = document.querySelectorAll(".google-tilemap");

  // Container-level IntersectionObserver gate: only run per-container tile
  // setup once the container is near the viewport AND actually visible
  // (offsetParent / computed display checks). Containers that are display:none
  // or off-screen-far never trigger the per-tile network requests.
  if ("IntersectionObserver" in window) {
    var containerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!_gmTilemapShouldInit(entry.target)) return;
        if (entry.target.dataset.gmTilemapInitialized === '1') return;
        entry.target.dataset.gmTilemapInitialized = '1';
        containerObserver.unobserve(entry.target);
        _initTileMapContainer(entry.target, $);
      });
    }, {
      rootMargin: '200px'
    });
    for (var i = 0; i < container.length; i++) {
      if (container[i].dataset.gmTilemapInitialized === '1') continue;
      containerObserver.observe(container[i]);
    }
    return;
  }

  // No IntersectionObserver support: init synchronously (legacy path).
  for (var j = 0; j < container.length; j++) {
    if (container[j].dataset.gmTilemapInitialized === '1') continue;
    container[j].dataset.gmTilemapInitialized = '1';
    _initTileMapContainer(container[j], $);
  }
}
function _initTileMapContainer(el, $) {
  if (el.tagName != "DIV") throw "Element passed through gm_tilemap() must be a div";
  if (el == document) el = document.documentElement;
  if (el == window) el = document.documentElement;
  $(el).css("object-fit", "cover");
  $(el).css("position", "relative");
  $(el).css("top", "50%");
  $(el).css("left", "50%");
  $(el).css("transform", "translate(-50%, -50%)");
  $(el).css("width", "100%");
  $(el).css("height", "100%");
  var src = el.getAttribute("data-src");
  var signature = el.getAttribute("data-signature");
  var tilesize = parseInt(el.getAttribute("data-tilesize")) || null;
  var resolution = 2;
  var xtiles = parseInt(el.getAttribute("data-xtiles"));
  var ytiles = parseInt(el.getAttribute("data-ytiles"));
  // var missing   = el.getAttribute("data-missing");

  el.addEventListener("lazyload.gm_tilemap", function () {
    var lazyBackgrounds = el.querySelectorAll("[data-background-image]");
    if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
      var lazyBackgroundObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (entry.target.dataset.backgroundImage) {
              var preloaderImg = document.createElement("img");
              preloaderImg.src = entry.target.dataset.backgroundImage;
              preloaderImg.addEventListener('load', function (event) {
                entry.target.style.backgroundImage = "url('" + event.target.src + "')";
                entry.target.style.opacity = "1";
                preloaderImg = null;
              });
            }
            entry.target.removeAttribute("data-background-image");
            lazyBackgroundObserver.unobserve(entry.target);
          }
        });
      });
      lazyBackgrounds.forEach(function (lazyBackground) {
        lazyBackgroundObserver.observe(lazyBackground);
      });
    }
  });
  function objectFit(contains /* true = contain, false = cover */, containerWidth, containerHeight, width, height) {
    var doRatio = width / height;
    var cRatio = containerWidth / containerHeight;
    var targetWidth = 0;
    var targetHeight = 0;
    var test = contains ? doRatio > cRatio : doRatio < cRatio;
    if (test) {
      targetWidth = containerWidth;
      targetHeight = targetWidth / doRatio;
    } else {
      targetHeight = containerHeight;
      targetWidth = targetHeight * doRatio;
    }
    return {
      width: targetWidth,
      height: targetHeight,
      left: (contains ? -1 : 1) * (containerWidth - targetWidth) / 2,
      top: (contains ? -1 : 1) * (containerHeight - targetHeight) / 2
    };
  }
  var width = xtiles * tilesize / resolution;
  var height = ytiles * tilesize / resolution;
  var tile = objectFit(true, width, height, el.clientWidth, el.clientHeight);
  if (tile.width == width) tile = objectFit(false, width, height, el.clientWidth, el.clientHeight);
  var elTile = $(el).find("span");
  for (iy = 0; iy < ytiles; iy++) {
    for (ix = 0; ix < xtiles; ix++) {
      var tileW = Math.floor(tile.width / xtiles);
      var tileH = Math.floor(tile.height / ytiles);
      var tileSize = Math.max(tileW, tileH);
      var index = iy * xtiles + ix;
      if (elTile[index] === undefined) {
        elTile[index] = document.createElement("span");
        var tmp_src = decodeURI(src);
        if (tmp_src.indexOf("{signature}")) tmp_src = tmp_src.replaceAll("{signature}", signature);else tmp_src += "/" + signature;
        if (tmp_src.indexOf("{id}")) tmp_src = tmp_src.replaceAll("{id}", index);else tmp_src += "/" + index;
        elTile[index].setAttribute("id", el.getAttribute("id") + "_" + index);
        elTile[index].setAttribute("data-background-image", tmp_src); //url('"+missing+"')
        elTile[index].style.opacity = "0";
        var rnd = (Math.random() * 0.5).toFixed(2);
        elTile[index].style.transition = "opacity 0.5s ease " + rnd + "s";
        el.append(elTile[index]);
      }
      var left = tile.left + ix * tileSize;
      var top = tile.top + iy * tileSize;
      var _width = ix === xtiles - 1 ? tile.width - tileSize * ix : tileSize;
      var _height = iy === ytiles - 1 ? tile.height - tileSize * iy : tileSize;
      elTile[index].style.position = "absolute";
      elTile[index].style.left = left + "px";
      elTile[index].style.top = top + "px";
      elTile[index].style.width = _width + 0.1 + "px";
      elTile[index].style.height = _height + 0.1 + "px";
      elTile[index].style.backgroundSize = _width + 0.1 + "px " + (_height + 0.1) + "px";
      el.dispatchEvent(new Event("lazyload.gm_tilemap"));
    }
  }
}
window.addEventListener('load', initTileMap);
window.addEventListener('resize', initTileMap);
// Transparent swaps content via AJAX without firing window 'load', so re-init tiles afterward.
window.addEventListener('transparent:ready', initTileMap);
window.addEventListener('transparent:postactive', initTileMap);

/***/ },

/***/ "./node_modules/@glitchr/html2canvas/src/index.js"
/*!********************************************************!*\
  !*** ./node_modules/@glitchr/html2canvas/src/index.js ***!
  \********************************************************/
() {

/*
  html2canvas-dpi 0.4.9 <http://html2canvas.hertzen.com>
  Copyright (c) 2020 Niklas von Hertzen

  Released under MIT License
*/

(function (window, document, undefined) {

  "use strict";

  var _html2canvas = {},
    previousElement,
    computedCSS;

  _html2canvas.Util = {};

  _html2canvas.Util.log = function (a) {
    if (_html2canvas.logging && window.console && window.console.log) {
      window.console.log(a);
    }
  };

  _html2canvas.Util.trimText = (function (isNative) {
    return function (input) {
      return isNative ? isNative.apply(input) : ((input || '') + '').replace(/^\s+|\s+$/g, '');
    };
  })(String.prototype.trim);

  _html2canvas.Util.asFloat = function (v) {
    return parseFloat(v);
  };

  (function () {
    // TODO: support all possible length values
    var TEXT_SHADOW_PROPERTY = /((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g;
    var TEXT_SHADOW_VALUES = /(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g;
    _html2canvas.Util.parseTextShadows = function (value) {
      if (!value || value === 'none') {
        return [];
      }

      // find multiple shadow declarations
      var shadows = value.match(TEXT_SHADOW_PROPERTY),
        results = [];
      for (var i = 0; shadows && (i < shadows.length); i++) {
        var s = shadows[i].match(TEXT_SHADOW_VALUES);
        results.push({
          color: s[0],
          offsetX: s[1] ? s[1].replace('px', '') : 0,
          offsetY: s[2] ? s[2].replace('px', '') : 0,
          blur: s[3] ? s[3].replace('px', '') : 0
        });
      }
      return results;
    };
  })();


  _html2canvas.Util.parseBackgroundImage = function (value) {
    var whitespace = ' \r\n\t',
      method, definition, prefix, prefix_i, block, results = [],
      c, mode = 0,
      numParen = 0,
      quote, args;

    var appendResult = function () {
      if (method) {
        if (definition.substr(0, 1) === '"') {
          definition = definition.substr(1, definition.length - 2);
        }
        if (definition) {
          args.push(definition);
        }
        if (method.substr(0, 1) === '-' &&
          (prefix_i = method.indexOf('-', 1) + 1) > 0) {
          prefix = method.substr(0, prefix_i);
          method = method.substr(prefix_i);
        }
        results.push({
          prefix: prefix,
          method: method.toLowerCase(),
          value: block,
          args: args
        });
      }
      args = []; //for some odd reason, setting .length = 0 didn't work in safari
      method =
        prefix =
        definition =
        block = '';
    };

    appendResult();
    for (var i = 0, ii = value.length; i < ii; i++) {
      c = value[i];
      if (mode === 0 && whitespace.indexOf(c) > -1) {
        continue;
      }
      switch (c) {
        case '"':
          if (!quote) {
            quote = c;
          } else if (quote === c) {
            quote = null;
          }
          break;

        case '(':
          if (quote) {
            break;
          } else if (mode === 0) {
            mode = 1;
            block += c;
            continue;
          } else {
            numParen++;
          }
          break;

        case ')':
          if (quote) {
            break;
          } else if (mode === 1) {
            if (numParen === 0) {
              mode = 0;
              block += c;
              appendResult();
              continue;
            } else {
              numParen--;
            }
          }
          break;

        case ',':
          if (quote) {
            break;
          } else if (mode === 0) {
            appendResult();
            continue;
          } else if (mode === 1) {
            if (numParen === 0 && !method.match(/^url$/i)) {
              args.push(definition);
              definition = '';
              block += c;
              continue;
            }
          }
          break;
      }

      block += c;
      if (mode === 0) {
        method += c;
      } else {
        definition += c;
      }
    }
    appendResult();

    return results;
  };

  _html2canvas.Util.Bounds = function (element) {
    var clientRect, bounds = {};

    if (element.getBoundingClientRect) {
      clientRect = element.getBoundingClientRect();

      // TODO add scroll position to bounds, so no scrolling of window necessary
      bounds.top = clientRect.top;
      bounds.bottom = clientRect.bottom || (clientRect.top + clientRect.height);
      bounds.left = clientRect.left;

      bounds.width = element.offsetWidth;
      bounds.height = element.offsetHeight;
    }

    return bounds;
  };

  // TODO ideally, we'd want everything to go through this function instead of Util.Bounds,
  // but would require further work to calculate the correct positions for elements with offsetParents
  _html2canvas.Util.OffsetBounds = function (element) {
    var parent = element.offsetParent ? _html2canvas.Util.OffsetBounds(element.offsetParent) : {
      top: 0,
      left: 0
    };

    return {
      top: element.offsetTop + parent.top,
      bottom: element.offsetTop + element.offsetHeight + parent.top,
      left: element.offsetLeft + parent.left,
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  };

  function toPX(element, attribute, value) {
    var rsLeft = element.runtimeStyle && element.runtimeStyle[attribute],
      left,
      style = element.style;

    // Check if we are not dealing with pixels, (Opera has issues with this)
    // Ported from jQuery css.js
    // From the awesome hack by Dean Edwards
    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

    // If we're not dealing with a regular pixel number
    // but a number that has a weird ending, we need to convert it to pixels

    if (!/^-?[0-9]+\.?[0-9]*(?:px)?$/i.test(value) && /^-?\d/.test(value)) {
      // Remember the original values
      left = style.left;

      // Put in the new values to get a computed value out
      if (rsLeft) {
        element.runtimeStyle.left = element.currentStyle.left;
      }
      style.left = attribute === "fontSize" ? "1em" : (value || 0);
      value = style.pixelLeft + "px";

      // Revert the changed values
      style.left = left;
      if (rsLeft) {
        element.runtimeStyle.left = rsLeft;
      }
    }

    if (!/^(thin|medium|thick)$/i.test(value)) {
      return Math.round(parseFloat(value)) + "px";
    }

    return value;
  }

  function asInt(val) {
    return parseInt(val, 10);
  }

  function parseBackgroundSizePosition(value, element, attribute, index) {
    value = (value || '').split(',');
    value = value[index || 0] || value[0] || 'auto';
    value = _html2canvas.Util.trimText(value).split(' ');

    if (attribute === 'backgroundSize' && (value[0] && value[0].match(/^(cover|contain|auto)$/))) {
      return value;
    } else {
      value[0] = (value[0].indexOf("%") === -1) ? toPX(element, attribute + "X", value[0]) : value[0];
      if (value[1] === undefined) {
        if (attribute === 'backgroundSize') {
          value[1] = 'auto';
          return value;
        } else {
          // IE 9 doesn't return double digit always
          value[1] = value[0];
        }
      }
      value[1] = (value[1].indexOf("%") === -1) ? toPX(element, attribute + "Y", value[1]) : value[1];
    }
    return value;
  }

  _html2canvas.Util.getCSS = function (element, attribute, index) {
    if (previousElement !== element) {
      computedCSS = document.defaultView.getComputedStyle(element, null);
    }

    var value = computedCSS[attribute];

    if (/^background(Size|Position)$/.test(attribute)) {
      return parseBackgroundSizePosition(value, element, attribute, index);
    } else if (/border(Top|Bottom)(Left|Right)Radius/.test(attribute)) {
      var arr = value.split(" ");
      if (arr.length <= 1) {
        arr[1] = arr[0];
      }
      return arr.map(asInt);
    }

    return value;
  };

  _html2canvas.Util.resizeBounds = function (current_width, current_height, target_width, target_height, stretch_mode) {
    var target_ratio = target_width / target_height,
      current_ratio = current_width / current_height,
      output_width, output_height, output_left, output_top;

      output_left = 0;
      output_top  = 0;

      if (!stretch_mode || stretch_mode === 'auto') {
      output_width = target_width;
      output_height = target_height;
    } else if (target_ratio < current_ratio ^ stretch_mode === 'contain') {
      output_height = target_height;
      output_width = target_height * current_ratio;
    } else {
      output_width = target_width;
      output_height = target_width / current_ratio;
    }

    output_left = (target_width-output_width)/2;
    output_top = (target_height-output_height)/2;

    return {
      width : output_width,
      height: output_height,
      left  : output_left,
      top   : output_top
    };
  };

  _html2canvas.Util.BackgroundPosition = function (element, bounds, image, imageIndex, backgroundSize) {
    var backgroundPosition = _html2canvas.Util.getCSS(element, 'backgroundPosition', imageIndex),
      leftPosition,
      topPosition;
    if (backgroundPosition.length === 1) {
      backgroundPosition = [backgroundPosition[0], backgroundPosition[0]];
    }
    if (backgroundPosition[0].toString().indexOf("%") !== -1) {
      leftPosition = (bounds.width - (backgroundSize || image).width) * (parseFloat(backgroundPosition[0]) / 100);
    } else {
      leftPosition = parseInt(backgroundPosition[0], 10);
    }
    if (backgroundPosition[1] === 'auto') {
      topPosition = leftPosition / image.width * image.height;
    } else if (backgroundPosition[1].toString().indexOf("%") !== -1) {
      topPosition = (bounds.height - (backgroundSize || image).height) * parseFloat(backgroundPosition[1]) / 100;
    } else {
      topPosition = parseInt(backgroundPosition[1], 10);
    }
    if (backgroundPosition[0] === 'auto') {
      leftPosition = topPosition / image.height * image.width;
    }
    return {
      left: leftPosition,
      top: topPosition
    };
  };

  _html2canvas.Util.BackgroundSize = function (element, bounds, image, imageIndex) {
    var backgroundSize = _html2canvas.Util.getCSS(element, 'backgroundSize', imageIndex),
      width,
      height;

    if (backgroundSize.length === 1) {
      backgroundSize = [backgroundSize[0], backgroundSize[0]];
    }

    if (backgroundSize[0].toString().indexOf("%") !== -1) {
      width = bounds.width * parseFloat(backgroundSize[0]) / 100;
    } else if (backgroundSize[0] === 'auto') {
      width = image.width;
    } else {
      if (/contain|cover/.test(backgroundSize[0])) {
        var resized = _html2canvas.Util.resizeBounds(image.width, image.height, bounds.width, bounds.height, backgroundSize[0]);
        return {
          width: resized.width,
          height: resized.height
        };
      } else {
        width = parseInt(backgroundSize[0], 10);
      }
    }

    if (backgroundSize[1] === 'auto') {
      height = width / image.width * image.height;
    } else if (backgroundSize[1].toString().indexOf("%") !== -1) {
      height = bounds.height * parseFloat(backgroundSize[1]) / 100;
    } else {
      height = parseInt(backgroundSize[1], 10);
    }


    if (backgroundSize[0] === 'auto') {
      width = height / image.height * image.width;
    }

    return {
      width: width,
      height: height
    };
  };

  _html2canvas.Util.Extend = function (options, defaults) {
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        defaults[key] = options[key];
      }
    }
    return defaults;
  };


  /*
   * Derived from jQuery.contents()
   * Copyright 2010, John Resig
   * Dual licensed under the MIT or GPL Version 2 licenses.
   * http://jquery.org/license
   */
  _html2canvas.Util.Children = function (elem) {
    var children;
    try {
      children = (elem.nodeName && elem.nodeName.toUpperCase() === "IFRAME") ? elem.contentDocument || elem.contentWindow.document : (function (array) {
        var ret = [];
        if (array !== null) {
          (function (first, second) {
            var i = first.length,
              j = 0;

            if (typeof second.length === "number") {
              for (var l = second.length; j < l; j++) {
                first[i++] = second[j];
              }
            } else {
              while (second[j] !== undefined) {
                first[i++] = second[j++];
              }
            }

            first.length = i;

            return first;
          })(ret, array);
        }
        return ret;
      })(elem.childNodes);

    } catch (ex) {
      _html2canvas.Util.log("html2canvas.Util.Children failed with exception: " + ex.message);
      children = [];
    }
    return children;
  };

  _html2canvas.Util.isTransparent = function (backgroundColor) {
    return (!backgroundColor || backgroundColor === "transparent" || backgroundColor === "rgba(0, 0, 0, 0)");
  };
  _html2canvas.Util.Font = (function () {

    var fontData = {};

    return function (font, fontSize, doc) {
      if (fontData[font + "-" + fontSize] !== undefined) {
        return fontData[font + "-" + fontSize];
      }

      var container = doc.createElement('div'),
        img = doc.createElement('img'),
        span = doc.createElement('span'),
        sampleText = 'Hidden Text',
        baseline,
        middle,
        metricsObj;

      container.style.visibility = "hidden";
      container.style.fontFamily = font;
      container.style.fontSize = fontSize;
      container.style.margin = 0;
      container.style.padding = 0;

      doc.body.appendChild(container);

      // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever (handtinywhite.gif)
      img.src = "data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=";
      img.width = 1;
      img.height = 1;

      img.style.margin = 0;
      img.style.padding = 0;
      img.style.verticalAlign = "baseline";

      span.style.fontFamily = font;
      span.style.fontSize = fontSize;
      span.style.margin = 0;
      span.style.padding = 0;

      span.appendChild(doc.createTextNode(sampleText));
      container.appendChild(span);
      container.appendChild(img);
      baseline = (img.offsetTop - span.offsetTop) + 1;

      container.removeChild(span);
      container.appendChild(doc.createTextNode(sampleText));

      container.style.lineHeight = "normal";
      img.style.verticalAlign = "super";

      middle = (img.offsetTop - container.offsetTop) + 1;
      metricsObj = {
        baseline: baseline,
        lineWidth: 1,
        middle: middle
      };

      fontData[font + "-" + fontSize] = metricsObj;

      doc.body.removeChild(container);

      return metricsObj;
    };
  })();

  (function () {
    var Util = _html2canvas.Util,
      Generate = {};

    _html2canvas.Generate = Generate;

    var reGradients = [
      /^(-webkit-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
      /^(-o-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,
      /^(-webkit-gradient)\((linear|radial),\s((?:\d{1,3}%?)\s(?:\d{1,3}%?),\s(?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)\-]+)\)$/,
      /^(-moz-linear-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)]+)\)$/,
      /^(-webkit-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z\-]+)([\w\d\.\s,%\(\)]+)\)$/,
      /^(-moz-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s?([a-z\-]*)([\w\d\.\s,%\(\)]+)\)$/,
      /^(-o-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z\-]+)([\w\d\.\s,%\(\)]+)\)$/
    ];

    /*
     * TODO: Add IE10 vendor prefix (-ms) support
     * TODO: Add W3C gradient (linear-gradient) support
     * TODO: Add old Webkit -webkit-gradient(radial, ...) support
     * TODO: Maybe some RegExp optimizations are possible ;o)
     */
    Generate.parseGradient = function (css, bounds) {
      var gradient, i, len = reGradients.length,
        m1, stop, m2, m2Len, step, m3, tl, tr, br, bl;

      for (i = 0; i < len; i += 1) {
        m1 = css.match(reGradients[i]);
        if (m1) {
          break;
        }
      }

      if (m1) {
        switch (m1[1]) {
          case '-webkit-linear-gradient':
          case '-o-linear-gradient':

            gradient = {
              type: 'linear',
              x0: null,
              y0: null,
              x1: null,
              y1: null,
              colorStops: []
            };

            // get coordinates
            m2 = m1[2].match(/\w+/g);
            if (m2) {
              m2Len = m2.length;
              for (i = 0; i < m2Len; i += 1) {
                switch (m2[i]) {
                  case 'top':
                    gradient.y0 = 0;
                    gradient.y1 = bounds.height;
                    break;

                  case 'right':
                    gradient.x0 = bounds.width;
                    gradient.x1 = 0;
                    break;

                  case 'bottom':
                    gradient.y0 = bounds.height;
                    gradient.y1 = 0;
                    break;

                  case 'left':
                    gradient.x0 = 0;
                    gradient.x1 = bounds.width;
                    break;
                }
              }
            }
            if (gradient.x0 === null && gradient.x1 === null) { // center
              gradient.x0 = gradient.x1 = bounds.width / 2;
            }
            if (gradient.y0 === null && gradient.y1 === null) { // center
              gradient.y0 = gradient.y1 = bounds.height / 2;
            }

            // get colors and stops
            m2 = m1[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g);
            if (m2) {
              m2Len = m2.length;
              step = 1 / Math.max(m2Len - 1, 1);
              for (i = 0; i < m2Len; i += 1) {
                m3 = m2[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/);
                if (m3[2]) {
                  stop = parseFloat(m3[2]);
                  if (m3[3] === '%') {
                    stop /= 100;
                  } else { // px - stupid opera
                    stop /= bounds.width;
                  }
                } else {
                  stop = i * step;
                }
                gradient.colorStops.push({
                  color: m3[1],
                  stop: stop
                });
              }
            }
            break;

          case '-webkit-gradient':

            gradient = {
              type: m1[2] === 'radial' ? 'circle' : m1[2], // TODO: Add radial gradient support for older mozilla definitions
              x0: 0,
              y0: 0,
              x1: 0,
              y1: 0,
              colorStops: []
            };

            // get coordinates
            m2 = m1[3].match(/(\d{1,3})%?\s(\d{1,3})%?,\s(\d{1,3})%?\s(\d{1,3})%?/);
            if (m2) {
              gradient.x0 = (m2[1] * bounds.width) / 100;
              gradient.y0 = (m2[2] * bounds.height) / 100;
              gradient.x1 = (m2[3] * bounds.width) / 100;
              gradient.y1 = (m2[4] * bounds.height) / 100;
            }

            // get colors and stops
            m2 = m1[4].match(/((?:from|to|color-stop)\((?:[0-9\.]+,\s)?(?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)\))+/g);
            if (m2) {
              m2Len = m2.length;
              for (i = 0; i < m2Len; i += 1) {
                m3 = m2[i].match(/(from|to|color-stop)\(([0-9\.]+)?(?:,\s)?((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\)/);
                stop = parseFloat(m3[2]);
                if (m3[1] === 'from') {
                  stop = 0.0;
                }
                if (m3[1] === 'to') {
                  stop = 1.0;
                }
                gradient.colorStops.push({
                  color: m3[3],
                  stop: stop
                });
              }
            }
            break;

          case '-moz-linear-gradient':

            gradient = {
              type: 'linear',
              x0: 0,
              y0: 0,
              x1: 0,
              y1: 0,
              colorStops: []
            };

            // get coordinates
            m2 = m1[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);

            // m2[1] == 0%   -> left
            // m2[1] == 50%  -> center
            // m2[1] == 100% -> right

            // m2[2] == 0%   -> top
            // m2[2] == 50%  -> center
            // m2[2] == 100% -> bottom

            if (m2) {
              gradient.x0 = (m2[1] * bounds.width) / 100;
              gradient.y0 = (m2[2] * bounds.height) / 100;
              gradient.x1 = bounds.width - gradient.x0;
              gradient.y1 = bounds.height - gradient.y0;
            }

            // get colors and stops
            m2 = m1[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}%)?)+/g);
            if (m2) {
              m2Len = m2.length;
              step = 1 / Math.max(m2Len - 1, 1);
              for (i = 0; i < m2Len; i += 1) {
                m3 = m2[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/);
                if (m3[2]) {
                  stop = parseFloat(m3[2]);
                  if (m3[3]) { // percentage
                    stop /= 100;
                  }
                } else {
                  stop = i * step;
                }
                gradient.colorStops.push({
                  color: m3[1],
                  stop: stop
                });
              }
            }
            break;

          case '-webkit-radial-gradient':
          case '-moz-radial-gradient':
          case '-o-radial-gradient':

            gradient = {
              type: 'circle',
              x0: 0,
              y0: 0,
              x1: bounds.width,
              y1: bounds.height,
              cx: 0,
              cy: 0,
              rx: 0,
              ry: 0,
              colorStops: []
            };

            // center
            m2 = m1[2].match(/(\d{1,3})%?\s(\d{1,3})%?/);
            if (m2) {
              gradient.cx = (m2[1] * bounds.width) / 100;
              gradient.cy = (m2[2] * bounds.height) / 100;
            }

            // size
            m2 = m1[3].match(/\w+/);
            m3 = m1[4].match(/[a-z\-]*/);
            if (m2 && m3) {
              switch (m3[0]) {
                case 'farthest-corner':
                case 'cover': // is equivalent to farthest-corner
                case '': // mozilla removes "cover" from definition :(
                  tl = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.cy, 2));
                  tr = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                  br = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                  bl = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.cy, 2));
                  gradient.rx = gradient.ry = Math.max(tl, tr, br, bl);
                  break;
                case 'closest-corner':
                  tl = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.cy, 2));
                  tr = Math.sqrt(Math.pow(gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                  br = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.y1 - gradient.cy, 2));
                  bl = Math.sqrt(Math.pow(gradient.x1 - gradient.cx, 2) + Math.pow(gradient.cy, 2));
                  gradient.rx = gradient.ry = Math.min(tl, tr, br, bl);
                  break;
                case 'farthest-side':
                  if (m2[0] === 'circle') {
                    gradient.rx = gradient.ry = Math.max(
                      gradient.cx,
                      gradient.cy,
                      gradient.x1 - gradient.cx,
                      gradient.y1 - gradient.cy
                    );
                  } else { // ellipse

                    gradient.type = m2[0];

                    gradient.rx = Math.max(
                      gradient.cx,
                      gradient.x1 - gradient.cx
                    );
                    gradient.ry = Math.max(
                      gradient.cy,
                      gradient.y1 - gradient.cy
                    );
                  }
                  break;
                case 'closest-side':
                case 'contain': // is equivalent to closest-side
                  if (m2[0] === 'circle') {
                    gradient.rx = gradient.ry = Math.min(
                      gradient.cx,
                      gradient.cy,
                      gradient.x1 - gradient.cx,
                      gradient.y1 - gradient.cy
                    );
                  } else { // ellipse

                    gradient.type = m2[0];

                    gradient.rx = Math.min(
                      gradient.cx,
                      gradient.x1 - gradient.cx
                    );
                    gradient.ry = Math.min(
                      gradient.cy,
                      gradient.y1 - gradient.cy
                    );
                  }
                  break;

                  // TODO: add support for "30px 40px" sizes (webkit only)
              }
            }

            // color stops
            m2 = m1[5].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g);
            if (m2) {
              m2Len = m2.length;
              step = 1 / Math.max(m2Len - 1, 1);
              for (i = 0; i < m2Len; i += 1) {
                m3 = m2[i].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/);
                if (m3[2]) {
                  stop = parseFloat(m3[2]);
                  if (m3[3] === '%') {
                    stop /= 100;
                  } else { // px - stupid opera
                    stop /= bounds.width;
                  }
                } else {
                  stop = i * step;
                }
                gradient.colorStops.push({
                  color: m3[1],
                  stop: stop
                });
              }
            }
            break;
        }
      }

      return gradient;
    };

    function addScrollStops(grad) {
      return function (colorStop) {
        try {
          grad.addColorStop(colorStop.stop, colorStop.color);
        } catch (e) {
          Util.log(['failed to add color stop: ', e, '; tried to add: ', colorStop]);
        }
      };
    }

    Generate.Gradient = function (src, bounds) {
      if (bounds.width === 0 || bounds.height === 0) {
        return;
      }

      var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        gradient, grad;

      canvas.width = bounds.width;
      canvas.height = bounds.height;

      // TODO: add support for multi defined background gradients
      gradient = _html2canvas.Generate.parseGradient(src, bounds);

      if (gradient) {
        switch (gradient.type) {
          case 'linear':
            grad = ctx.createLinearGradient(gradient.x0, gradient.y0, gradient.x1, gradient.y1);
            gradient.colorStops.forEach(addScrollStops(grad));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, bounds.width, bounds.height);
            break;

          case 'circle':
            grad = ctx.createRadialGradient(gradient.cx, gradient.cy, 0, gradient.cx, gradient.cy, gradient.rx);
            gradient.colorStops.forEach(addScrollStops(grad));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, bounds.width, bounds.height);
            break;

          case 'ellipse':
            var canvasRadial = document.createElement('canvas'),
              ctxRadial = canvasRadial.getContext('2d'),
              ri = Math.max(gradient.rx, gradient.ry),
              di = ri * 2;

            canvasRadial.width = canvasRadial.height = di;

            grad = ctxRadial.createRadialGradient(gradient.rx, gradient.ry, 0, gradient.rx, gradient.ry, ri);
            gradient.colorStops.forEach(addScrollStops(grad));

            ctxRadial.fillStyle = grad;
            ctxRadial.fillRect(0, 0, di, di);

            ctx.fillStyle = gradient.colorStops[gradient.colorStops.length - 1].color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvasRadial, gradient.cx - gradient.rx, gradient.cy - gradient.ry, 2 * gradient.rx, 2 * gradient.ry);
            break;
        }
      }

      return canvas;
    };

    Generate.ListAlpha = function (number) {
      var tmp = "",
        modulus;

      do {
        modulus = number % 26;
        tmp = String.fromCharCode((modulus) + 64) + tmp;
        number = number / 26;
      } while ((number * 26) > 26);

      return tmp;
    };

    Generate.ListRoman = function (number) {
      var romanArray = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"],
        decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
        roman = "",
        v,
        len = romanArray.length;

      if (number <= 0 || number >= 4000) {
        return number;
      }

      for (v = 0; v < len; v += 1) {
        while (number >= decimal[v]) {
          number -= decimal[v];
          roman += romanArray[v];
        }
      }

      return roman;
    };
  })();

  function h2cRenderContext(width, height) {
    var storage = [];
    return {
      storage: storage,
      width: width,
      height: height,
      clip: function () {
        storage.push({
          type: "function",
          name: "clip",
          'arguments': arguments
        });
      },
      translate: function () {
        storage.push({
          type: "function",
          name: "translate",
          'arguments': arguments
        });
      },
      fill: function () {
        storage.push({
          type: "function",
          name: "fill",
          'arguments': arguments
        });
      },
      save: function () {
        storage.push({
          type: "function",
          name: "save",
          'arguments': arguments
        });
      },
      restore: function () {
        storage.push({
          type: "function",
          name: "restore",
          'arguments': arguments
        });
      },
      fillRect: function () {
        storage.push({
          type: "function",
          name: "fillRect",
          'arguments': arguments
        });
      },
      createPattern: function () {
        storage.push({
          type: "function",
          name: "createPattern",
          'arguments': arguments
        });
      },
      drawShape: function () {

        var shape = [];

        storage.push({
          type: "function",
          name: "drawShape",
          'arguments': shape
        });

        return {
          moveTo: function () {
            shape.push({
              name: "moveTo",
              'arguments': arguments
            });
          },
          lineTo: function () {
            shape.push({
              name: "lineTo",
              'arguments': arguments
            });
          },
          arcTo: function () {
            shape.push({
              name: "arcTo",
              'arguments': arguments
            });
          },
          bezierCurveTo: function () {
            shape.push({
              name: "bezierCurveTo",
              'arguments': arguments
            });
          },
          quadraticCurveTo: function () {
            shape.push({
              name: "quadraticCurveTo",
              'arguments': arguments
            });
          }
        };

      },
      drawImage: function () {
        storage.push({
          type: "function",
          name: "drawImage",
          'arguments': arguments
        });
      },
      fillText: function () {
        storage.push({
          type: "function",
          name: "fillText",
          'arguments': arguments
        });
      },
      setVariable: function (variable, value) {
        storage.push({
          type: "variable",
          name: variable,
          'arguments': value
        });
        return value;
      }
    };
  }
  _html2canvas.Parse = function (images, options) {

    if (options.autoscroll || false) window.scroll(0, 0);

    var element = ((options.elements === undefined) ? document.body : options.elements[0]), // select body by default
      numDraws = 0,
      doc = element.ownerDocument,
      Util = _html2canvas.Util,
      support = Util.Support(options, doc),
      ignoreElementsRegExp = new RegExp("(" + options.ignoreElements + ")"),
      body = doc.body,
      getCSS = Util.getCSS,
      pseudoHide = "___html2canvas___pseudoelement",
      hidePseudoElements = doc.createElement('style');

    hidePseudoElements.innerHTML = '.' + pseudoHide + '-before:before { content: "" !important; display: none !important; }' +
      '.' + pseudoHide + '-after:after { content: "" !important; display: none !important; }';

    body.appendChild(hidePseudoElements);

    images = images || {};

    function documentWidth() {
      return Math.max(
        Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth),
        Math.max(doc.body.offsetWidth, doc.documentElement.offsetWidth),
        Math.max(doc.body.clientWidth, doc.documentElement.clientWidth)
      );
    }

    function documentHeight() {
      return Math.max(
        Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight),
        Math.max(doc.body.offsetHeight, doc.documentElement.offsetHeight),
        Math.max(doc.body.clientHeight, doc.documentElement.clientHeight)
      );
    }

    function getCSSInt(element, attribute) {
      var val = parseInt(getCSS(element, attribute), 10);
      return (isNaN(val)) ? 0 : val; // borders in old IE are throwing 'medium' for demo.html
    }

    function renderRect(ctx, x, y, w, h, bgcolor) {
      if (bgcolor !== "transparent") {
        ctx.setVariable("fillStyle", bgcolor);
        ctx.fillRect(x, y, w, h);
        numDraws += 1;
      }
    }

    function capitalize(m, p1, p2) {
      if (m.length > 0) {
        return p1 + p2.toUpperCase();
      }
    }

    function textTransform(text, transform) {
      switch (transform) {
        case "lowercase":
          return text.toLowerCase();
        case "capitalize":
          return text.replace(/(^|\s|:|-|\(|\))([a-z])/g, capitalize);
        case "uppercase":
          return text.toUpperCase();
        default:
          return text;
      }
    }

    function noLetterSpacing(letter_spacing) {
      return (/^(normal|none|0px)$/.test(letter_spacing));
    }

    function drawText(currentText, x, y, ctx) {
      if (currentText !== null && Util.trimText(currentText).length > 0) {
        ctx.fillText(currentText, x, y);
        numDraws += 1;
      }
    }

    function setTextVariables(ctx, el, text_decoration, color) {
      var align = false,
        bold = getCSS(el, "fontWeight"),
        family = getCSS(el, "fontFamily"),
        size = getCSS(el, "fontSize"),
        shadows = Util.parseTextShadows(getCSS(el, "textShadow"));

      switch (parseInt(bold, 10)) {
        case 401:
          bold = "bold";
          break;
        case 400:
          bold = "normal";
          break;
      }

      ctx.setVariable("fillStyle", color);
      ctx.setVariable("font", [getCSS(el, "fontStyle"), getCSS(el, "fontVariant"), bold, size, family].join(" "));
      ctx.setVariable("textAlign", (align) ? "right" : "left");

      if (shadows.length) {
        // TODO: support multiple text shadows
        // apply the first text shadow
        ctx.setVariable("shadowColor", shadows[0].color);
        ctx.setVariable("shadowOffsetX", shadows[0].offsetX);
        ctx.setVariable("shadowOffsetY", shadows[0].offsetY);
        ctx.setVariable("shadowBlur", shadows[0].blur);
      }

      if (text_decoration !== "none") {
        return Util.Font(family, size, doc);
      }
    }

    function renderTextDecoration(ctx, text_decoration, bounds, metrics, color) {
      switch (text_decoration) {
        case "underline":
          // Draws a line at the baseline of the font
          // TODO As some browsers display the line as more than 1px if the font-size is big, need to take that into account both in position and size
          renderRect(ctx, bounds.left, Math.round(bounds.top + metrics.baseline + metrics.lineWidth), bounds.width, 1, color);
          break;
        case "overline":
          renderRect(ctx, bounds.left, Math.round(bounds.top), bounds.width, 1, color);
          break;
        case "line-through":
          // TODO try and find exact position for line-through
          renderRect(ctx, bounds.left, Math.ceil(bounds.top + metrics.middle + metrics.lineWidth), bounds.width, 1, color);
          break;
      }
    }

    function getTextBounds(state, text, textDecoration, isLast, transform) {
      var bounds;
      if (support.rangeBounds && !transform) {
        if (textDecoration !== "none" || Util.trimText(text).length !== 0) {
          bounds = textRangeBounds(text, state.node, state.textOffset);
        }
        state.textOffset += text.length;
      } else if (state.node && typeof state.node.nodeValue === "string") {
        var newTextNode = (isLast) ? state.node.splitText(text.length) : null;
        bounds = textWrapperBounds(state.node, transform);
        state.node = newTextNode;
      }
      return bounds;
    }

    function textRangeBounds(text, textNode, textOffset) {
      var range = doc.createRange();
      range.setStart(textNode, textOffset);
      range.setEnd(textNode, textOffset + text.length);
      return range.getBoundingClientRect();
    }

    function textWrapperBounds(oldTextNode, transform) {
      var parent = oldTextNode.parentNode,
        wrapElement = doc.createElement('wrapper'),
        backupText = oldTextNode.cloneNode(true);

      wrapElement.appendChild(oldTextNode.cloneNode(true));
      parent.replaceChild(wrapElement, oldTextNode);

      var bounds = transform ? Util.OffsetBounds(wrapElement) : Util.Bounds(wrapElement);
      parent.replaceChild(backupText, wrapElement);
      return bounds;
    }

    function renderText(el, textNode, stack) {
      var ctx = stack.ctx,
        color = getCSS(el, "color"),
        textDecoration = getCSS(el, "textDecoration"),
        textAlign = getCSS(el, "textAlign"),
        metrics,
        textList,
        state = {
          node: textNode,
          textOffset: 0
        };

      if (Util.trimText(textNode.nodeValue).length > 0) {
        textNode.nodeValue = textTransform(textNode.nodeValue, getCSS(el, "textTransform"));
        textAlign = textAlign.replace(["-webkit-auto"], ["auto"]);

        textList = (!options.letterRendering && /^(left|right|justify|auto)$/.test(textAlign) && noLetterSpacing(getCSS(el, "letterSpacing"))) ?
          textNode.nodeValue.split(/(\b| )/) :
          textNode.nodeValue.split("");

        metrics = setTextVariables(ctx, el, textDecoration, color);

        if (options.chinese) {
          textList.forEach(function (word, index) {
            if (/.*[\u4E00-\u9FA5].*$/.test(word)) {
              word = word.split("");
              word.unshift(index, 1);
              textList.splice.apply(textList, word);
            }
          });
        }

        textList.forEach(function (text, index) {
          var bounds = getTextBounds(state, text, textDecoration, (index < textList.length - 1), stack.transform.matrix);
          if (bounds) {
            drawText(text, bounds.left, bounds.bottom, ctx);
            renderTextDecoration(ctx, textDecoration, bounds, metrics, color);
          }
        });
      }
    }

    function listPosition(element, val) {
      var boundElement = doc.createElement("boundelement"),
        originalType,
        bounds;

      boundElement.style.display = "inline";

      originalType = element.style.listStyleType;
      element.style.listStyleType = "none";

      boundElement.appendChild(doc.createTextNode(val));

      element.insertBefore(boundElement, element.firstChild);

      bounds = Util.Bounds(boundElement);
      element.removeChild(boundElement);
      element.style.listStyleType = originalType;
      return bounds;
    }

    function elementIndex(el) {
      var i = -1,
        count = 1,
        childs = el.parentNode.childNodes;

      if (el.parentNode) {
        while (childs[++i] !== el) {
          if (childs[i].nodeType === 1) {
            count++;
          }
        }
        return count;
      } else {
        return -1;
      }
    }

    function listItemText(element, type) {
      var currentIndex = elementIndex(element),
        text;
      switch (type) {
        case "decimal":
          text = currentIndex;
          break;
        case "decimal-leading-zero":
          text = (currentIndex.toString().length === 1) ? currentIndex = "0" + currentIndex.toString() : currentIndex.toString();
          break;
        case "upper-roman":
          text = _html2canvas.Generate.ListRoman(currentIndex);
          break;
        case "lower-roman":
          text = _html2canvas.Generate.ListRoman(currentIndex).toLowerCase();
          break;
        case "lower-alpha":
          text = _html2canvas.Generate.ListAlpha(currentIndex).toLowerCase();
          break;
        case "upper-alpha":
          text = _html2canvas.Generate.ListAlpha(currentIndex);
          break;
      }

      return text + ". ";
    }

    function renderListItem(element, stack, elBounds) {
      var x,
        text,
        ctx = stack.ctx,
        type = getCSS(element, "listStyleType"),
        listBounds;

      if (/^(decimal|decimal-leading-zero|upper-alpha|upper-latin|upper-roman|lower-alpha|lower-greek|lower-latin|lower-roman)$/i.test(type)) {
        text = listItemText(element, type);
        listBounds = listPosition(element, text);
        setTextVariables(ctx, element, "none", getCSS(element, "color"));

        if (getCSS(element, "listStylePosition") === "inside") {
          ctx.setVariable("textAlign", "left");
          x = elBounds.left;
        } else {
          return;
        }

        drawText(text, x, listBounds.bottom, ctx);
      }
    }

    function loadImage(src) {
      var img = images[src];
      return (img && img.succeeded === true) ? img.img : false;
    }

    function clipBounds(src, dst) {
      var x = Math.max(src.left, dst.left),
        y = Math.max(src.top, dst.top),
        x2 = Math.min((src.left + src.width), (dst.left + dst.width)),
        y2 = Math.min((src.top + src.height), (dst.top + dst.height));

      return {
        left: x,
        top: y,
        width: x2 - x,
        height: y2 - y
      };
    }

    function setZ(element, stack, parentStack) {
      var newContext,
        isPositioned = stack.cssPosition !== 'static',
        zIndex = isPositioned ? getCSS(element, 'zIndex') : 'auto',
        opacity = getCSS(element, 'opacity'),
        isFloated = getCSS(element, 'cssFloat') !== 'none';

      // https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context
      // When a new stacking context should be created:
      // the root element (HTML),
      // positioned (absolutely or relatively) with a z-index value other than "auto",
      // elements with an opacity value less than 1. (See the specification for opacity),
      // on mobile WebKit and Chrome 22+, position: fixed always creates a new stacking context, even when z-index is "auto" (See this post)

      stack.zIndex = newContext = h2czContext(zIndex);
      newContext.isPositioned = isPositioned;
      newContext.isFloated = isFloated;
      newContext.opacity = opacity;
      newContext.ownStacking = (zIndex !== 'auto' || opacity < 1);

      if (parentStack) {
        parentStack.zIndex.children.push(stack);
      }
    }

    function renderImage(ctx, element, image, bounds, borders) {

      var paddingLeft = getCSSInt(element, 'paddingLeft'),
        paddingTop = getCSSInt(element, 'paddingTop'),
        paddingRight = getCSSInt(element, 'paddingRight'),
        paddingBottom = getCSSInt(element, 'paddingBottom');

      var offsetTop  = options["top"]  || 0;
      var offsetLeft = options["left"] || 0;

      // Resize image based on objectFit
      var objectFit = getComputedStyle(element).objectFit;
      if (/contain|cover/.test(objectFit)) {
        var resizedBounds = _html2canvas.Util.resizeBounds(image.width, image.height, bounds.width, bounds.height, objectFit);
        bounds.width  = resizedBounds.width;
        bounds.height = resizedBounds.height;
        offsetLeft += resizedBounds.left;
        offsetTop  += resizedBounds.top;
      }

      var sx = 0;
      var sy = 0;
      var sw = image.width;
      var sh = image.height;

      var dx = bounds.left + paddingLeft + borders[3].width + offsetLeft;
      var dy = bounds.top + paddingTop + borders[0].width + offsetTop;
      var dw = bounds.width - (borders[1].width + borders[3].width + paddingLeft + paddingRight);
      var dh = bounds.height - (borders[0].width + borders[2].width + paddingTop + paddingBottom);

      drawImage(ctx, image,
        sx, sy, sw, sh,
        dx, dy, dw, dh
      );
    }

    function getBorderData(element) {
      return ["Top", "Right", "Bottom", "Left"].map(function (side) {
        return {
          width: getCSSInt(element, 'border' + side + 'Width'),
          color: getCSS(element, 'border' + side + 'Color')
        };
      });
    }

    function getBorderRadiusData(element) {
      return ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map(function (side) {
        return getCSS(element, 'border' + side + 'Radius');
      });
    }

    var getCurvePoints = (function (kappa) {

      return function (x, y, r1, r2) {
        var ox = (r1) * kappa, // control point offset horizontal
          oy = (r2) * kappa, // control point offset vertical
          xm = x + r1, // x-middle
          ym = y + r2; // y-middle
        return {
          topLeft: bezierCurve({
            x: x,
            y: ym
          }, {
            x: x,
            y: ym - oy
          }, {
            x: xm - ox,
            y: y
          }, {
            x: xm,
            y: y
          }),
          topRight: bezierCurve({
            x: x,
            y: y
          }, {
            x: x + ox,
            y: y
          }, {
            x: xm,
            y: ym - oy
          }, {
            x: xm,
            y: ym
          }),
          bottomRight: bezierCurve({
            x: xm,
            y: y
          }, {
            x: xm,
            y: y + oy
          }, {
            x: x + ox,
            y: ym
          }, {
            x: x,
            y: ym
          }),
          bottomLeft: bezierCurve({
            x: xm,
            y: ym
          }, {
            x: xm - ox,
            y: ym
          }, {
            x: x,
            y: y + oy
          }, {
            x: x,
            y: y
          })
        };
      };
    })(4 * ((Math.sqrt(2) - 1) / 3));

    function bezierCurve(start, startControl, endControl, end) {

      var lerp = function (a, b, t) {
        return {
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t
        };
      };

      return {
        start: start,
        startControl: startControl,
        endControl: endControl,
        end: end,
        subdivide: function (t) {
          var ab = lerp(start, startControl, t),
            bc = lerp(startControl, endControl, t),
            cd = lerp(endControl, end, t),
            abbc = lerp(ab, bc, t),
            bccd = lerp(bc, cd, t),
            dest = lerp(abbc, bccd, t);
          return [bezierCurve(start, ab, abbc, dest), bezierCurve(dest, bccd, cd, end)];
        },
        curveTo: function (borderArgs) {
          borderArgs.push(["bezierCurve", startControl.x, startControl.y, endControl.x, endControl.y, end.x, end.y]);
        },
        curveToReversed: function (borderArgs) {
          borderArgs.push(["bezierCurve", endControl.x, endControl.y, startControl.x, startControl.y, start.x, start.y]);
        }
      };
    }

    function parseCorner(borderArgs, radius1, radius2, corner1, corner2, x, y) {
      if (radius1[0] > 0 || radius1[1] > 0) {
        borderArgs.push(["line", corner1[0].start.x, corner1[0].start.y]);
        corner1[0].curveTo(borderArgs);
        corner1[1].curveTo(borderArgs);
      } else {
        borderArgs.push(["line", x, y]);
      }

      if (radius2[0] > 0 || radius2[1] > 0) {
        borderArgs.push(["line", corner2[0].start.x, corner2[0].start.y]);
      }
    }

    function drawSide(borderData, radius1, radius2, outer1, inner1, outer2, inner2) {
      var borderArgs = [];

      if (radius1[0] > 0 || radius1[1] > 0) {
        borderArgs.push(["line", outer1[1].start.x, outer1[1].start.y]);
        outer1[1].curveTo(borderArgs);
      } else {
        borderArgs.push(["line", borderData.c1[0], borderData.c1[1]]);
      }

      if (radius2[0] > 0 || radius2[1] > 0) {
        borderArgs.push(["line", outer2[0].start.x, outer2[0].start.y]);
        outer2[0].curveTo(borderArgs);
        borderArgs.push(["line", inner2[0].end.x, inner2[0].end.y]);
        inner2[0].curveToReversed(borderArgs);
      } else {
        borderArgs.push(["line", borderData.c2[0], borderData.c2[1]]);
        borderArgs.push(["line", borderData.c3[0], borderData.c3[1]]);
      }

      if (radius1[0] > 0 || radius1[1] > 0) {
        borderArgs.push(["line", inner1[1].end.x, inner1[1].end.y]);
        inner1[1].curveToReversed(borderArgs);
      } else {
        borderArgs.push(["line", borderData.c4[0], borderData.c4[1]]);
      }

      return borderArgs;
    }

    function calculateCurvePoints(bounds, borderRadius, borders) {

      var x = bounds.left,
        y = bounds.top,
        width = bounds.width,
        height = bounds.height,

        tlh = borderRadius[0][0],
        tlv = borderRadius[0][1],
        trh = borderRadius[1][0],
        trv = borderRadius[1][1],
        brh = borderRadius[2][0],
        brv = borderRadius[2][1],
        blh = borderRadius[3][0],
        blv = borderRadius[3][1];

      var halfHeight = Math.floor(height / 2);
      tlh = tlh > halfHeight ? halfHeight : tlh;
      tlv = tlv > halfHeight ? halfHeight : tlv;
      trh = trh > halfHeight ? halfHeight : trh;
      trv = trv > halfHeight ? halfHeight : trv;
      brh = brh > halfHeight ? halfHeight : brh;
      brv = brv > halfHeight ? halfHeight : brv;
      blh = blh > halfHeight ? halfHeight : blh;
      blv = blv > halfHeight ? halfHeight : blv;

      var topWidth = width - trh,
        rightHeight = height - brv,
        bottomWidth = width - brh,
        leftHeight = height - blv;

      return {
        topLeftOuter: getCurvePoints(
          x,
          y,
          tlh,
          tlv
        ).topLeft.subdivide(0.5),

        topLeftInner: getCurvePoints(
          x + borders[3].width,
          y + borders[0].width,
          Math.max(0, tlh - borders[3].width),
          Math.max(0, tlv - borders[0].width)
        ).topLeft.subdivide(0.5),

        topRightOuter: getCurvePoints(
          x + topWidth,
          y,
          trh,
          trv
        ).topRight.subdivide(0.5),

        topRightInner: getCurvePoints(
          x + Math.min(topWidth, width + borders[3].width),
          y + borders[0].width,
          (topWidth > width + borders[3].width) ? 0 : trh - borders[3].width,
          trv - borders[0].width
        ).topRight.subdivide(0.5),

        bottomRightOuter: getCurvePoints(
          x + bottomWidth,
          y + rightHeight,
          brh,
          brv
        ).bottomRight.subdivide(0.5),

        bottomRightInner: getCurvePoints(
          x + Math.min(bottomWidth, width + borders[3].width),
          y + Math.min(rightHeight, height + borders[0].width),
          Math.max(0, brh - borders[1].width),
          Math.max(0, brv - borders[2].width)
        ).bottomRight.subdivide(0.5),

        bottomLeftOuter: getCurvePoints(
          x,
          y + leftHeight,
          blh,
          blv
        ).bottomLeft.subdivide(0.5),

        bottomLeftInner: getCurvePoints(
          x + borders[3].width,
          y + leftHeight,
          Math.max(0, blh - borders[3].width),
          Math.max(0, blv - borders[2].width)
        ).bottomLeft.subdivide(0.5)
      };
    }

    function getBorderClip(element, borderPoints, borders, radius, bounds) {
      var backgroundClip = getCSS(element, 'backgroundClip'),
        borderArgs = [];

      switch (backgroundClip) {
        case "content-box":
        case "padding-box":
          parseCorner(borderArgs, radius[0], radius[1], borderPoints.topLeftInner, borderPoints.topRightInner, bounds.left + borders[3].width, bounds.top + borders[0].width);
          parseCorner(borderArgs, radius[1], radius[2], borderPoints.topRightInner, borderPoints.bottomRightInner, bounds.left + bounds.width - borders[1].width, bounds.top + borders[0].width);
          parseCorner(borderArgs, radius[2], radius[3], borderPoints.bottomRightInner, borderPoints.bottomLeftInner, bounds.left + bounds.width - borders[1].width, bounds.top + bounds.height - borders[2].width);
          parseCorner(borderArgs, radius[3], radius[0], borderPoints.bottomLeftInner, borderPoints.topLeftInner, bounds.left + borders[3].width, bounds.top + bounds.height - borders[2].width);
          break;

        default:
          parseCorner(borderArgs, radius[0], radius[1], borderPoints.topLeftOuter, borderPoints.topRightOuter, bounds.left, bounds.top);
          parseCorner(borderArgs, radius[1], radius[2], borderPoints.topRightOuter, borderPoints.bottomRightOuter, bounds.left + bounds.width, bounds.top);
          parseCorner(borderArgs, radius[2], radius[3], borderPoints.bottomRightOuter, borderPoints.bottomLeftOuter, bounds.left + bounds.width, bounds.top + bounds.height);
          parseCorner(borderArgs, radius[3], radius[0], borderPoints.bottomLeftOuter, borderPoints.topLeftOuter, bounds.left, bounds.top + bounds.height);
          break;
      }

      return borderArgs;
    }

    function parseBorders(element, bounds, borders) {
      var x = bounds.left,
        y = bounds.top,
        width = bounds.width,
        height = bounds.height,
        borderSide,
        bx,
        by,
        bw,
        bh,
        borderArgs,
        // http://www.w3.org/TR/css3-background/#the-border-radius
        borderRadius = getBorderRadiusData(element),
        borderPoints = calculateCurvePoints(bounds, borderRadius, borders),
        borderData = {
          clip: getBorderClip(element, borderPoints, borders, borderRadius, bounds),
          borders: []
        };

      for (borderSide = 0; borderSide < 4; borderSide++) {

        if (borders[borderSide].width > 0) {
          bx = x;
          by = y;
          bw = width;
          bh = height - (borders[2].width);

          switch (borderSide) {
            case 0:
              // top border
              bh = borders[0].width;

              borderArgs = drawSide({
                  c1: [bx, by],
                  c2: [bx + bw, by],
                  c3: [bx + bw - borders[1].width, by + bh],
                  c4: [bx + borders[3].width, by + bh]
                }, borderRadius[0], borderRadius[1],
                borderPoints.topLeftOuter, borderPoints.topLeftInner, borderPoints.topRightOuter, borderPoints.topRightInner);
              break;
            case 1:
              // right border
              bx = x + width - (borders[1].width);
              bw = borders[1].width;

              borderArgs = drawSide({
                  c1: [bx + bw, by],
                  c2: [bx + bw, by + bh + borders[2].width],
                  c3: [bx, by + bh],
                  c4: [bx, by + borders[0].width]
                }, borderRadius[1], borderRadius[2],
                borderPoints.topRightOuter, borderPoints.topRightInner, borderPoints.bottomRightOuter, borderPoints.bottomRightInner);
              break;
            case 2:
              // bottom border
              by = (by + height) - (borders[2].width);
              bh = borders[2].width;

              borderArgs = drawSide({
                  c1: [bx + bw, by + bh],
                  c2: [bx, by + bh],
                  c3: [bx + borders[3].width, by],
                  c4: [bx + bw - borders[3].width, by]
                }, borderRadius[2], borderRadius[3],
                borderPoints.bottomRightOuter, borderPoints.bottomRightInner, borderPoints.bottomLeftOuter, borderPoints.bottomLeftInner);
              break;
            case 3:
              // left border
              bw = borders[3].width;

              borderArgs = drawSide({
                  c1: [bx, by + bh + borders[2].width],
                  c2: [bx, by],
                  c3: [bx + bw, by + borders[0].width],
                  c4: [bx + bw, by + bh]
                }, borderRadius[3], borderRadius[0],
                borderPoints.bottomLeftOuter, borderPoints.bottomLeftInner, borderPoints.topLeftOuter, borderPoints.topLeftInner);
              break;
          }

          borderData.borders.push({
            args: borderArgs,
            color: borders[borderSide].color
          });

        }
      }

      return borderData;
    }

    function createShape(ctx, args) {
      var shape = ctx.drawShape();
      args.forEach(function (border, index) {
        shape[(index === 0) ? "moveTo" : border[0] + "To"].apply(null, border.slice(1));
      });
      return shape;
    }

    function renderBorders(ctx, borderArgs, color) {
      if (color !== "transparent") {
        ctx.setVariable("fillStyle", color);
        createShape(ctx, borderArgs);
        ctx.fill();
        numDraws += 1;
      }
    }

    function renderFormValue(el, bounds, stack) {

      var valueWrap = doc.createElement('valuewrap'),
        cssPropertyArray = ['lineHeight', 'textAlign', 'fontFamily', 'color', 'fontSize', 'paddingLeft', 'paddingTop', 'width', 'height', 'border', 'borderLeftWidth', 'borderTopWidth'],
        textValue,
        textNode;

      cssPropertyArray.forEach(function (property) {
        try {
          valueWrap.style[property] = getCSS(el, property);
        } catch (e) {
          // Older IE has issues with "border"
          Util.log("html2canvas: Parse: Exception caught in renderFormValue: " + e.message);
        }
      });

      valueWrap.style.borderColor = "black";
      valueWrap.style.borderStyle = "solid";
      valueWrap.style.display = "block";
      valueWrap.style.position = "absolute";

      if (/^(submit|reset|button|text|password)$/.test(el.type) || el.nodeName === "SELECT") {
        valueWrap.style.lineHeight = getCSS(el, "height");
      }

      valueWrap.style.top = bounds.top + "px";
      valueWrap.style.left = bounds.left + "px";

      textValue = (el.nodeName === "SELECT") ? (el.options[el.selectedIndex] || 0).text : el.value;
      if (!textValue) {
        textValue = el.placeholder;
      }

      textNode = doc.createTextNode(textValue);

      valueWrap.appendChild(textNode);
      body.appendChild(valueWrap);

      renderText(el, textNode, stack);
      body.removeChild(valueWrap);
    }

    function drawImage(ctx) {
      ctx.drawImage.apply(ctx, Array.prototype.slice.call(arguments, 1));
      numDraws += 1;
    }

    function getPseudoElement(el, which) {
      var elStyle = window.getComputedStyle(el, which);
      if (!elStyle || !elStyle.content || elStyle.content === "none" || elStyle.content === "-moz-alt-content" || elStyle.display === "none") {
        return;
      }
      var content = elStyle.content + '',
        first = content.substr(0, 1);
      //strips quotes
      if (first === content.substr(content.length - 1) && first.match(/'|"/)) {
        content = content.substr(1, content.length - 2);
      }

      var isImage = content.substr(0, 3) === 'url',
        elps = document.createElement(isImage ? 'img' : 'span');

      elps.className = pseudoHide + "-before " + pseudoHide + "-after";

      Object.keys(elStyle).filter(indexedProperty).forEach(function (prop) {
        // Prevent assigning of read only CSS Rules, ex. length, parentRule
        try {
          elps.style[prop] = elStyle[prop];
        } catch (e) {
          Util.log(['Tried to assign readonly property ', prop, 'Error:', e]);
        }
      });

      elps.style['fontFamily'] = elStyle['fontFamily'];
      elps.style['font-family'] = elStyle['font-family'];

      if (isImage) {
        elps.src = Util.parseBackgroundImage(content)[0].args[0];
      } else {
        elps.innerHTML = content;
      }
      return elps;
    }

    function indexedProperty(property) {
      return (isNaN(window.parseInt(property, 10)));
    }

    function injectPseudoElements(el, stack) {
      var before = getPseudoElement(el, ':before'),
        after = getPseudoElement(el, ':after');
      if (!before && !after) {
        return;
      }

      if (before) {
        el.className += " " + pseudoHide + "-before";
        el.parentNode.insertBefore(before, el);
        parseElement(before, stack, true);
        el.parentNode.removeChild(before);
        el.className = el.className.replace(pseudoHide + "-before", "").trim();
      }

      if (after) {
        el.className += " " + pseudoHide + "-after";
        el.appendChild(after);
        parseElement(after, stack, true);
        el.removeChild(after);
        el.className = el.className.replace(pseudoHide + "-after", "").trim();
      }

    }

    function renderBackgroundRepeat(ctx, image, backgroundPosition, bounds) {
      var offsetX = Math.round(bounds.left + backgroundPosition.left),
        offsetY = Math.round(bounds.top + backgroundPosition.top);

      ctx.createPattern(image);
      ctx.translate(offsetX, offsetY);
      ctx.fill();
      ctx.translate(-offsetX, -offsetY);
    }

    function backgroundRepeatShape(ctx, image, backgroundPosition, bounds, left, top, width, height) {
      var args = [];
      args.push(["line", Math.round(left), Math.round(top)]);
      args.push(["line", Math.round(left + width), Math.round(top)]);
      args.push(["line", Math.round(left + width), Math.round(height + top)]);
      args.push(["line", Math.round(left), Math.round(height + top)]);
      createShape(ctx, args);
      ctx.save();
      ctx.clip();
      renderBackgroundRepeat(ctx, image, backgroundPosition, bounds);
      ctx.restore();
    }

    function renderBackgroundColor(ctx, backgroundBounds, bgcolor) {
      renderRect(
        ctx,
        backgroundBounds.left,
        backgroundBounds.top,
        backgroundBounds.width,
        backgroundBounds.height,
        bgcolor
      );
    }

    function renderBackgroundRepeating(el, bounds, ctx, image, imageIndex) {
      var backgroundSize = Util.BackgroundSize(el, bounds, image, imageIndex),
        backgroundPosition = Util.BackgroundPosition(el, bounds, image, imageIndex, backgroundSize),
        backgroundRepeat = getCSS(el, "backgroundRepeat").split(",").map(Util.trimText);

      image = resizeImage(image, backgroundSize);

      backgroundRepeat = backgroundRepeat[imageIndex] || backgroundRepeat[0];

      switch (backgroundRepeat) {
        case "repeat-x":
          backgroundRepeatShape(ctx, image, backgroundPosition, bounds,
            bounds.left, bounds.top + backgroundPosition.top, 99999, image.height);
          break;

        case "repeat-y":
          backgroundRepeatShape(ctx, image, backgroundPosition, bounds,
            bounds.left + backgroundPosition.left, bounds.top, image.width, 99999);
          break;

        case "no-repeat":
          backgroundRepeatShape(ctx, image, backgroundPosition, bounds,
            bounds.left + backgroundPosition.left, bounds.top + backgroundPosition.top, image.width, image.height);
          break;

        default:
          renderBackgroundRepeat(ctx, image, backgroundPosition, {
            top: bounds.top,
            left: bounds.left,
            width: image.width,
            height: image.height
          });
          break;
      }
    }

    function renderBackgroundImage(element, bounds, ctx) {
      var backgroundImage = getCSS(element, "backgroundImage"),
        backgroundImages = Util.parseBackgroundImage(backgroundImage),
        image,
        imageIndex = backgroundImages.length;

      while (imageIndex--) {
        backgroundImage = backgroundImages[imageIndex];

        if (!backgroundImage.args || backgroundImage.args.length === 0) {
          continue;
        }

        var key = backgroundImage.method === 'url' ?
          backgroundImage.args[0] :
          backgroundImage.value;

        image = loadImage(key);

        // TODO add support for background-origin
        if (image) {
          renderBackgroundRepeating(element, bounds, ctx, image, imageIndex);
        } else {
          Util.log("html2canvas: Error loading background:", backgroundImage);
        }
      }
    }

    function resizeImage(image, bounds) {

      if (image.width === bounds.width && image.height === bounds.height)
        return image;

      var ctx, canvas = doc.createElement('canvas');
      canvas.width = bounds.width;
      canvas.height = bounds.height;

      ctx = canvas.getContext("2d");
      drawImage(ctx, image, 0, 0, image.width, image.height, 0, 0, bounds.width, bounds.height);
      return canvas;
    }

    function setOpacity(ctx, element, parentStack) {
      return ctx.setVariable("globalAlpha", getCSS(element, "opacity") * ((parentStack) ? parentStack.opacity : 1));
    }

    function removePx(str) {
      return str.replace("px", "");
    }

    var transformRegExp = /(matrix)\((.+)\)/;

    function getTransform(element, parentStack) {
      var transform = getCSS(element, "transform") || getCSS(element, "-webkit-transform") || getCSS(element, "-moz-transform") || getCSS(element, "-ms-transform") || getCSS(element, "-o-transform");
      var transformOrigin = getCSS(element, "transform-origin") || getCSS(element, "-webkit-transform-origin") || getCSS(element, "-moz-transform-origin") || getCSS(element, "-ms-transform-origin") || getCSS(element, "-o-transform-origin") || "0px 0px";

      transformOrigin = transformOrigin.split(" ").map(removePx).map(Util.asFloat);

      var matrix;
      if (transform && transform !== "none") {
        var match = transform.match(transformRegExp);
        if (match) {
          switch (match[1]) {
            case "matrix":
              matrix = match[2].split(",").map(Util.trimText).map(Util.asFloat);
              break;
          }
        }
      }

      return {
        origin: transformOrigin,
        matrix: matrix
      };
    }

    function createStack(element, parentStack, bounds, transform) {
      var ctx = h2cRenderContext((!parentStack) ? documentWidth() : bounds.width, (!parentStack) ? documentHeight() : bounds.height),
        stack = {
          ctx: ctx,
          opacity: setOpacity(ctx, element, parentStack),
          cssPosition: getCSS(element, "position"),
          borders: getBorderData(element),
          transform: transform,
          clip: (parentStack && parentStack.clip) ? Util.Extend({}, parentStack.clip) : null
        };

      setZ(element, stack, parentStack);

      // TODO correct overflow for absolute content residing under a static position
      if (options.useOverflow === true && /(hidden|scroll|auto)/.test(getCSS(element, "overflow")) === true && /(BODY)/i.test(element.nodeName) === false) {
        stack.clip = (stack.clip) ? clipBounds(stack.clip, bounds) : bounds;
      }

      return stack;
    }

    function getBackgroundBounds(borders, bounds, clip) {
      var backgroundBounds = {
        left: bounds.left + borders[3].width,
        top: bounds.top + borders[0].width,
        width: bounds.width - (borders[1].width + borders[3].width),
        height: bounds.height - (borders[0].width + borders[2].width)
      };

      if (clip) {
        backgroundBounds = clipBounds(backgroundBounds, clip);
      }

      return backgroundBounds;
    }

    function getBounds(element, transform) {
      var bounds = (transform.matrix) ? Util.OffsetBounds(element) : Util.Bounds(element);
      transform.origin[0] += bounds.left;
      transform.origin[1] += bounds.top;
      return bounds;
    }

    function renderElement(element, parentStack, pseudoElement, ignoreBackground) {
      var transform = getTransform(element, parentStack),
        bounds = getBounds(element, transform),
        image,
        stack = createStack(element, parentStack, bounds, transform),
        borders = stack.borders,
        ctx = stack.ctx,
        backgroundBounds = getBackgroundBounds(borders, bounds, stack.clip),
        borderData = parseBorders(element, bounds, borders),
        backgroundColor = (ignoreElementsRegExp.test(element.nodeName)) ? "#efefef" : getCSS(element, "backgroundColor");


      createShape(ctx, borderData.clip);

      ctx.save();
      ctx.clip();

      if (backgroundBounds.height > 0 && backgroundBounds.width > 0 && !ignoreBackground) {
        renderBackgroundColor(ctx, bounds, backgroundColor);
        renderBackgroundImage(element, backgroundBounds, ctx);
      } else if (ignoreBackground) {
        stack.backgroundColor = backgroundColor;
      }

      ctx.restore();

      borderData.borders.forEach(function (border) {
        renderBorders(ctx, border.args, border.color);
      });

      if (!pseudoElement) {
        injectPseudoElements(element, stack);
      }

      switch (element.nodeName) {
        case "IMG":
          if ((image = loadImage(element.getAttribute('src')))) {
            renderImage(ctx, element, image, bounds, borders);
          } else {
            Util.log("html2canvas: Error loading <img>:" + element.getAttribute('src'));
          }
          break;
        case "INPUT":
          // TODO add all relevant type's, i.e. HTML5 new stuff
          // todo add support for placeholder attribute for browsers which support it
          if (/^(text|url|email|submit|button|reset)$/.test(element.type) && (element.value || element.placeholder || "").length > 0) {
            renderFormValue(element, bounds, stack);
          }
          break;
        case "TEXTAREA":
          if ((element.value || element.placeholder || "").length > 0) {
            renderFormValue(element, bounds, stack);
          }
          break;
        case "SELECT":
          if ((element.options || element.placeholder || "").length > 0) {
            renderFormValue(element, bounds, stack);
          }
          break;
        case "LI":
          renderListItem(element, stack, backgroundBounds);
          break;
        case "CANVAS":
          renderImage(ctx, element, element, bounds, borders);
          break;
      }

      return stack;
    }

    function isElementVisible(element) {
      return (getCSS(element, 'display') !== "none" && getCSS(element, 'visibility') !== "hidden" && !element.hasAttribute("data-html2canvas-ignore"));
    }

    function parseElement(element, stack, pseudoElement) {
      if (isElementVisible(element)) {
        stack = renderElement(element, stack, pseudoElement, false) || stack;
        if (!ignoreElementsRegExp.test(element.nodeName)) {
          parseChildren(element, stack, pseudoElement);
        }
      }
    }

    function parseChildren(element, stack, pseudoElement) {
      Util.Children(element).forEach(function (node) {
        if (node.nodeType === node.ELEMENT_NODE) {
          parseElement(node, stack, pseudoElement);
        } else if (node.nodeType === node.TEXT_NODE) {
          renderText(element, node, stack);
        }
      });
    }

    function init() {

      var background = options["background-color"];
      if(background == "rgba(0, 0, 0, 0)" || background === undefined)
        background = options["backgroundColor"];
      if(background == "rgba(0, 0, 0, 0)" || background === undefined)
        background = options["background"];
      if(background == "rgba(0, 0, 0, 0)" || background === undefined)
        background = getCSS(options["container"] instanceof Element ? options["container"] : document.querySelector(options["container"]), "backgroundColor");
      if(background == "rgba(0, 0, 0, 0)" || background === undefined)
        background = getCSS(document.documentElement, "backgroundColor");
      if(background == "rgba(0, 0, 0, 0)" || background === undefined)
        background = getCSS(document.body, "backgroundColor");

      var transparentBackground = (Util.isTransparent(background) && element === document.body),
          stack = renderElement(element, null, false, transparentBackground);

      parseChildren(element, stack);

      if (transparentBackground) {
        background = stack.backgroundColor;
      }

      body.removeChild(hidePseudoElements);

      return {
        backgroundColor: background,
        stack: stack
      };
    }

    return init();
  };

  function h2czContext(zindex) {
    return {
      zindex: zindex,
      children: []
    };
  }

  _html2canvas.Preload = function (options) {

    var images = {
        numLoaded: 0, // also failed are counted here
        numFailed: 0,
        numTotal: 0,
        cleanupDone: false
      },
      pageOrigin,
      Util = _html2canvas.Util,
      methods,
      i,
      count = 0,
      element = options.elements[0] || document.body,
      doc = element.ownerDocument,
      domImages = element.getElementsByTagName('img'), // Fetch images of the present element only
      imgLen = domImages.length,
      link = doc.createElement("a"),
      supportCORS = (function (img) {
        return (img.crossOrigin !== undefined);
      })(new Image()),
      timeoutTimer;

    link.href = window.location.href;
    pageOrigin = link.protocol + link.host;

    function isSameOrigin(url) {
      link.href = url;
      link.href = link.href; // YES, BELIEVE IT OR NOT, that is required for IE9 - http://jsfiddle.net/niklasvh/2e48b/
      var origin = link.protocol + link.host;
      return (origin === pageOrigin);
    }

    function start() {
      Util.log("html2canvas: start: images: " + images.numLoaded + " / " + images.numTotal + " (failed: " + images.numFailed + ")");
      if (!images.firstRun && images.numLoaded >= images.numTotal) {
        Util.log("Finished loading images: # " + images.numTotal + " (failed: " + images.numFailed + ")");

        if (typeof options.complete === "function") {
          options.complete(images);
        }

      }
    }

    // TODO modify proxy to serve images with CORS enabled, where available
    function proxyGetImage(url, img, imageObj) {
      var callback_name,
        scriptUrl = options.proxy,
        script;

      link.href = url;
      url = link.href; // work around for pages with base href="" set - WARNING: this may change the url

      callback_name = 'html2canvas_' + (count++);
      imageObj.callbackname = callback_name;

      if (scriptUrl.indexOf("?") > -1) {
        scriptUrl += "&";
      } else {
        scriptUrl += "?";
      }
      scriptUrl += 'url=' + encodeURIComponent(url) + '&callback=' + callback_name;
      script = doc.createElement("script");

      window[callback_name] = function (a) {
        if (a.substring(0, 6) === "error:") {
          imageObj.succeeded = false;
          images.numLoaded++;
          images.numFailed++;
          start();
        } else {
          setImageLoadHandlers(img, imageObj);
          img.src = a;
        }
        window[callback_name] = undefined; // to work with IE<9  // NOTE: that the undefined callback property-name still exists on the window object (for IE<9)
        try {
          delete window[callback_name]; // for all browser that support this
        } catch (ex) {}
        script.parentNode.removeChild(script);
        script = null;
        delete imageObj.script;
        delete imageObj.callbackname;
      };

      script.setAttribute("type", "text/javascript");
      script.setAttribute("src", scriptUrl);
      imageObj.script = script;
      window.document.body.appendChild(script);

    }

    function loadPseudoElement(element, type) {
      var style = window.getComputedStyle(element, type),
        content = style.content;
      if (content.substr(0, 3) === 'url') {
        methods.loadImage(_html2canvas.Util.parseBackgroundImage(content)[0].args[0]);
      }
      loadBackgroundImages(style.backgroundImage, element);
    }

    function loadPseudoElementImages(element) {
      loadPseudoElement(element, ":before");
      loadPseudoElement(element, ":after");
    }

    function loadGradientImage(backgroundImage, bounds) {
      var img = _html2canvas.Generate.Gradient(backgroundImage, bounds);

      if (img !== undefined) {
        images[backgroundImage] = {
          img: img,
          succeeded: true
        };
        images.numTotal++;
        images.numLoaded++;
        start();
      }
    }

    function invalidBackgrounds(background_image) {
      return (background_image && background_image.method && background_image.args && background_image.args.length > 0);
    }

    function loadBackgroundImages(background_image, el) {
      var bounds;

      _html2canvas.Util.parseBackgroundImage(background_image).filter(invalidBackgrounds).forEach(function (background_image) {
        if (background_image.method === 'url') {
          methods.loadImage(background_image.args[0]);
        } else if (background_image.method.match(/\-?gradient$/)) {
          if (bounds === undefined) {
            bounds = _html2canvas.Util.Bounds(el);
          }
          loadGradientImage(background_image.value, bounds);
        }
      });
    }

    function getImages(el) {
      var elNodeType = false;

      // Firefox fails with permission denied on pages with iframes
      try {
        Util.Children(el).forEach(getImages);
      } catch (e) {}

      try {
        elNodeType = el.nodeType;
      } catch (ex) {
        elNodeType = false;
        Util.log("html2canvas: failed to access some element's nodeType - Exception: " + ex.message);
      }

      if (elNodeType === 1 || elNodeType === undefined) {

        loadPseudoElementImages(el);
        try {
          loadBackgroundImages(Util.getCSS(el, 'backgroundImage'), el);
        } catch (e) {
          Util.log("html2canvas: failed to get background-image - Exception: " + e.message);
        }
        loadBackgroundImages(el);
      }
    }

    function setImageLoadHandlers(img, imageObj) {

      img.onload = function () {

        if (imageObj.timer !== undefined) {
          // CORS succeeded
          window.clearTimeout(imageObj.timer);
        }

        images.numLoaded++;
        imageObj.succeeded = true;
        img.onerror = img.onload = null;
        start();
      };

      img.onerror = function () {

        if (img.crossOrigin === "anonymous") {
          // CORS failed
          window.clearTimeout(imageObj.timer);

          // let's try with proxy instead
          if (options.proxy) {
            var src = img.src;
            img = new Image();
            imageObj.img = img;
            img.src = src;

            proxyGetImage(img.src, img, imageObj);
            return;
          }
        }

        images.numLoaded++;
        images.numFailed++;
        imageObj.succeeded = false;
        img.onerror = img.onload = null;

        start();
      };
    }

    methods = {
      loadImage: function (src) {

        var img, imageObj;
        if (src && images[src] === undefined) {

            img = new Image();
            if (src.match(/data:image\/.*;base64,/i)) {
              img.src = src.replace(/url\(['"]{0,}|['"]{0,}\)$/ig, '');
              imageObj = images[src] = {
                img: img
              };
              images.numTotal++;
              setImageLoadHandlers(img, imageObj);
            } else if (isSameOrigin(src) || options.allowTaint === true) {
              imageObj = images[src] = {
                img: img
              };
              images.numTotal++;
              setImageLoadHandlers(img, imageObj);
              img.src = src;

            } else if (supportCORS && !options.allowTaint && options.useCORS) {
              // attempt to load with CORS

              img.crossOrigin = "anonymous";
              imageObj = images[src] = { img: img };
              images.numTotal++;

              setImageLoadHandlers(img, imageObj);
              img.src = src;

            } else if (options.proxy) {
              imageObj = images[src] = {
                img: img
              };
              images.numTotal++;
              proxyGetImage(src, img, imageObj);
            }
        }

      },
      cleanupDOM: function (cause) {

        var img, src;
        if (!images.cleanupDone) {
          if (cause && typeof cause === "string") {
            Util.log("html2canvas: Cleanup because: " + cause);
          } else {
            Util.log("html2canvas: Cleanup after timeout: " + options.timeout + " ms.");
          }

          for (src in images) {
            if (images.hasOwnProperty(src)) {
              img = images[src];
              if (typeof img === "object" && img.callbackname && img.succeeded === undefined) {
                // cancel proxy image request
                window[img.callbackname] = undefined; // to work with IE<9  // NOTE: that the undefined callback property-name still exists on the window object (for IE<9)
                try {
                  delete window[img.callbackname]; // for all browser that support this
                } catch (ex) {}
                if (img.script && img.script.parentNode) {
                  img.script.setAttribute("src", "about:blank"); // try to cancel running request
                  img.script.parentNode.removeChild(img.script);
                }
                images.numLoaded++;
                images.numFailed++;
                Util.log("html2canvas: Cleaned up failed img: '" + src + "' Steps: " + images.numLoaded + " / " + images.numTotal);
              }
            }
          }

          // cancel any pending requests
          if (window.stop !== undefined) {
            window.stop();
          } else if (document.execCommand !== undefined) {
            document.execCommand("Stop", false);
          }
          if (document.close !== undefined) {
            document.close();
          }
          images.cleanupDone = true;
          if (!(cause && typeof cause === "string")) {
            start();
          }
        }
      },

      renderingDone: function () {

        if (timeoutTimer) {
          window.clearTimeout(timeoutTimer);
        }
      }
    };

    if (options.timeout > 0) {
      timeoutTimer = window.setTimeout(methods.cleanupDOM, options.timeout);
    }

    Util.log('html2canvas: Preload starts: finding background-images');
    images.firstRun = true;

    getImages(element);

    Util.log('html2canvas: Preload: Finding images');
    // load <img> images
    for (i = 0; i < imgLen; i += 1) {
      methods.loadImage(domImages[i].getAttribute("src"));
    }

    images.firstRun = false;
    Util.log('html2canvas: Preload: Done.');
    if (images.numTotal === images.numLoaded)
      start();

    return methods;
  };

  _html2canvas.Renderer = function (parseQueue, options) {

    // http://www.w3.org/TR/CSS21/zindex.html
    function createRenderQueue(parseQueue) {
      var queue = [],
        rootContext;

      rootContext = (function buildStackingContext(rootNode) {
        var rootContext = {};

        function insert(context, node, specialParent) {
          var zi = (node.zIndex.zindex === 'auto') ? 0 : Number(node.zIndex.zindex),
            contextForChildren = context, // the stacking context for children
            isPositioned = node.zIndex.isPositioned,
            isFloated = node.zIndex.isFloated,
            stub = {
              node: node
            },
            childrenDest = specialParent; // where children without z-index should be pushed into

          if (node.zIndex.ownStacking) {
            // '!' comes before numbers in sorted array
            contextForChildren = stub.context = {
              '!': [{
                node: node,
                children: []
              }]
            };
            childrenDest = undefined;
          } else if (isPositioned || isFloated) {
            childrenDest = stub.children = [];
          }

          if (zi === 0 && specialParent) {
            specialParent.push(stub);
          } else {
            if (!context[zi]) {
              context[zi] = [];
            }
            context[zi].push(stub);
          }

          node.zIndex.children.forEach(function (childNode) {
            insert(contextForChildren, childNode, childrenDest);
          });
        }
        insert(rootContext, rootNode);
        return rootContext;
      })(parseQueue);

      function sortZ(context) {
        Object.keys(context).sort().forEach(function (zi) {
          var nonPositioned = [],
            floated = [],
            positioned = [],
            list = [];

          // positioned after static
          context[zi].forEach(function (v) {
            if (v.node.zIndex.isPositioned || v.node.zIndex.opacity < 1) {
              // http://www.w3.org/TR/css3-color/#transparency
              // non-positioned element with opactiy < 1 should be stacked as if it were a positioned element with ‘z-index: 0’ and ‘opacity: 1’.
              positioned.push(v);
            } else if (v.node.zIndex.isFloated) {
              floated.push(v);
            } else {
              nonPositioned.push(v);
            }
          });

          (function walk(arr) {
            arr.forEach(function (v) {
              list.push(v);
              if (v.children) {
                walk(v.children);
              }
            });
          })(nonPositioned.concat(floated, positioned));

          list.forEach(function (v) {
            if (v.context) {
              sortZ(v.context);
            } else {
              queue.push(v.node);
            }
          });
        });
      }

      sortZ(rootContext);

      return queue;
    }

    function getRenderer(rendererName) {
      var renderer;

      if (typeof options.renderer === "string" && _html2canvas.Renderer[rendererName] !== undefined) {
        renderer = _html2canvas.Renderer[rendererName](options);
      } else if (typeof rendererName === "function") {
        renderer = rendererName(options);
      } else {
        throw new Error("Unknown renderer");
      }

      if (typeof renderer !== "function") {
        throw new Error("Invalid renderer defined");
      }
      return renderer;
    }

    return getRenderer(options.renderer)(parseQueue, options, document, createRenderQueue(parseQueue.stack), _html2canvas);
  };

  _html2canvas.Util.Support = function (options, doc) {

    function supportSVGRendering() {
      var img = new Image(),
        canvas = doc.createElement("canvas"),
        ctx = (canvas.getContext === undefined) ? false : canvas.getContext("2d");
      if (ctx === false) {
        return false;
      }
      canvas.width = canvas.height = 10;
      img.src = [
        "data:image/svg+xml,",
        "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'>",
        "<foreignObject width='10' height='10'>",
        "<div xmlns='http://www.w3.org/1999/xhtml' style='width:10;height:10;'>",
        "sup",
        "</div>",
        "</foreignObject>",
        "</svg>"
      ].join("");
      try {
        ctx.drawImage(img, 0, 0);
        canvas.toDataURL();
      } catch (e) {
        return false;
      }
      _html2canvas.Util.log('html2canvas: Parse: SVG powered rendering available');
      return true;
    }

    // Test whether we can use ranges to measure bounding boxes
    // Opera doesn't provide valid bounds.height/bottom even though it supports the method.

    function supportRangeBounds() {
      var r, testElement, rangeBounds, rangeHeight, support = false;

      if (doc.createRange) {
        r = doc.createRange();
        if (r.getBoundingClientRect) {
          testElement = doc.createElement('boundtest');
          testElement.style.height = "123px";
          testElement.style.display = "block";
          doc.body.appendChild(testElement);

          r.selectNode(testElement);
          rangeBounds = r.getBoundingClientRect();
          rangeHeight = rangeBounds.height;

          if (rangeHeight === 123) {
            support = true;
          }
          doc.body.removeChild(testElement);
        }
      }

      return support;
    }

    return {
      rangeBounds: supportRangeBounds(),
      svgRendering: options.svgRendering && supportSVGRendering()
    };
  };
  window.html2canvas = function (elements, opts) {

    elements = (elements.length) ? elements : [elements];
    var queue,
      canvas,
      options = {

        // general
        logging: false,
        container: null,
        elements: elements,
        background: undefined,

        // preload options
        proxy: null,
        timeout: 0, // no timeout
        useCORS: false, // try to load images as CORS (where available), before falling back to proxy
        allowTaint: false, // whether to allow images to taint the canvas, won't need proxy if set to true

        // parse options
        svgRendering: false, // use svg powered rendering where available (FF11+)
        ignoreElements: "IFRAME|OBJECT|PARAM",
        useOverflow: true,
        letterRendering: false,
        chinese: false,

        // render options
        width: null,
        height: null,
        scale: 1,
        taintTest: true, // do a taint test with all images before applying to canvas
        renderer: "Canvas"
      };

    options = _html2canvas.Util.Extend(opts, options);
    var container = options.container || options.elements[0];
    if(options["width"])  options["width"]  = (options["width"].indexOf("%") !== -1) ? container.width() * parseFloat(options["width"]) / 100 : options["width"];
    if(options["height"]) options["height"] = (options["height"].indexOf("%") !== -1) ? container.height() * parseFloat(options["height"]) / 100 : options["height"];
    if(options["left"]) options["left"] = (options["left"].indexOf("%") !== -1) ? elements[0].offsetWidth * parseFloat(options["left"]) / 100 : options["left"];
    if(options["top"]) options["top"] = (options["top"].indexOf("%") !== -1) ? elements[0].offsetHeight * parseFloat(options["top"]) / 100 : options["top"];
    _html2canvas.logging = options.logging;
    options.complete = function (images) {

      if (typeof options.onpreloaded === "function") {
        if (options.onpreloaded(images) === false) {
          return;
        }
      }
      queue = _html2canvas.Parse(images, options);

      if (typeof options.onparsed === "function") {
        if (options.onparsed(queue) === false) {
          return;
        }
      }

      canvas = _html2canvas.Renderer(queue, options);
      if (typeof options.onrendered === "function") {
        options.onrendered(canvas);
      }


    };

    // for pages without images, we still want this to be async, i.e. return methods before executing
    window.setTimeout(function () {
      _html2canvas.Preload(options);
    }, 0);

    return {
      render: function (queue, opts) {
        return _html2canvas.Renderer(queue, _html2canvas.Util.Extend(opts, options));
      },
      parse: function (images, opts) {
        return _html2canvas.Parse(images, _html2canvas.Util.Extend(opts, options));
      },
      preload: function (opts) {
        return _html2canvas.Preload(_html2canvas.Util.Extend(opts, options));
      },
      log: _html2canvas.Util.log
    };
  };

  window.html2canvas.log = _html2canvas.Util.log; // for renderers
  window.html2canvas.Renderer = {
    Canvas: undefined // We are assuming this will be used
  };
  _html2canvas.Renderer.Canvas = function (options) {

    options = options || {};

    var doc = document,
      safeImages = [],
      testCanvas = document.createElement("canvas"),
      testctx = testCanvas.getContext("2d"),
      Util = _html2canvas.Util,
      canvas = options.canvas || doc.createElement('canvas');

    function createShape(ctx, args) {
      ctx.beginPath();
      args.forEach(function (arg) {
        ctx[arg.name].apply(ctx, arg['arguments']);
      });
      ctx.closePath();
    }

    function safeImage(item) {
      if (safeImages.indexOf(item['arguments'][0].src) === -1) {
        testctx.drawImage(item['arguments'][0], 0, 0);
        try {
          testctx.getImageData(0, 0, 1, 1);
        } catch (e) {
          testCanvas = doc.createElement("canvas");
          testctx = testCanvas.getContext("2d");
          return false;
        }
        safeImages.push(item['arguments'][0].src);
      }
      return true;
    }

    function renderItem(ctx, item) {
      switch (item.type) {
        case "variable":
          ctx[item.name] = item['arguments'];
          break;
        case "function":
          switch (item.name) {
            case "createPattern":
              if (item['arguments'][0].width > 0 && item['arguments'][0].height > 0) {
                try {
                  ctx.fillStyle = ctx.createPattern(item['arguments'][0], "repeat");
                } catch (e) {
                  Util.log("html2canvas: Renderer: Error creating pattern", e.message);
                }
              }
              break;
            case "drawShape":
              createShape(ctx, item['arguments']);
              break;
            case "drawImage":
              if (item['arguments'][8] > 0 && item['arguments'][7] > 0) {
                if (!options.taintTest || (options.taintTest && safeImage(item))) {
                  ctx.drawImage.apply(ctx, item['arguments']);
                }
              }
              break;
            default:
              ctx[item.name].apply(ctx, item['arguments']);
          }
          break;
      }
    }

    function getBrowserInfo() {
      var ua = navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
      if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return ['IE', (tem[1] || '')];
      }
      if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge?)\/(\d+)/);
        if (tem != null) {
          var stem = tem.slice(1);
          stem[0].replace('OPR', 'Opera').replace('Edg ', 'Edge ');
          return stem;
        }
      }
      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
      if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
      return M;
    }

    function getBrowserCanvasLimit(scale) {
      var browser = getBrowserInfo()[0];
      var restrictions = {
        DEFAULT: {
          width: 8192,
          height: 8192
        },
        Edge: {
          width: 8192,
          height: 8192
        },
        Firefox: {
          width: 32767,
          height: 32767
        },
        Safari: {
          width: 32767,
          height: 32767
        },
        Chrome: {
          width: 32767,
          height: 32767
        }
      }

      return [restrictions[browser] || restrictions['DEFAULT'], browser]
    }

    return function (parsedData, options, document, queue, _html2canvas) {
      var ctx = canvas.getContext("2d"),
        newCanvas,
        bounds,
        boundScaleKeys,
        fstyle,
        zStack = parsedData.stack;

      if (options.dpi)
        options.scale = options.dpi / 96;

      var browserCanvasLimit = getBrowserCanvasLimit(options.scale);
      var canvasLimit = browserCanvasLimit[0];

      canvas.width = canvas.style.width = Math.min((options.width || zStack.ctx.width) * options.scale, canvasLimit.width);
      canvas.height = canvas.style.height = Math.min((options.height || zStack.ctx.height) * options.scale, canvasLimit.height);

      fstyle = ctx.fillStyle;
      ctx.scale(options.scale, options.scale);
      ctx.fillStyle = (Util.isTransparent(parsedData.backgroundColor) && options.background !== undefined) ? options.background : parsedData.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = fstyle;

      queue.forEach(function (storageContext) {
        // set common settings for canvas
        ctx.textBaseline = "bottom";
        ctx.save();

        if (storageContext.transform.matrix) {
          ctx.translate(storageContext.transform.origin[0], storageContext.transform.origin[1]);
          ctx.transform.apply(ctx, storageContext.transform.matrix);
          ctx.translate(-storageContext.transform.origin[0], -storageContext.transform.origin[1]);
        }

        if (storageContext.clip) {
          ctx.beginPath();
          ctx.rect(storageContext.clip.left, storageContext.clip.top, storageContext.clip.width, storageContext.clip.height);
          ctx.clip();
        }

        if (storageContext.ctx.storage) {
          storageContext.ctx.storage.forEach(function (item) {
            renderItem(ctx, item);
          });
        }

        ctx.restore();
      });

      Util.log("html2canvas: Renderer: Canvas renderer done, scaled at " + options.scale + " - returning canvas obj");

      if (options.elements.length === 1) {
        if (typeof options.elements[0] === "object" && options.elements[0].nodeName !== "BODY") {
          // crop image to the bounds of selected (single) element

          var container = options.container || options.elements;

          bounds = _html2canvas.Util.Bounds(container[0]);
          bounds.width  = options["width"]  || bounds.width;
          bounds.height = options["height"] || bounds.height;

          boundScaleKeys = ['width', 'height', 'top', 'left'];

          boundScaleKeys.forEach(function (key) {
            var limitKey = ['width', 'left'].indexOf(key) === -1 ? 'height' : 'width';
            bounds[key] = Math.min(bounds[key] * options.scale, canvasLimit[limitKey]);
          });

          newCanvas = document.createElement('canvas');
          newCanvas.width = Math.min(bounds.width, canvasLimit.width);
          newCanvas.height = Math.min(bounds.height, canvasLimit.height);
          newCanvas.style.width = newCanvas.width + 'px';
          newCanvas.style.height = newCanvas.height + 'px';

          ctx = newCanvas.getContext("2d");
          ctx.drawImage(canvas, bounds.left, bounds.top, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
          canvas = null;
          return newCanvas;
        }
      }

      return canvas;
    };
  };
})(window, document);


window.html2canvas_tilemap = function (el) {

  if(Object.keys(el).length === 0) return;
  if(el.length == 0 || el === undefined) return;

  var canvas = el instanceof Element ? el : document.querySelector(el);
  if(canvas.tagName != "CANVAS")
    throw "Element passed through html2canvas_tilemap() must be a canvas";

  canvas.style.objectFit = "cover";
  canvas.style.position = "relative";
  canvas.style.top = "50%";
  canvas.style.left = "50%";
  canvas.style.transform = "translate(-50%, -50%)";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  var src = canvas.getAttribute("data-src");
  var width = parseInt(canvas.getAttribute("width"));
  var height = parseInt(canvas.getAttribute("height"));
  var scale = parseFloat(parseInt(getComputedStyle(canvas).width) / width) || 1;

  var signature = canvas.getAttribute("data-signature");
  var tilesize  = parseInt(canvas.getAttribute("data-tilesize")) || null;

  var xtiles    = parseInt(canvas.getAttribute("data-xtiles"));
  var ytiles    = parseInt(canvas.getAttribute("data-ytiles"));
  var missing   = canvas.getAttribute("data-missing");

  var ctx = canvas.getContext('2d');

  var tileList = [];

  // TODO: Optimize resource loading..
  // function boundsOverlap(r1, r2) {
  //   console.log(r1);
  //   console.log(r2);

  //   return !(r2.left > r1.right ||
  //          r2.right < r1.left ||
  //          r2.top > r1.bottom ||
  //          r2.bottom < r1.top);
  // }

  function tilesLazyload() {

    // var lazywidth  = parseInt(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)/scale);
    // var lazyheight = parseInt(Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)/scale);
    // var lazybounds = {
    //   left:width/2-lazywidth/2,  top:0,
    //   right:width/2+lazywidth/2, bottom:lazyheight
    // };

    for(ix = 0; ix < xtiles; ix++) {
      for(iy = 0; iy < ytiles; iy++) {

        var index = iy*xtiles + ix;
        //console.log("index:", index);

        if(tileList[index] === undefined)
            tileList[index] = new Image();

        tileList[index].onerror = function() {
            this.onerror = "";
            this.src = missing;
        }

        // var dx = ix*tilesize, dy = iy*tilesize;
        // var dw = (tilesize || width), dh = (tilesize || height);
        // var tilebounds = {left:dx, top:dy, right:dx+dw, bottom:dy+dh};

        // var lazyload = boundsOverlap(tilebounds, lazybounds);
        // console.log("lazyload:", lazyload);
        // if(lazyload && tileList[index].src == "") {
        //   tileList[index].src = src + "/" + signature + "/" + index;
        //   console.log("Call.. ", tileList[index].src, lazyload);
        // }

        var tmp_src = src;
        if(tmp_src.indexOf("{signature}")) tmp_src = tmp_src.replaceAll("{signature}", signature);
        else tmp_src += "/" + signature;
        if(tmp_src.indexOf("{id}")) tmp_src = tmp_src.replaceAll("{id}", index);
        else tmp_src += "/" + index;

        tileList[index].src = tmp_src;
      }
    }
  };

  window.onresize = tilesLazyload;
  tilesLazyload();

  var duration = 250;
  var tileOpacity = [];
  var tilePast = [];
  var totalOpacityMax = tileList.length;

  if(totalOpacityMax == 0) return;

  function animate(present) {

    var totalOpacity    = 0;
    for(var index = 0; index < xtiles*ytiles; index++) {

        var tile = tileList[index];
        if(tile !== undefined) {

            if(tile.complete == false) continue;
            if(tileOpacity[index] == 1) continue;

            if(tileOpacity[index] === undefined) tileOpacity[index] = 0;
            if(tilePast[index] === undefined) {
                window.dispatchEvent(new Event('idle'));
                tilePast[index] = present;
            }

            var dOpacity = (present - tilePast[index]) / duration;
            if(!tilesize) dOpacity = 1;

            tileOpacity[index] += dOpacity;
            if(tileOpacity[index] > 1) tileOpacity[index] = 1;

            totalOpacity += tileOpacity[index];
            tilePast[index] = present;

            var ix = index % xtiles;
            var iy = Math.floor(index / xtiles);
            var dx = ix*tilesize, dy = iy*tilesize;
            var sw = tileList[index].width, sh = tileList[index].height;
            var dw = tilesize || width, dh = tilesize || height;

            ctx.globalAlpha = tileOpacity[index];
            ctx.drawImage(tile, 0,0, sw,sh, dx,dy, dw,dh);
        }
    }

    if (totalOpacity < totalOpacityMax) window.requestAnimationFrame(animate);
    else window.dispatchEvent(new Event('tilesloaded'));
  }

  window.requestAnimationFrame(animate);


}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!************************!*\
  !*** ./assets/maps.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _glitchr_html2canvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @glitchr/html2canvas */ "./node_modules/@glitchr/html2canvas/src/index.js");
/* harmony import */ var _glitchr_html2canvas__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_glitchr_html2canvas__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _styles_js_tilemap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./styles/js/tilemap.js */ "./assets/styles/js/tilemap.js");
/* harmony import */ var _styles_js_tilemap_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_js_tilemap_js__WEBPACK_IMPORTED_MODULE_1__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }



// jQuery plugin wrapper for html2canvas with tiling support
var html2canvasPlugin = function html2canvasPlugin(container) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var onrenderedCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var $ = this.constructor;
  if (this.length === 0) return this;
  var element = $(container).length > 0 ? $(container)[0] : this[0];
  var insert = opts.insert || 'append';
  var options = _objectSpread(_objectSpread({}, opts), {}, {
    onrendered: function onrendered(canvas) {
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
  });
  delete options.insert;
  window.html2canvas(element, options);
  return this;
};

// Register plugin on global jQuery (loaded from CDN)
if (window.jQuery) window.jQuery.fn.html2canvas = html2canvasPlugin;
if (window.$) window.$.fn.html2canvas = html2canvasPlugin;
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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WUFBWTtBQUNaO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTs7O0FBR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMENBQTBDLE9BQU87QUFDakQ7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsT0FBTzs7QUFFUCxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LHlDQUF5Qyx3QkFBd0IsMkJBQTJCOztBQUU1Rjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscUNBQXFDO0FBQ3JDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkIsZ0JBQWdCOztBQUUzQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXOztBQUVYO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWtFO0FBQ2xFOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUI7O0FBRXZCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0Esd0NBQXdDO0FBQ3hDLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7O0FBRVI7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSwwQ0FBMEM7QUFDMUMsK0NBQStDLEdBQUcsTUFBTSxHQUFHO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGNBQWM7QUFDZDs7QUFFQTtBQUNBLHlDQUF5QztBQUN6Qzs7QUFFQTtBQUNBOztBQUVBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNEO0FBQ3REO0FBQ0EsbURBQW1EO0FBQ25ELGtCQUFrQjtBQUNsQjtBQUNBLGlFQUFpRTtBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCLFlBQVk7QUFDNUI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsMENBQTBDOztBQUUxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLFdBQVc7QUFDWCxTQUFTO0FBQ1Q7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUVBQW1FLFVBQVU7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQSxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFF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QUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ25FLElBQU0wRixNQUFNLEdBQUdMLElBQUksQ0FBQ0ssTUFBTSxJQUFJLFFBQVE7RUFFdEMsSUFBTUMsT0FBTyxHQUFBQyxhQUFBLENBQUFBLGFBQUEsS0FDTlAsSUFBSTtJQUNQUSxVQUFVLEVBQUUsU0FBWkEsVUFBVUEsQ0FBV0MsTUFBTSxFQUFFO01BQ3pCLElBQUlQLGtCQUFrQixJQUFJLE9BQU9BLGtCQUFrQixLQUFLLFVBQVUsRUFBRTtRQUNoRUEsa0JBQWtCLENBQUNPLE1BQU0sQ0FBQztNQUM5QixDQUFDLE1BQU07UUFDSCxJQUFJSixNQUFNLEtBQUssU0FBUyxFQUFFO1VBQ3RCNUYsQ0FBQyxDQUFDMkYsT0FBTyxDQUFDLENBQUNNLE9BQU8sQ0FBQ0QsTUFBTSxDQUFDO1FBQzlCLENBQUMsTUFBTTtVQUNIaEcsQ0FBQyxDQUFDMkYsT0FBTyxDQUFDLENBQUNULE1BQU0sQ0FBQ2MsTUFBTSxDQUFDO1FBQzdCO01BQ0o7SUFDSjtFQUFDLEVBQ0o7RUFFRCxPQUFPSCxPQUFPLENBQUNELE1BQU07RUFDckJuRyxNQUFNLENBQUN5RyxXQUFXLENBQUNQLE9BQU8sRUFBRUUsT0FBTyxDQUFDO0VBQ3BDLE9BQU8sSUFBSTtBQUNmLENBQUM7O0FBRUQ7QUFDQSxJQUFJcEcsTUFBTSxDQUFDUSxNQUFNLEVBQUVSLE1BQU0sQ0FBQ1EsTUFBTSxDQUFDa0csRUFBRSxDQUFDRCxXQUFXLEdBQUdaLGlCQUFpQjtBQUNuRSxJQUFJN0YsTUFBTSxDQUFDTyxDQUFDLEVBQUVQLE1BQU0sQ0FBQ08sQ0FBQyxDQUFDbUcsRUFBRSxDQUFDRCxXQUFXLEdBQUdaLGlCQUFpQixDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3N0eWxlcy9qcy90aWxlbWFwLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZ2xpdGNoci9odG1sMmNhbnZhcy9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL2Fzc2V0cy9tYXBzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvbnRhaW5lci1sZXZlbCB2aXNpYmlsaXR5IGdhdGUuIFdpdGhvdXQgdGhpcywgZXZlcnkgLmdvb2dsZS10aWxlbWFwIGluIHRoZVxuLy8gRE9NIGdldHMgaXRzIHRpbGUgPHNwYW4+cyBjcmVhdGVkIGF0IG1vZHVsZSBpbml0IOKAlCBhbmQgZWFjaCB0aWxlIHRoZW5cbi8vIHJlcXVlc3RzIGl0cyBiYWNrZ3JvdW5kLWltYWdlIGFzIHNvb24gYXMgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgZGVjaWRlcyBpdCdzXG4vLyBpbiB2aWV3cG9ydC4gRm9yIG1hcHMgdGhhdCBhcmUgZGlzcGxheTpub25lIGluIG5pZ2h0IG1vZGUgKG9yIG90aGVyd2lzZVxuLy8gaGlkZGVuIHZpYSBwYXJlbnQgQ1NTKSwgdGhlIHRpbGUgZ2VvbWV0cnkgY2FuIHN0aWxsIHNhdGlzZnkgdGhlXG4vLyBpbnRlcnNlY3Rpb24gdGVzdCBkZXBlbmRpbmcgb24gdGhlIGxheW91dCwgdHJpZ2dlcmluZyBOIHRpbGUgd2VicCByZXF1ZXN0c1xuLy8gZm9yIGNvbnRlbnQgdGhlIHVzZXIgY2FuIG5ldmVyIHNlZS5cbi8vXG4vLyBUaGUgSW50ZXJzZWN0aW9uT2JzZXJ2ZXItb24tdGhlLWNvbnRhaW5lciBhcHByb2FjaCBpcyBtb3JlIGNvbnNlcnZhdGl2ZVxuLy8gdGhhbiBhIG9uZS1zaG90IGdldENvbXB1dGVkU3R5bGUoKSBjaGVjazogaXQgaGFuZGxlcyB0YWJzL2FjY29yZGlvbnMgdGhhdFxuLy8gcmV2ZWFsIHRoZSBtYXAgbGF0ZXIgKGxhenkgcmV2ZWFsKSwgQU5EIGl0IGRvZXNuJ3QgcnVuIGFueSB3b3JrIGZvciBtYXBzXG4vLyB0aGF0IHRoZSB1c2VyIG5ldmVyIHNjcm9sbHMgdG8uIGByb290TWFyZ2luOiAyMDBweGAgcHJlLXdhcm1zIHRoZSBtYXAgfjFcbi8vIHZpZXdwb3J0IGJlZm9yZSBpdCdzIGFjdHVhbGx5IHZpc2libGUsIGJhbGFuY2luZyBwZXJjZWl2ZWQgcmVzcG9uc2l2ZW5lc3Ncbi8vIGFnYWluc3QgYmFuZHdpZHRoIHdhc3RlLlxuZnVuY3Rpb24gX2dtVGlsZW1hcFNob3VsZEluaXQoZWwpIHtcbiAgICBpZiAoIWVsLmlzQ29ubmVjdGVkKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpO1xuICAgIGlmIChzdHlsZS5kaXNwbGF5ID09PSAnbm9uZScgfHwgc3R5bGUudmlzaWJpbGl0eSA9PT0gJ2hpZGRlbicpIHJldHVybiBmYWxzZTtcbiAgICAvLyBvZmZzZXRQYXJlbnQgPT09IG51bGwgd2hlbiB0aGUgZWxlbWVudCBvciBhbiBhbmNlc3RvciBpcyBkaXNwbGF5Om5vbmUuXG4gICAgLy8gUG9zaXRpb246Zml4ZWQgZWxlbWVudHMgaGF2ZSBudWxsIG9mZnNldFBhcmVudCBidXQgQVJFIHJlbmRlcmVkLCBzb1xuICAgIC8vIGV4ZW1wdCB0aG9zZS5cbiAgICBpZiAoZWwub2Zmc2V0UGFyZW50ID09PSBudWxsICYmIHN0eWxlLnBvc2l0aW9uICE9PSAnZml4ZWQnKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGluaXRUaWxlTWFwKCkge1xuXG4gIHZhciAkID0gd2luZG93LmpRdWVyeSB8fCB3aW5kb3cuJDtcbiAgaWYgKCEkKSByZXR1cm47IC8vIGpRdWVyeSBub3QgeWV0IGF0dGFjaGVkIHRvIHdpbmRvdzsgc2FmZSBuby1vcFxuICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nb29nbGUtdGlsZW1hcFwiKTtcblxuICAvLyBDb250YWluZXItbGV2ZWwgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgZ2F0ZTogb25seSBydW4gcGVyLWNvbnRhaW5lciB0aWxlXG4gIC8vIHNldHVwIG9uY2UgdGhlIGNvbnRhaW5lciBpcyBuZWFyIHRoZSB2aWV3cG9ydCBBTkQgYWN0dWFsbHkgdmlzaWJsZVxuICAvLyAob2Zmc2V0UGFyZW50IC8gY29tcHV0ZWQgZGlzcGxheSBjaGVja3MpLiBDb250YWluZXJzIHRoYXQgYXJlIGRpc3BsYXk6bm9uZVxuICAvLyBvciBvZmYtc2NyZWVuLWZhciBuZXZlciB0cmlnZ2VyIHRoZSBwZXItdGlsZSBuZXR3b3JrIHJlcXVlc3RzLlxuICBpZiAoXCJJbnRlcnNlY3Rpb25PYnNlcnZlclwiIGluIHdpbmRvdykge1xuICAgIHZhciBjb250YWluZXJPYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihmdW5jdGlvbihlbnRyaWVzKSB7XG4gICAgICBlbnRyaWVzLmZvckVhY2goZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgICAgaWYgKCFlbnRyeS5pc0ludGVyc2VjdGluZykgcmV0dXJuO1xuICAgICAgICBpZiAoIV9nbVRpbGVtYXBTaG91bGRJbml0KGVudHJ5LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgaWYgKGVudHJ5LnRhcmdldC5kYXRhc2V0LmdtVGlsZW1hcEluaXRpYWxpemVkID09PSAnMScpIHJldHVybjtcbiAgICAgICAgZW50cnkudGFyZ2V0LmRhdGFzZXQuZ21UaWxlbWFwSW5pdGlhbGl6ZWQgPSAnMSc7XG4gICAgICAgIGNvbnRhaW5lck9ic2VydmVyLnVub2JzZXJ2ZShlbnRyeS50YXJnZXQpO1xuICAgICAgICBfaW5pdFRpbGVNYXBDb250YWluZXIoZW50cnkudGFyZ2V0LCAkKTtcbiAgICAgIH0pO1xuICAgIH0sIHsgcm9vdE1hcmdpbjogJzIwMHB4JyB9KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRhaW5lci5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNvbnRhaW5lcltpXS5kYXRhc2V0LmdtVGlsZW1hcEluaXRpYWxpemVkID09PSAnMScpIGNvbnRpbnVlO1xuICAgICAgY29udGFpbmVyT2JzZXJ2ZXIub2JzZXJ2ZShjb250YWluZXJbaV0pO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBObyBJbnRlcnNlY3Rpb25PYnNlcnZlciBzdXBwb3J0OiBpbml0IHN5bmNocm9ub3VzbHkgKGxlZ2FjeSBwYXRoKS5cbiAgZm9yICh2YXIgaiA9IDA7IGogPCBjb250YWluZXIubGVuZ3RoOyBqKyspIHtcbiAgICBpZiAoY29udGFpbmVyW2pdLmRhdGFzZXQuZ21UaWxlbWFwSW5pdGlhbGl6ZWQgPT09ICcxJykgY29udGludWU7XG4gICAgY29udGFpbmVyW2pdLmRhdGFzZXQuZ21UaWxlbWFwSW5pdGlhbGl6ZWQgPSAnMSc7XG4gICAgX2luaXRUaWxlTWFwQ29udGFpbmVyKGNvbnRhaW5lcltqXSwgJCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2luaXRUaWxlTWFwQ29udGFpbmVyKGVsLCAkKSB7XG5cbiAgICBpZihlbC50YWdOYW1lICE9IFwiRElWXCIpXG4gICAgICB0aHJvdyBcIkVsZW1lbnQgcGFzc2VkIHRocm91Z2ggZ21fdGlsZW1hcCgpIG11c3QgYmUgYSBkaXZcIjtcblxuICAgIGlmIChlbCA9PSBkb2N1bWVudCkgZWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgaWYgKGVsID09IHdpbmRvdykgZWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICAkKGVsKS5jc3MoXCJvYmplY3QtZml0XCIsIFwiY292ZXJcIik7XG4gICAgJChlbCkuY3NzKFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKTtcbiAgICAkKGVsKS5jc3MoXCJ0b3BcIiwgXCI1MCVcIik7XG4gICAgJChlbCkuY3NzKFwibGVmdFwiLCBcIjUwJVwiKTtcbiAgICAkKGVsKS5jc3MoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoLTUwJSwgLTUwJSlcIik7XG4gICAgJChlbCkuY3NzKFwid2lkdGhcIiwgXCIxMDAlXCIpO1xuICAgICQoZWwpLmNzcyhcImhlaWdodFwiLCBcIjEwMCVcIik7XG5cbiAgICB2YXIgc3JjID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1zcmNcIik7XG4gICAgdmFyIHNpZ25hdHVyZSA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtc2lnbmF0dXJlXCIpO1xuICAgIHZhciB0aWxlc2l6ZSAgPSBwYXJzZUludChlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRpbGVzaXplXCIpKSB8fCBudWxsO1xuICAgIHZhciByZXNvbHV0aW9uID0gMjtcbiAgICB2YXIgeHRpbGVzICAgID0gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS14dGlsZXNcIikpO1xuICAgIHZhciB5dGlsZXMgICAgPSBwYXJzZUludChlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXl0aWxlc1wiKSk7XG4gICAgLy8gdmFyIG1pc3NpbmcgICA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtbWlzc2luZ1wiKTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJsYXp5bG9hZC5nbV90aWxlbWFwXCIsIGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgbGF6eUJhY2tncm91bmRzID0gZWwucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWJhY2tncm91bmQtaW1hZ2VdXCIpO1xuXG4gICAgICBpZiAoXCJJbnRlcnNlY3Rpb25PYnNlcnZlclwiIGluIHdpbmRvdyAmJiBcIkludGVyc2VjdGlvbk9ic2VydmVyRW50cnlcIiBpbiB3aW5kb3cgJiYgXCJpbnRlcnNlY3Rpb25SYXRpb1wiIGluIHdpbmRvdy5JbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5LnByb3RvdHlwZSkge1xuICAgICAgICBsZXQgbGF6eUJhY2tncm91bmRPYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihmdW5jdGlvbihlbnRyaWVzLCBvYnNlcnZlcikge1xuICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRyeSkge1xuICAgICAgICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XG5cbiAgICAgICAgICAgICAgaWYoZW50cnkudGFyZ2V0LmRhdGFzZXQuYmFja2dyb3VuZEltYWdlKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgcHJlbG9hZGVySW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVySW1nLnNyYyA9IGVudHJ5LnRhcmdldC5kYXRhc2V0LmJhY2tncm91bmRJbWFnZTtcbiAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVySW1nLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoZXZlbnQpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybCgnXCIrZXZlbnQudGFyZ2V0LnNyYytcIicpXCI7XG4gICAgICAgICAgICAgICAgICAgICAgZW50cnkudGFyZ2V0LnN0eWxlLm9wYWNpdHkgICA9IFwiMVwiO1xuICAgICAgICAgICAgICAgICAgICAgIHByZWxvYWRlckltZyA9IG51bGw7ICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgZW50cnkudGFyZ2V0LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtYmFja2dyb3VuZC1pbWFnZVwiKTsgICAgXG4gICAgICAgICAgICAgIGxhenlCYWNrZ3JvdW5kT2JzZXJ2ZXIudW5vYnNlcnZlKGVudHJ5LnRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxhenlCYWNrZ3JvdW5kcy5mb3JFYWNoKGZ1bmN0aW9uKGxhenlCYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgbGF6eUJhY2tncm91bmRPYnNlcnZlci5vYnNlcnZlKGxhenlCYWNrZ3JvdW5kKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBcbiAgICBmdW5jdGlvbiBvYmplY3RGaXQoY29udGFpbnMgLyogdHJ1ZSA9IGNvbnRhaW4sIGZhbHNlID0gY292ZXIgKi8sIGNvbnRhaW5lcldpZHRoLCBjb250YWluZXJIZWlnaHQsIHdpZHRoLCBoZWlnaHQpe1xuXG4gICAgICB2YXIgZG9SYXRpbyA9IHdpZHRoIC8gaGVpZ2h0O1xuICAgICAgdmFyIGNSYXRpbyA9IGNvbnRhaW5lcldpZHRoIC8gY29udGFpbmVySGVpZ2h0O1xuICAgICAgdmFyIHRhcmdldFdpZHRoID0gMDtcbiAgICAgIHZhciB0YXJnZXRIZWlnaHQgPSAwO1xuICAgICAgdmFyIHRlc3QgPSBjb250YWlucyA/IChkb1JhdGlvID4gY1JhdGlvKSA6IChkb1JhdGlvIDwgY1JhdGlvKTtcblxuICAgICAgaWYgKHRlc3QpIHtcbiAgICAgICAgICB0YXJnZXRXaWR0aCA9IGNvbnRhaW5lcldpZHRoO1xuICAgICAgICAgIHRhcmdldEhlaWdodCA9IHRhcmdldFdpZHRoIC8gZG9SYXRpbztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0O1xuICAgICAgICAgIHRhcmdldFdpZHRoID0gdGFyZ2V0SGVpZ2h0ICogZG9SYXRpbztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB3aWR0aDogdGFyZ2V0V2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiB0YXJnZXRIZWlnaHQsXG4gICAgICAgICAgbGVmdDogKGNvbnRhaW5zID8gLTEgOiAxKSAqIChjb250YWluZXJXaWR0aCAtIHRhcmdldFdpZHRoKSAvIDIsXG4gICAgICAgICAgdG9wOiAoY29udGFpbnMgPyAtMSA6IDEpICogKGNvbnRhaW5lckhlaWdodCAtIHRhcmdldEhlaWdodCkgLyAyXG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciB3aWR0aCAgPSB4dGlsZXMqdGlsZXNpemUvcmVzb2x1dGlvbjtcbiAgICB2YXIgaGVpZ2h0ID0geXRpbGVzKnRpbGVzaXplL3Jlc29sdXRpb247XG5cbiAgICB2YXIgdGlsZSA9IG9iamVjdEZpdCh0cnVlLCB3aWR0aCwgaGVpZ2h0LCBlbC5jbGllbnRXaWR0aCwgZWwuY2xpZW50SGVpZ2h0KTtcbiAgICBpZih0aWxlLndpZHRoID09IHdpZHRoKSB0aWxlID0gb2JqZWN0Rml0KGZhbHNlLCB3aWR0aCwgaGVpZ2h0LCBlbC5jbGllbnRXaWR0aCwgZWwuY2xpZW50SGVpZ2h0KTtcbiAgICBcbiAgICB2YXIgZWxUaWxlID0gJChlbCkuZmluZChcInNwYW5cIilcbiAgICBmb3IoaXkgPSAwOyBpeSA8IHl0aWxlczsgaXkrKykge1xuICAgIFxuICAgICAgZm9yKGl4ID0gMDsgaXggPCB4dGlsZXM7IGl4KyspIHtcblxuICAgICAgICBjb25zdCB0aWxlVyA9IE1hdGguZmxvb3IodGlsZS53aWR0aCAgLyB4dGlsZXMpO1xuICAgICAgICBjb25zdCB0aWxlSCA9IE1hdGguZmxvb3IodGlsZS5oZWlnaHQgLyB5dGlsZXMpO1xuICAgICAgICBjb25zdCB0aWxlU2l6ZSA9IE1hdGgubWF4KHRpbGVXLCB0aWxlSCk7XG4gICAgICAgIHZhciBpbmRleCA9IGl5Knh0aWxlcyArIGl4O1xuXG4gICAgICAgIGlmIChlbFRpbGVbaW5kZXhdID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgZWxUaWxlW2luZGV4XSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuXG4gICAgICAgICAgICB2YXIgdG1wX3NyYyA9IGRlY29kZVVSSShzcmMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZih0bXBfc3JjLmluZGV4T2YoXCJ7c2lnbmF0dXJlfVwiKSkgdG1wX3NyYyA9IHRtcF9zcmMucmVwbGFjZUFsbChcIntzaWduYXR1cmV9XCIsIHNpZ25hdHVyZSk7XG4gICAgICAgICAgICBlbHNlIHRtcF9zcmMgKz0gXCIvXCIgKyBzaWduYXR1cmU7XG4gICAgICAgICAgICBpZih0bXBfc3JjLmluZGV4T2YoXCJ7aWR9XCIpKSB0bXBfc3JjID0gdG1wX3NyYy5yZXBsYWNlQWxsKFwie2lkfVwiLCBpbmRleCk7XG4gICAgICAgICAgICBlbHNlIHRtcF9zcmMgKz0gXCIvXCIgKyBpbmRleDtcblxuICAgICAgICAgICAgZWxUaWxlW2luZGV4XS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBlbC5nZXRBdHRyaWJ1dGUoXCJpZFwiKStcIl9cIitpbmRleCk7XG4gICAgICAgICAgICBlbFRpbGVbaW5kZXhdLnNldEF0dHJpYnV0ZShcImRhdGEtYmFja2dyb3VuZC1pbWFnZVwiLCB0bXBfc3JjKTsgLy91cmwoJ1wiK21pc3NpbmcrXCInKVxuICAgICAgICAgICAgZWxUaWxlW2luZGV4XS5zdHlsZS5vcGFjaXR5ICAgPSBcIjBcIjtcblxuICAgICAgICAgICAgdmFyIHJuZCA9IChNYXRoLnJhbmRvbSgpKjAuNSkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgIGVsVGlsZVtpbmRleF0uc3R5bGUudHJhbnNpdGlvbiAgID0gXCJvcGFjaXR5IDAuNXMgZWFzZSBcIitybmQrXCJzXCI7XG4gICAgICAgICAgICBlbC5hcHBlbmQoZWxUaWxlW2luZGV4XSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsZWZ0ID0gdGlsZS5sZWZ0ICsgaXggKiB0aWxlU2l6ZTtcbiAgICAgICAgY29uc3QgdG9wICA9IHRpbGUudG9wICArIGl5ICogdGlsZVNpemU7XG4gICAgICAgIGNvbnN0IHdpZHRoICA9IChpeCA9PT0geHRpbGVzIC0gMSkgPyB0aWxlLndpZHRoICAtIHRpbGVTaXplICogaXg6IHRpbGVTaXplO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSAoaXkgPT09IHl0aWxlcyAtIDEpID8gdGlsZS5oZWlnaHQgLSB0aWxlU2l6ZSAqIGl5OiB0aWxlU2l6ZTtcblxuICAgICAgICBlbFRpbGVbaW5kZXhdLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgICAgICBlbFRpbGVbaW5kZXhdLnN0eWxlLmxlZnQgICA9IGxlZnQgKyBcInB4XCI7XG4gICAgICAgIGVsVGlsZVtpbmRleF0uc3R5bGUudG9wICAgID0gdG9wICArIFwicHhcIjtcbiAgICAgICAgZWxUaWxlW2luZGV4XS5zdHlsZS53aWR0aCAgPSAod2lkdGggICsgMC4xKSArIFwicHhcIjtcbiAgICAgICAgZWxUaWxlW2luZGV4XS5zdHlsZS5oZWlnaHQgPSAoaGVpZ2h0ICsgMC4xKSArIFwicHhcIjtcbiAgICAgICAgZWxUaWxlW2luZGV4XS5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICh3aWR0aCAgKyAwLjEpICsgXCJweCBcIiArIChoZWlnaHQgKyAwLjEpICsgXCJweFwiO1xuICAgICAgICBcbiAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJsYXp5bG9hZC5nbV90aWxlbWFwXCIpKTtcbiAgICAgIH1cbiAgICB9XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgaW5pdFRpbGVNYXApO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGluaXRUaWxlTWFwKTtcbi8vIFRyYW5zcGFyZW50IHN3YXBzIGNvbnRlbnQgdmlhIEFKQVggd2l0aG91dCBmaXJpbmcgd2luZG93ICdsb2FkJywgc28gcmUtaW5pdCB0aWxlcyBhZnRlcndhcmQuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNwYXJlbnQ6cmVhZHknLCBpbml0VGlsZU1hcCk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNwYXJlbnQ6cG9zdGFjdGl2ZScsIGluaXRUaWxlTWFwKTtcbiIsIi8qXG4gIGh0bWwyY2FudmFzLWRwaSAwLjQuOSA8aHR0cDovL2h0bWwyY2FudmFzLmhlcnR6ZW4uY29tPlxuICBDb3B5cmlnaHQgKGMpIDIwMjAgTmlrbGFzIHZvbiBIZXJ0emVuXG5cbiAgUmVsZWFzZWQgdW5kZXIgTUlUIExpY2Vuc2VcbiovXG5cbihmdW5jdGlvbiAod2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIF9odG1sMmNhbnZhcyA9IHt9LFxuICAgIHByZXZpb3VzRWxlbWVudCxcbiAgICBjb21wdXRlZENTUztcblxuICBfaHRtbDJjYW52YXMuVXRpbCA9IHt9O1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLmxvZyA9IGZ1bmN0aW9uIChhKSB7XG4gICAgaWYgKF9odG1sMmNhbnZhcy5sb2dnaW5nICYmIHdpbmRvdy5jb25zb2xlICYmIHdpbmRvdy5jb25zb2xlLmxvZykge1xuICAgICAgd2luZG93LmNvbnNvbGUubG9nKGEpO1xuICAgIH1cbiAgfTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC50cmltVGV4dCA9IChmdW5jdGlvbiAoaXNOYXRpdmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICByZXR1cm4gaXNOYXRpdmUgPyBpc05hdGl2ZS5hcHBseShpbnB1dCkgOiAoKGlucHV0IHx8ICcnKSArICcnKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgfTtcbiAgfSkoU3RyaW5nLnByb3RvdHlwZS50cmltKTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC5hc0Zsb2F0ID0gZnVuY3Rpb24gKHYpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCh2KTtcbiAgfTtcblxuICAoZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE86IHN1cHBvcnQgYWxsIHBvc3NpYmxlIGxlbmd0aCB2YWx1ZXNcbiAgICB2YXIgVEVYVF9TSEFET1dfUFJPUEVSVFkgPSAvKChyZ2JhfHJnYilcXChbXlxcKV0rXFwpKFxccy0/XFxkK3B4KXswLH0pL2c7XG4gICAgdmFyIFRFWFRfU0hBRE9XX1ZBTFVFUyA9IC8oLT9cXGQrcHgpfCgjLispfChyZ2JcXCguK1xcKSl8KHJnYmFcXCguK1xcKSkvZztcbiAgICBfaHRtbDJjYW52YXMuVXRpbC5wYXJzZVRleHRTaGFkb3dzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoIXZhbHVlIHx8IHZhbHVlID09PSAnbm9uZScpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBmaW5kIG11bHRpcGxlIHNoYWRvdyBkZWNsYXJhdGlvbnNcbiAgICAgIHZhciBzaGFkb3dzID0gdmFsdWUubWF0Y2goVEVYVF9TSEFET1dfUFJPUEVSVFkpLFxuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgc2hhZG93cyAmJiAoaSA8IHNoYWRvd3MubGVuZ3RoKTsgaSsrKSB7XG4gICAgICAgIHZhciBzID0gc2hhZG93c1tpXS5tYXRjaChURVhUX1NIQURPV19WQUxVRVMpO1xuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIGNvbG9yOiBzWzBdLFxuICAgICAgICAgIG9mZnNldFg6IHNbMV0gPyBzWzFdLnJlcGxhY2UoJ3B4JywgJycpIDogMCxcbiAgICAgICAgICBvZmZzZXRZOiBzWzJdID8gc1syXS5yZXBsYWNlKCdweCcsICcnKSA6IDAsXG4gICAgICAgICAgYmx1cjogc1szXSA/IHNbM10ucmVwbGFjZSgncHgnLCAnJykgOiAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcbiAgfSkoKTtcblxuXG4gIF9odG1sMmNhbnZhcy5VdGlsLnBhcnNlQmFja2dyb3VuZEltYWdlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIHdoaXRlc3BhY2UgPSAnIFxcclxcblxcdCcsXG4gICAgICBtZXRob2QsIGRlZmluaXRpb24sIHByZWZpeCwgcHJlZml4X2ksIGJsb2NrLCByZXN1bHRzID0gW10sXG4gICAgICBjLCBtb2RlID0gMCxcbiAgICAgIG51bVBhcmVuID0gMCxcbiAgICAgIHF1b3RlLCBhcmdzO1xuXG4gICAgdmFyIGFwcGVuZFJlc3VsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChtZXRob2QpIHtcbiAgICAgICAgaWYgKGRlZmluaXRpb24uc3Vic3RyKDAsIDEpID09PSAnXCInKSB7XG4gICAgICAgICAgZGVmaW5pdGlvbiA9IGRlZmluaXRpb24uc3Vic3RyKDEsIGRlZmluaXRpb24ubGVuZ3RoIC0gMik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZmluaXRpb24pIHtcbiAgICAgICAgICBhcmdzLnB1c2goZGVmaW5pdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1ldGhvZC5zdWJzdHIoMCwgMSkgPT09ICctJyAmJlxuICAgICAgICAgIChwcmVmaXhfaSA9IG1ldGhvZC5pbmRleE9mKCctJywgMSkgKyAxKSA+IDApIHtcbiAgICAgICAgICBwcmVmaXggPSBtZXRob2Quc3Vic3RyKDAsIHByZWZpeF9pKTtcbiAgICAgICAgICBtZXRob2QgPSBtZXRob2Quc3Vic3RyKHByZWZpeF9pKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgIHByZWZpeDogcHJlZml4LFxuICAgICAgICAgIG1ldGhvZDogbWV0aG9kLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgdmFsdWU6IGJsb2NrLFxuICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBhcmdzID0gW107IC8vZm9yIHNvbWUgb2RkIHJlYXNvbiwgc2V0dGluZyAubGVuZ3RoID0gMCBkaWRuJ3Qgd29yayBpbiBzYWZhcmlcbiAgICAgIG1ldGhvZCA9XG4gICAgICAgIHByZWZpeCA9XG4gICAgICAgIGRlZmluaXRpb24gPVxuICAgICAgICBibG9jayA9ICcnO1xuICAgIH07XG5cbiAgICBhcHBlbmRSZXN1bHQoKTtcbiAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB2YWx1ZS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICBjID0gdmFsdWVbaV07XG4gICAgICBpZiAobW9kZSA9PT0gMCAmJiB3aGl0ZXNwYWNlLmluZGV4T2YoYykgPiAtMSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoYykge1xuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgaWYgKCFxdW90ZSkge1xuICAgICAgICAgICAgcXVvdGUgPSBjO1xuICAgICAgICAgIH0gZWxzZSBpZiAocXVvdGUgPT09IGMpIHtcbiAgICAgICAgICAgIHF1b3RlID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnKCc6XG4gICAgICAgICAgaWYgKHF1b3RlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IDApIHtcbiAgICAgICAgICAgIG1vZGUgPSAxO1xuICAgICAgICAgICAgYmxvY2sgKz0gYztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBudW1QYXJlbisrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICcpJzpcbiAgICAgICAgICBpZiAocXVvdGUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gMSkge1xuICAgICAgICAgICAgaWYgKG51bVBhcmVuID09PSAwKSB7XG4gICAgICAgICAgICAgIG1vZGUgPSAwO1xuICAgICAgICAgICAgICBibG9jayArPSBjO1xuICAgICAgICAgICAgICBhcHBlbmRSZXN1bHQoKTtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBudW1QYXJlbi0tO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICcsJzpcbiAgICAgICAgICBpZiAocXVvdGUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gMCkge1xuICAgICAgICAgICAgYXBwZW5kUmVzdWx0KCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IDEpIHtcbiAgICAgICAgICAgIGlmIChudW1QYXJlbiA9PT0gMCAmJiAhbWV0aG9kLm1hdGNoKC9edXJsJC9pKSkge1xuICAgICAgICAgICAgICBhcmdzLnB1c2goZGVmaW5pdGlvbik7XG4gICAgICAgICAgICAgIGRlZmluaXRpb24gPSAnJztcbiAgICAgICAgICAgICAgYmxvY2sgKz0gYztcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBibG9jayArPSBjO1xuICAgICAgaWYgKG1vZGUgPT09IDApIHtcbiAgICAgICAgbWV0aG9kICs9IGM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZpbml0aW9uICs9IGM7XG4gICAgICB9XG4gICAgfVxuICAgIGFwcGVuZFJlc3VsdCgpO1xuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwuQm91bmRzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICB2YXIgY2xpZW50UmVjdCwgYm91bmRzID0ge307XG5cbiAgICBpZiAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QpIHtcbiAgICAgIGNsaWVudFJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAvLyBUT0RPIGFkZCBzY3JvbGwgcG9zaXRpb24gdG8gYm91bmRzLCBzbyBubyBzY3JvbGxpbmcgb2Ygd2luZG93IG5lY2Vzc2FyeVxuICAgICAgYm91bmRzLnRvcCA9IGNsaWVudFJlY3QudG9wO1xuICAgICAgYm91bmRzLmJvdHRvbSA9IGNsaWVudFJlY3QuYm90dG9tIHx8IChjbGllbnRSZWN0LnRvcCArIGNsaWVudFJlY3QuaGVpZ2h0KTtcbiAgICAgIGJvdW5kcy5sZWZ0ID0gY2xpZW50UmVjdC5sZWZ0O1xuXG4gICAgICBib3VuZHMud2lkdGggPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgYm91bmRzLmhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgIH1cblxuICAgIHJldHVybiBib3VuZHM7XG4gIH07XG5cbiAgLy8gVE9ETyBpZGVhbGx5LCB3ZSdkIHdhbnQgZXZlcnl0aGluZyB0byBnbyB0aHJvdWdoIHRoaXMgZnVuY3Rpb24gaW5zdGVhZCBvZiBVdGlsLkJvdW5kcyxcbiAgLy8gYnV0IHdvdWxkIHJlcXVpcmUgZnVydGhlciB3b3JrIHRvIGNhbGN1bGF0ZSB0aGUgY29ycmVjdCBwb3NpdGlvbnMgZm9yIGVsZW1lbnRzIHdpdGggb2Zmc2V0UGFyZW50c1xuICBfaHRtbDJjYW52YXMuVXRpbC5PZmZzZXRCb3VuZHMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHZhciBwYXJlbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudCA/IF9odG1sMmNhbnZhcy5VdGlsLk9mZnNldEJvdW5kcyhlbGVtZW50Lm9mZnNldFBhcmVudCkgOiB7XG4gICAgICB0b3A6IDAsXG4gICAgICBsZWZ0OiAwXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICB0b3A6IGVsZW1lbnQub2Zmc2V0VG9wICsgcGFyZW50LnRvcCxcbiAgICAgIGJvdHRvbTogZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodCArIHBhcmVudC50b3AsXG4gICAgICBsZWZ0OiBlbGVtZW50Lm9mZnNldExlZnQgKyBwYXJlbnQubGVmdCxcbiAgICAgIHdpZHRoOiBlbGVtZW50Lm9mZnNldFdpZHRoLFxuICAgICAgaGVpZ2h0OiBlbGVtZW50Lm9mZnNldEhlaWdodFxuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdG9QWChlbGVtZW50LCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgdmFyIHJzTGVmdCA9IGVsZW1lbnQucnVudGltZVN0eWxlICYmIGVsZW1lbnQucnVudGltZVN0eWxlW2F0dHJpYnV0ZV0sXG4gICAgICBsZWZ0LFxuICAgICAgc3R5bGUgPSBlbGVtZW50LnN0eWxlO1xuXG4gICAgLy8gQ2hlY2sgaWYgd2UgYXJlIG5vdCBkZWFsaW5nIHdpdGggcGl4ZWxzLCAoT3BlcmEgaGFzIGlzc3VlcyB3aXRoIHRoaXMpXG4gICAgLy8gUG9ydGVkIGZyb20galF1ZXJ5IGNzcy5qc1xuICAgIC8vIEZyb20gdGhlIGF3ZXNvbWUgaGFjayBieSBEZWFuIEVkd2FyZHNcbiAgICAvLyBodHRwOi8vZXJpay5lYWUubmV0L2FyY2hpdmVzLzIwMDcvMDcvMjcvMTguNTQuMTUvI2NvbW1lbnQtMTAyMjkxXG5cbiAgICAvLyBJZiB3ZSdyZSBub3QgZGVhbGluZyB3aXRoIGEgcmVndWxhciBwaXhlbCBudW1iZXJcbiAgICAvLyBidXQgYSBudW1iZXIgdGhhdCBoYXMgYSB3ZWlyZCBlbmRpbmcsIHdlIG5lZWQgdG8gY29udmVydCBpdCB0byBwaXhlbHNcblxuICAgIGlmICghL14tP1swLTldK1xcLj9bMC05XSooPzpweCk/JC9pLnRlc3QodmFsdWUpICYmIC9eLT9cXGQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAvLyBSZW1lbWJlciB0aGUgb3JpZ2luYWwgdmFsdWVzXG4gICAgICBsZWZ0ID0gc3R5bGUubGVmdDtcblxuICAgICAgLy8gUHV0IGluIHRoZSBuZXcgdmFsdWVzIHRvIGdldCBhIGNvbXB1dGVkIHZhbHVlIG91dFxuICAgICAgaWYgKHJzTGVmdCkge1xuICAgICAgICBlbGVtZW50LnJ1bnRpbWVTdHlsZS5sZWZ0ID0gZWxlbWVudC5jdXJyZW50U3R5bGUubGVmdDtcbiAgICAgIH1cbiAgICAgIHN0eWxlLmxlZnQgPSBhdHRyaWJ1dGUgPT09IFwiZm9udFNpemVcIiA/IFwiMWVtXCIgOiAodmFsdWUgfHwgMCk7XG4gICAgICB2YWx1ZSA9IHN0eWxlLnBpeGVsTGVmdCArIFwicHhcIjtcblxuICAgICAgLy8gUmV2ZXJ0IHRoZSBjaGFuZ2VkIHZhbHVlc1xuICAgICAgc3R5bGUubGVmdCA9IGxlZnQ7XG4gICAgICBpZiAocnNMZWZ0KSB7XG4gICAgICAgIGVsZW1lbnQucnVudGltZVN0eWxlLmxlZnQgPSByc0xlZnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCEvXih0aGlufG1lZGl1bXx0aGljaykkL2kudGVzdCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKHBhcnNlRmxvYXQodmFsdWUpKSArIFwicHhcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBmdW5jdGlvbiBhc0ludCh2YWwpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQodmFsLCAxMCk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUJhY2tncm91bmRTaXplUG9zaXRpb24odmFsdWUsIGVsZW1lbnQsIGF0dHJpYnV0ZSwgaW5kZXgpIHtcbiAgICB2YWx1ZSA9ICh2YWx1ZSB8fCAnJykuc3BsaXQoJywnKTtcbiAgICB2YWx1ZSA9IHZhbHVlW2luZGV4IHx8IDBdIHx8IHZhbHVlWzBdIHx8ICdhdXRvJztcbiAgICB2YWx1ZSA9IF9odG1sMmNhbnZhcy5VdGlsLnRyaW1UZXh0KHZhbHVlKS5zcGxpdCgnICcpO1xuXG4gICAgaWYgKGF0dHJpYnV0ZSA9PT0gJ2JhY2tncm91bmRTaXplJyAmJiAodmFsdWVbMF0gJiYgdmFsdWVbMF0ubWF0Y2goL14oY292ZXJ8Y29udGFpbnxhdXRvKSQvKSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVbMF0gPSAodmFsdWVbMF0uaW5kZXhPZihcIiVcIikgPT09IC0xKSA/IHRvUFgoZWxlbWVudCwgYXR0cmlidXRlICsgXCJYXCIsIHZhbHVlWzBdKSA6IHZhbHVlWzBdO1xuICAgICAgaWYgKHZhbHVlWzFdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZSA9PT0gJ2JhY2tncm91bmRTaXplJykge1xuICAgICAgICAgIHZhbHVlWzFdID0gJ2F1dG8nO1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJRSA5IGRvZXNuJ3QgcmV0dXJuIGRvdWJsZSBkaWdpdCBhbHdheXNcbiAgICAgICAgICB2YWx1ZVsxXSA9IHZhbHVlWzBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YWx1ZVsxXSA9ICh2YWx1ZVsxXS5pbmRleE9mKFwiJVwiKSA9PT0gLTEpID8gdG9QWChlbGVtZW50LCBhdHRyaWJ1dGUgKyBcIllcIiwgdmFsdWVbMV0pIDogdmFsdWVbMV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIF9odG1sMmNhbnZhcy5VdGlsLmdldENTUyA9IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGUsIGluZGV4KSB7XG4gICAgaWYgKHByZXZpb3VzRWxlbWVudCAhPT0gZWxlbWVudCkge1xuICAgICAgY29tcHV0ZWRDU1MgPSBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQsIG51bGwpO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IGNvbXB1dGVkQ1NTW2F0dHJpYnV0ZV07XG5cbiAgICBpZiAoL15iYWNrZ3JvdW5kKFNpemV8UG9zaXRpb24pJC8udGVzdChhdHRyaWJ1dGUpKSB7XG4gICAgICByZXR1cm4gcGFyc2VCYWNrZ3JvdW5kU2l6ZVBvc2l0aW9uKHZhbHVlLCBlbGVtZW50LCBhdHRyaWJ1dGUsIGluZGV4KTtcbiAgICB9IGVsc2UgaWYgKC9ib3JkZXIoVG9wfEJvdHRvbSkoTGVmdHxSaWdodClSYWRpdXMvLnRlc3QoYXR0cmlidXRlKSkge1xuICAgICAgdmFyIGFyciA9IHZhbHVlLnNwbGl0KFwiIFwiKTtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgYXJyWzFdID0gYXJyWzBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFyci5tYXAoYXNJbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC5yZXNpemVCb3VuZHMgPSBmdW5jdGlvbiAoY3VycmVudF93aWR0aCwgY3VycmVudF9oZWlnaHQsIHRhcmdldF93aWR0aCwgdGFyZ2V0X2hlaWdodCwgc3RyZXRjaF9tb2RlKSB7XG4gICAgdmFyIHRhcmdldF9yYXRpbyA9IHRhcmdldF93aWR0aCAvIHRhcmdldF9oZWlnaHQsXG4gICAgICBjdXJyZW50X3JhdGlvID0gY3VycmVudF93aWR0aCAvIGN1cnJlbnRfaGVpZ2h0LFxuICAgICAgb3V0cHV0X3dpZHRoLCBvdXRwdXRfaGVpZ2h0LCBvdXRwdXRfbGVmdCwgb3V0cHV0X3RvcDtcblxuICAgICAgb3V0cHV0X2xlZnQgPSAwO1xuICAgICAgb3V0cHV0X3RvcCAgPSAwO1xuXG4gICAgICBpZiAoIXN0cmV0Y2hfbW9kZSB8fCBzdHJldGNoX21vZGUgPT09ICdhdXRvJykge1xuICAgICAgb3V0cHV0X3dpZHRoID0gdGFyZ2V0X3dpZHRoO1xuICAgICAgb3V0cHV0X2hlaWdodCA9IHRhcmdldF9oZWlnaHQ7XG4gICAgfSBlbHNlIGlmICh0YXJnZXRfcmF0aW8gPCBjdXJyZW50X3JhdGlvIF4gc3RyZXRjaF9tb2RlID09PSAnY29udGFpbicpIHtcbiAgICAgIG91dHB1dF9oZWlnaHQgPSB0YXJnZXRfaGVpZ2h0O1xuICAgICAgb3V0cHV0X3dpZHRoID0gdGFyZ2V0X2hlaWdodCAqIGN1cnJlbnRfcmF0aW87XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dF93aWR0aCA9IHRhcmdldF93aWR0aDtcbiAgICAgIG91dHB1dF9oZWlnaHQgPSB0YXJnZXRfd2lkdGggLyBjdXJyZW50X3JhdGlvO1xuICAgIH1cblxuICAgIG91dHB1dF9sZWZ0ID0gKHRhcmdldF93aWR0aC1vdXRwdXRfd2lkdGgpLzI7XG4gICAgb3V0cHV0X3RvcCA9ICh0YXJnZXRfaGVpZ2h0LW91dHB1dF9oZWlnaHQpLzI7XG5cbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGggOiBvdXRwdXRfd2lkdGgsXG4gICAgICBoZWlnaHQ6IG91dHB1dF9oZWlnaHQsXG4gICAgICBsZWZ0ICA6IG91dHB1dF9sZWZ0LFxuICAgICAgdG9wICAgOiBvdXRwdXRfdG9wXG4gICAgfTtcbiAgfTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC5CYWNrZ3JvdW5kUG9zaXRpb24gPSBmdW5jdGlvbiAoZWxlbWVudCwgYm91bmRzLCBpbWFnZSwgaW1hZ2VJbmRleCwgYmFja2dyb3VuZFNpemUpIHtcbiAgICB2YXIgYmFja2dyb3VuZFBvc2l0aW9uID0gX2h0bWwyY2FudmFzLlV0aWwuZ2V0Q1NTKGVsZW1lbnQsICdiYWNrZ3JvdW5kUG9zaXRpb24nLCBpbWFnZUluZGV4KSxcbiAgICAgIGxlZnRQb3NpdGlvbixcbiAgICAgIHRvcFBvc2l0aW9uO1xuICAgIGlmIChiYWNrZ3JvdW5kUG9zaXRpb24ubGVuZ3RoID09PSAxKSB7XG4gICAgICBiYWNrZ3JvdW5kUG9zaXRpb24gPSBbYmFja2dyb3VuZFBvc2l0aW9uWzBdLCBiYWNrZ3JvdW5kUG9zaXRpb25bMF1dO1xuICAgIH1cbiAgICBpZiAoYmFja2dyb3VuZFBvc2l0aW9uWzBdLnRvU3RyaW5nKCkuaW5kZXhPZihcIiVcIikgIT09IC0xKSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSAoYm91bmRzLndpZHRoIC0gKGJhY2tncm91bmRTaXplIHx8IGltYWdlKS53aWR0aCkgKiAocGFyc2VGbG9hdChiYWNrZ3JvdW5kUG9zaXRpb25bMF0pIC8gMTAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGVmdFBvc2l0aW9uID0gcGFyc2VJbnQoYmFja2dyb3VuZFBvc2l0aW9uWzBdLCAxMCk7XG4gICAgfVxuICAgIGlmIChiYWNrZ3JvdW5kUG9zaXRpb25bMV0gPT09ICdhdXRvJykge1xuICAgICAgdG9wUG9zaXRpb24gPSBsZWZ0UG9zaXRpb24gLyBpbWFnZS53aWR0aCAqIGltYWdlLmhlaWdodDtcbiAgICB9IGVsc2UgaWYgKGJhY2tncm91bmRQb3NpdGlvblsxXS50b1N0cmluZygpLmluZGV4T2YoXCIlXCIpICE9PSAtMSkge1xuICAgICAgdG9wUG9zaXRpb24gPSAoYm91bmRzLmhlaWdodCAtIChiYWNrZ3JvdW5kU2l6ZSB8fCBpbWFnZSkuaGVpZ2h0KSAqIHBhcnNlRmxvYXQoYmFja2dyb3VuZFBvc2l0aW9uWzFdKSAvIDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9wUG9zaXRpb24gPSBwYXJzZUludChiYWNrZ3JvdW5kUG9zaXRpb25bMV0sIDEwKTtcbiAgICB9XG4gICAgaWYgKGJhY2tncm91bmRQb3NpdGlvblswXSA9PT0gJ2F1dG8nKSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSB0b3BQb3NpdGlvbiAvIGltYWdlLmhlaWdodCAqIGltYWdlLndpZHRoO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbGVmdDogbGVmdFBvc2l0aW9uLFxuICAgICAgdG9wOiB0b3BQb3NpdGlvblxuICAgIH07XG4gIH07XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwuQmFja2dyb3VuZFNpemUgPSBmdW5jdGlvbiAoZWxlbWVudCwgYm91bmRzLCBpbWFnZSwgaW1hZ2VJbmRleCkge1xuICAgIHZhciBiYWNrZ3JvdW5kU2l6ZSA9IF9odG1sMmNhbnZhcy5VdGlsLmdldENTUyhlbGVtZW50LCAnYmFja2dyb3VuZFNpemUnLCBpbWFnZUluZGV4KSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0O1xuXG4gICAgaWYgKGJhY2tncm91bmRTaXplLmxlbmd0aCA9PT0gMSkge1xuICAgICAgYmFja2dyb3VuZFNpemUgPSBbYmFja2dyb3VuZFNpemVbMF0sIGJhY2tncm91bmRTaXplWzBdXTtcbiAgICB9XG5cbiAgICBpZiAoYmFja2dyb3VuZFNpemVbMF0udG9TdHJpbmcoKS5pbmRleE9mKFwiJVwiKSAhPT0gLTEpIHtcbiAgICAgIHdpZHRoID0gYm91bmRzLndpZHRoICogcGFyc2VGbG9hdChiYWNrZ3JvdW5kU2l6ZVswXSkgLyAxMDA7XG4gICAgfSBlbHNlIGlmIChiYWNrZ3JvdW5kU2l6ZVswXSA9PT0gJ2F1dG8nKSB7XG4gICAgICB3aWR0aCA9IGltYWdlLndpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoL2NvbnRhaW58Y292ZXIvLnRlc3QoYmFja2dyb3VuZFNpemVbMF0pKSB7XG4gICAgICAgIHZhciByZXNpemVkID0gX2h0bWwyY2FudmFzLlV0aWwucmVzaXplQm91bmRzKGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgYmFja2dyb3VuZFNpemVbMF0pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHdpZHRoOiByZXNpemVkLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogcmVzaXplZC5oZWlnaHRcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpZHRoID0gcGFyc2VJbnQoYmFja2dyb3VuZFNpemVbMF0sIDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYmFja2dyb3VuZFNpemVbMV0gPT09ICdhdXRvJykge1xuICAgICAgaGVpZ2h0ID0gd2lkdGggLyBpbWFnZS53aWR0aCAqIGltYWdlLmhlaWdodDtcbiAgICB9IGVsc2UgaWYgKGJhY2tncm91bmRTaXplWzFdLnRvU3RyaW5nKCkuaW5kZXhPZihcIiVcIikgIT09IC0xKSB7XG4gICAgICBoZWlnaHQgPSBib3VuZHMuaGVpZ2h0ICogcGFyc2VGbG9hdChiYWNrZ3JvdW5kU2l6ZVsxXSkgLyAxMDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhlaWdodCA9IHBhcnNlSW50KGJhY2tncm91bmRTaXplWzFdLCAxMCk7XG4gICAgfVxuXG5cbiAgICBpZiAoYmFja2dyb3VuZFNpemVbMF0gPT09ICdhdXRvJykge1xuICAgICAgd2lkdGggPSBoZWlnaHQgLyBpbWFnZS5oZWlnaHQgKiBpbWFnZS53aWR0aDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICB9O1xuICB9O1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLkV4dGVuZCA9IGZ1bmN0aW9uIChvcHRpb25zLCBkZWZhdWx0cykge1xuICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGRlZmF1bHRzW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWZhdWx0cztcbiAgfTtcblxuXG4gIC8qXG4gICAqIERlcml2ZWQgZnJvbSBqUXVlcnkuY29udGVudHMoKVxuICAgKiBDb3B5cmlnaHQgMjAxMCwgSm9obiBSZXNpZ1xuICAgKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgb3IgR1BMIFZlcnNpb24gMiBsaWNlbnNlcy5cbiAgICogaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICAgKi9cbiAgX2h0bWwyY2FudmFzLlV0aWwuQ2hpbGRyZW4gPSBmdW5jdGlvbiAoZWxlbSkge1xuICAgIHZhciBjaGlsZHJlbjtcbiAgICB0cnkge1xuICAgICAgY2hpbGRyZW4gPSAoZWxlbS5ub2RlTmFtZSAmJiBlbGVtLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgPT09IFwiSUZSQU1FXCIpID8gZWxlbS5jb250ZW50RG9jdW1lbnQgfHwgZWxlbS5jb250ZW50V2luZG93LmRvY3VtZW50IDogKGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICB2YXIgcmV0ID0gW107XG4gICAgICAgIGlmIChhcnJheSAhPT0gbnVsbCkge1xuICAgICAgICAgIChmdW5jdGlvbiAoZmlyc3QsIHNlY29uZCkge1xuICAgICAgICAgICAgdmFyIGkgPSBmaXJzdC5sZW5ndGgsXG4gICAgICAgICAgICAgIGogPSAwO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlY29uZC5sZW5ndGggPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgbCA9IHNlY29uZC5sZW5ndGg7IGogPCBsOyBqKyspIHtcbiAgICAgICAgICAgICAgICBmaXJzdFtpKytdID0gc2Vjb25kW2pdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB3aGlsZSAoc2Vjb25kW2pdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBmaXJzdFtpKytdID0gc2Vjb25kW2orK107XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZmlyc3QubGVuZ3RoID0gaTtcblxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0O1xuICAgICAgICAgIH0pKHJldCwgYXJyYXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9KShlbGVtLmNoaWxkTm9kZXMpO1xuXG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIF9odG1sMmNhbnZhcy5VdGlsLmxvZyhcImh0bWwyY2FudmFzLlV0aWwuQ2hpbGRyZW4gZmFpbGVkIHdpdGggZXhjZXB0aW9uOiBcIiArIGV4Lm1lc3NhZ2UpO1xuICAgICAgY2hpbGRyZW4gPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9O1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLmlzVHJhbnNwYXJlbnQgPSBmdW5jdGlvbiAoYmFja2dyb3VuZENvbG9yKSB7XG4gICAgcmV0dXJuICghYmFja2dyb3VuZENvbG9yIHx8IGJhY2tncm91bmRDb2xvciA9PT0gXCJ0cmFuc3BhcmVudFwiIHx8IGJhY2tncm91bmRDb2xvciA9PT0gXCJyZ2JhKDAsIDAsIDAsIDApXCIpO1xuICB9O1xuICBfaHRtbDJjYW52YXMuVXRpbC5Gb250ID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBmb250RGF0YSA9IHt9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChmb250LCBmb250U2l6ZSwgZG9jKSB7XG4gICAgICBpZiAoZm9udERhdGFbZm9udCArIFwiLVwiICsgZm9udFNpemVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGZvbnREYXRhW2ZvbnQgKyBcIi1cIiArIGZvbnRTaXplXTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRhaW5lciA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgaW1nID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2ltZycpLFxuICAgICAgICBzcGFuID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSxcbiAgICAgICAgc2FtcGxlVGV4dCA9ICdIaWRkZW4gVGV4dCcsXG4gICAgICAgIGJhc2VsaW5lLFxuICAgICAgICBtaWRkbGUsXG4gICAgICAgIG1ldHJpY3NPYmo7XG5cbiAgICAgIGNvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5mb250RmFtaWx5ID0gZm9udDtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5mb250U2l6ZSA9IGZvbnRTaXplO1xuICAgICAgY29udGFpbmVyLnN0eWxlLm1hcmdpbiA9IDA7XG4gICAgICBjb250YWluZXIuc3R5bGUucGFkZGluZyA9IDA7XG5cbiAgICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgICAgIC8vIGh0dHA6Ly9wcm9iYWJseXByb2dyYW1taW5nLmNvbS8yMDA5LzAzLzE1L3RoZS10aW5pZXN0LWdpZi1ldmVyIChoYW5kdGlueXdoaXRlLmdpZilcbiAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFCQVAvLy93QUFBQ3dBQUFBQUFRQUJBQUFDQWtRQkFEcz1cIjtcbiAgICAgIGltZy53aWR0aCA9IDE7XG4gICAgICBpbWcuaGVpZ2h0ID0gMTtcblxuICAgICAgaW1nLnN0eWxlLm1hcmdpbiA9IDA7XG4gICAgICBpbWcuc3R5bGUucGFkZGluZyA9IDA7XG4gICAgICBpbWcuc3R5bGUudmVydGljYWxBbGlnbiA9IFwiYmFzZWxpbmVcIjtcblxuICAgICAgc3Bhbi5zdHlsZS5mb250RmFtaWx5ID0gZm9udDtcbiAgICAgIHNwYW4uc3R5bGUuZm9udFNpemUgPSBmb250U2l6ZTtcbiAgICAgIHNwYW4uc3R5bGUubWFyZ2luID0gMDtcbiAgICAgIHNwYW4uc3R5bGUucGFkZGluZyA9IDA7XG5cbiAgICAgIHNwYW4uYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKHNhbXBsZVRleHQpKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzcGFuKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgYmFzZWxpbmUgPSAoaW1nLm9mZnNldFRvcCAtIHNwYW4ub2Zmc2V0VG9wKSArIDE7XG5cbiAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChzcGFuKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoc2FtcGxlVGV4dCkpO1xuXG4gICAgICBjb250YWluZXIuc3R5bGUubGluZUhlaWdodCA9IFwibm9ybWFsXCI7XG4gICAgICBpbWcuc3R5bGUudmVydGljYWxBbGlnbiA9IFwic3VwZXJcIjtcblxuICAgICAgbWlkZGxlID0gKGltZy5vZmZzZXRUb3AgLSBjb250YWluZXIub2Zmc2V0VG9wKSArIDE7XG4gICAgICBtZXRyaWNzT2JqID0ge1xuICAgICAgICBiYXNlbGluZTogYmFzZWxpbmUsXG4gICAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgICAgbWlkZGxlOiBtaWRkbGVcbiAgICAgIH07XG5cbiAgICAgIGZvbnREYXRhW2ZvbnQgKyBcIi1cIiArIGZvbnRTaXplXSA9IG1ldHJpY3NPYmo7XG5cbiAgICAgIGRvYy5ib2R5LnJlbW92ZUNoaWxkKGNvbnRhaW5lcik7XG5cbiAgICAgIHJldHVybiBtZXRyaWNzT2JqO1xuICAgIH07XG4gIH0pKCk7XG5cbiAgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgVXRpbCA9IF9odG1sMmNhbnZhcy5VdGlsLFxuICAgICAgR2VuZXJhdGUgPSB7fTtcblxuICAgIF9odG1sMmNhbnZhcy5HZW5lcmF0ZSA9IEdlbmVyYXRlO1xuXG4gICAgdmFyIHJlR3JhZGllbnRzID0gW1xuICAgICAgL14oLXdlYmtpdC1saW5lYXItZ3JhZGllbnQpXFwoKFthLXpcXHNdKykoW1xcd1xcZFxcLlxccywlXFwoXFwpXSspXFwpJC8sXG4gICAgICAvXigtby1saW5lYXItZ3JhZGllbnQpXFwoKFthLXpcXHNdKykoW1xcd1xcZFxcLlxccywlXFwoXFwpXSspXFwpJC8sXG4gICAgICAvXigtd2Via2l0LWdyYWRpZW50KVxcKChsaW5lYXJ8cmFkaWFsKSxcXHMoKD86XFxkezEsM30lPylcXHMoPzpcXGR7MSwzfSU/KSxcXHMoPzpcXGR7MSwzfSU/KVxccyg/OlxcZHsxLDN9JT8pKShbXFx3XFxkXFwuXFxzLCVcXChcXClcXC1dKylcXCkkLyxcbiAgICAgIC9eKC1tb3otbGluZWFyLWdyYWRpZW50KVxcKCgoPzpcXGR7MSwzfSU/KVxccyg/OlxcZHsxLDN9JT8pKShbXFx3XFxkXFwuXFxzLCVcXChcXCldKylcXCkkLyxcbiAgICAgIC9eKC13ZWJraXQtcmFkaWFsLWdyYWRpZW50KVxcKCgoPzpcXGR7MSwzfSU/KVxccyg/OlxcZHsxLDN9JT8pKSxcXHMoXFx3KylcXHMoW2EtelxcLV0rKShbXFx3XFxkXFwuXFxzLCVcXChcXCldKylcXCkkLyxcbiAgICAgIC9eKC1tb3otcmFkaWFsLWdyYWRpZW50KVxcKCgoPzpcXGR7MSwzfSU/KVxccyg/OlxcZHsxLDN9JT8pKSxcXHMoXFx3KylcXHM/KFthLXpcXC1dKikoW1xcd1xcZFxcLlxccywlXFwoXFwpXSspXFwpJC8sXG4gICAgICAvXigtby1yYWRpYWwtZ3JhZGllbnQpXFwoKCg/OlxcZHsxLDN9JT8pXFxzKD86XFxkezEsM30lPykpLFxccyhcXHcrKVxccyhbYS16XFwtXSspKFtcXHdcXGRcXC5cXHMsJVxcKFxcKV0rKVxcKSQvXG4gICAgXTtcblxuICAgIC8qXG4gICAgICogVE9ETzogQWRkIElFMTAgdmVuZG9yIHByZWZpeCAoLW1zKSBzdXBwb3J0XG4gICAgICogVE9ETzogQWRkIFczQyBncmFkaWVudCAobGluZWFyLWdyYWRpZW50KSBzdXBwb3J0XG4gICAgICogVE9ETzogQWRkIG9sZCBXZWJraXQgLXdlYmtpdC1ncmFkaWVudChyYWRpYWwsIC4uLikgc3VwcG9ydFxuICAgICAqIFRPRE86IE1heWJlIHNvbWUgUmVnRXhwIG9wdGltaXphdGlvbnMgYXJlIHBvc3NpYmxlIDtvKVxuICAgICAqL1xuICAgIEdlbmVyYXRlLnBhcnNlR3JhZGllbnQgPSBmdW5jdGlvbiAoY3NzLCBib3VuZHMpIHtcbiAgICAgIHZhciBncmFkaWVudCwgaSwgbGVuID0gcmVHcmFkaWVudHMubGVuZ3RoLFxuICAgICAgICBtMSwgc3RvcCwgbTIsIG0yTGVuLCBzdGVwLCBtMywgdGwsIHRyLCBiciwgYmw7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICBtMSA9IGNzcy5tYXRjaChyZUdyYWRpZW50c1tpXSk7XG4gICAgICAgIGlmIChtMSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtMSkge1xuICAgICAgICBzd2l0Y2ggKG0xWzFdKSB7XG4gICAgICAgICAgY2FzZSAnLXdlYmtpdC1saW5lYXItZ3JhZGllbnQnOlxuICAgICAgICAgIGNhc2UgJy1vLWxpbmVhci1ncmFkaWVudCc6XG5cbiAgICAgICAgICAgIGdyYWRpZW50ID0ge1xuICAgICAgICAgICAgICB0eXBlOiAnbGluZWFyJyxcbiAgICAgICAgICAgICAgeDA6IG51bGwsXG4gICAgICAgICAgICAgIHkwOiBudWxsLFxuICAgICAgICAgICAgICB4MTogbnVsbCxcbiAgICAgICAgICAgICAgeTE6IG51bGwsXG4gICAgICAgICAgICAgIGNvbG9yU3RvcHM6IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBnZXQgY29vcmRpbmF0ZXNcbiAgICAgICAgICAgIG0yID0gbTFbMl0ubWF0Y2goL1xcdysvZyk7XG4gICAgICAgICAgICBpZiAobTIpIHtcbiAgICAgICAgICAgICAgbTJMZW4gPSBtMi5sZW5ndGg7XG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtMkxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChtMltpXSkge1xuICAgICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueTAgPSAwO1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC55MSA9IGJvdW5kcy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LngwID0gYm91bmRzLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC54MSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC55MCA9IGJvdW5kcy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnkxID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC54MCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LngxID0gYm91bmRzLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChncmFkaWVudC54MCA9PT0gbnVsbCAmJiBncmFkaWVudC54MSA9PT0gbnVsbCkgeyAvLyBjZW50ZXJcbiAgICAgICAgICAgICAgZ3JhZGllbnQueDAgPSBncmFkaWVudC54MSA9IGJvdW5kcy53aWR0aCAvIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ3JhZGllbnQueTAgPT09IG51bGwgJiYgZ3JhZGllbnQueTEgPT09IG51bGwpIHsgLy8gY2VudGVyXG4gICAgICAgICAgICAgIGdyYWRpZW50LnkwID0gZ3JhZGllbnQueTEgPSBib3VuZHMuaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZ2V0IGNvbG9ycyBhbmQgc3RvcHNcbiAgICAgICAgICAgIG0yID0gbTFbM10ubWF0Y2goLygoPzpyZ2J8cmdiYSlcXChcXGR7MSwzfSxcXHNcXGR7MSwzfSxcXHNcXGR7MSwzfSg/OixcXHNbMC05XFwuXSspP1xcKSg/Olxcc1xcZHsxLDN9KD86JXxweCkpPykrL2cpO1xuICAgICAgICAgICAgaWYgKG0yKSB7XG4gICAgICAgICAgICAgIG0yTGVuID0gbTIubGVuZ3RoO1xuICAgICAgICAgICAgICBzdGVwID0gMSAvIE1hdGgubWF4KG0yTGVuIC0gMSwgMSk7XG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtMkxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbTMgPSBtMltpXS5tYXRjaCgvKCg/OnJnYnxyZ2JhKVxcKFxcZHsxLDN9LFxcc1xcZHsxLDN9LFxcc1xcZHsxLDN9KD86LFxcc1swLTlcXC5dKyk/XFwpKVxccyooXFxkezEsM30pPyglfHB4KT8vKTtcbiAgICAgICAgICAgICAgICBpZiAobTNbMl0pIHtcbiAgICAgICAgICAgICAgICAgIHN0b3AgPSBwYXJzZUZsb2F0KG0zWzJdKTtcbiAgICAgICAgICAgICAgICAgIGlmIChtM1szXSA9PT0gJyUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AgLz0gMTAwO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gcHggLSBzdHVwaWQgb3BlcmFcbiAgICAgICAgICAgICAgICAgICAgc3RvcCAvPSBib3VuZHMud2lkdGg7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHN0b3AgPSBpICogc3RlcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3JhZGllbnQuY29sb3JTdG9wcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBtM1sxXSxcbiAgICAgICAgICAgICAgICAgIHN0b3A6IHN0b3BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICctd2Via2l0LWdyYWRpZW50JzpcblxuICAgICAgICAgICAgZ3JhZGllbnQgPSB7XG4gICAgICAgICAgICAgIHR5cGU6IG0xWzJdID09PSAncmFkaWFsJyA/ICdjaXJjbGUnIDogbTFbMl0sIC8vIFRPRE86IEFkZCByYWRpYWwgZ3JhZGllbnQgc3VwcG9ydCBmb3Igb2xkZXIgbW96aWxsYSBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICB4MDogMCxcbiAgICAgICAgICAgICAgeTA6IDAsXG4gICAgICAgICAgICAgIHgxOiAwLFxuICAgICAgICAgICAgICB5MTogMCxcbiAgICAgICAgICAgICAgY29sb3JTdG9wczogW11cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGdldCBjb29yZGluYXRlc1xuICAgICAgICAgICAgbTIgPSBtMVszXS5tYXRjaCgvKFxcZHsxLDN9KSU/XFxzKFxcZHsxLDN9KSU/LFxccyhcXGR7MSwzfSklP1xccyhcXGR7MSwzfSklPy8pO1xuICAgICAgICAgICAgaWYgKG0yKSB7XG4gICAgICAgICAgICAgIGdyYWRpZW50LngwID0gKG0yWzFdICogYm91bmRzLndpZHRoKSAvIDEwMDtcbiAgICAgICAgICAgICAgZ3JhZGllbnQueTAgPSAobTJbMl0gKiBib3VuZHMuaGVpZ2h0KSAvIDEwMDtcbiAgICAgICAgICAgICAgZ3JhZGllbnQueDEgPSAobTJbM10gKiBib3VuZHMud2lkdGgpIC8gMTAwO1xuICAgICAgICAgICAgICBncmFkaWVudC55MSA9IChtMls0XSAqIGJvdW5kcy5oZWlnaHQpIC8gMTAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBnZXQgY29sb3JzIGFuZCBzdG9wc1xuICAgICAgICAgICAgbTIgPSBtMVs0XS5tYXRjaCgvKCg/OmZyb218dG98Y29sb3Itc3RvcClcXCgoPzpbMC05XFwuXSssXFxzKT8oPzpyZ2J8cmdiYSlcXChcXGR7MSwzfSxcXHNcXGR7MSwzfSxcXHNcXGR7MSwzfSg/OixcXHNbMC05XFwuXSspP1xcKVxcKSkrL2cpO1xuICAgICAgICAgICAgaWYgKG0yKSB7XG4gICAgICAgICAgICAgIG0yTGVuID0gbTIubGVuZ3RoO1xuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbTJMZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIG0zID0gbTJbaV0ubWF0Y2goLyhmcm9tfHRvfGNvbG9yLXN0b3ApXFwoKFswLTlcXC5dKyk/KD86LFxccyk/KCg/OnJnYnxyZ2JhKVxcKFxcZHsxLDN9LFxcc1xcZHsxLDN9LFxcc1xcZHsxLDN9KD86LFxcc1swLTlcXC5dKyk/XFwpKVxcKS8pO1xuICAgICAgICAgICAgICAgIHN0b3AgPSBwYXJzZUZsb2F0KG0zWzJdKTtcbiAgICAgICAgICAgICAgICBpZiAobTNbMV0gPT09ICdmcm9tJykge1xuICAgICAgICAgICAgICAgICAgc3RvcCA9IDAuMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG0zWzFdID09PSAndG8nKSB7XG4gICAgICAgICAgICAgICAgICBzdG9wID0gMS4wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBncmFkaWVudC5jb2xvclN0b3BzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgY29sb3I6IG0zWzNdLFxuICAgICAgICAgICAgICAgICAgc3RvcDogc3RvcFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJy1tb3otbGluZWFyLWdyYWRpZW50JzpcblxuICAgICAgICAgICAgZ3JhZGllbnQgPSB7XG4gICAgICAgICAgICAgIHR5cGU6ICdsaW5lYXInLFxuICAgICAgICAgICAgICB4MDogMCxcbiAgICAgICAgICAgICAgeTA6IDAsXG4gICAgICAgICAgICAgIHgxOiAwLFxuICAgICAgICAgICAgICB5MTogMCxcbiAgICAgICAgICAgICAgY29sb3JTdG9wczogW11cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGdldCBjb29yZGluYXRlc1xuICAgICAgICAgICAgbTIgPSBtMVsyXS5tYXRjaCgvKFxcZHsxLDN9KSU/XFxzKFxcZHsxLDN9KSU/Lyk7XG5cbiAgICAgICAgICAgIC8vIG0yWzFdID09IDAlICAgLT4gbGVmdFxuICAgICAgICAgICAgLy8gbTJbMV0gPT0gNTAlICAtPiBjZW50ZXJcbiAgICAgICAgICAgIC8vIG0yWzFdID09IDEwMCUgLT4gcmlnaHRcblxuICAgICAgICAgICAgLy8gbTJbMl0gPT0gMCUgICAtPiB0b3BcbiAgICAgICAgICAgIC8vIG0yWzJdID09IDUwJSAgLT4gY2VudGVyXG4gICAgICAgICAgICAvLyBtMlsyXSA9PSAxMDAlIC0+IGJvdHRvbVxuXG4gICAgICAgICAgICBpZiAobTIpIHtcbiAgICAgICAgICAgICAgZ3JhZGllbnQueDAgPSAobTJbMV0gKiBib3VuZHMud2lkdGgpIC8gMTAwO1xuICAgICAgICAgICAgICBncmFkaWVudC55MCA9IChtMlsyXSAqIGJvdW5kcy5oZWlnaHQpIC8gMTAwO1xuICAgICAgICAgICAgICBncmFkaWVudC54MSA9IGJvdW5kcy53aWR0aCAtIGdyYWRpZW50LngwO1xuICAgICAgICAgICAgICBncmFkaWVudC55MSA9IGJvdW5kcy5oZWlnaHQgLSBncmFkaWVudC55MDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZ2V0IGNvbG9ycyBhbmQgc3RvcHNcbiAgICAgICAgICAgIG0yID0gbTFbM10ubWF0Y2goLygoPzpyZ2J8cmdiYSlcXChcXGR7MSwzfSxcXHNcXGR7MSwzfSxcXHNcXGR7MSwzfSg/OixcXHNbMC05XFwuXSspP1xcKSg/Olxcc1xcZHsxLDN9JSk/KSsvZyk7XG4gICAgICAgICAgICBpZiAobTIpIHtcbiAgICAgICAgICAgICAgbTJMZW4gPSBtMi5sZW5ndGg7XG4gICAgICAgICAgICAgIHN0ZXAgPSAxIC8gTWF0aC5tYXgobTJMZW4gLSAxLCAxKTtcbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG0yTGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBtMyA9IG0yW2ldLm1hdGNoKC8oKD86cmdifHJnYmEpXFwoXFxkezEsM30sXFxzXFxkezEsM30sXFxzXFxkezEsM30oPzosXFxzWzAtOVxcLl0rKT9cXCkpXFxzKihcXGR7MSwzfSk/KCUpPy8pO1xuICAgICAgICAgICAgICAgIGlmIChtM1syXSkge1xuICAgICAgICAgICAgICAgICAgc3RvcCA9IHBhcnNlRmxvYXQobTNbMl0pO1xuICAgICAgICAgICAgICAgICAgaWYgKG0zWzNdKSB7IC8vIHBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICAgICAgc3RvcCAvPSAxMDA7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHN0b3AgPSBpICogc3RlcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3JhZGllbnQuY29sb3JTdG9wcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBtM1sxXSxcbiAgICAgICAgICAgICAgICAgIHN0b3A6IHN0b3BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICctd2Via2l0LXJhZGlhbC1ncmFkaWVudCc6XG4gICAgICAgICAgY2FzZSAnLW1vei1yYWRpYWwtZ3JhZGllbnQnOlxuICAgICAgICAgIGNhc2UgJy1vLXJhZGlhbC1ncmFkaWVudCc6XG5cbiAgICAgICAgICAgIGdyYWRpZW50ID0ge1xuICAgICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgeDA6IDAsXG4gICAgICAgICAgICAgIHkwOiAwLFxuICAgICAgICAgICAgICB4MTogYm91bmRzLndpZHRoLFxuICAgICAgICAgICAgICB5MTogYm91bmRzLmhlaWdodCxcbiAgICAgICAgICAgICAgY3g6IDAsXG4gICAgICAgICAgICAgIGN5OiAwLFxuICAgICAgICAgICAgICByeDogMCxcbiAgICAgICAgICAgICAgcnk6IDAsXG4gICAgICAgICAgICAgIGNvbG9yU3RvcHM6IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBjZW50ZXJcbiAgICAgICAgICAgIG0yID0gbTFbMl0ubWF0Y2goLyhcXGR7MSwzfSklP1xccyhcXGR7MSwzfSklPy8pO1xuICAgICAgICAgICAgaWYgKG0yKSB7XG4gICAgICAgICAgICAgIGdyYWRpZW50LmN4ID0gKG0yWzFdICogYm91bmRzLndpZHRoKSAvIDEwMDtcbiAgICAgICAgICAgICAgZ3JhZGllbnQuY3kgPSAobTJbMl0gKiBib3VuZHMuaGVpZ2h0KSAvIDEwMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2l6ZVxuICAgICAgICAgICAgbTIgPSBtMVszXS5tYXRjaCgvXFx3Ky8pO1xuICAgICAgICAgICAgbTMgPSBtMVs0XS5tYXRjaCgvW2EtelxcLV0qLyk7XG4gICAgICAgICAgICBpZiAobTIgJiYgbTMpIHtcbiAgICAgICAgICAgICAgc3dpdGNoIChtM1swXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2ZhcnRoZXN0LWNvcm5lcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnY292ZXInOiAvLyBpcyBlcXVpdmFsZW50IHRvIGZhcnRoZXN0LWNvcm5lclxuICAgICAgICAgICAgICAgIGNhc2UgJyc6IC8vIG1vemlsbGEgcmVtb3ZlcyBcImNvdmVyXCIgZnJvbSBkZWZpbml0aW9uIDooXG4gICAgICAgICAgICAgICAgICB0bCA9IE1hdGguc3FydChNYXRoLnBvdyhncmFkaWVudC5jeCwgMikgKyBNYXRoLnBvdyhncmFkaWVudC5jeSwgMikpO1xuICAgICAgICAgICAgICAgICAgdHIgPSBNYXRoLnNxcnQoTWF0aC5wb3coZ3JhZGllbnQuY3gsIDIpICsgTWF0aC5wb3coZ3JhZGllbnQueTEgLSBncmFkaWVudC5jeSwgMikpO1xuICAgICAgICAgICAgICAgICAgYnIgPSBNYXRoLnNxcnQoTWF0aC5wb3coZ3JhZGllbnQueDEgLSBncmFkaWVudC5jeCwgMikgKyBNYXRoLnBvdyhncmFkaWVudC55MSAtIGdyYWRpZW50LmN5LCAyKSk7XG4gICAgICAgICAgICAgICAgICBibCA9IE1hdGguc3FydChNYXRoLnBvdyhncmFkaWVudC54MSAtIGdyYWRpZW50LmN4LCAyKSArIE1hdGgucG93KGdyYWRpZW50LmN5LCAyKSk7XG4gICAgICAgICAgICAgICAgICBncmFkaWVudC5yeCA9IGdyYWRpZW50LnJ5ID0gTWF0aC5tYXgodGwsIHRyLCBiciwgYmwpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2xvc2VzdC1jb3JuZXInOlxuICAgICAgICAgICAgICAgICAgdGwgPSBNYXRoLnNxcnQoTWF0aC5wb3coZ3JhZGllbnQuY3gsIDIpICsgTWF0aC5wb3coZ3JhZGllbnQuY3ksIDIpKTtcbiAgICAgICAgICAgICAgICAgIHRyID0gTWF0aC5zcXJ0KE1hdGgucG93KGdyYWRpZW50LmN4LCAyKSArIE1hdGgucG93KGdyYWRpZW50LnkxIC0gZ3JhZGllbnQuY3ksIDIpKTtcbiAgICAgICAgICAgICAgICAgIGJyID0gTWF0aC5zcXJ0KE1hdGgucG93KGdyYWRpZW50LngxIC0gZ3JhZGllbnQuY3gsIDIpICsgTWF0aC5wb3coZ3JhZGllbnQueTEgLSBncmFkaWVudC5jeSwgMikpO1xuICAgICAgICAgICAgICAgICAgYmwgPSBNYXRoLnNxcnQoTWF0aC5wb3coZ3JhZGllbnQueDEgLSBncmFkaWVudC5jeCwgMikgKyBNYXRoLnBvdyhncmFkaWVudC5jeSwgMikpO1xuICAgICAgICAgICAgICAgICAgZ3JhZGllbnQucnggPSBncmFkaWVudC5yeSA9IE1hdGgubWluKHRsLCB0ciwgYnIsIGJsKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2ZhcnRoZXN0LXNpZGUnOlxuICAgICAgICAgICAgICAgICAgaWYgKG0yWzBdID09PSAnY2lyY2xlJykge1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5yeCA9IGdyYWRpZW50LnJ5ID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuY3gsXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuY3ksXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueDEgLSBncmFkaWVudC5jeCxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC55MSAtIGdyYWRpZW50LmN5XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBlbGxpcHNlXG5cbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQudHlwZSA9IG0yWzBdO1xuXG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnJ4ID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuY3gsXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueDEgLSBncmFkaWVudC5jeFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5yeSA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmN5LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnkxIC0gZ3JhZGllbnQuY3lcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Nsb3Nlc3Qtc2lkZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29udGFpbic6IC8vIGlzIGVxdWl2YWxlbnQgdG8gY2xvc2VzdC1zaWRlXG4gICAgICAgICAgICAgICAgICBpZiAobTJbMF0gPT09ICdjaXJjbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnJ4ID0gZ3JhZGllbnQucnkgPSBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5jeCxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5jeSxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC54MSAtIGdyYWRpZW50LmN4LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnkxIC0gZ3JhZGllbnQuY3lcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIGVsbGlwc2VcblxuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC50eXBlID0gbTJbMF07XG5cbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQucnggPSBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5jeCxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC54MSAtIGdyYWRpZW50LmN4XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnJ5ID0gTWF0aC5taW4oXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuY3ksXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueTEgLSBncmFkaWVudC5jeVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGFkZCBzdXBwb3J0IGZvciBcIjMwcHggNDBweFwiIHNpemVzICh3ZWJraXQgb25seSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb2xvciBzdG9wc1xuICAgICAgICAgICAgbTIgPSBtMVs1XS5tYXRjaCgvKCg/OnJnYnxyZ2JhKVxcKFxcZHsxLDN9LFxcc1xcZHsxLDN9LFxcc1xcZHsxLDN9KD86LFxcc1swLTlcXC5dKyk/XFwpKD86XFxzXFxkezEsM30oPzolfHB4KSk/KSsvZyk7XG4gICAgICAgICAgICBpZiAobTIpIHtcbiAgICAgICAgICAgICAgbTJMZW4gPSBtMi5sZW5ndGg7XG4gICAgICAgICAgICAgIHN0ZXAgPSAxIC8gTWF0aC5tYXgobTJMZW4gLSAxLCAxKTtcbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG0yTGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBtMyA9IG0yW2ldLm1hdGNoKC8oKD86cmdifHJnYmEpXFwoXFxkezEsM30sXFxzXFxkezEsM30sXFxzXFxkezEsM30oPzosXFxzWzAtOVxcLl0rKT9cXCkpXFxzKihcXGR7MSwzfSk/KCV8cHgpPy8pO1xuICAgICAgICAgICAgICAgIGlmIChtM1syXSkge1xuICAgICAgICAgICAgICAgICAgc3RvcCA9IHBhcnNlRmxvYXQobTNbMl0pO1xuICAgICAgICAgICAgICAgICAgaWYgKG0zWzNdID09PSAnJScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCAvPSAxMDA7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBweCAtIHN0dXBpZCBvcGVyYVxuICAgICAgICAgICAgICAgICAgICBzdG9wIC89IGJvdW5kcy53aWR0aDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc3RvcCA9IGkgKiBzdGVwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBncmFkaWVudC5jb2xvclN0b3BzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgY29sb3I6IG0zWzFdLFxuICAgICAgICAgICAgICAgICAgc3RvcDogc3RvcFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ3JhZGllbnQ7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGFkZFNjcm9sbFN0b3BzKGdyYWQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoY29sb3JTdG9wKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZ3JhZC5hZGRDb2xvclN0b3AoY29sb3JTdG9wLnN0b3AsIGNvbG9yU3RvcC5jb2xvcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBVdGlsLmxvZyhbJ2ZhaWxlZCB0byBhZGQgY29sb3Igc3RvcDogJywgZSwgJzsgdHJpZWQgdG8gYWRkOiAnLCBjb2xvclN0b3BdKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBHZW5lcmF0ZS5HcmFkaWVudCA9IGZ1bmN0aW9uIChzcmMsIGJvdW5kcykge1xuICAgICAgaWYgKGJvdW5kcy53aWR0aCA9PT0gMCB8fCBib3VuZHMuaGVpZ2h0ID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgICAgZ3JhZGllbnQsIGdyYWQ7XG5cbiAgICAgIGNhbnZhcy53aWR0aCA9IGJvdW5kcy53aWR0aDtcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBib3VuZHMuaGVpZ2h0O1xuXG4gICAgICAvLyBUT0RPOiBhZGQgc3VwcG9ydCBmb3IgbXVsdGkgZGVmaW5lZCBiYWNrZ3JvdW5kIGdyYWRpZW50c1xuICAgICAgZ3JhZGllbnQgPSBfaHRtbDJjYW52YXMuR2VuZXJhdGUucGFyc2VHcmFkaWVudChzcmMsIGJvdW5kcyk7XG5cbiAgICAgIGlmIChncmFkaWVudCkge1xuICAgICAgICBzd2l0Y2ggKGdyYWRpZW50LnR5cGUpIHtcbiAgICAgICAgICBjYXNlICdsaW5lYXInOlxuICAgICAgICAgICAgZ3JhZCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudChncmFkaWVudC54MCwgZ3JhZGllbnQueTAsIGdyYWRpZW50LngxLCBncmFkaWVudC55MSk7XG4gICAgICAgICAgICBncmFkaWVudC5jb2xvclN0b3BzLmZvckVhY2goYWRkU2Nyb2xsU3RvcHMoZ3JhZCkpO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoZ3JhZGllbnQuY3gsIGdyYWRpZW50LmN5LCAwLCBncmFkaWVudC5jeCwgZ3JhZGllbnQuY3ksIGdyYWRpZW50LnJ4KTtcbiAgICAgICAgICAgIGdyYWRpZW50LmNvbG9yU3RvcHMuZm9yRWFjaChhZGRTY3JvbGxTdG9wcyhncmFkKSk7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdlbGxpcHNlJzpcbiAgICAgICAgICAgIHZhciBjYW52YXNSYWRpYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgICAgICAgICAgY3R4UmFkaWFsID0gY2FudmFzUmFkaWFsLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgICAgICAgIHJpID0gTWF0aC5tYXgoZ3JhZGllbnQucngsIGdyYWRpZW50LnJ5KSxcbiAgICAgICAgICAgICAgZGkgPSByaSAqIDI7XG5cbiAgICAgICAgICAgIGNhbnZhc1JhZGlhbC53aWR0aCA9IGNhbnZhc1JhZGlhbC5oZWlnaHQgPSBkaTtcblxuICAgICAgICAgICAgZ3JhZCA9IGN0eFJhZGlhbC5jcmVhdGVSYWRpYWxHcmFkaWVudChncmFkaWVudC5yeCwgZ3JhZGllbnQucnksIDAsIGdyYWRpZW50LnJ4LCBncmFkaWVudC5yeSwgcmkpO1xuICAgICAgICAgICAgZ3JhZGllbnQuY29sb3JTdG9wcy5mb3JFYWNoKGFkZFNjcm9sbFN0b3BzKGdyYWQpKTtcblxuICAgICAgICAgICAgY3R4UmFkaWFsLmZpbGxTdHlsZSA9IGdyYWQ7XG4gICAgICAgICAgICBjdHhSYWRpYWwuZmlsbFJlY3QoMCwgMCwgZGksIGRpKTtcblxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWRpZW50LmNvbG9yU3RvcHNbZ3JhZGllbnQuY29sb3JTdG9wcy5sZW5ndGggLSAxXS5jb2xvcjtcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShjYW52YXNSYWRpYWwsIGdyYWRpZW50LmN4IC0gZ3JhZGllbnQucngsIGdyYWRpZW50LmN5IC0gZ3JhZGllbnQucnksIDIgKiBncmFkaWVudC5yeCwgMiAqIGdyYWRpZW50LnJ5KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjYW52YXM7XG4gICAgfTtcblxuICAgIEdlbmVyYXRlLkxpc3RBbHBoYSA9IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICAgIHZhciB0bXAgPSBcIlwiLFxuICAgICAgICBtb2R1bHVzO1xuXG4gICAgICBkbyB7XG4gICAgICAgIG1vZHVsdXMgPSBudW1iZXIgJSAyNjtcbiAgICAgICAgdG1wID0gU3RyaW5nLmZyb21DaGFyQ29kZSgobW9kdWx1cykgKyA2NCkgKyB0bXA7XG4gICAgICAgIG51bWJlciA9IG51bWJlciAvIDI2O1xuICAgICAgfSB3aGlsZSAoKG51bWJlciAqIDI2KSA+IDI2KTtcblxuICAgICAgcmV0dXJuIHRtcDtcbiAgICB9O1xuXG4gICAgR2VuZXJhdGUuTGlzdFJvbWFuID0gZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgdmFyIHJvbWFuQXJyYXkgPSBbXCJNXCIsIFwiQ01cIiwgXCJEXCIsIFwiQ0RcIiwgXCJDXCIsIFwiWENcIiwgXCJMXCIsIFwiWExcIiwgXCJYXCIsIFwiSVhcIiwgXCJWXCIsIFwiSVZcIiwgXCJJXCJdLFxuICAgICAgICBkZWNpbWFsID0gWzEwMDAsIDkwMCwgNTAwLCA0MDAsIDEwMCwgOTAsIDUwLCA0MCwgMTAsIDksIDUsIDQsIDFdLFxuICAgICAgICByb21hbiA9IFwiXCIsXG4gICAgICAgIHYsXG4gICAgICAgIGxlbiA9IHJvbWFuQXJyYXkubGVuZ3RoO1xuXG4gICAgICBpZiAobnVtYmVyIDw9IDAgfHwgbnVtYmVyID49IDQwMDApIHtcbiAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgIH1cblxuICAgICAgZm9yICh2ID0gMDsgdiA8IGxlbjsgdiArPSAxKSB7XG4gICAgICAgIHdoaWxlIChudW1iZXIgPj0gZGVjaW1hbFt2XSkge1xuICAgICAgICAgIG51bWJlciAtPSBkZWNpbWFsW3ZdO1xuICAgICAgICAgIHJvbWFuICs9IHJvbWFuQXJyYXlbdl07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJvbWFuO1xuICAgIH07XG4gIH0pKCk7XG5cbiAgZnVuY3Rpb24gaDJjUmVuZGVyQ29udGV4dCh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIHN0b3JhZ2UgPSBbXTtcbiAgICByZXR1cm4ge1xuICAgICAgc3RvcmFnZTogc3RvcmFnZSxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgY2xpcDogZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcImNsaXBcIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHRyYW5zbGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcInRyYW5zbGF0ZVwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZmlsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcImZpbGxcIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHNhdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJzYXZlXCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICByZXN0b3JlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwicmVzdG9yZVwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZmlsbFJlY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJmaWxsUmVjdFwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgY3JlYXRlUGF0dGVybjogZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcImNyZWF0ZVBhdHRlcm5cIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRyYXdTaGFwZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBzaGFwZSA9IFtdO1xuXG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwiZHJhd1NoYXBlXCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IHNoYXBlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbW92ZVRvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzaGFwZS5wdXNoKHtcbiAgICAgICAgICAgICAgbmFtZTogXCJtb3ZlVG9cIixcbiAgICAgICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBsaW5lVG86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNoYXBlLnB1c2goe1xuICAgICAgICAgICAgICBuYW1lOiBcImxpbmVUb1wiLFxuICAgICAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFyY1RvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzaGFwZS5wdXNoKHtcbiAgICAgICAgICAgICAgbmFtZTogXCJhcmNUb1wiLFxuICAgICAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJlemllckN1cnZlVG86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNoYXBlLnB1c2goe1xuICAgICAgICAgICAgICBuYW1lOiBcImJlemllckN1cnZlVG9cIixcbiAgICAgICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBxdWFkcmF0aWNDdXJ2ZVRvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzaGFwZS5wdXNoKHtcbiAgICAgICAgICAgICAgbmFtZTogXCJxdWFkcmF0aWNDdXJ2ZVRvXCIsXG4gICAgICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgfSxcbiAgICAgIGRyYXdJbWFnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcImRyYXdJbWFnZVwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZmlsbFRleHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJmaWxsVGV4dFwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgc2V0VmFyaWFibGU6IGZ1bmN0aW9uICh2YXJpYWJsZSwgdmFsdWUpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcInZhcmlhYmxlXCIsXG4gICAgICAgICAgbmFtZTogdmFyaWFibGUsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IHZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBfaHRtbDJjYW52YXMuUGFyc2UgPSBmdW5jdGlvbiAoaW1hZ2VzLCBvcHRpb25zKSB7XG5cbiAgICBpZiAob3B0aW9ucy5hdXRvc2Nyb2xsIHx8IGZhbHNlKSB3aW5kb3cuc2Nyb2xsKDAsIDApO1xuXG4gICAgdmFyIGVsZW1lbnQgPSAoKG9wdGlvbnMuZWxlbWVudHMgPT09IHVuZGVmaW5lZCkgPyBkb2N1bWVudC5ib2R5IDogb3B0aW9ucy5lbGVtZW50c1swXSksIC8vIHNlbGVjdCBib2R5IGJ5IGRlZmF1bHRcbiAgICAgIG51bURyYXdzID0gMCxcbiAgICAgIGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCxcbiAgICAgIFV0aWwgPSBfaHRtbDJjYW52YXMuVXRpbCxcbiAgICAgIHN1cHBvcnQgPSBVdGlsLlN1cHBvcnQob3B0aW9ucywgZG9jKSxcbiAgICAgIGlnbm9yZUVsZW1lbnRzUmVnRXhwID0gbmV3IFJlZ0V4cChcIihcIiArIG9wdGlvbnMuaWdub3JlRWxlbWVudHMgKyBcIilcIiksXG4gICAgICBib2R5ID0gZG9jLmJvZHksXG4gICAgICBnZXRDU1MgPSBVdGlsLmdldENTUyxcbiAgICAgIHBzZXVkb0hpZGUgPSBcIl9fX2h0bWwyY2FudmFzX19fcHNldWRvZWxlbWVudFwiLFxuICAgICAgaGlkZVBzZXVkb0VsZW1lbnRzID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cbiAgICBoaWRlUHNldWRvRWxlbWVudHMuaW5uZXJIVE1MID0gJy4nICsgcHNldWRvSGlkZSArICctYmVmb3JlOmJlZm9yZSB7IGNvbnRlbnQ6IFwiXCIgIWltcG9ydGFudDsgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9JyArXG4gICAgICAnLicgKyBwc2V1ZG9IaWRlICsgJy1hZnRlcjphZnRlciB7IGNvbnRlbnQ6IFwiXCIgIWltcG9ydGFudDsgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9JztcblxuICAgIGJvZHkuYXBwZW5kQ2hpbGQoaGlkZVBzZXVkb0VsZW1lbnRzKTtcblxuICAgIGltYWdlcyA9IGltYWdlcyB8fCB7fTtcblxuICAgIGZ1bmN0aW9uIGRvY3VtZW50V2lkdGgoKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgIE1hdGgubWF4KGRvYy5ib2R5LnNjcm9sbFdpZHRoLCBkb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoKSxcbiAgICAgICAgTWF0aC5tYXgoZG9jLmJvZHkub2Zmc2V0V2lkdGgsIGRvYy5kb2N1bWVudEVsZW1lbnQub2Zmc2V0V2lkdGgpLFxuICAgICAgICBNYXRoLm1heChkb2MuYm9keS5jbGllbnRXaWR0aCwgZG9jLmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG9jdW1lbnRIZWlnaHQoKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgIE1hdGgubWF4KGRvYy5ib2R5LnNjcm9sbEhlaWdodCwgZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQpLFxuICAgICAgICBNYXRoLm1heChkb2MuYm9keS5vZmZzZXRIZWlnaHQsIGRvYy5kb2N1bWVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0KSxcbiAgICAgICAgTWF0aC5tYXgoZG9jLmJvZHkuY2xpZW50SGVpZ2h0LCBkb2MuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q1NTSW50KGVsZW1lbnQsIGF0dHJpYnV0ZSkge1xuICAgICAgdmFyIHZhbCA9IHBhcnNlSW50KGdldENTUyhlbGVtZW50LCBhdHRyaWJ1dGUpLCAxMCk7XG4gICAgICByZXR1cm4gKGlzTmFOKHZhbCkpID8gMCA6IHZhbDsgLy8gYm9yZGVycyBpbiBvbGQgSUUgYXJlIHRocm93aW5nICdtZWRpdW0nIGZvciBkZW1vLmh0bWxcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJSZWN0KGN0eCwgeCwgeSwgdywgaCwgYmdjb2xvcikge1xuICAgICAgaWYgKGJnY29sb3IgIT09IFwidHJhbnNwYXJlbnRcIikge1xuICAgICAgICBjdHguc2V0VmFyaWFibGUoXCJmaWxsU3R5bGVcIiwgYmdjb2xvcik7XG4gICAgICAgIGN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcbiAgICAgICAgbnVtRHJhd3MgKz0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYXBpdGFsaXplKG0sIHAxLCBwMikge1xuICAgICAgaWYgKG0ubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gcDEgKyBwMi50b1VwcGVyQ2FzZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRleHRUcmFuc2Zvcm0odGV4dCwgdHJhbnNmb3JtKSB7XG4gICAgICBzd2l0Y2ggKHRyYW5zZm9ybSkge1xuICAgICAgICBjYXNlIFwibG93ZXJjYXNlXCI6XG4gICAgICAgICAgcmV0dXJuIHRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY2FzZSBcImNhcGl0YWxpemVcIjpcbiAgICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8oXnxcXHN8OnwtfFxcKHxcXCkpKFthLXpdKS9nLCBjYXBpdGFsaXplKTtcbiAgICAgICAgY2FzZSBcInVwcGVyY2FzZVwiOlxuICAgICAgICAgIHJldHVybiB0ZXh0LnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9MZXR0ZXJTcGFjaW5nKGxldHRlcl9zcGFjaW5nKSB7XG4gICAgICByZXR1cm4gKC9eKG5vcm1hbHxub25lfDBweCkkLy50ZXN0KGxldHRlcl9zcGFjaW5nKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd1RleHQoY3VycmVudFRleHQsIHgsIHksIGN0eCkge1xuICAgICAgaWYgKGN1cnJlbnRUZXh0ICE9PSBudWxsICYmIFV0aWwudHJpbVRleHQoY3VycmVudFRleHQpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGN1cnJlbnRUZXh0LCB4LCB5KTtcbiAgICAgICAgbnVtRHJhd3MgKz0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRUZXh0VmFyaWFibGVzKGN0eCwgZWwsIHRleHRfZGVjb3JhdGlvbiwgY29sb3IpIHtcbiAgICAgIHZhciBhbGlnbiA9IGZhbHNlLFxuICAgICAgICBib2xkID0gZ2V0Q1NTKGVsLCBcImZvbnRXZWlnaHRcIiksXG4gICAgICAgIGZhbWlseSA9IGdldENTUyhlbCwgXCJmb250RmFtaWx5XCIpLFxuICAgICAgICBzaXplID0gZ2V0Q1NTKGVsLCBcImZvbnRTaXplXCIpLFxuICAgICAgICBzaGFkb3dzID0gVXRpbC5wYXJzZVRleHRTaGFkb3dzKGdldENTUyhlbCwgXCJ0ZXh0U2hhZG93XCIpKTtcblxuICAgICAgc3dpdGNoIChwYXJzZUludChib2xkLCAxMCkpIHtcbiAgICAgICAgY2FzZSA0MDE6XG4gICAgICAgICAgYm9sZCA9IFwiYm9sZFwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQwMDpcbiAgICAgICAgICBib2xkID0gXCJub3JtYWxcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY3R4LnNldFZhcmlhYmxlKFwiZmlsbFN0eWxlXCIsIGNvbG9yKTtcbiAgICAgIGN0eC5zZXRWYXJpYWJsZShcImZvbnRcIiwgW2dldENTUyhlbCwgXCJmb250U3R5bGVcIiksIGdldENTUyhlbCwgXCJmb250VmFyaWFudFwiKSwgYm9sZCwgc2l6ZSwgZmFtaWx5XS5qb2luKFwiIFwiKSk7XG4gICAgICBjdHguc2V0VmFyaWFibGUoXCJ0ZXh0QWxpZ25cIiwgKGFsaWduKSA/IFwicmlnaHRcIiA6IFwibGVmdFwiKTtcblxuICAgICAgaWYgKHNoYWRvd3MubGVuZ3RoKSB7XG4gICAgICAgIC8vIFRPRE86IHN1cHBvcnQgbXVsdGlwbGUgdGV4dCBzaGFkb3dzXG4gICAgICAgIC8vIGFwcGx5IHRoZSBmaXJzdCB0ZXh0IHNoYWRvd1xuICAgICAgICBjdHguc2V0VmFyaWFibGUoXCJzaGFkb3dDb2xvclwiLCBzaGFkb3dzWzBdLmNvbG9yKTtcbiAgICAgICAgY3R4LnNldFZhcmlhYmxlKFwic2hhZG93T2Zmc2V0WFwiLCBzaGFkb3dzWzBdLm9mZnNldFgpO1xuICAgICAgICBjdHguc2V0VmFyaWFibGUoXCJzaGFkb3dPZmZzZXRZXCIsIHNoYWRvd3NbMF0ub2Zmc2V0WSk7XG4gICAgICAgIGN0eC5zZXRWYXJpYWJsZShcInNoYWRvd0JsdXJcIiwgc2hhZG93c1swXS5ibHVyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRleHRfZGVjb3JhdGlvbiAhPT0gXCJub25lXCIpIHtcbiAgICAgICAgcmV0dXJuIFV0aWwuRm9udChmYW1pbHksIHNpemUsIGRvYyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyVGV4dERlY29yYXRpb24oY3R4LCB0ZXh0X2RlY29yYXRpb24sIGJvdW5kcywgbWV0cmljcywgY29sb3IpIHtcbiAgICAgIHN3aXRjaCAodGV4dF9kZWNvcmF0aW9uKSB7XG4gICAgICAgIGNhc2UgXCJ1bmRlcmxpbmVcIjpcbiAgICAgICAgICAvLyBEcmF3cyBhIGxpbmUgYXQgdGhlIGJhc2VsaW5lIG9mIHRoZSBmb250XG4gICAgICAgICAgLy8gVE9ETyBBcyBzb21lIGJyb3dzZXJzIGRpc3BsYXkgdGhlIGxpbmUgYXMgbW9yZSB0aGFuIDFweCBpZiB0aGUgZm9udC1zaXplIGlzIGJpZywgbmVlZCB0byB0YWtlIHRoYXQgaW50byBhY2NvdW50IGJvdGggaW4gcG9zaXRpb24gYW5kIHNpemVcbiAgICAgICAgICByZW5kZXJSZWN0KGN0eCwgYm91bmRzLmxlZnQsIE1hdGgucm91bmQoYm91bmRzLnRvcCArIG1ldHJpY3MuYmFzZWxpbmUgKyBtZXRyaWNzLmxpbmVXaWR0aCksIGJvdW5kcy53aWR0aCwgMSwgY29sb3IpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwib3ZlcmxpbmVcIjpcbiAgICAgICAgICByZW5kZXJSZWN0KGN0eCwgYm91bmRzLmxlZnQsIE1hdGgucm91bmQoYm91bmRzLnRvcCksIGJvdW5kcy53aWR0aCwgMSwgY29sb3IpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibGluZS10aHJvdWdoXCI6XG4gICAgICAgICAgLy8gVE9ETyB0cnkgYW5kIGZpbmQgZXhhY3QgcG9zaXRpb24gZm9yIGxpbmUtdGhyb3VnaFxuICAgICAgICAgIHJlbmRlclJlY3QoY3R4LCBib3VuZHMubGVmdCwgTWF0aC5jZWlsKGJvdW5kcy50b3AgKyBtZXRyaWNzLm1pZGRsZSArIG1ldHJpY3MubGluZVdpZHRoKSwgYm91bmRzLndpZHRoLCAxLCBjb2xvcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VGV4dEJvdW5kcyhzdGF0ZSwgdGV4dCwgdGV4dERlY29yYXRpb24sIGlzTGFzdCwgdHJhbnNmb3JtKSB7XG4gICAgICB2YXIgYm91bmRzO1xuICAgICAgaWYgKHN1cHBvcnQucmFuZ2VCb3VuZHMgJiYgIXRyYW5zZm9ybSkge1xuICAgICAgICBpZiAodGV4dERlY29yYXRpb24gIT09IFwibm9uZVwiIHx8IFV0aWwudHJpbVRleHQodGV4dCkubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgYm91bmRzID0gdGV4dFJhbmdlQm91bmRzKHRleHQsIHN0YXRlLm5vZGUsIHN0YXRlLnRleHRPZmZzZXQpO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLnRleHRPZmZzZXQgKz0gdGV4dC5sZW5ndGg7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLm5vZGUgJiYgdHlwZW9mIHN0YXRlLm5vZGUubm9kZVZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHZhciBuZXdUZXh0Tm9kZSA9IChpc0xhc3QpID8gc3RhdGUubm9kZS5zcGxpdFRleHQodGV4dC5sZW5ndGgpIDogbnVsbDtcbiAgICAgICAgYm91bmRzID0gdGV4dFdyYXBwZXJCb3VuZHMoc3RhdGUubm9kZSwgdHJhbnNmb3JtKTtcbiAgICAgICAgc3RhdGUubm9kZSA9IG5ld1RleHROb2RlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0ZXh0UmFuZ2VCb3VuZHModGV4dCwgdGV4dE5vZGUsIHRleHRPZmZzZXQpIHtcbiAgICAgIHZhciByYW5nZSA9IGRvYy5jcmVhdGVSYW5nZSgpO1xuICAgICAgcmFuZ2Uuc2V0U3RhcnQodGV4dE5vZGUsIHRleHRPZmZzZXQpO1xuICAgICAgcmFuZ2Uuc2V0RW5kKHRleHROb2RlLCB0ZXh0T2Zmc2V0ICsgdGV4dC5sZW5ndGgpO1xuICAgICAgcmV0dXJuIHJhbmdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRleHRXcmFwcGVyQm91bmRzKG9sZFRleHROb2RlLCB0cmFuc2Zvcm0pIHtcbiAgICAgIHZhciBwYXJlbnQgPSBvbGRUZXh0Tm9kZS5wYXJlbnROb2RlLFxuICAgICAgICB3cmFwRWxlbWVudCA9IGRvYy5jcmVhdGVFbGVtZW50KCd3cmFwcGVyJyksXG4gICAgICAgIGJhY2t1cFRleHQgPSBvbGRUZXh0Tm9kZS5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgIHdyYXBFbGVtZW50LmFwcGVuZENoaWxkKG9sZFRleHROb2RlLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICBwYXJlbnQucmVwbGFjZUNoaWxkKHdyYXBFbGVtZW50LCBvbGRUZXh0Tm9kZSk7XG5cbiAgICAgIHZhciBib3VuZHMgPSB0cmFuc2Zvcm0gPyBVdGlsLk9mZnNldEJvdW5kcyh3cmFwRWxlbWVudCkgOiBVdGlsLkJvdW5kcyh3cmFwRWxlbWVudCk7XG4gICAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGJhY2t1cFRleHQsIHdyYXBFbGVtZW50KTtcbiAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyVGV4dChlbCwgdGV4dE5vZGUsIHN0YWNrKSB7XG4gICAgICB2YXIgY3R4ID0gc3RhY2suY3R4LFxuICAgICAgICBjb2xvciA9IGdldENTUyhlbCwgXCJjb2xvclwiKSxcbiAgICAgICAgdGV4dERlY29yYXRpb24gPSBnZXRDU1MoZWwsIFwidGV4dERlY29yYXRpb25cIiksXG4gICAgICAgIHRleHRBbGlnbiA9IGdldENTUyhlbCwgXCJ0ZXh0QWxpZ25cIiksXG4gICAgICAgIG1ldHJpY3MsXG4gICAgICAgIHRleHRMaXN0LFxuICAgICAgICBzdGF0ZSA9IHtcbiAgICAgICAgICBub2RlOiB0ZXh0Tm9kZSxcbiAgICAgICAgICB0ZXh0T2Zmc2V0OiAwXG4gICAgICAgIH07XG5cbiAgICAgIGlmIChVdGlsLnRyaW1UZXh0KHRleHROb2RlLm5vZGVWYWx1ZSkubGVuZ3RoID4gMCkge1xuICAgICAgICB0ZXh0Tm9kZS5ub2RlVmFsdWUgPSB0ZXh0VHJhbnNmb3JtKHRleHROb2RlLm5vZGVWYWx1ZSwgZ2V0Q1NTKGVsLCBcInRleHRUcmFuc2Zvcm1cIikpO1xuICAgICAgICB0ZXh0QWxpZ24gPSB0ZXh0QWxpZ24ucmVwbGFjZShbXCItd2Via2l0LWF1dG9cIl0sIFtcImF1dG9cIl0pO1xuXG4gICAgICAgIHRleHRMaXN0ID0gKCFvcHRpb25zLmxldHRlclJlbmRlcmluZyAmJiAvXihsZWZ0fHJpZ2h0fGp1c3RpZnl8YXV0bykkLy50ZXN0KHRleHRBbGlnbikgJiYgbm9MZXR0ZXJTcGFjaW5nKGdldENTUyhlbCwgXCJsZXR0ZXJTcGFjaW5nXCIpKSkgP1xuICAgICAgICAgIHRleHROb2RlLm5vZGVWYWx1ZS5zcGxpdCgvKFxcYnwgKS8pIDpcbiAgICAgICAgICB0ZXh0Tm9kZS5ub2RlVmFsdWUuc3BsaXQoXCJcIik7XG5cbiAgICAgICAgbWV0cmljcyA9IHNldFRleHRWYXJpYWJsZXMoY3R4LCBlbCwgdGV4dERlY29yYXRpb24sIGNvbG9yKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5jaGluZXNlKSB7XG4gICAgICAgICAgdGV4dExpc3QuZm9yRWFjaChmdW5jdGlvbiAod29yZCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICgvLipbXFx1NEUwMC1cXHU5RkE1XS4qJC8udGVzdCh3b3JkKSkge1xuICAgICAgICAgICAgICB3b3JkID0gd29yZC5zcGxpdChcIlwiKTtcbiAgICAgICAgICAgICAgd29yZC51bnNoaWZ0KGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgdGV4dExpc3Quc3BsaWNlLmFwcGx5KHRleHRMaXN0LCB3b3JkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHRMaXN0LmZvckVhY2goZnVuY3Rpb24gKHRleHQsIGluZGV4KSB7XG4gICAgICAgICAgdmFyIGJvdW5kcyA9IGdldFRleHRCb3VuZHMoc3RhdGUsIHRleHQsIHRleHREZWNvcmF0aW9uLCAoaW5kZXggPCB0ZXh0TGlzdC5sZW5ndGggLSAxKSwgc3RhY2sudHJhbnNmb3JtLm1hdHJpeCk7XG4gICAgICAgICAgaWYgKGJvdW5kcykge1xuICAgICAgICAgICAgZHJhd1RleHQodGV4dCwgYm91bmRzLmxlZnQsIGJvdW5kcy5ib3R0b20sIGN0eCk7XG4gICAgICAgICAgICByZW5kZXJUZXh0RGVjb3JhdGlvbihjdHgsIHRleHREZWNvcmF0aW9uLCBib3VuZHMsIG1ldHJpY3MsIGNvbG9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RQb3NpdGlvbihlbGVtZW50LCB2YWwpIHtcbiAgICAgIHZhciBib3VuZEVsZW1lbnQgPSBkb2MuY3JlYXRlRWxlbWVudChcImJvdW5kZWxlbWVudFwiKSxcbiAgICAgICAgb3JpZ2luYWxUeXBlLFxuICAgICAgICBib3VuZHM7XG5cbiAgICAgIGJvdW5kRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmVcIjtcblxuICAgICAgb3JpZ2luYWxUeXBlID0gZWxlbWVudC5zdHlsZS5saXN0U3R5bGVUeXBlO1xuICAgICAgZWxlbWVudC5zdHlsZS5saXN0U3R5bGVUeXBlID0gXCJub25lXCI7XG5cbiAgICAgIGJvdW5kRWxlbWVudC5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUodmFsKSk7XG5cbiAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGJvdW5kRWxlbWVudCwgZWxlbWVudC5maXJzdENoaWxkKTtcblxuICAgICAgYm91bmRzID0gVXRpbC5Cb3VuZHMoYm91bmRFbGVtZW50KTtcbiAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQoYm91bmRFbGVtZW50KTtcbiAgICAgIGVsZW1lbnQuc3R5bGUubGlzdFN0eWxlVHlwZSA9IG9yaWdpbmFsVHlwZTtcbiAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZWxlbWVudEluZGV4KGVsKSB7XG4gICAgICB2YXIgaSA9IC0xLFxuICAgICAgICBjb3VudCA9IDEsXG4gICAgICAgIGNoaWxkcyA9IGVsLnBhcmVudE5vZGUuY2hpbGROb2RlcztcblxuICAgICAgaWYgKGVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgd2hpbGUgKGNoaWxkc1srK2ldICE9PSBlbCkge1xuICAgICAgICAgIGlmIChjaGlsZHNbaV0ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaXN0SXRlbVRleHQoZWxlbWVudCwgdHlwZSkge1xuICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IGVsZW1lbnRJbmRleChlbGVtZW50KSxcbiAgICAgICAgdGV4dDtcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFwiZGVjaW1hbFwiOlxuICAgICAgICAgIHRleHQgPSBjdXJyZW50SW5kZXg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJkZWNpbWFsLWxlYWRpbmctemVyb1wiOlxuICAgICAgICAgIHRleHQgPSAoY3VycmVudEluZGV4LnRvU3RyaW5nKCkubGVuZ3RoID09PSAxKSA/IGN1cnJlbnRJbmRleCA9IFwiMFwiICsgY3VycmVudEluZGV4LnRvU3RyaW5nKCkgOiBjdXJyZW50SW5kZXgudG9TdHJpbmcoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInVwcGVyLXJvbWFuXCI6XG4gICAgICAgICAgdGV4dCA9IF9odG1sMmNhbnZhcy5HZW5lcmF0ZS5MaXN0Um9tYW4oY3VycmVudEluZGV4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImxvd2VyLXJvbWFuXCI6XG4gICAgICAgICAgdGV4dCA9IF9odG1sMmNhbnZhcy5HZW5lcmF0ZS5MaXN0Um9tYW4oY3VycmVudEluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibG93ZXItYWxwaGFcIjpcbiAgICAgICAgICB0ZXh0ID0gX2h0bWwyY2FudmFzLkdlbmVyYXRlLkxpc3RBbHBoYShjdXJyZW50SW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ1cHBlci1hbHBoYVwiOlxuICAgICAgICAgIHRleHQgPSBfaHRtbDJjYW52YXMuR2VuZXJhdGUuTGlzdEFscGhhKGN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0ZXh0ICsgXCIuIFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlckxpc3RJdGVtKGVsZW1lbnQsIHN0YWNrLCBlbEJvdW5kcykge1xuICAgICAgdmFyIHgsXG4gICAgICAgIHRleHQsXG4gICAgICAgIGN0eCA9IHN0YWNrLmN0eCxcbiAgICAgICAgdHlwZSA9IGdldENTUyhlbGVtZW50LCBcImxpc3RTdHlsZVR5cGVcIiksXG4gICAgICAgIGxpc3RCb3VuZHM7XG5cbiAgICAgIGlmICgvXihkZWNpbWFsfGRlY2ltYWwtbGVhZGluZy16ZXJvfHVwcGVyLWFscGhhfHVwcGVyLWxhdGlufHVwcGVyLXJvbWFufGxvd2VyLWFscGhhfGxvd2VyLWdyZWVrfGxvd2VyLWxhdGlufGxvd2VyLXJvbWFuKSQvaS50ZXN0KHR5cGUpKSB7XG4gICAgICAgIHRleHQgPSBsaXN0SXRlbVRleHQoZWxlbWVudCwgdHlwZSk7XG4gICAgICAgIGxpc3RCb3VuZHMgPSBsaXN0UG9zaXRpb24oZWxlbWVudCwgdGV4dCk7XG4gICAgICAgIHNldFRleHRWYXJpYWJsZXMoY3R4LCBlbGVtZW50LCBcIm5vbmVcIiwgZ2V0Q1NTKGVsZW1lbnQsIFwiY29sb3JcIikpO1xuXG4gICAgICAgIGlmIChnZXRDU1MoZWxlbWVudCwgXCJsaXN0U3R5bGVQb3NpdGlvblwiKSA9PT0gXCJpbnNpZGVcIikge1xuICAgICAgICAgIGN0eC5zZXRWYXJpYWJsZShcInRleHRBbGlnblwiLCBcImxlZnRcIik7XG4gICAgICAgICAgeCA9IGVsQm91bmRzLmxlZnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZHJhd1RleHQodGV4dCwgeCwgbGlzdEJvdW5kcy5ib3R0b20sIGN0eCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZEltYWdlKHNyYykge1xuICAgICAgdmFyIGltZyA9IGltYWdlc1tzcmNdO1xuICAgICAgcmV0dXJuIChpbWcgJiYgaW1nLnN1Y2NlZWRlZCA9PT0gdHJ1ZSkgPyBpbWcuaW1nIDogZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xpcEJvdW5kcyhzcmMsIGRzdCkge1xuICAgICAgdmFyIHggPSBNYXRoLm1heChzcmMubGVmdCwgZHN0LmxlZnQpLFxuICAgICAgICB5ID0gTWF0aC5tYXgoc3JjLnRvcCwgZHN0LnRvcCksXG4gICAgICAgIHgyID0gTWF0aC5taW4oKHNyYy5sZWZ0ICsgc3JjLndpZHRoKSwgKGRzdC5sZWZ0ICsgZHN0LndpZHRoKSksXG4gICAgICAgIHkyID0gTWF0aC5taW4oKHNyYy50b3AgKyBzcmMuaGVpZ2h0KSwgKGRzdC50b3AgKyBkc3QuaGVpZ2h0KSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IHgsXG4gICAgICAgIHRvcDogeSxcbiAgICAgICAgd2lkdGg6IHgyIC0geCxcbiAgICAgICAgaGVpZ2h0OiB5MiAtIHlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0WihlbGVtZW50LCBzdGFjaywgcGFyZW50U3RhY2spIHtcbiAgICAgIHZhciBuZXdDb250ZXh0LFxuICAgICAgICBpc1Bvc2l0aW9uZWQgPSBzdGFjay5jc3NQb3NpdGlvbiAhPT0gJ3N0YXRpYycsXG4gICAgICAgIHpJbmRleCA9IGlzUG9zaXRpb25lZCA/IGdldENTUyhlbGVtZW50LCAnekluZGV4JykgOiAnYXV0bycsXG4gICAgICAgIG9wYWNpdHkgPSBnZXRDU1MoZWxlbWVudCwgJ29wYWNpdHknKSxcbiAgICAgICAgaXNGbG9hdGVkID0gZ2V0Q1NTKGVsZW1lbnQsICdjc3NGbG9hdCcpICE9PSAnbm9uZSc7XG5cbiAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0d1aWRlL0NTUy9VbmRlcnN0YW5kaW5nX3pfaW5kZXgvVGhlX3N0YWNraW5nX2NvbnRleHRcbiAgICAgIC8vIFdoZW4gYSBuZXcgc3RhY2tpbmcgY29udGV4dCBzaG91bGQgYmUgY3JlYXRlZDpcbiAgICAgIC8vIHRoZSByb290IGVsZW1lbnQgKEhUTUwpLFxuICAgICAgLy8gcG9zaXRpb25lZCAoYWJzb2x1dGVseSBvciByZWxhdGl2ZWx5KSB3aXRoIGEgei1pbmRleCB2YWx1ZSBvdGhlciB0aGFuIFwiYXV0b1wiLFxuICAgICAgLy8gZWxlbWVudHMgd2l0aCBhbiBvcGFjaXR5IHZhbHVlIGxlc3MgdGhhbiAxLiAoU2VlIHRoZSBzcGVjaWZpY2F0aW9uIGZvciBvcGFjaXR5KSxcbiAgICAgIC8vIG9uIG1vYmlsZSBXZWJLaXQgYW5kIENocm9tZSAyMissIHBvc2l0aW9uOiBmaXhlZCBhbHdheXMgY3JlYXRlcyBhIG5ldyBzdGFja2luZyBjb250ZXh0LCBldmVuIHdoZW4gei1pbmRleCBpcyBcImF1dG9cIiAoU2VlIHRoaXMgcG9zdClcblxuICAgICAgc3RhY2suekluZGV4ID0gbmV3Q29udGV4dCA9IGgyY3pDb250ZXh0KHpJbmRleCk7XG4gICAgICBuZXdDb250ZXh0LmlzUG9zaXRpb25lZCA9IGlzUG9zaXRpb25lZDtcbiAgICAgIG5ld0NvbnRleHQuaXNGbG9hdGVkID0gaXNGbG9hdGVkO1xuICAgICAgbmV3Q29udGV4dC5vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICAgIG5ld0NvbnRleHQub3duU3RhY2tpbmcgPSAoekluZGV4ICE9PSAnYXV0bycgfHwgb3BhY2l0eSA8IDEpO1xuXG4gICAgICBpZiAocGFyZW50U3RhY2spIHtcbiAgICAgICAgcGFyZW50U3RhY2suekluZGV4LmNoaWxkcmVuLnB1c2goc3RhY2spO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlckltYWdlKGN0eCwgZWxlbWVudCwgaW1hZ2UsIGJvdW5kcywgYm9yZGVycykge1xuXG4gICAgICB2YXIgcGFkZGluZ0xlZnQgPSBnZXRDU1NJbnQoZWxlbWVudCwgJ3BhZGRpbmdMZWZ0JyksXG4gICAgICAgIHBhZGRpbmdUb3AgPSBnZXRDU1NJbnQoZWxlbWVudCwgJ3BhZGRpbmdUb3AnKSxcbiAgICAgICAgcGFkZGluZ1JpZ2h0ID0gZ2V0Q1NTSW50KGVsZW1lbnQsICdwYWRkaW5nUmlnaHQnKSxcbiAgICAgICAgcGFkZGluZ0JvdHRvbSA9IGdldENTU0ludChlbGVtZW50LCAncGFkZGluZ0JvdHRvbScpO1xuXG4gICAgICB2YXIgb2Zmc2V0VG9wICA9IG9wdGlvbnNbXCJ0b3BcIl0gIHx8IDA7XG4gICAgICB2YXIgb2Zmc2V0TGVmdCA9IG9wdGlvbnNbXCJsZWZ0XCJdIHx8IDA7XG5cbiAgICAgIC8vIFJlc2l6ZSBpbWFnZSBiYXNlZCBvbiBvYmplY3RGaXRcbiAgICAgIHZhciBvYmplY3RGaXQgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLm9iamVjdEZpdDtcbiAgICAgIGlmICgvY29udGFpbnxjb3Zlci8udGVzdChvYmplY3RGaXQpKSB7XG4gICAgICAgIHZhciByZXNpemVkQm91bmRzID0gX2h0bWwyY2FudmFzLlV0aWwucmVzaXplQm91bmRzKGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgb2JqZWN0Rml0KTtcbiAgICAgICAgYm91bmRzLndpZHRoICA9IHJlc2l6ZWRCb3VuZHMud2lkdGg7XG4gICAgICAgIGJvdW5kcy5oZWlnaHQgPSByZXNpemVkQm91bmRzLmhlaWdodDtcbiAgICAgICAgb2Zmc2V0TGVmdCArPSByZXNpemVkQm91bmRzLmxlZnQ7XG4gICAgICAgIG9mZnNldFRvcCAgKz0gcmVzaXplZEJvdW5kcy50b3A7XG4gICAgICB9XG5cbiAgICAgIHZhciBzeCA9IDA7XG4gICAgICB2YXIgc3kgPSAwO1xuICAgICAgdmFyIHN3ID0gaW1hZ2Uud2lkdGg7XG4gICAgICB2YXIgc2ggPSBpbWFnZS5oZWlnaHQ7XG5cbiAgICAgIHZhciBkeCA9IGJvdW5kcy5sZWZ0ICsgcGFkZGluZ0xlZnQgKyBib3JkZXJzWzNdLndpZHRoICsgb2Zmc2V0TGVmdDtcbiAgICAgIHZhciBkeSA9IGJvdW5kcy50b3AgKyBwYWRkaW5nVG9wICsgYm9yZGVyc1swXS53aWR0aCArIG9mZnNldFRvcDtcbiAgICAgIHZhciBkdyA9IGJvdW5kcy53aWR0aCAtIChib3JkZXJzWzFdLndpZHRoICsgYm9yZGVyc1szXS53aWR0aCArIHBhZGRpbmdMZWZ0ICsgcGFkZGluZ1JpZ2h0KTtcbiAgICAgIHZhciBkaCA9IGJvdW5kcy5oZWlnaHQgLSAoYm9yZGVyc1swXS53aWR0aCArIGJvcmRlcnNbMl0ud2lkdGggKyBwYWRkaW5nVG9wICsgcGFkZGluZ0JvdHRvbSk7XG5cbiAgICAgIGRyYXdJbWFnZShjdHgsIGltYWdlLFxuICAgICAgICBzeCwgc3ksIHN3LCBzaCxcbiAgICAgICAgZHgsIGR5LCBkdywgZGhcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Qm9yZGVyRGF0YShlbGVtZW50KSB7XG4gICAgICByZXR1cm4gW1wiVG9wXCIsIFwiUmlnaHRcIiwgXCJCb3R0b21cIiwgXCJMZWZ0XCJdLm1hcChmdW5jdGlvbiAoc2lkZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHdpZHRoOiBnZXRDU1NJbnQoZWxlbWVudCwgJ2JvcmRlcicgKyBzaWRlICsgJ1dpZHRoJyksXG4gICAgICAgICAgY29sb3I6IGdldENTUyhlbGVtZW50LCAnYm9yZGVyJyArIHNpZGUgKyAnQ29sb3InKVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Qm9yZGVyUmFkaXVzRGF0YShlbGVtZW50KSB7XG4gICAgICByZXR1cm4gW1wiVG9wTGVmdFwiLCBcIlRvcFJpZ2h0XCIsIFwiQm90dG9tUmlnaHRcIiwgXCJCb3R0b21MZWZ0XCJdLm1hcChmdW5jdGlvbiAoc2lkZSkge1xuICAgICAgICByZXR1cm4gZ2V0Q1NTKGVsZW1lbnQsICdib3JkZXInICsgc2lkZSArICdSYWRpdXMnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBnZXRDdXJ2ZVBvaW50cyA9IChmdW5jdGlvbiAoa2FwcGEpIHtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICh4LCB5LCByMSwgcjIpIHtcbiAgICAgICAgdmFyIG94ID0gKHIxKSAqIGthcHBhLCAvLyBjb250cm9sIHBvaW50IG9mZnNldCBob3Jpem9udGFsXG4gICAgICAgICAgb3kgPSAocjIpICoga2FwcGEsIC8vIGNvbnRyb2wgcG9pbnQgb2Zmc2V0IHZlcnRpY2FsXG4gICAgICAgICAgeG0gPSB4ICsgcjEsIC8vIHgtbWlkZGxlXG4gICAgICAgICAgeW0gPSB5ICsgcjI7IC8vIHktbWlkZGxlXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9wTGVmdDogYmV6aWVyQ3VydmUoe1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHltXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHltIC0gb3lcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4bSAtIG94LFxuICAgICAgICAgICAgeTogeVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHhtLFxuICAgICAgICAgICAgeTogeVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHRvcFJpZ2h0OiBiZXppZXJDdXJ2ZSh7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHggKyBveCxcbiAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4bSxcbiAgICAgICAgICAgIHk6IHltIC0gb3lcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4bSxcbiAgICAgICAgICAgIHk6IHltXG4gICAgICAgICAgfSksXG4gICAgICAgICAgYm90dG9tUmlnaHQ6IGJlemllckN1cnZlKHtcbiAgICAgICAgICAgIHg6IHhtLFxuICAgICAgICAgICAgeTogeVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHhtLFxuICAgICAgICAgICAgeTogeSArIG95XG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeCArIG94LFxuICAgICAgICAgICAgeTogeW1cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeW1cbiAgICAgICAgICB9KSxcbiAgICAgICAgICBib3R0b21MZWZ0OiBiZXppZXJDdXJ2ZSh7XG4gICAgICAgICAgICB4OiB4bSxcbiAgICAgICAgICAgIHk6IHltXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeG0gLSBveCxcbiAgICAgICAgICAgIHk6IHltXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHkgKyBveVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5XG4gICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfSkoNCAqICgoTWF0aC5zcXJ0KDIpIC0gMSkgLyAzKSk7XG5cbiAgICBmdW5jdGlvbiBiZXppZXJDdXJ2ZShzdGFydCwgc3RhcnRDb250cm9sLCBlbmRDb250cm9sLCBlbmQpIHtcblxuICAgICAgdmFyIGxlcnAgPSBmdW5jdGlvbiAoYSwgYiwgdCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IGEueCArIChiLnggLSBhLngpICogdCxcbiAgICAgICAgICB5OiBhLnkgKyAoYi55IC0gYS55KSAqIHRcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgc3RhcnRDb250cm9sOiBzdGFydENvbnRyb2wsXG4gICAgICAgIGVuZENvbnRyb2w6IGVuZENvbnRyb2wsXG4gICAgICAgIGVuZDogZW5kLFxuICAgICAgICBzdWJkaXZpZGU6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgdmFyIGFiID0gbGVycChzdGFydCwgc3RhcnRDb250cm9sLCB0KSxcbiAgICAgICAgICAgIGJjID0gbGVycChzdGFydENvbnRyb2wsIGVuZENvbnRyb2wsIHQpLFxuICAgICAgICAgICAgY2QgPSBsZXJwKGVuZENvbnRyb2wsIGVuZCwgdCksXG4gICAgICAgICAgICBhYmJjID0gbGVycChhYiwgYmMsIHQpLFxuICAgICAgICAgICAgYmNjZCA9IGxlcnAoYmMsIGNkLCB0KSxcbiAgICAgICAgICAgIGRlc3QgPSBsZXJwKGFiYmMsIGJjY2QsIHQpO1xuICAgICAgICAgIHJldHVybiBbYmV6aWVyQ3VydmUoc3RhcnQsIGFiLCBhYmJjLCBkZXN0KSwgYmV6aWVyQ3VydmUoZGVzdCwgYmNjZCwgY2QsIGVuZCldO1xuICAgICAgICB9LFxuICAgICAgICBjdXJ2ZVRvOiBmdW5jdGlvbiAoYm9yZGVyQXJncykge1xuICAgICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJiZXppZXJDdXJ2ZVwiLCBzdGFydENvbnRyb2wueCwgc3RhcnRDb250cm9sLnksIGVuZENvbnRyb2wueCwgZW5kQ29udHJvbC55LCBlbmQueCwgZW5kLnldKTtcbiAgICAgICAgfSxcbiAgICAgICAgY3VydmVUb1JldmVyc2VkOiBmdW5jdGlvbiAoYm9yZGVyQXJncykge1xuICAgICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJiZXppZXJDdXJ2ZVwiLCBlbmRDb250cm9sLngsIGVuZENvbnRyb2wueSwgc3RhcnRDb250cm9sLngsIHN0YXJ0Q29udHJvbC55LCBzdGFydC54LCBzdGFydC55XSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VDb3JuZXIoYm9yZGVyQXJncywgcmFkaXVzMSwgcmFkaXVzMiwgY29ybmVyMSwgY29ybmVyMiwgeCwgeSkge1xuICAgICAgaWYgKHJhZGl1czFbMF0gPiAwIHx8IHJhZGl1czFbMV0gPiAwKSB7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIGNvcm5lcjFbMF0uc3RhcnQueCwgY29ybmVyMVswXS5zdGFydC55XSk7XG4gICAgICAgIGNvcm5lcjFbMF0uY3VydmVUbyhib3JkZXJBcmdzKTtcbiAgICAgICAgY29ybmVyMVsxXS5jdXJ2ZVRvKGJvcmRlckFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgeCwgeV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocmFkaXVzMlswXSA+IDAgfHwgcmFkaXVzMlsxXSA+IDApIHtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgY29ybmVyMlswXS5zdGFydC54LCBjb3JuZXIyWzBdLnN0YXJ0LnldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3U2lkZShib3JkZXJEYXRhLCByYWRpdXMxLCByYWRpdXMyLCBvdXRlcjEsIGlubmVyMSwgb3V0ZXIyLCBpbm5lcjIpIHtcbiAgICAgIHZhciBib3JkZXJBcmdzID0gW107XG5cbiAgICAgIGlmIChyYWRpdXMxWzBdID4gMCB8fCByYWRpdXMxWzFdID4gMCkge1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBvdXRlcjFbMV0uc3RhcnQueCwgb3V0ZXIxWzFdLnN0YXJ0LnldKTtcbiAgICAgICAgb3V0ZXIxWzFdLmN1cnZlVG8oYm9yZGVyQXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBib3JkZXJEYXRhLmMxWzBdLCBib3JkZXJEYXRhLmMxWzFdXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyYWRpdXMyWzBdID4gMCB8fCByYWRpdXMyWzFdID4gMCkge1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBvdXRlcjJbMF0uc3RhcnQueCwgb3V0ZXIyWzBdLnN0YXJ0LnldKTtcbiAgICAgICAgb3V0ZXIyWzBdLmN1cnZlVG8oYm9yZGVyQXJncyk7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIGlubmVyMlswXS5lbmQueCwgaW5uZXIyWzBdLmVuZC55XSk7XG4gICAgICAgIGlubmVyMlswXS5jdXJ2ZVRvUmV2ZXJzZWQoYm9yZGVyQXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBib3JkZXJEYXRhLmMyWzBdLCBib3JkZXJEYXRhLmMyWzFdXSk7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIGJvcmRlckRhdGEuYzNbMF0sIGJvcmRlckRhdGEuYzNbMV1dKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJhZGl1czFbMF0gPiAwIHx8IHJhZGl1czFbMV0gPiAwKSB7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIGlubmVyMVsxXS5lbmQueCwgaW5uZXIxWzFdLmVuZC55XSk7XG4gICAgICAgIGlubmVyMVsxXS5jdXJ2ZVRvUmV2ZXJzZWQoYm9yZGVyQXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBib3JkZXJEYXRhLmM0WzBdLCBib3JkZXJEYXRhLmM0WzFdXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBib3JkZXJBcmdzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUN1cnZlUG9pbnRzKGJvdW5kcywgYm9yZGVyUmFkaXVzLCBib3JkZXJzKSB7XG5cbiAgICAgIHZhciB4ID0gYm91bmRzLmxlZnQsXG4gICAgICAgIHkgPSBib3VuZHMudG9wLFxuICAgICAgICB3aWR0aCA9IGJvdW5kcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzLmhlaWdodCxcblxuICAgICAgICB0bGggPSBib3JkZXJSYWRpdXNbMF1bMF0sXG4gICAgICAgIHRsdiA9IGJvcmRlclJhZGl1c1swXVsxXSxcbiAgICAgICAgdHJoID0gYm9yZGVyUmFkaXVzWzFdWzBdLFxuICAgICAgICB0cnYgPSBib3JkZXJSYWRpdXNbMV1bMV0sXG4gICAgICAgIGJyaCA9IGJvcmRlclJhZGl1c1syXVswXSxcbiAgICAgICAgYnJ2ID0gYm9yZGVyUmFkaXVzWzJdWzFdLFxuICAgICAgICBibGggPSBib3JkZXJSYWRpdXNbM11bMF0sXG4gICAgICAgIGJsdiA9IGJvcmRlclJhZGl1c1szXVsxXTtcblxuICAgICAgdmFyIGhhbGZIZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAvIDIpO1xuICAgICAgdGxoID0gdGxoID4gaGFsZkhlaWdodCA/IGhhbGZIZWlnaHQgOiB0bGg7XG4gICAgICB0bHYgPSB0bHYgPiBoYWxmSGVpZ2h0ID8gaGFsZkhlaWdodCA6IHRsdjtcbiAgICAgIHRyaCA9IHRyaCA+IGhhbGZIZWlnaHQgPyBoYWxmSGVpZ2h0IDogdHJoO1xuICAgICAgdHJ2ID0gdHJ2ID4gaGFsZkhlaWdodCA/IGhhbGZIZWlnaHQgOiB0cnY7XG4gICAgICBicmggPSBicmggPiBoYWxmSGVpZ2h0ID8gaGFsZkhlaWdodCA6IGJyaDtcbiAgICAgIGJydiA9IGJydiA+IGhhbGZIZWlnaHQgPyBoYWxmSGVpZ2h0IDogYnJ2O1xuICAgICAgYmxoID0gYmxoID4gaGFsZkhlaWdodCA/IGhhbGZIZWlnaHQgOiBibGg7XG4gICAgICBibHYgPSBibHYgPiBoYWxmSGVpZ2h0ID8gaGFsZkhlaWdodCA6IGJsdjtcblxuICAgICAgdmFyIHRvcFdpZHRoID0gd2lkdGggLSB0cmgsXG4gICAgICAgIHJpZ2h0SGVpZ2h0ID0gaGVpZ2h0IC0gYnJ2LFxuICAgICAgICBib3R0b21XaWR0aCA9IHdpZHRoIC0gYnJoLFxuICAgICAgICBsZWZ0SGVpZ2h0ID0gaGVpZ2h0IC0gYmx2O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b3BMZWZ0T3V0ZXI6IGdldEN1cnZlUG9pbnRzKFxuICAgICAgICAgIHgsXG4gICAgICAgICAgeSxcbiAgICAgICAgICB0bGgsXG4gICAgICAgICAgdGx2XG4gICAgICAgICkudG9wTGVmdC5zdWJkaXZpZGUoMC41KSxcblxuICAgICAgICB0b3BMZWZ0SW5uZXI6IGdldEN1cnZlUG9pbnRzKFxuICAgICAgICAgIHggKyBib3JkZXJzWzNdLndpZHRoLFxuICAgICAgICAgIHkgKyBib3JkZXJzWzBdLndpZHRoLFxuICAgICAgICAgIE1hdGgubWF4KDAsIHRsaCAtIGJvcmRlcnNbM10ud2lkdGgpLFxuICAgICAgICAgIE1hdGgubWF4KDAsIHRsdiAtIGJvcmRlcnNbMF0ud2lkdGgpXG4gICAgICAgICkudG9wTGVmdC5zdWJkaXZpZGUoMC41KSxcblxuICAgICAgICB0b3BSaWdodE91dGVyOiBnZXRDdXJ2ZVBvaW50cyhcbiAgICAgICAgICB4ICsgdG9wV2lkdGgsXG4gICAgICAgICAgeSxcbiAgICAgICAgICB0cmgsXG4gICAgICAgICAgdHJ2XG4gICAgICAgICkudG9wUmlnaHQuc3ViZGl2aWRlKDAuNSksXG5cbiAgICAgICAgdG9wUmlnaHRJbm5lcjogZ2V0Q3VydmVQb2ludHMoXG4gICAgICAgICAgeCArIE1hdGgubWluKHRvcFdpZHRoLCB3aWR0aCArIGJvcmRlcnNbM10ud2lkdGgpLFxuICAgICAgICAgIHkgKyBib3JkZXJzWzBdLndpZHRoLFxuICAgICAgICAgICh0b3BXaWR0aCA+IHdpZHRoICsgYm9yZGVyc1szXS53aWR0aCkgPyAwIDogdHJoIC0gYm9yZGVyc1szXS53aWR0aCxcbiAgICAgICAgICB0cnYgLSBib3JkZXJzWzBdLndpZHRoXG4gICAgICAgICkudG9wUmlnaHQuc3ViZGl2aWRlKDAuNSksXG5cbiAgICAgICAgYm90dG9tUmlnaHRPdXRlcjogZ2V0Q3VydmVQb2ludHMoXG4gICAgICAgICAgeCArIGJvdHRvbVdpZHRoLFxuICAgICAgICAgIHkgKyByaWdodEhlaWdodCxcbiAgICAgICAgICBicmgsXG4gICAgICAgICAgYnJ2XG4gICAgICAgICkuYm90dG9tUmlnaHQuc3ViZGl2aWRlKDAuNSksXG5cbiAgICAgICAgYm90dG9tUmlnaHRJbm5lcjogZ2V0Q3VydmVQb2ludHMoXG4gICAgICAgICAgeCArIE1hdGgubWluKGJvdHRvbVdpZHRoLCB3aWR0aCArIGJvcmRlcnNbM10ud2lkdGgpLFxuICAgICAgICAgIHkgKyBNYXRoLm1pbihyaWdodEhlaWdodCwgaGVpZ2h0ICsgYm9yZGVyc1swXS53aWR0aCksXG4gICAgICAgICAgTWF0aC5tYXgoMCwgYnJoIC0gYm9yZGVyc1sxXS53aWR0aCksXG4gICAgICAgICAgTWF0aC5tYXgoMCwgYnJ2IC0gYm9yZGVyc1syXS53aWR0aClcbiAgICAgICAgKS5ib3R0b21SaWdodC5zdWJkaXZpZGUoMC41KSxcblxuICAgICAgICBib3R0b21MZWZ0T3V0ZXI6IGdldEN1cnZlUG9pbnRzKFxuICAgICAgICAgIHgsXG4gICAgICAgICAgeSArIGxlZnRIZWlnaHQsXG4gICAgICAgICAgYmxoLFxuICAgICAgICAgIGJsdlxuICAgICAgICApLmJvdHRvbUxlZnQuc3ViZGl2aWRlKDAuNSksXG5cbiAgICAgICAgYm90dG9tTGVmdElubmVyOiBnZXRDdXJ2ZVBvaW50cyhcbiAgICAgICAgICB4ICsgYm9yZGVyc1szXS53aWR0aCxcbiAgICAgICAgICB5ICsgbGVmdEhlaWdodCxcbiAgICAgICAgICBNYXRoLm1heCgwLCBibGggLSBib3JkZXJzWzNdLndpZHRoKSxcbiAgICAgICAgICBNYXRoLm1heCgwLCBibHYgLSBib3JkZXJzWzJdLndpZHRoKVxuICAgICAgICApLmJvdHRvbUxlZnQuc3ViZGl2aWRlKDAuNSlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Qm9yZGVyQ2xpcChlbGVtZW50LCBib3JkZXJQb2ludHMsIGJvcmRlcnMsIHJhZGl1cywgYm91bmRzKSB7XG4gICAgICB2YXIgYmFja2dyb3VuZENsaXAgPSBnZXRDU1MoZWxlbWVudCwgJ2JhY2tncm91bmRDbGlwJyksXG4gICAgICAgIGJvcmRlckFyZ3MgPSBbXTtcblxuICAgICAgc3dpdGNoIChiYWNrZ3JvdW5kQ2xpcCkge1xuICAgICAgICBjYXNlIFwiY29udGVudC1ib3hcIjpcbiAgICAgICAgY2FzZSBcInBhZGRpbmctYm94XCI6XG4gICAgICAgICAgcGFyc2VDb3JuZXIoYm9yZGVyQXJncywgcmFkaXVzWzBdLCByYWRpdXNbMV0sIGJvcmRlclBvaW50cy50b3BMZWZ0SW5uZXIsIGJvcmRlclBvaW50cy50b3BSaWdodElubmVyLCBib3VuZHMubGVmdCArIGJvcmRlcnNbM10ud2lkdGgsIGJvdW5kcy50b3AgKyBib3JkZXJzWzBdLndpZHRoKTtcbiAgICAgICAgICBwYXJzZUNvcm5lcihib3JkZXJBcmdzLCByYWRpdXNbMV0sIHJhZGl1c1syXSwgYm9yZGVyUG9pbnRzLnRvcFJpZ2h0SW5uZXIsIGJvcmRlclBvaW50cy5ib3R0b21SaWdodElubmVyLCBib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCAtIGJvcmRlcnNbMV0ud2lkdGgsIGJvdW5kcy50b3AgKyBib3JkZXJzWzBdLndpZHRoKTtcbiAgICAgICAgICBwYXJzZUNvcm5lcihib3JkZXJBcmdzLCByYWRpdXNbMl0sIHJhZGl1c1szXSwgYm9yZGVyUG9pbnRzLmJvdHRvbVJpZ2h0SW5uZXIsIGJvcmRlclBvaW50cy5ib3R0b21MZWZ0SW5uZXIsIGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoIC0gYm9yZGVyc1sxXS53aWR0aCwgYm91bmRzLnRvcCArIGJvdW5kcy5oZWlnaHQgLSBib3JkZXJzWzJdLndpZHRoKTtcbiAgICAgICAgICBwYXJzZUNvcm5lcihib3JkZXJBcmdzLCByYWRpdXNbM10sIHJhZGl1c1swXSwgYm9yZGVyUG9pbnRzLmJvdHRvbUxlZnRJbm5lciwgYm9yZGVyUG9pbnRzLnRvcExlZnRJbm5lciwgYm91bmRzLmxlZnQgKyBib3JkZXJzWzNdLndpZHRoLCBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodCAtIGJvcmRlcnNbMl0ud2lkdGgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcGFyc2VDb3JuZXIoYm9yZGVyQXJncywgcmFkaXVzWzBdLCByYWRpdXNbMV0sIGJvcmRlclBvaW50cy50b3BMZWZ0T3V0ZXIsIGJvcmRlclBvaW50cy50b3BSaWdodE91dGVyLCBib3VuZHMubGVmdCwgYm91bmRzLnRvcCk7XG4gICAgICAgICAgcGFyc2VDb3JuZXIoYm9yZGVyQXJncywgcmFkaXVzWzFdLCByYWRpdXNbMl0sIGJvcmRlclBvaW50cy50b3BSaWdodE91dGVyLCBib3JkZXJQb2ludHMuYm90dG9tUmlnaHRPdXRlciwgYm91bmRzLmxlZnQgKyBib3VuZHMud2lkdGgsIGJvdW5kcy50b3ApO1xuICAgICAgICAgIHBhcnNlQ29ybmVyKGJvcmRlckFyZ3MsIHJhZGl1c1syXSwgcmFkaXVzWzNdLCBib3JkZXJQb2ludHMuYm90dG9tUmlnaHRPdXRlciwgYm9yZGVyUG9pbnRzLmJvdHRvbUxlZnRPdXRlciwgYm91bmRzLmxlZnQgKyBib3VuZHMud2lkdGgsIGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0KTtcbiAgICAgICAgICBwYXJzZUNvcm5lcihib3JkZXJBcmdzLCByYWRpdXNbM10sIHJhZGl1c1swXSwgYm9yZGVyUG9pbnRzLmJvdHRvbUxlZnRPdXRlciwgYm9yZGVyUG9pbnRzLnRvcExlZnRPdXRlciwgYm91bmRzLmxlZnQsIGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJvcmRlckFyZ3M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VCb3JkZXJzKGVsZW1lbnQsIGJvdW5kcywgYm9yZGVycykge1xuICAgICAgdmFyIHggPSBib3VuZHMubGVmdCxcbiAgICAgICAgeSA9IGJvdW5kcy50b3AsXG4gICAgICAgIHdpZHRoID0gYm91bmRzLndpZHRoLFxuICAgICAgICBoZWlnaHQgPSBib3VuZHMuaGVpZ2h0LFxuICAgICAgICBib3JkZXJTaWRlLFxuICAgICAgICBieCxcbiAgICAgICAgYnksXG4gICAgICAgIGJ3LFxuICAgICAgICBiaCxcbiAgICAgICAgYm9yZGVyQXJncyxcbiAgICAgICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1iYWNrZ3JvdW5kLyN0aGUtYm9yZGVyLXJhZGl1c1xuICAgICAgICBib3JkZXJSYWRpdXMgPSBnZXRCb3JkZXJSYWRpdXNEYXRhKGVsZW1lbnQpLFxuICAgICAgICBib3JkZXJQb2ludHMgPSBjYWxjdWxhdGVDdXJ2ZVBvaW50cyhib3VuZHMsIGJvcmRlclJhZGl1cywgYm9yZGVycyksXG4gICAgICAgIGJvcmRlckRhdGEgPSB7XG4gICAgICAgICAgY2xpcDogZ2V0Qm9yZGVyQ2xpcChlbGVtZW50LCBib3JkZXJQb2ludHMsIGJvcmRlcnMsIGJvcmRlclJhZGl1cywgYm91bmRzKSxcbiAgICAgICAgICBib3JkZXJzOiBbXVxuICAgICAgICB9O1xuXG4gICAgICBmb3IgKGJvcmRlclNpZGUgPSAwOyBib3JkZXJTaWRlIDwgNDsgYm9yZGVyU2lkZSsrKSB7XG5cbiAgICAgICAgaWYgKGJvcmRlcnNbYm9yZGVyU2lkZV0ud2lkdGggPiAwKSB7XG4gICAgICAgICAgYnggPSB4O1xuICAgICAgICAgIGJ5ID0geTtcbiAgICAgICAgICBidyA9IHdpZHRoO1xuICAgICAgICAgIGJoID0gaGVpZ2h0IC0gKGJvcmRlcnNbMl0ud2lkdGgpO1xuXG4gICAgICAgICAgc3dpdGNoIChib3JkZXJTaWRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIC8vIHRvcCBib3JkZXJcbiAgICAgICAgICAgICAgYmggPSBib3JkZXJzWzBdLndpZHRoO1xuXG4gICAgICAgICAgICAgIGJvcmRlckFyZ3MgPSBkcmF3U2lkZSh7XG4gICAgICAgICAgICAgICAgICBjMTogW2J4LCBieV0sXG4gICAgICAgICAgICAgICAgICBjMjogW2J4ICsgYncsIGJ5XSxcbiAgICAgICAgICAgICAgICAgIGMzOiBbYnggKyBidyAtIGJvcmRlcnNbMV0ud2lkdGgsIGJ5ICsgYmhdLFxuICAgICAgICAgICAgICAgICAgYzQ6IFtieCArIGJvcmRlcnNbM10ud2lkdGgsIGJ5ICsgYmhdXG4gICAgICAgICAgICAgICAgfSwgYm9yZGVyUmFkaXVzWzBdLCBib3JkZXJSYWRpdXNbMV0sXG4gICAgICAgICAgICAgICAgYm9yZGVyUG9pbnRzLnRvcExlZnRPdXRlciwgYm9yZGVyUG9pbnRzLnRvcExlZnRJbm5lciwgYm9yZGVyUG9pbnRzLnRvcFJpZ2h0T3V0ZXIsIGJvcmRlclBvaW50cy50b3BSaWdodElubmVyKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgIC8vIHJpZ2h0IGJvcmRlclxuICAgICAgICAgICAgICBieCA9IHggKyB3aWR0aCAtIChib3JkZXJzWzFdLndpZHRoKTtcbiAgICAgICAgICAgICAgYncgPSBib3JkZXJzWzFdLndpZHRoO1xuXG4gICAgICAgICAgICAgIGJvcmRlckFyZ3MgPSBkcmF3U2lkZSh7XG4gICAgICAgICAgICAgICAgICBjMTogW2J4ICsgYncsIGJ5XSxcbiAgICAgICAgICAgICAgICAgIGMyOiBbYnggKyBidywgYnkgKyBiaCArIGJvcmRlcnNbMl0ud2lkdGhdLFxuICAgICAgICAgICAgICAgICAgYzM6IFtieCwgYnkgKyBiaF0sXG4gICAgICAgICAgICAgICAgICBjNDogW2J4LCBieSArIGJvcmRlcnNbMF0ud2lkdGhdXG4gICAgICAgICAgICAgICAgfSwgYm9yZGVyUmFkaXVzWzFdLCBib3JkZXJSYWRpdXNbMl0sXG4gICAgICAgICAgICAgICAgYm9yZGVyUG9pbnRzLnRvcFJpZ2h0T3V0ZXIsIGJvcmRlclBvaW50cy50b3BSaWdodElubmVyLCBib3JkZXJQb2ludHMuYm90dG9tUmlnaHRPdXRlciwgYm9yZGVyUG9pbnRzLmJvdHRvbVJpZ2h0SW5uZXIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgLy8gYm90dG9tIGJvcmRlclxuICAgICAgICAgICAgICBieSA9IChieSArIGhlaWdodCkgLSAoYm9yZGVyc1syXS53aWR0aCk7XG4gICAgICAgICAgICAgIGJoID0gYm9yZGVyc1syXS53aWR0aDtcblxuICAgICAgICAgICAgICBib3JkZXJBcmdzID0gZHJhd1NpZGUoe1xuICAgICAgICAgICAgICAgICAgYzE6IFtieCArIGJ3LCBieSArIGJoXSxcbiAgICAgICAgICAgICAgICAgIGMyOiBbYngsIGJ5ICsgYmhdLFxuICAgICAgICAgICAgICAgICAgYzM6IFtieCArIGJvcmRlcnNbM10ud2lkdGgsIGJ5XSxcbiAgICAgICAgICAgICAgICAgIGM0OiBbYnggKyBidyAtIGJvcmRlcnNbM10ud2lkdGgsIGJ5XVxuICAgICAgICAgICAgICAgIH0sIGJvcmRlclJhZGl1c1syXSwgYm9yZGVyUmFkaXVzWzNdLFxuICAgICAgICAgICAgICAgIGJvcmRlclBvaW50cy5ib3R0b21SaWdodE91dGVyLCBib3JkZXJQb2ludHMuYm90dG9tUmlnaHRJbm5lciwgYm9yZGVyUG9pbnRzLmJvdHRvbUxlZnRPdXRlciwgYm9yZGVyUG9pbnRzLmJvdHRvbUxlZnRJbm5lcik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAvLyBsZWZ0IGJvcmRlclxuICAgICAgICAgICAgICBidyA9IGJvcmRlcnNbM10ud2lkdGg7XG5cbiAgICAgICAgICAgICAgYm9yZGVyQXJncyA9IGRyYXdTaWRlKHtcbiAgICAgICAgICAgICAgICAgIGMxOiBbYngsIGJ5ICsgYmggKyBib3JkZXJzWzJdLndpZHRoXSxcbiAgICAgICAgICAgICAgICAgIGMyOiBbYngsIGJ5XSxcbiAgICAgICAgICAgICAgICAgIGMzOiBbYnggKyBidywgYnkgKyBib3JkZXJzWzBdLndpZHRoXSxcbiAgICAgICAgICAgICAgICAgIGM0OiBbYnggKyBidywgYnkgKyBiaF1cbiAgICAgICAgICAgICAgICB9LCBib3JkZXJSYWRpdXNbM10sIGJvcmRlclJhZGl1c1swXSxcbiAgICAgICAgICAgICAgICBib3JkZXJQb2ludHMuYm90dG9tTGVmdE91dGVyLCBib3JkZXJQb2ludHMuYm90dG9tTGVmdElubmVyLCBib3JkZXJQb2ludHMudG9wTGVmdE91dGVyLCBib3JkZXJQb2ludHMudG9wTGVmdElubmVyKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYm9yZGVyRGF0YS5ib3JkZXJzLnB1c2goe1xuICAgICAgICAgICAgYXJnczogYm9yZGVyQXJncyxcbiAgICAgICAgICAgIGNvbG9yOiBib3JkZXJzW2JvcmRlclNpZGVdLmNvbG9yXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gYm9yZGVyRGF0YTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTaGFwZShjdHgsIGFyZ3MpIHtcbiAgICAgIHZhciBzaGFwZSA9IGN0eC5kcmF3U2hhcGUoKTtcbiAgICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYm9yZGVyLCBpbmRleCkge1xuICAgICAgICBzaGFwZVsoaW5kZXggPT09IDApID8gXCJtb3ZlVG9cIiA6IGJvcmRlclswXSArIFwiVG9cIl0uYXBwbHkobnVsbCwgYm9yZGVyLnNsaWNlKDEpKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHNoYXBlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlckJvcmRlcnMoY3R4LCBib3JkZXJBcmdzLCBjb2xvcikge1xuICAgICAgaWYgKGNvbG9yICE9PSBcInRyYW5zcGFyZW50XCIpIHtcbiAgICAgICAgY3R4LnNldFZhcmlhYmxlKFwiZmlsbFN0eWxlXCIsIGNvbG9yKTtcbiAgICAgICAgY3JlYXRlU2hhcGUoY3R4LCBib3JkZXJBcmdzKTtcbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgbnVtRHJhd3MgKz0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJGb3JtVmFsdWUoZWwsIGJvdW5kcywgc3RhY2spIHtcblxuICAgICAgdmFyIHZhbHVlV3JhcCA9IGRvYy5jcmVhdGVFbGVtZW50KCd2YWx1ZXdyYXAnKSxcbiAgICAgICAgY3NzUHJvcGVydHlBcnJheSA9IFsnbGluZUhlaWdodCcsICd0ZXh0QWxpZ24nLCAnZm9udEZhbWlseScsICdjb2xvcicsICdmb250U2l6ZScsICdwYWRkaW5nTGVmdCcsICdwYWRkaW5nVG9wJywgJ3dpZHRoJywgJ2hlaWdodCcsICdib3JkZXInLCAnYm9yZGVyTGVmdFdpZHRoJywgJ2JvcmRlclRvcFdpZHRoJ10sXG4gICAgICAgIHRleHRWYWx1ZSxcbiAgICAgICAgdGV4dE5vZGU7XG5cbiAgICAgIGNzc1Byb3BlcnR5QXJyYXkuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YWx1ZVdyYXAuc3R5bGVbcHJvcGVydHldID0gZ2V0Q1NTKGVsLCBwcm9wZXJ0eSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBPbGRlciBJRSBoYXMgaXNzdWVzIHdpdGggXCJib3JkZXJcIlxuICAgICAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IFBhcnNlOiBFeGNlcHRpb24gY2F1Z2h0IGluIHJlbmRlckZvcm1WYWx1ZTogXCIgKyBlLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdmFsdWVXcmFwLnN0eWxlLmJvcmRlckNvbG9yID0gXCJibGFja1wiO1xuICAgICAgdmFsdWVXcmFwLnN0eWxlLmJvcmRlclN0eWxlID0gXCJzb2xpZFwiO1xuICAgICAgdmFsdWVXcmFwLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICB2YWx1ZVdyYXAuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG5cbiAgICAgIGlmICgvXihzdWJtaXR8cmVzZXR8YnV0dG9ufHRleHR8cGFzc3dvcmQpJC8udGVzdChlbC50eXBlKSB8fCBlbC5ub2RlTmFtZSA9PT0gXCJTRUxFQ1RcIikge1xuICAgICAgICB2YWx1ZVdyYXAuc3R5bGUubGluZUhlaWdodCA9IGdldENTUyhlbCwgXCJoZWlnaHRcIik7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlV3JhcC5zdHlsZS50b3AgPSBib3VuZHMudG9wICsgXCJweFwiO1xuICAgICAgdmFsdWVXcmFwLnN0eWxlLmxlZnQgPSBib3VuZHMubGVmdCArIFwicHhcIjtcblxuICAgICAgdGV4dFZhbHVlID0gKGVsLm5vZGVOYW1lID09PSBcIlNFTEVDVFwiKSA/IChlbC5vcHRpb25zW2VsLnNlbGVjdGVkSW5kZXhdIHx8IDApLnRleHQgOiBlbC52YWx1ZTtcbiAgICAgIGlmICghdGV4dFZhbHVlKSB7XG4gICAgICAgIHRleHRWYWx1ZSA9IGVsLnBsYWNlaG9sZGVyO1xuICAgICAgfVxuXG4gICAgICB0ZXh0Tm9kZSA9IGRvYy5jcmVhdGVUZXh0Tm9kZSh0ZXh0VmFsdWUpO1xuXG4gICAgICB2YWx1ZVdyYXAuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgYm9keS5hcHBlbmRDaGlsZCh2YWx1ZVdyYXApO1xuXG4gICAgICByZW5kZXJUZXh0KGVsLCB0ZXh0Tm9kZSwgc3RhY2spO1xuICAgICAgYm9keS5yZW1vdmVDaGlsZCh2YWx1ZVdyYXApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdJbWFnZShjdHgpIHtcbiAgICAgIGN0eC5kcmF3SW1hZ2UuYXBwbHkoY3R4LCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgIG51bURyYXdzICs9IDE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UHNldWRvRWxlbWVudChlbCwgd2hpY2gpIHtcbiAgICAgIHZhciBlbFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIHdoaWNoKTtcbiAgICAgIGlmICghZWxTdHlsZSB8fCAhZWxTdHlsZS5jb250ZW50IHx8IGVsU3R5bGUuY29udGVudCA9PT0gXCJub25lXCIgfHwgZWxTdHlsZS5jb250ZW50ID09PSBcIi1tb3otYWx0LWNvbnRlbnRcIiB8fCBlbFN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBjb250ZW50ID0gZWxTdHlsZS5jb250ZW50ICsgJycsXG4gICAgICAgIGZpcnN0ID0gY29udGVudC5zdWJzdHIoMCwgMSk7XG4gICAgICAvL3N0cmlwcyBxdW90ZXNcbiAgICAgIGlmIChmaXJzdCA9PT0gY29udGVudC5zdWJzdHIoY29udGVudC5sZW5ndGggLSAxKSAmJiBmaXJzdC5tYXRjaCgvJ3xcIi8pKSB7XG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnN1YnN0cigxLCBjb250ZW50Lmxlbmd0aCAtIDIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXNJbWFnZSA9IGNvbnRlbnQuc3Vic3RyKDAsIDMpID09PSAndXJsJyxcbiAgICAgICAgZWxwcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXNJbWFnZSA/ICdpbWcnIDogJ3NwYW4nKTtcblxuICAgICAgZWxwcy5jbGFzc05hbWUgPSBwc2V1ZG9IaWRlICsgXCItYmVmb3JlIFwiICsgcHNldWRvSGlkZSArIFwiLWFmdGVyXCI7XG5cbiAgICAgIE9iamVjdC5rZXlzKGVsU3R5bGUpLmZpbHRlcihpbmRleGVkUHJvcGVydHkpLmZvckVhY2goZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgICAgLy8gUHJldmVudCBhc3NpZ25pbmcgb2YgcmVhZCBvbmx5IENTUyBSdWxlcywgZXguIGxlbmd0aCwgcGFyZW50UnVsZVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGVscHMuc3R5bGVbcHJvcF0gPSBlbFN0eWxlW3Byb3BdO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgVXRpbC5sb2coWydUcmllZCB0byBhc3NpZ24gcmVhZG9ubHkgcHJvcGVydHkgJywgcHJvcCwgJ0Vycm9yOicsIGVdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGVscHMuc3R5bGVbJ2ZvbnRGYW1pbHknXSA9IGVsU3R5bGVbJ2ZvbnRGYW1pbHknXTtcbiAgICAgIGVscHMuc3R5bGVbJ2ZvbnQtZmFtaWx5J10gPSBlbFN0eWxlWydmb250LWZhbWlseSddO1xuXG4gICAgICBpZiAoaXNJbWFnZSkge1xuICAgICAgICBlbHBzLnNyYyA9IFV0aWwucGFyc2VCYWNrZ3JvdW5kSW1hZ2UoY29udGVudClbMF0uYXJnc1swXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVscHMuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbHBzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluZGV4ZWRQcm9wZXJ0eShwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIChpc05hTih3aW5kb3cucGFyc2VJbnQocHJvcGVydHksIDEwKSkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluamVjdFBzZXVkb0VsZW1lbnRzKGVsLCBzdGFjaykge1xuICAgICAgdmFyIGJlZm9yZSA9IGdldFBzZXVkb0VsZW1lbnQoZWwsICc6YmVmb3JlJyksXG4gICAgICAgIGFmdGVyID0gZ2V0UHNldWRvRWxlbWVudChlbCwgJzphZnRlcicpO1xuICAgICAgaWYgKCFiZWZvcmUgJiYgIWFmdGVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGJlZm9yZSkge1xuICAgICAgICBlbC5jbGFzc05hbWUgKz0gXCIgXCIgKyBwc2V1ZG9IaWRlICsgXCItYmVmb3JlXCI7XG4gICAgICAgIGVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGJlZm9yZSwgZWwpO1xuICAgICAgICBwYXJzZUVsZW1lbnQoYmVmb3JlLCBzdGFjaywgdHJ1ZSk7XG4gICAgICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYmVmb3JlKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UocHNldWRvSGlkZSArIFwiLWJlZm9yZVwiLCBcIlwiKS50cmltKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhZnRlcikge1xuICAgICAgICBlbC5jbGFzc05hbWUgKz0gXCIgXCIgKyBwc2V1ZG9IaWRlICsgXCItYWZ0ZXJcIjtcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQoYWZ0ZXIpO1xuICAgICAgICBwYXJzZUVsZW1lbnQoYWZ0ZXIsIHN0YWNrLCB0cnVlKTtcbiAgICAgICAgZWwucmVtb3ZlQ2hpbGQoYWZ0ZXIpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShwc2V1ZG9IaWRlICsgXCItYWZ0ZXJcIiwgXCJcIikudHJpbSgpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyQmFja2dyb3VuZFJlcGVhdChjdHgsIGltYWdlLCBiYWNrZ3JvdW5kUG9zaXRpb24sIGJvdW5kcykge1xuICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKGJvdW5kcy5sZWZ0ICsgYmFja2dyb3VuZFBvc2l0aW9uLmxlZnQpLFxuICAgICAgICBvZmZzZXRZID0gTWF0aC5yb3VuZChib3VuZHMudG9wICsgYmFja2dyb3VuZFBvc2l0aW9uLnRvcCk7XG5cbiAgICAgIGN0eC5jcmVhdGVQYXR0ZXJuKGltYWdlKTtcbiAgICAgIGN0eC50cmFuc2xhdGUob2Zmc2V0WCwgb2Zmc2V0WSk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgICAgY3R4LnRyYW5zbGF0ZSgtb2Zmc2V0WCwgLW9mZnNldFkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJhY2tncm91bmRSZXBlYXRTaGFwZShjdHgsIGltYWdlLCBiYWNrZ3JvdW5kUG9zaXRpb24sIGJvdW5kcywgbGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgYXJncy5wdXNoKFtcImxpbmVcIiwgTWF0aC5yb3VuZChsZWZ0KSwgTWF0aC5yb3VuZCh0b3ApXSk7XG4gICAgICBhcmdzLnB1c2goW1wibGluZVwiLCBNYXRoLnJvdW5kKGxlZnQgKyB3aWR0aCksIE1hdGgucm91bmQodG9wKV0pO1xuICAgICAgYXJncy5wdXNoKFtcImxpbmVcIiwgTWF0aC5yb3VuZChsZWZ0ICsgd2lkdGgpLCBNYXRoLnJvdW5kKGhlaWdodCArIHRvcCldKTtcbiAgICAgIGFyZ3MucHVzaChbXCJsaW5lXCIsIE1hdGgucm91bmQobGVmdCksIE1hdGgucm91bmQoaGVpZ2h0ICsgdG9wKV0pO1xuICAgICAgY3JlYXRlU2hhcGUoY3R4LCBhcmdzKTtcbiAgICAgIGN0eC5zYXZlKCk7XG4gICAgICBjdHguY2xpcCgpO1xuICAgICAgcmVuZGVyQmFja2dyb3VuZFJlcGVhdChjdHgsIGltYWdlLCBiYWNrZ3JvdW5kUG9zaXRpb24sIGJvdW5kcyk7XG4gICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlckJhY2tncm91bmRDb2xvcihjdHgsIGJhY2tncm91bmRCb3VuZHMsIGJnY29sb3IpIHtcbiAgICAgIHJlbmRlclJlY3QoXG4gICAgICAgIGN0eCxcbiAgICAgICAgYmFja2dyb3VuZEJvdW5kcy5sZWZ0LFxuICAgICAgICBiYWNrZ3JvdW5kQm91bmRzLnRvcCxcbiAgICAgICAgYmFja2dyb3VuZEJvdW5kcy53aWR0aCxcbiAgICAgICAgYmFja2dyb3VuZEJvdW5kcy5oZWlnaHQsXG4gICAgICAgIGJnY29sb3JcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyQmFja2dyb3VuZFJlcGVhdGluZyhlbCwgYm91bmRzLCBjdHgsIGltYWdlLCBpbWFnZUluZGV4KSB7XG4gICAgICB2YXIgYmFja2dyb3VuZFNpemUgPSBVdGlsLkJhY2tncm91bmRTaXplKGVsLCBib3VuZHMsIGltYWdlLCBpbWFnZUluZGV4KSxcbiAgICAgICAgYmFja2dyb3VuZFBvc2l0aW9uID0gVXRpbC5CYWNrZ3JvdW5kUG9zaXRpb24oZWwsIGJvdW5kcywgaW1hZ2UsIGltYWdlSW5kZXgsIGJhY2tncm91bmRTaXplKSxcbiAgICAgICAgYmFja2dyb3VuZFJlcGVhdCA9IGdldENTUyhlbCwgXCJiYWNrZ3JvdW5kUmVwZWF0XCIpLnNwbGl0KFwiLFwiKS5tYXAoVXRpbC50cmltVGV4dCk7XG5cbiAgICAgIGltYWdlID0gcmVzaXplSW1hZ2UoaW1hZ2UsIGJhY2tncm91bmRTaXplKTtcblxuICAgICAgYmFja2dyb3VuZFJlcGVhdCA9IGJhY2tncm91bmRSZXBlYXRbaW1hZ2VJbmRleF0gfHwgYmFja2dyb3VuZFJlcGVhdFswXTtcblxuICAgICAgc3dpdGNoIChiYWNrZ3JvdW5kUmVwZWF0KSB7XG4gICAgICAgIGNhc2UgXCJyZXBlYXQteFwiOlxuICAgICAgICAgIGJhY2tncm91bmRSZXBlYXRTaGFwZShjdHgsIGltYWdlLCBiYWNrZ3JvdW5kUG9zaXRpb24sIGJvdW5kcyxcbiAgICAgICAgICAgIGJvdW5kcy5sZWZ0LCBib3VuZHMudG9wICsgYmFja2dyb3VuZFBvc2l0aW9uLnRvcCwgOTk5OTksIGltYWdlLmhlaWdodCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcInJlcGVhdC15XCI6XG4gICAgICAgICAgYmFja2dyb3VuZFJlcGVhdFNoYXBlKGN0eCwgaW1hZ2UsIGJhY2tncm91bmRQb3NpdGlvbiwgYm91bmRzLFxuICAgICAgICAgICAgYm91bmRzLmxlZnQgKyBiYWNrZ3JvdW5kUG9zaXRpb24ubGVmdCwgYm91bmRzLnRvcCwgaW1hZ2Uud2lkdGgsIDk5OTk5KTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwibm8tcmVwZWF0XCI6XG4gICAgICAgICAgYmFja2dyb3VuZFJlcGVhdFNoYXBlKGN0eCwgaW1hZ2UsIGJhY2tncm91bmRQb3NpdGlvbiwgYm91bmRzLFxuICAgICAgICAgICAgYm91bmRzLmxlZnQgKyBiYWNrZ3JvdW5kUG9zaXRpb24ubGVmdCwgYm91bmRzLnRvcCArIGJhY2tncm91bmRQb3NpdGlvbi50b3AsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmVuZGVyQmFja2dyb3VuZFJlcGVhdChjdHgsIGltYWdlLCBiYWNrZ3JvdW5kUG9zaXRpb24sIHtcbiAgICAgICAgICAgIHRvcDogYm91bmRzLnRvcCxcbiAgICAgICAgICAgIGxlZnQ6IGJvdW5kcy5sZWZ0LFxuICAgICAgICAgICAgd2lkdGg6IGltYWdlLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBpbWFnZS5oZWlnaHRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJCYWNrZ3JvdW5kSW1hZ2UoZWxlbWVudCwgYm91bmRzLCBjdHgpIHtcbiAgICAgIHZhciBiYWNrZ3JvdW5kSW1hZ2UgPSBnZXRDU1MoZWxlbWVudCwgXCJiYWNrZ3JvdW5kSW1hZ2VcIiksXG4gICAgICAgIGJhY2tncm91bmRJbWFnZXMgPSBVdGlsLnBhcnNlQmFja2dyb3VuZEltYWdlKGJhY2tncm91bmRJbWFnZSksXG4gICAgICAgIGltYWdlLFxuICAgICAgICBpbWFnZUluZGV4ID0gYmFja2dyb3VuZEltYWdlcy5sZW5ndGg7XG5cbiAgICAgIHdoaWxlIChpbWFnZUluZGV4LS0pIHtcbiAgICAgICAgYmFja2dyb3VuZEltYWdlID0gYmFja2dyb3VuZEltYWdlc1tpbWFnZUluZGV4XTtcblxuICAgICAgICBpZiAoIWJhY2tncm91bmRJbWFnZS5hcmdzIHx8IGJhY2tncm91bmRJbWFnZS5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGtleSA9IGJhY2tncm91bmRJbWFnZS5tZXRob2QgPT09ICd1cmwnID9cbiAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2UuYXJnc1swXSA6XG4gICAgICAgICAgYmFja2dyb3VuZEltYWdlLnZhbHVlO1xuXG4gICAgICAgIGltYWdlID0gbG9hZEltYWdlKGtleSk7XG5cbiAgICAgICAgLy8gVE9ETyBhZGQgc3VwcG9ydCBmb3IgYmFja2dyb3VuZC1vcmlnaW5cbiAgICAgICAgaWYgKGltYWdlKSB7XG4gICAgICAgICAgcmVuZGVyQmFja2dyb3VuZFJlcGVhdGluZyhlbGVtZW50LCBib3VuZHMsIGN0eCwgaW1hZ2UsIGltYWdlSW5kZXgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IEVycm9yIGxvYWRpbmcgYmFja2dyb3VuZDpcIiwgYmFja2dyb3VuZEltYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2l6ZUltYWdlKGltYWdlLCBib3VuZHMpIHtcblxuICAgICAgaWYgKGltYWdlLndpZHRoID09PSBib3VuZHMud2lkdGggJiYgaW1hZ2UuaGVpZ2h0ID09PSBib3VuZHMuaGVpZ2h0KVxuICAgICAgICByZXR1cm4gaW1hZ2U7XG5cbiAgICAgIHZhciBjdHgsIGNhbnZhcyA9IGRvYy5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgIGNhbnZhcy53aWR0aCA9IGJvdW5kcy53aWR0aDtcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBib3VuZHMuaGVpZ2h0O1xuXG4gICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgZHJhd0ltYWdlKGN0eCwgaW1hZ2UsIDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQsIDAsIDAsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCk7XG4gICAgICByZXR1cm4gY2FudmFzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldE9wYWNpdHkoY3R4LCBlbGVtZW50LCBwYXJlbnRTdGFjaykge1xuICAgICAgcmV0dXJuIGN0eC5zZXRWYXJpYWJsZShcImdsb2JhbEFscGhhXCIsIGdldENTUyhlbGVtZW50LCBcIm9wYWNpdHlcIikgKiAoKHBhcmVudFN0YWNrKSA/IHBhcmVudFN0YWNrLm9wYWNpdHkgOiAxKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlUHgoc3RyKSB7XG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UoXCJweFwiLCBcIlwiKTtcbiAgICB9XG5cbiAgICB2YXIgdHJhbnNmb3JtUmVnRXhwID0gLyhtYXRyaXgpXFwoKC4rKVxcKS87XG5cbiAgICBmdW5jdGlvbiBnZXRUcmFuc2Zvcm0oZWxlbWVudCwgcGFyZW50U3RhY2spIHtcbiAgICAgIHZhciB0cmFuc2Zvcm0gPSBnZXRDU1MoZWxlbWVudCwgXCJ0cmFuc2Zvcm1cIikgfHwgZ2V0Q1NTKGVsZW1lbnQsIFwiLXdlYmtpdC10cmFuc2Zvcm1cIikgfHwgZ2V0Q1NTKGVsZW1lbnQsIFwiLW1vei10cmFuc2Zvcm1cIikgfHwgZ2V0Q1NTKGVsZW1lbnQsIFwiLW1zLXRyYW5zZm9ybVwiKSB8fCBnZXRDU1MoZWxlbWVudCwgXCItby10cmFuc2Zvcm1cIik7XG4gICAgICB2YXIgdHJhbnNmb3JtT3JpZ2luID0gZ2V0Q1NTKGVsZW1lbnQsIFwidHJhbnNmb3JtLW9yaWdpblwiKSB8fCBnZXRDU1MoZWxlbWVudCwgXCItd2Via2l0LXRyYW5zZm9ybS1vcmlnaW5cIikgfHwgZ2V0Q1NTKGVsZW1lbnQsIFwiLW1vei10cmFuc2Zvcm0tb3JpZ2luXCIpIHx8IGdldENTUyhlbGVtZW50LCBcIi1tcy10cmFuc2Zvcm0tb3JpZ2luXCIpIHx8IGdldENTUyhlbGVtZW50LCBcIi1vLXRyYW5zZm9ybS1vcmlnaW5cIikgfHwgXCIwcHggMHB4XCI7XG5cbiAgICAgIHRyYW5zZm9ybU9yaWdpbiA9IHRyYW5zZm9ybU9yaWdpbi5zcGxpdChcIiBcIikubWFwKHJlbW92ZVB4KS5tYXAoVXRpbC5hc0Zsb2F0KTtcblxuICAgICAgdmFyIG1hdHJpeDtcbiAgICAgIGlmICh0cmFuc2Zvcm0gJiYgdHJhbnNmb3JtICE9PSBcIm5vbmVcIikge1xuICAgICAgICB2YXIgbWF0Y2ggPSB0cmFuc2Zvcm0ubWF0Y2godHJhbnNmb3JtUmVnRXhwKTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgc3dpdGNoIChtYXRjaFsxXSkge1xuICAgICAgICAgICAgY2FzZSBcIm1hdHJpeFwiOlxuICAgICAgICAgICAgICBtYXRyaXggPSBtYXRjaFsyXS5zcGxpdChcIixcIikubWFwKFV0aWwudHJpbVRleHQpLm1hcChVdGlsLmFzRmxvYXQpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3JpZ2luOiB0cmFuc2Zvcm1PcmlnaW4sXG4gICAgICAgIG1hdHJpeDogbWF0cml4XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVN0YWNrKGVsZW1lbnQsIHBhcmVudFN0YWNrLCBib3VuZHMsIHRyYW5zZm9ybSkge1xuICAgICAgdmFyIGN0eCA9IGgyY1JlbmRlckNvbnRleHQoKCFwYXJlbnRTdGFjaykgPyBkb2N1bWVudFdpZHRoKCkgOiBib3VuZHMud2lkdGgsICghcGFyZW50U3RhY2spID8gZG9jdW1lbnRIZWlnaHQoKSA6IGJvdW5kcy5oZWlnaHQpLFxuICAgICAgICBzdGFjayA9IHtcbiAgICAgICAgICBjdHg6IGN0eCxcbiAgICAgICAgICBvcGFjaXR5OiBzZXRPcGFjaXR5KGN0eCwgZWxlbWVudCwgcGFyZW50U3RhY2spLFxuICAgICAgICAgIGNzc1Bvc2l0aW9uOiBnZXRDU1MoZWxlbWVudCwgXCJwb3NpdGlvblwiKSxcbiAgICAgICAgICBib3JkZXJzOiBnZXRCb3JkZXJEYXRhKGVsZW1lbnQpLFxuICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNmb3JtLFxuICAgICAgICAgIGNsaXA6IChwYXJlbnRTdGFjayAmJiBwYXJlbnRTdGFjay5jbGlwKSA/IFV0aWwuRXh0ZW5kKHt9LCBwYXJlbnRTdGFjay5jbGlwKSA6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgc2V0WihlbGVtZW50LCBzdGFjaywgcGFyZW50U3RhY2spO1xuXG4gICAgICAvLyBUT0RPIGNvcnJlY3Qgb3ZlcmZsb3cgZm9yIGFic29sdXRlIGNvbnRlbnQgcmVzaWRpbmcgdW5kZXIgYSBzdGF0aWMgcG9zaXRpb25cbiAgICAgIGlmIChvcHRpb25zLnVzZU92ZXJmbG93ID09PSB0cnVlICYmIC8oaGlkZGVufHNjcm9sbHxhdXRvKS8udGVzdChnZXRDU1MoZWxlbWVudCwgXCJvdmVyZmxvd1wiKSkgPT09IHRydWUgJiYgLyhCT0RZKS9pLnRlc3QoZWxlbWVudC5ub2RlTmFtZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIHN0YWNrLmNsaXAgPSAoc3RhY2suY2xpcCkgPyBjbGlwQm91bmRzKHN0YWNrLmNsaXAsIGJvdW5kcykgOiBib3VuZHM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGFjaztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCYWNrZ3JvdW5kQm91bmRzKGJvcmRlcnMsIGJvdW5kcywgY2xpcCkge1xuICAgICAgdmFyIGJhY2tncm91bmRCb3VuZHMgPSB7XG4gICAgICAgIGxlZnQ6IGJvdW5kcy5sZWZ0ICsgYm9yZGVyc1szXS53aWR0aCxcbiAgICAgICAgdG9wOiBib3VuZHMudG9wICsgYm9yZGVyc1swXS53aWR0aCxcbiAgICAgICAgd2lkdGg6IGJvdW5kcy53aWR0aCAtIChib3JkZXJzWzFdLndpZHRoICsgYm9yZGVyc1szXS53aWR0aCksXG4gICAgICAgIGhlaWdodDogYm91bmRzLmhlaWdodCAtIChib3JkZXJzWzBdLndpZHRoICsgYm9yZGVyc1syXS53aWR0aClcbiAgICAgIH07XG5cbiAgICAgIGlmIChjbGlwKSB7XG4gICAgICAgIGJhY2tncm91bmRCb3VuZHMgPSBjbGlwQm91bmRzKGJhY2tncm91bmRCb3VuZHMsIGNsaXApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYmFja2dyb3VuZEJvdW5kcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCb3VuZHMoZWxlbWVudCwgdHJhbnNmb3JtKSB7XG4gICAgICB2YXIgYm91bmRzID0gKHRyYW5zZm9ybS5tYXRyaXgpID8gVXRpbC5PZmZzZXRCb3VuZHMoZWxlbWVudCkgOiBVdGlsLkJvdW5kcyhlbGVtZW50KTtcbiAgICAgIHRyYW5zZm9ybS5vcmlnaW5bMF0gKz0gYm91bmRzLmxlZnQ7XG4gICAgICB0cmFuc2Zvcm0ub3JpZ2luWzFdICs9IGJvdW5kcy50b3A7XG4gICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlckVsZW1lbnQoZWxlbWVudCwgcGFyZW50U3RhY2ssIHBzZXVkb0VsZW1lbnQsIGlnbm9yZUJhY2tncm91bmQpIHtcbiAgICAgIHZhciB0cmFuc2Zvcm0gPSBnZXRUcmFuc2Zvcm0oZWxlbWVudCwgcGFyZW50U3RhY2spLFxuICAgICAgICBib3VuZHMgPSBnZXRCb3VuZHMoZWxlbWVudCwgdHJhbnNmb3JtKSxcbiAgICAgICAgaW1hZ2UsXG4gICAgICAgIHN0YWNrID0gY3JlYXRlU3RhY2soZWxlbWVudCwgcGFyZW50U3RhY2ssIGJvdW5kcywgdHJhbnNmb3JtKSxcbiAgICAgICAgYm9yZGVycyA9IHN0YWNrLmJvcmRlcnMsXG4gICAgICAgIGN0eCA9IHN0YWNrLmN0eCxcbiAgICAgICAgYmFja2dyb3VuZEJvdW5kcyA9IGdldEJhY2tncm91bmRCb3VuZHMoYm9yZGVycywgYm91bmRzLCBzdGFjay5jbGlwKSxcbiAgICAgICAgYm9yZGVyRGF0YSA9IHBhcnNlQm9yZGVycyhlbGVtZW50LCBib3VuZHMsIGJvcmRlcnMpLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3IgPSAoaWdub3JlRWxlbWVudHNSZWdFeHAudGVzdChlbGVtZW50Lm5vZGVOYW1lKSkgPyBcIiNlZmVmZWZcIiA6IGdldENTUyhlbGVtZW50LCBcImJhY2tncm91bmRDb2xvclwiKTtcblxuXG4gICAgICBjcmVhdGVTaGFwZShjdHgsIGJvcmRlckRhdGEuY2xpcCk7XG5cbiAgICAgIGN0eC5zYXZlKCk7XG4gICAgICBjdHguY2xpcCgpO1xuXG4gICAgICBpZiAoYmFja2dyb3VuZEJvdW5kcy5oZWlnaHQgPiAwICYmIGJhY2tncm91bmRCb3VuZHMud2lkdGggPiAwICYmICFpZ25vcmVCYWNrZ3JvdW5kKSB7XG4gICAgICAgIHJlbmRlckJhY2tncm91bmRDb2xvcihjdHgsIGJvdW5kcywgYmFja2dyb3VuZENvbG9yKTtcbiAgICAgICAgcmVuZGVyQmFja2dyb3VuZEltYWdlKGVsZW1lbnQsIGJhY2tncm91bmRCb3VuZHMsIGN0eCk7XG4gICAgICB9IGVsc2UgaWYgKGlnbm9yZUJhY2tncm91bmQpIHtcbiAgICAgICAgc3RhY2suYmFja2dyb3VuZENvbG9yID0gYmFja2dyb3VuZENvbG9yO1xuICAgICAgfVxuXG4gICAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgICBib3JkZXJEYXRhLmJvcmRlcnMuZm9yRWFjaChmdW5jdGlvbiAoYm9yZGVyKSB7XG4gICAgICAgIHJlbmRlckJvcmRlcnMoY3R4LCBib3JkZXIuYXJncywgYm9yZGVyLmNvbG9yKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXBzZXVkb0VsZW1lbnQpIHtcbiAgICAgICAgaW5qZWN0UHNldWRvRWxlbWVudHMoZWxlbWVudCwgc3RhY2spO1xuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKGVsZW1lbnQubm9kZU5hbWUpIHtcbiAgICAgICAgY2FzZSBcIklNR1wiOlxuICAgICAgICAgIGlmICgoaW1hZ2UgPSBsb2FkSW1hZ2UoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpKSkpIHtcbiAgICAgICAgICAgIHJlbmRlckltYWdlKGN0eCwgZWxlbWVudCwgaW1hZ2UsIGJvdW5kcywgYm9yZGVycyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IEVycm9yIGxvYWRpbmcgPGltZz46XCIgKyBlbGVtZW50LmdldEF0dHJpYnV0ZSgnc3JjJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIklOUFVUXCI6XG4gICAgICAgICAgLy8gVE9ETyBhZGQgYWxsIHJlbGV2YW50IHR5cGUncywgaS5lLiBIVE1MNSBuZXcgc3R1ZmZcbiAgICAgICAgICAvLyB0b2RvIGFkZCBzdXBwb3J0IGZvciBwbGFjZWhvbGRlciBhdHRyaWJ1dGUgZm9yIGJyb3dzZXJzIHdoaWNoIHN1cHBvcnQgaXRcbiAgICAgICAgICBpZiAoL14odGV4dHx1cmx8ZW1haWx8c3VibWl0fGJ1dHRvbnxyZXNldCkkLy50ZXN0KGVsZW1lbnQudHlwZSkgJiYgKGVsZW1lbnQudmFsdWUgfHwgZWxlbWVudC5wbGFjZWhvbGRlciB8fCBcIlwiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZW5kZXJGb3JtVmFsdWUoZWxlbWVudCwgYm91bmRzLCBzdGFjayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiVEVYVEFSRUFcIjpcbiAgICAgICAgICBpZiAoKGVsZW1lbnQudmFsdWUgfHwgZWxlbWVudC5wbGFjZWhvbGRlciB8fCBcIlwiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZW5kZXJGb3JtVmFsdWUoZWxlbWVudCwgYm91bmRzLCBzdGFjayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiU0VMRUNUXCI6XG4gICAgICAgICAgaWYgKChlbGVtZW50Lm9wdGlvbnMgfHwgZWxlbWVudC5wbGFjZWhvbGRlciB8fCBcIlwiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZW5kZXJGb3JtVmFsdWUoZWxlbWVudCwgYm91bmRzLCBzdGFjayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiTElcIjpcbiAgICAgICAgICByZW5kZXJMaXN0SXRlbShlbGVtZW50LCBzdGFjaywgYmFja2dyb3VuZEJvdW5kcyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJDQU5WQVNcIjpcbiAgICAgICAgICByZW5kZXJJbWFnZShjdHgsIGVsZW1lbnQsIGVsZW1lbnQsIGJvdW5kcywgYm9yZGVycyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGFjaztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0VsZW1lbnRWaXNpYmxlKGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiAoZ2V0Q1NTKGVsZW1lbnQsICdkaXNwbGF5JykgIT09IFwibm9uZVwiICYmIGdldENTUyhlbGVtZW50LCAndmlzaWJpbGl0eScpICE9PSBcImhpZGRlblwiICYmICFlbGVtZW50Lmhhc0F0dHJpYnV0ZShcImRhdGEtaHRtbDJjYW52YXMtaWdub3JlXCIpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUVsZW1lbnQoZWxlbWVudCwgc3RhY2ssIHBzZXVkb0VsZW1lbnQpIHtcbiAgICAgIGlmIChpc0VsZW1lbnRWaXNpYmxlKGVsZW1lbnQpKSB7XG4gICAgICAgIHN0YWNrID0gcmVuZGVyRWxlbWVudChlbGVtZW50LCBzdGFjaywgcHNldWRvRWxlbWVudCwgZmFsc2UpIHx8IHN0YWNrO1xuICAgICAgICBpZiAoIWlnbm9yZUVsZW1lbnRzUmVnRXhwLnRlc3QoZWxlbWVudC5ub2RlTmFtZSkpIHtcbiAgICAgICAgICBwYXJzZUNoaWxkcmVuKGVsZW1lbnQsIHN0YWNrLCBwc2V1ZG9FbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlQ2hpbGRyZW4oZWxlbWVudCwgc3RhY2ssIHBzZXVkb0VsZW1lbnQpIHtcbiAgICAgIFV0aWwuQ2hpbGRyZW4oZWxlbWVudCkuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gbm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgICBwYXJzZUVsZW1lbnQobm9kZSwgc3RhY2ssIHBzZXVkb0VsZW1lbnQpO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IG5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICAgICAgcmVuZGVyVGV4dChlbGVtZW50LCBub2RlLCBzdGFjayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICAgIHZhciBiYWNrZ3JvdW5kID0gb3B0aW9uc1tcImJhY2tncm91bmQtY29sb3JcIl07XG4gICAgICBpZihiYWNrZ3JvdW5kID09IFwicmdiYSgwLCAwLCAwLCAwKVwiIHx8wqBiYWNrZ3JvdW5kID09PSB1bmRlZmluZWQpXG4gICAgICAgIGJhY2tncm91bmQgPSBvcHRpb25zW1wiYmFja2dyb3VuZENvbG9yXCJdO1xuICAgICAgaWYoYmFja2dyb3VuZCA9PSBcInJnYmEoMCwgMCwgMCwgMClcIiB8fMKgYmFja2dyb3VuZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBiYWNrZ3JvdW5kID0gb3B0aW9uc1tcImJhY2tncm91bmRcIl07XG4gICAgICBpZihiYWNrZ3JvdW5kID09IFwicmdiYSgwLCAwLCAwLCAwKVwiIHx8wqBiYWNrZ3JvdW5kID09PSB1bmRlZmluZWQpXG4gICAgICAgIGJhY2tncm91bmQgPSBnZXRDU1Mob3B0aW9uc1tcImNvbnRhaW5lclwiXSBpbnN0YW5jZW9mIEVsZW1lbnQgPyBvcHRpb25zW1wiY29udGFpbmVyXCJdIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcHRpb25zW1wiY29udGFpbmVyXCJdKSwgXCJiYWNrZ3JvdW5kQ29sb3JcIik7XG4gICAgICBpZihiYWNrZ3JvdW5kID09IFwicmdiYSgwLCAwLCAwLCAwKVwiIHx8wqBiYWNrZ3JvdW5kID09PSB1bmRlZmluZWQpXG4gICAgICAgIGJhY2tncm91bmQgPSBnZXRDU1MoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBcImJhY2tncm91bmRDb2xvclwiKTtcbiAgICAgIGlmKGJhY2tncm91bmQgPT0gXCJyZ2JhKDAsIDAsIDAsIDApXCIgfHzCoGJhY2tncm91bmQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgYmFja2dyb3VuZCA9IGdldENTUyhkb2N1bWVudC5ib2R5LCBcImJhY2tncm91bmRDb2xvclwiKTtcblxuICAgICAgdmFyIHRyYW5zcGFyZW50QmFja2dyb3VuZCA9IChVdGlsLmlzVHJhbnNwYXJlbnQoYmFja2dyb3VuZCkgJiYgZWxlbWVudCA9PT0gZG9jdW1lbnQuYm9keSksXG4gICAgICAgICAgc3RhY2sgPSByZW5kZXJFbGVtZW50KGVsZW1lbnQsIG51bGwsIGZhbHNlLCB0cmFuc3BhcmVudEJhY2tncm91bmQpO1xuXG4gICAgICBwYXJzZUNoaWxkcmVuKGVsZW1lbnQsIHN0YWNrKTtcblxuICAgICAgaWYgKHRyYW5zcGFyZW50QmFja2dyb3VuZCkge1xuICAgICAgICBiYWNrZ3JvdW5kID0gc3RhY2suYmFja2dyb3VuZENvbG9yO1xuICAgICAgfVxuXG4gICAgICBib2R5LnJlbW92ZUNoaWxkKGhpZGVQc2V1ZG9FbGVtZW50cyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFja2dyb3VuZCxcbiAgICAgICAgc3RhY2s6IHN0YWNrXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBpbml0KCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gaDJjekNvbnRleHQoemluZGV4KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHppbmRleDogemluZGV4LFxuICAgICAgY2hpbGRyZW46IFtdXG4gICAgfTtcbiAgfVxuXG4gIF9odG1sMmNhbnZhcy5QcmVsb2FkID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblxuICAgIHZhciBpbWFnZXMgPSB7XG4gICAgICAgIG51bUxvYWRlZDogMCwgLy8gYWxzbyBmYWlsZWQgYXJlIGNvdW50ZWQgaGVyZVxuICAgICAgICBudW1GYWlsZWQ6IDAsXG4gICAgICAgIG51bVRvdGFsOiAwLFxuICAgICAgICBjbGVhbnVwRG9uZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBwYWdlT3JpZ2luLFxuICAgICAgVXRpbCA9IF9odG1sMmNhbnZhcy5VdGlsLFxuICAgICAgbWV0aG9kcyxcbiAgICAgIGksXG4gICAgICBjb3VudCA9IDAsXG4gICAgICBlbGVtZW50ID0gb3B0aW9ucy5lbGVtZW50c1swXSB8fCBkb2N1bWVudC5ib2R5LFxuICAgICAgZG9jID0gZWxlbWVudC5vd25lckRvY3VtZW50LFxuICAgICAgZG9tSW1hZ2VzID0gZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJyksIC8vIEZldGNoIGltYWdlcyBvZiB0aGUgcHJlc2VudCBlbGVtZW50IG9ubHlcbiAgICAgIGltZ0xlbiA9IGRvbUltYWdlcy5sZW5ndGgsXG4gICAgICBsaW5rID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJhXCIpLFxuICAgICAgc3VwcG9ydENPUlMgPSAoZnVuY3Rpb24gKGltZykge1xuICAgICAgICByZXR1cm4gKGltZy5jcm9zc09yaWdpbiAhPT0gdW5kZWZpbmVkKTtcbiAgICAgIH0pKG5ldyBJbWFnZSgpKSxcbiAgICAgIHRpbWVvdXRUaW1lcjtcblxuICAgIGxpbmsuaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgIHBhZ2VPcmlnaW4gPSBsaW5rLnByb3RvY29sICsgbGluay5ob3N0O1xuXG4gICAgZnVuY3Rpb24gaXNTYW1lT3JpZ2luKHVybCkge1xuICAgICAgbGluay5ocmVmID0gdXJsO1xuICAgICAgbGluay5ocmVmID0gbGluay5ocmVmOyAvLyBZRVMsIEJFTElFVkUgSVQgT1IgTk9ULCB0aGF0IGlzIHJlcXVpcmVkIGZvciBJRTkgLSBodHRwOi8vanNmaWRkbGUubmV0L25pa2xhc3ZoLzJlNDhiL1xuICAgICAgdmFyIG9yaWdpbiA9IGxpbmsucHJvdG9jb2wgKyBsaW5rLmhvc3Q7XG4gICAgICByZXR1cm4gKG9yaWdpbiA9PT0gcGFnZU9yaWdpbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBzdGFydDogaW1hZ2VzOiBcIiArIGltYWdlcy5udW1Mb2FkZWQgKyBcIiAvIFwiICsgaW1hZ2VzLm51bVRvdGFsICsgXCIgKGZhaWxlZDogXCIgKyBpbWFnZXMubnVtRmFpbGVkICsgXCIpXCIpO1xuICAgICAgaWYgKCFpbWFnZXMuZmlyc3RSdW4gJiYgaW1hZ2VzLm51bUxvYWRlZCA+PSBpbWFnZXMubnVtVG90YWwpIHtcbiAgICAgICAgVXRpbC5sb2coXCJGaW5pc2hlZCBsb2FkaW5nIGltYWdlczogIyBcIiArIGltYWdlcy5udW1Ub3RhbCArIFwiIChmYWlsZWQ6IFwiICsgaW1hZ2VzLm51bUZhaWxlZCArIFwiKVwiKTtcblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuY29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIG9wdGlvbnMuY29tcGxldGUoaW1hZ2VzKTtcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETyBtb2RpZnkgcHJveHkgdG8gc2VydmUgaW1hZ2VzIHdpdGggQ09SUyBlbmFibGVkLCB3aGVyZSBhdmFpbGFibGVcbiAgICBmdW5jdGlvbiBwcm94eUdldEltYWdlKHVybCwgaW1nLCBpbWFnZU9iaikge1xuICAgICAgdmFyIGNhbGxiYWNrX25hbWUsXG4gICAgICAgIHNjcmlwdFVybCA9IG9wdGlvbnMucHJveHksXG4gICAgICAgIHNjcmlwdDtcblxuICAgICAgbGluay5ocmVmID0gdXJsO1xuICAgICAgdXJsID0gbGluay5ocmVmOyAvLyB3b3JrIGFyb3VuZCBmb3IgcGFnZXMgd2l0aCBiYXNlIGhyZWY9XCJcIiBzZXQgLSBXQVJOSU5HOiB0aGlzIG1heSBjaGFuZ2UgdGhlIHVybFxuXG4gICAgICBjYWxsYmFja19uYW1lID0gJ2h0bWwyY2FudmFzXycgKyAoY291bnQrKyk7XG4gICAgICBpbWFnZU9iai5jYWxsYmFja25hbWUgPSBjYWxsYmFja19uYW1lO1xuXG4gICAgICBpZiAoc2NyaXB0VXJsLmluZGV4T2YoXCI/XCIpID4gLTEpIHtcbiAgICAgICAgc2NyaXB0VXJsICs9IFwiJlwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NyaXB0VXJsICs9IFwiP1wiO1xuICAgICAgfVxuICAgICAgc2NyaXB0VXJsICs9ICd1cmw9JyArIGVuY29kZVVSSUNvbXBvbmVudCh1cmwpICsgJyZjYWxsYmFjaz0nICsgY2FsbGJhY2tfbmFtZTtcbiAgICAgIHNjcmlwdCA9IGRvYy5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuXG4gICAgICB3aW5kb3dbY2FsbGJhY2tfbmFtZV0gPSBmdW5jdGlvbiAoYSkge1xuICAgICAgICBpZiAoYS5zdWJzdHJpbmcoMCwgNikgPT09IFwiZXJyb3I6XCIpIHtcbiAgICAgICAgICBpbWFnZU9iai5zdWNjZWVkZWQgPSBmYWxzZTtcbiAgICAgICAgICBpbWFnZXMubnVtTG9hZGVkKys7XG4gICAgICAgICAgaW1hZ2VzLm51bUZhaWxlZCsrO1xuICAgICAgICAgIHN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0SW1hZ2VMb2FkSGFuZGxlcnMoaW1nLCBpbWFnZU9iaik7XG4gICAgICAgICAgaW1nLnNyYyA9IGE7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93W2NhbGxiYWNrX25hbWVdID0gdW5kZWZpbmVkOyAvLyB0byB3b3JrIHdpdGggSUU8OSAgLy8gTk9URTogdGhhdCB0aGUgdW5kZWZpbmVkIGNhbGxiYWNrIHByb3BlcnR5LW5hbWUgc3RpbGwgZXhpc3RzIG9uIHRoZSB3aW5kb3cgb2JqZWN0IChmb3IgSUU8OSlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBkZWxldGUgd2luZG93W2NhbGxiYWNrX25hbWVdOyAvLyBmb3IgYWxsIGJyb3dzZXIgdGhhdCBzdXBwb3J0IHRoaXNcbiAgICAgICAgfSBjYXRjaCAoZXgpIHt9XG4gICAgICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgICAgIHNjcmlwdCA9IG51bGw7XG4gICAgICAgIGRlbGV0ZSBpbWFnZU9iai5zY3JpcHQ7XG4gICAgICAgIGRlbGV0ZSBpbWFnZU9iai5jYWxsYmFja25hbWU7XG4gICAgICB9O1xuXG4gICAgICBzY3JpcHQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcInRleHQvamF2YXNjcmlwdFwiKTtcbiAgICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgc2NyaXB0VXJsKTtcbiAgICAgIGltYWdlT2JqLnNjcmlwdCA9IHNjcmlwdDtcbiAgICAgIHdpbmRvdy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkUHNldWRvRWxlbWVudChlbGVtZW50LCB0eXBlKSB7XG4gICAgICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50LCB0eXBlKSxcbiAgICAgICAgY29udGVudCA9IHN0eWxlLmNvbnRlbnQ7XG4gICAgICBpZiAoY29udGVudC5zdWJzdHIoMCwgMykgPT09ICd1cmwnKSB7XG4gICAgICAgIG1ldGhvZHMubG9hZEltYWdlKF9odG1sMmNhbnZhcy5VdGlsLnBhcnNlQmFja2dyb3VuZEltYWdlKGNvbnRlbnQpWzBdLmFyZ3NbMF0pO1xuICAgICAgfVxuICAgICAgbG9hZEJhY2tncm91bmRJbWFnZXMoc3R5bGUuYmFja2dyb3VuZEltYWdlLCBlbGVtZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkUHNldWRvRWxlbWVudEltYWdlcyhlbGVtZW50KSB7XG4gICAgICBsb2FkUHNldWRvRWxlbWVudChlbGVtZW50LCBcIjpiZWZvcmVcIik7XG4gICAgICBsb2FkUHNldWRvRWxlbWVudChlbGVtZW50LCBcIjphZnRlclwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkR3JhZGllbnRJbWFnZShiYWNrZ3JvdW5kSW1hZ2UsIGJvdW5kcykge1xuICAgICAgdmFyIGltZyA9IF9odG1sMmNhbnZhcy5HZW5lcmF0ZS5HcmFkaWVudChiYWNrZ3JvdW5kSW1hZ2UsIGJvdW5kcyk7XG5cbiAgICAgIGlmIChpbWcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpbWFnZXNbYmFja2dyb3VuZEltYWdlXSA9IHtcbiAgICAgICAgICBpbWc6IGltZyxcbiAgICAgICAgICBzdWNjZWVkZWQ6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgaW1hZ2VzLm51bVRvdGFsKys7XG4gICAgICAgIGltYWdlcy5udW1Mb2FkZWQrKztcbiAgICAgICAgc3RhcnQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnZhbGlkQmFja2dyb3VuZHMoYmFja2dyb3VuZF9pbWFnZSkge1xuICAgICAgcmV0dXJuIChiYWNrZ3JvdW5kX2ltYWdlICYmIGJhY2tncm91bmRfaW1hZ2UubWV0aG9kICYmIGJhY2tncm91bmRfaW1hZ2UuYXJncyAmJiBiYWNrZ3JvdW5kX2ltYWdlLmFyZ3MubGVuZ3RoID4gMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZEJhY2tncm91bmRJbWFnZXMoYmFja2dyb3VuZF9pbWFnZSwgZWwpIHtcbiAgICAgIHZhciBib3VuZHM7XG5cbiAgICAgIF9odG1sMmNhbnZhcy5VdGlsLnBhcnNlQmFja2dyb3VuZEltYWdlKGJhY2tncm91bmRfaW1hZ2UpLmZpbHRlcihpbnZhbGlkQmFja2dyb3VuZHMpLmZvckVhY2goZnVuY3Rpb24gKGJhY2tncm91bmRfaW1hZ2UpIHtcbiAgICAgICAgaWYgKGJhY2tncm91bmRfaW1hZ2UubWV0aG9kID09PSAndXJsJykge1xuICAgICAgICAgIG1ldGhvZHMubG9hZEltYWdlKGJhY2tncm91bmRfaW1hZ2UuYXJnc1swXSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmFja2dyb3VuZF9pbWFnZS5tZXRob2QubWF0Y2goL1xcLT9ncmFkaWVudCQvKSkge1xuICAgICAgICAgIGlmIChib3VuZHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYm91bmRzID0gX2h0bWwyY2FudmFzLlV0aWwuQm91bmRzKGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbG9hZEdyYWRpZW50SW1hZ2UoYmFja2dyb3VuZF9pbWFnZS52YWx1ZSwgYm91bmRzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SW1hZ2VzKGVsKSB7XG4gICAgICB2YXIgZWxOb2RlVHlwZSA9IGZhbHNlO1xuXG4gICAgICAvLyBGaXJlZm94IGZhaWxzIHdpdGggcGVybWlzc2lvbiBkZW5pZWQgb24gcGFnZXMgd2l0aCBpZnJhbWVzXG4gICAgICB0cnkge1xuICAgICAgICBVdGlsLkNoaWxkcmVuKGVsKS5mb3JFYWNoKGdldEltYWdlcyk7XG4gICAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgICB0cnkge1xuICAgICAgICBlbE5vZGVUeXBlID0gZWwubm9kZVR5cGU7XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBlbE5vZGVUeXBlID0gZmFsc2U7XG4gICAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IGZhaWxlZCB0byBhY2Nlc3Mgc29tZSBlbGVtZW50J3Mgbm9kZVR5cGUgLSBFeGNlcHRpb246IFwiICsgZXgubWVzc2FnZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlbE5vZGVUeXBlID09PSAxIHx8IGVsTm9kZVR5cGUgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIGxvYWRQc2V1ZG9FbGVtZW50SW1hZ2VzKGVsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsb2FkQmFja2dyb3VuZEltYWdlcyhVdGlsLmdldENTUyhlbCwgJ2JhY2tncm91bmRJbWFnZScpLCBlbCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBmYWlsZWQgdG8gZ2V0IGJhY2tncm91bmQtaW1hZ2UgLSBFeGNlcHRpb246IFwiICsgZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkQmFja2dyb3VuZEltYWdlcyhlbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0SW1hZ2VMb2FkSGFuZGxlcnMoaW1nLCBpbWFnZU9iaikge1xuXG4gICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpbWFnZU9iai50aW1lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQ09SUyBzdWNjZWVkZWRcbiAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGltYWdlT2JqLnRpbWVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGltYWdlcy5udW1Mb2FkZWQrKztcbiAgICAgICAgaW1hZ2VPYmouc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSBpbWcub25sb2FkID0gbnVsbDtcbiAgICAgICAgc3RhcnQoKTtcbiAgICAgIH07XG5cbiAgICAgIGltZy5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChpbWcuY3Jvc3NPcmlnaW4gPT09IFwiYW5vbnltb3VzXCIpIHtcbiAgICAgICAgICAvLyBDT1JTIGZhaWxlZFxuICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaW1hZ2VPYmoudGltZXIpO1xuXG4gICAgICAgICAgLy8gbGV0J3MgdHJ5IHdpdGggcHJveHkgaW5zdGVhZFxuICAgICAgICAgIGlmIChvcHRpb25zLnByb3h5KSB7XG4gICAgICAgICAgICB2YXIgc3JjID0gaW1nLnNyYztcbiAgICAgICAgICAgIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1hZ2VPYmouaW1nID0gaW1nO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHNyYztcblxuICAgICAgICAgICAgcHJveHlHZXRJbWFnZShpbWcuc3JjLCBpbWcsIGltYWdlT2JqKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpbWFnZXMubnVtTG9hZGVkKys7XG4gICAgICAgIGltYWdlcy5udW1GYWlsZWQrKztcbiAgICAgICAgaW1hZ2VPYmouc3VjY2VlZGVkID0gZmFsc2U7XG4gICAgICAgIGltZy5vbmVycm9yID0gaW1nLm9ubG9hZCA9IG51bGw7XG5cbiAgICAgICAgc3RhcnQoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgbWV0aG9kcyA9IHtcbiAgICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKHNyYykge1xuXG4gICAgICAgIHZhciBpbWcsIGltYWdlT2JqO1xuICAgICAgICBpZiAoc3JjICYmIGltYWdlc1tzcmNdID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpZiAoc3JjLm1hdGNoKC9kYXRhOmltYWdlXFwvLio7YmFzZTY0LC9pKSkge1xuICAgICAgICAgICAgICBpbWcuc3JjID0gc3JjLnJlcGxhY2UoL3VybFxcKFsnXCJdezAsfXxbJ1wiXXswLH1cXCkkL2lnLCAnJyk7XG4gICAgICAgICAgICAgIGltYWdlT2JqID0gaW1hZ2VzW3NyY10gPSB7XG4gICAgICAgICAgICAgICAgaW1nOiBpbWdcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgaW1hZ2VzLm51bVRvdGFsKys7XG4gICAgICAgICAgICAgIHNldEltYWdlTG9hZEhhbmRsZXJzKGltZywgaW1hZ2VPYmopO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1NhbWVPcmlnaW4oc3JjKSB8fCBvcHRpb25zLmFsbG93VGFpbnQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgaW1hZ2VPYmogPSBpbWFnZXNbc3JjXSA9IHtcbiAgICAgICAgICAgICAgICBpbWc6IGltZ1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBpbWFnZXMubnVtVG90YWwrKztcbiAgICAgICAgICAgICAgc2V0SW1hZ2VMb2FkSGFuZGxlcnMoaW1nLCBpbWFnZU9iaik7XG4gICAgICAgICAgICAgIGltZy5zcmMgPSBzcmM7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydENPUlMgJiYgIW9wdGlvbnMuYWxsb3dUYWludCAmJiBvcHRpb25zLnVzZUNPUlMpIHtcbiAgICAgICAgICAgICAgLy8gYXR0ZW1wdCB0byBsb2FkIHdpdGggQ09SU1xuXG4gICAgICAgICAgICAgIGltZy5jcm9zc09yaWdpbiA9IFwiYW5vbnltb3VzXCI7XG4gICAgICAgICAgICAgIGltYWdlT2JqID0gaW1hZ2VzW3NyY10gPSB7IGltZzogaW1nIH07XG4gICAgICAgICAgICAgIGltYWdlcy5udW1Ub3RhbCsrO1xuXG4gICAgICAgICAgICAgIHNldEltYWdlTG9hZEhhbmRsZXJzKGltZywgaW1hZ2VPYmopO1xuICAgICAgICAgICAgICBpbWcuc3JjID0gc3JjO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucHJveHkpIHtcbiAgICAgICAgICAgICAgaW1hZ2VPYmogPSBpbWFnZXNbc3JjXSA9IHtcbiAgICAgICAgICAgICAgICBpbWc6IGltZ1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBpbWFnZXMubnVtVG90YWwrKztcbiAgICAgICAgICAgICAgcHJveHlHZXRJbWFnZShzcmMsIGltZywgaW1hZ2VPYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICBjbGVhbnVwRE9NOiBmdW5jdGlvbiAoY2F1c2UpIHtcblxuICAgICAgICB2YXIgaW1nLCBzcmM7XG4gICAgICAgIGlmICghaW1hZ2VzLmNsZWFudXBEb25lKSB7XG4gICAgICAgICAgaWYgKGNhdXNlICYmIHR5cGVvZiBjYXVzZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogQ2xlYW51cCBiZWNhdXNlOiBcIiArIGNhdXNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogQ2xlYW51cCBhZnRlciB0aW1lb3V0OiBcIiArIG9wdGlvbnMudGltZW91dCArIFwiIG1zLlwiKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKHNyYyBpbiBpbWFnZXMpIHtcbiAgICAgICAgICAgIGlmIChpbWFnZXMuaGFzT3duUHJvcGVydHkoc3JjKSkge1xuICAgICAgICAgICAgICBpbWcgPSBpbWFnZXNbc3JjXTtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbWcgPT09IFwib2JqZWN0XCIgJiYgaW1nLmNhbGxiYWNrbmFtZSAmJiBpbWcuc3VjY2VlZGVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBjYW5jZWwgcHJveHkgaW1hZ2UgcmVxdWVzdFxuICAgICAgICAgICAgICAgIHdpbmRvd1tpbWcuY2FsbGJhY2tuYW1lXSA9IHVuZGVmaW5lZDsgLy8gdG8gd29yayB3aXRoIElFPDkgIC8vIE5PVEU6IHRoYXQgdGhlIHVuZGVmaW5lZCBjYWxsYmFjayBwcm9wZXJ0eS1uYW1lIHN0aWxsIGV4aXN0cyBvbiB0aGUgd2luZG93IG9iamVjdCAoZm9yIElFPDkpXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3aW5kb3dbaW1nLmNhbGxiYWNrbmFtZV07IC8vIGZvciBhbGwgYnJvd3NlciB0aGF0IHN1cHBvcnQgdGhpc1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7fVxuICAgICAgICAgICAgICAgIGlmIChpbWcuc2NyaXB0ICYmIGltZy5zY3JpcHQucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgaW1nLnNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgXCJhYm91dDpibGFua1wiKTsgLy8gdHJ5IHRvIGNhbmNlbCBydW5uaW5nIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgIGltZy5zY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpbWcuc2NyaXB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW1hZ2VzLm51bUxvYWRlZCsrO1xuICAgICAgICAgICAgICAgIGltYWdlcy5udW1GYWlsZWQrKztcbiAgICAgICAgICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBDbGVhbmVkIHVwIGZhaWxlZCBpbWc6ICdcIiArIHNyYyArIFwiJyBTdGVwczogXCIgKyBpbWFnZXMubnVtTG9hZGVkICsgXCIgLyBcIiArIGltYWdlcy5udW1Ub3RhbCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBjYW5jZWwgYW55IHBlbmRpbmcgcmVxdWVzdHNcbiAgICAgICAgICBpZiAod2luZG93LnN0b3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgd2luZG93LnN0b3AoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmV4ZWNDb21tYW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiU3RvcFwiLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChkb2N1bWVudC5jbG9zZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5jbG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbWFnZXMuY2xlYW51cERvbmUgPSB0cnVlO1xuICAgICAgICAgIGlmICghKGNhdXNlICYmIHR5cGVvZiBjYXVzZSA9PT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgIHN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICByZW5kZXJpbmdEb25lOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKHRpbWVvdXRUaW1lcikge1xuICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dFRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAob3B0aW9ucy50aW1lb3V0ID4gMCkge1xuICAgICAgdGltZW91dFRpbWVyID0gd2luZG93LnNldFRpbWVvdXQobWV0aG9kcy5jbGVhbnVwRE9NLCBvcHRpb25zLnRpbWVvdXQpO1xuICAgIH1cblxuICAgIFV0aWwubG9nKCdodG1sMmNhbnZhczogUHJlbG9hZCBzdGFydHM6IGZpbmRpbmcgYmFja2dyb3VuZC1pbWFnZXMnKTtcbiAgICBpbWFnZXMuZmlyc3RSdW4gPSB0cnVlO1xuXG4gICAgZ2V0SW1hZ2VzKGVsZW1lbnQpO1xuXG4gICAgVXRpbC5sb2coJ2h0bWwyY2FudmFzOiBQcmVsb2FkOiBGaW5kaW5nIGltYWdlcycpO1xuICAgIC8vIGxvYWQgPGltZz4gaW1hZ2VzXG4gICAgZm9yIChpID0gMDsgaSA8IGltZ0xlbjsgaSArPSAxKSB7XG4gICAgICBtZXRob2RzLmxvYWRJbWFnZShkb21JbWFnZXNbaV0uZ2V0QXR0cmlidXRlKFwic3JjXCIpKTtcbiAgICB9XG5cbiAgICBpbWFnZXMuZmlyc3RSdW4gPSBmYWxzZTtcbiAgICBVdGlsLmxvZygnaHRtbDJjYW52YXM6IFByZWxvYWQ6IERvbmUuJyk7XG4gICAgaWYgKGltYWdlcy5udW1Ub3RhbCA9PT0gaW1hZ2VzLm51bUxvYWRlZClcbiAgICAgIHN0YXJ0KCk7XG5cbiAgICByZXR1cm4gbWV0aG9kcztcbiAgfTtcblxuICBfaHRtbDJjYW52YXMuUmVuZGVyZXIgPSBmdW5jdGlvbiAocGFyc2VRdWV1ZSwgb3B0aW9ucykge1xuXG4gICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvQ1NTMjEvemluZGV4Lmh0bWxcbiAgICBmdW5jdGlvbiBjcmVhdGVSZW5kZXJRdWV1ZShwYXJzZVF1ZXVlKSB7XG4gICAgICB2YXIgcXVldWUgPSBbXSxcbiAgICAgICAgcm9vdENvbnRleHQ7XG5cbiAgICAgIHJvb3RDb250ZXh0ID0gKGZ1bmN0aW9uIGJ1aWxkU3RhY2tpbmdDb250ZXh0KHJvb3ROb2RlKSB7XG4gICAgICAgIHZhciByb290Q29udGV4dCA9IHt9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGluc2VydChjb250ZXh0LCBub2RlLCBzcGVjaWFsUGFyZW50KSB7XG4gICAgICAgICAgdmFyIHppID0gKG5vZGUuekluZGV4LnppbmRleCA9PT0gJ2F1dG8nKSA/IDAgOiBOdW1iZXIobm9kZS56SW5kZXguemluZGV4KSxcbiAgICAgICAgICAgIGNvbnRleHRGb3JDaGlsZHJlbiA9IGNvbnRleHQsIC8vIHRoZSBzdGFja2luZyBjb250ZXh0IGZvciBjaGlsZHJlblxuICAgICAgICAgICAgaXNQb3NpdGlvbmVkID0gbm9kZS56SW5kZXguaXNQb3NpdGlvbmVkLFxuICAgICAgICAgICAgaXNGbG9hdGVkID0gbm9kZS56SW5kZXguaXNGbG9hdGVkLFxuICAgICAgICAgICAgc3R1YiA9IHtcbiAgICAgICAgICAgICAgbm9kZTogbm9kZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoaWxkcmVuRGVzdCA9IHNwZWNpYWxQYXJlbnQ7IC8vIHdoZXJlIGNoaWxkcmVuIHdpdGhvdXQgei1pbmRleCBzaG91bGQgYmUgcHVzaGVkIGludG9cblxuICAgICAgICAgIGlmIChub2RlLnpJbmRleC5vd25TdGFja2luZykge1xuICAgICAgICAgICAgLy8gJyEnIGNvbWVzIGJlZm9yZSBudW1iZXJzIGluIHNvcnRlZCBhcnJheVxuICAgICAgICAgICAgY29udGV4dEZvckNoaWxkcmVuID0gc3R1Yi5jb250ZXh0ID0ge1xuICAgICAgICAgICAgICAnISc6IFt7XG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjaGlsZHJlbkRlc3QgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfSBlbHNlIGlmIChpc1Bvc2l0aW9uZWQgfHwgaXNGbG9hdGVkKSB7XG4gICAgICAgICAgICBjaGlsZHJlbkRlc3QgPSBzdHViLmNoaWxkcmVuID0gW107XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHppID09PSAwICYmIHNwZWNpYWxQYXJlbnQpIHtcbiAgICAgICAgICAgIHNwZWNpYWxQYXJlbnQucHVzaChzdHViKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFjb250ZXh0W3ppXSkge1xuICAgICAgICAgICAgICBjb250ZXh0W3ppXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGV4dFt6aV0ucHVzaChzdHViKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBub2RlLnpJbmRleC5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZE5vZGUpIHtcbiAgICAgICAgICAgIGluc2VydChjb250ZXh0Rm9yQ2hpbGRyZW4sIGNoaWxkTm9kZSwgY2hpbGRyZW5EZXN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpbnNlcnQocm9vdENvbnRleHQsIHJvb3ROb2RlKTtcbiAgICAgICAgcmV0dXJuIHJvb3RDb250ZXh0O1xuICAgICAgfSkocGFyc2VRdWV1ZSk7XG5cbiAgICAgIGZ1bmN0aW9uIHNvcnRaKGNvbnRleHQpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoY29udGV4dCkuc29ydCgpLmZvckVhY2goZnVuY3Rpb24gKHppKSB7XG4gICAgICAgICAgdmFyIG5vblBvc2l0aW9uZWQgPSBbXSxcbiAgICAgICAgICAgIGZsb2F0ZWQgPSBbXSxcbiAgICAgICAgICAgIHBvc2l0aW9uZWQgPSBbXSxcbiAgICAgICAgICAgIGxpc3QgPSBbXTtcblxuICAgICAgICAgIC8vIHBvc2l0aW9uZWQgYWZ0ZXIgc3RhdGljXG4gICAgICAgICAgY29udGV4dFt6aV0uZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgaWYgKHYubm9kZS56SW5kZXguaXNQb3NpdGlvbmVkIHx8IHYubm9kZS56SW5kZXgub3BhY2l0eSA8IDEpIHtcbiAgICAgICAgICAgICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1jb2xvci8jdHJhbnNwYXJlbmN5XG4gICAgICAgICAgICAgIC8vIG5vbi1wb3NpdGlvbmVkIGVsZW1lbnQgd2l0aCBvcGFjdGl5IDwgMSBzaG91bGQgYmUgc3RhY2tlZCBhcyBpZiBpdCB3ZXJlIGEgcG9zaXRpb25lZCBlbGVtZW50IHdpdGgg4oCYei1pbmRleDogMOKAmSBhbmQg4oCYb3BhY2l0eTogMeKAmS5cbiAgICAgICAgICAgICAgcG9zaXRpb25lZC5wdXNoKHYpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2Lm5vZGUuekluZGV4LmlzRmxvYXRlZCkge1xuICAgICAgICAgICAgICBmbG9hdGVkLnB1c2godik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBub25Qb3NpdGlvbmVkLnB1c2godik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAoZnVuY3Rpb24gd2FsayhhcnIpIHtcbiAgICAgICAgICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgIGxpc3QucHVzaCh2KTtcbiAgICAgICAgICAgICAgaWYgKHYuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICB3YWxrKHYuY2hpbGRyZW4pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KShub25Qb3NpdGlvbmVkLmNvbmNhdChmbG9hdGVkLCBwb3NpdGlvbmVkKSk7XG5cbiAgICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmICh2LmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgc29ydFoodi5jb250ZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHF1ZXVlLnB1c2godi5ub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHNvcnRaKHJvb3RDb250ZXh0KTtcblxuICAgICAgcmV0dXJuIHF1ZXVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFJlbmRlcmVyKHJlbmRlcmVyTmFtZSkge1xuICAgICAgdmFyIHJlbmRlcmVyO1xuXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMucmVuZGVyZXIgPT09IFwic3RyaW5nXCIgJiYgX2h0bWwyY2FudmFzLlJlbmRlcmVyW3JlbmRlcmVyTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZW5kZXJlciA9IF9odG1sMmNhbnZhcy5SZW5kZXJlcltyZW5kZXJlck5hbWVdKG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmVuZGVyZXJOYW1lID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmVuZGVyZXIgPSByZW5kZXJlck5hbWUob3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHJlbmRlcmVyXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHJlbmRlcmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByZW5kZXJlciBkZWZpbmVkXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlbmRlcmVyO1xuICAgIH1cblxuICAgIHJldHVybiBnZXRSZW5kZXJlcihvcHRpb25zLnJlbmRlcmVyKShwYXJzZVF1ZXVlLCBvcHRpb25zLCBkb2N1bWVudCwgY3JlYXRlUmVuZGVyUXVldWUocGFyc2VRdWV1ZS5zdGFjayksIF9odG1sMmNhbnZhcyk7XG4gIH07XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwuU3VwcG9ydCA9IGZ1bmN0aW9uIChvcHRpb25zLCBkb2MpIHtcblxuICAgIGZ1bmN0aW9uIHN1cHBvcnRTVkdSZW5kZXJpbmcoKSB7XG4gICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCksXG4gICAgICAgIGNhbnZhcyA9IGRvYy5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLFxuICAgICAgICBjdHggPSAoY2FudmFzLmdldENvbnRleHQgPT09IHVuZGVmaW5lZCkgPyBmYWxzZSA6IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICBpZiAoY3R4ID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuaGVpZ2h0ID0gMTA7XG4gICAgICBpbWcuc3JjID0gW1xuICAgICAgICBcImRhdGE6aW1hZ2Uvc3ZnK3htbCxcIixcbiAgICAgICAgXCI8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJz5cIixcbiAgICAgICAgXCI8Zm9yZWlnbk9iamVjdCB3aWR0aD0nMTAnIGhlaWdodD0nMTAnPlwiLFxuICAgICAgICBcIjxkaXYgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnIHN0eWxlPSd3aWR0aDoxMDtoZWlnaHQ6MTA7Jz5cIixcbiAgICAgICAgXCJzdXBcIixcbiAgICAgICAgXCI8L2Rpdj5cIixcbiAgICAgICAgXCI8L2ZvcmVpZ25PYmplY3Q+XCIsXG4gICAgICAgIFwiPC9zdmc+XCJcbiAgICAgIF0uam9pbihcIlwiKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgICAgICAgY2FudmFzLnRvRGF0YVVSTCgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBfaHRtbDJjYW52YXMuVXRpbC5sb2coJ2h0bWwyY2FudmFzOiBQYXJzZTogU1ZHIHBvd2VyZWQgcmVuZGVyaW5nIGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gVGVzdCB3aGV0aGVyIHdlIGNhbiB1c2UgcmFuZ2VzIHRvIG1lYXN1cmUgYm91bmRpbmcgYm94ZXNcbiAgICAvLyBPcGVyYSBkb2Vzbid0IHByb3ZpZGUgdmFsaWQgYm91bmRzLmhlaWdodC9ib3R0b20gZXZlbiB0aG91Z2ggaXQgc3VwcG9ydHMgdGhlIG1ldGhvZC5cblxuICAgIGZ1bmN0aW9uIHN1cHBvcnRSYW5nZUJvdW5kcygpIHtcbiAgICAgIHZhciByLCB0ZXN0RWxlbWVudCwgcmFuZ2VCb3VuZHMsIHJhbmdlSGVpZ2h0LCBzdXBwb3J0ID0gZmFsc2U7XG5cbiAgICAgIGlmIChkb2MuY3JlYXRlUmFuZ2UpIHtcbiAgICAgICAgciA9IGRvYy5jcmVhdGVSYW5nZSgpO1xuICAgICAgICBpZiAoci5nZXRCb3VuZGluZ0NsaWVudFJlY3QpIHtcbiAgICAgICAgICB0ZXN0RWxlbWVudCA9IGRvYy5jcmVhdGVFbGVtZW50KCdib3VuZHRlc3QnKTtcbiAgICAgICAgICB0ZXN0RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIjEyM3B4XCI7XG4gICAgICAgICAgdGVzdEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICBkb2MuYm9keS5hcHBlbmRDaGlsZCh0ZXN0RWxlbWVudCk7XG5cbiAgICAgICAgICByLnNlbGVjdE5vZGUodGVzdEVsZW1lbnQpO1xuICAgICAgICAgIHJhbmdlQm91bmRzID0gci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICByYW5nZUhlaWdodCA9IHJhbmdlQm91bmRzLmhlaWdodDtcblxuICAgICAgICAgIGlmIChyYW5nZUhlaWdodCA9PT0gMTIzKSB7XG4gICAgICAgICAgICBzdXBwb3J0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG9jLmJvZHkucmVtb3ZlQ2hpbGQodGVzdEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdXBwb3J0O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByYW5nZUJvdW5kczogc3VwcG9ydFJhbmdlQm91bmRzKCksXG4gICAgICBzdmdSZW5kZXJpbmc6IG9wdGlvbnMuc3ZnUmVuZGVyaW5nICYmIHN1cHBvcnRTVkdSZW5kZXJpbmcoKVxuICAgIH07XG4gIH07XG4gIHdpbmRvdy5odG1sMmNhbnZhcyA9IGZ1bmN0aW9uIChlbGVtZW50cywgb3B0cykge1xuXG4gICAgZWxlbWVudHMgPSAoZWxlbWVudHMubGVuZ3RoKSA/IGVsZW1lbnRzIDogW2VsZW1lbnRzXTtcbiAgICB2YXIgcXVldWUsXG4gICAgICBjYW52YXMsXG4gICAgICBvcHRpb25zID0ge1xuXG4gICAgICAgIC8vIGdlbmVyYWxcbiAgICAgICAgbG9nZ2luZzogZmFsc2UsXG4gICAgICAgIGNvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgZWxlbWVudHM6IGVsZW1lbnRzLFxuICAgICAgICBiYWNrZ3JvdW5kOiB1bmRlZmluZWQsXG5cbiAgICAgICAgLy8gcHJlbG9hZCBvcHRpb25zXG4gICAgICAgIHByb3h5OiBudWxsLFxuICAgICAgICB0aW1lb3V0OiAwLCAvLyBubyB0aW1lb3V0XG4gICAgICAgIHVzZUNPUlM6IGZhbHNlLCAvLyB0cnkgdG8gbG9hZCBpbWFnZXMgYXMgQ09SUyAod2hlcmUgYXZhaWxhYmxlKSwgYmVmb3JlIGZhbGxpbmcgYmFjayB0byBwcm94eVxuICAgICAgICBhbGxvd1RhaW50OiBmYWxzZSwgLy8gd2hldGhlciB0byBhbGxvdyBpbWFnZXMgdG8gdGFpbnQgdGhlIGNhbnZhcywgd29uJ3QgbmVlZCBwcm94eSBpZiBzZXQgdG8gdHJ1ZVxuXG4gICAgICAgIC8vIHBhcnNlIG9wdGlvbnNcbiAgICAgICAgc3ZnUmVuZGVyaW5nOiBmYWxzZSwgLy8gdXNlIHN2ZyBwb3dlcmVkIHJlbmRlcmluZyB3aGVyZSBhdmFpbGFibGUgKEZGMTErKVxuICAgICAgICBpZ25vcmVFbGVtZW50czogXCJJRlJBTUV8T0JKRUNUfFBBUkFNXCIsXG4gICAgICAgIHVzZU92ZXJmbG93OiB0cnVlLFxuICAgICAgICBsZXR0ZXJSZW5kZXJpbmc6IGZhbHNlLFxuICAgICAgICBjaGluZXNlOiBmYWxzZSxcblxuICAgICAgICAvLyByZW5kZXIgb3B0aW9uc1xuICAgICAgICB3aWR0aDogbnVsbCxcbiAgICAgICAgaGVpZ2h0OiBudWxsLFxuICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgdGFpbnRUZXN0OiB0cnVlLCAvLyBkbyBhIHRhaW50IHRlc3Qgd2l0aCBhbGwgaW1hZ2VzIGJlZm9yZSBhcHBseWluZyB0byBjYW52YXNcbiAgICAgICAgcmVuZGVyZXI6IFwiQ2FudmFzXCJcbiAgICAgIH07XG5cbiAgICBvcHRpb25zID0gX2h0bWwyY2FudmFzLlV0aWwuRXh0ZW5kKG9wdHMsIG9wdGlvbnMpO1xuICAgIHZhciBjb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lciB8fMKgb3B0aW9ucy5lbGVtZW50c1swXTtcbiAgICBpZihvcHRpb25zW1wid2lkdGhcIl0pICBvcHRpb25zW1wid2lkdGhcIl0gID0gKG9wdGlvbnNbXCJ3aWR0aFwiXS5pbmRleE9mKFwiJVwiKSAhPT0gLTEpID8gY29udGFpbmVyLndpZHRoKCkgKiBwYXJzZUZsb2F0KG9wdGlvbnNbXCJ3aWR0aFwiXSkgLyAxMDAgOiBvcHRpb25zW1wid2lkdGhcIl07XG4gICAgaWYob3B0aW9uc1tcImhlaWdodFwiXSkgb3B0aW9uc1tcImhlaWdodFwiXSA9IChvcHRpb25zW1wiaGVpZ2h0XCJdLmluZGV4T2YoXCIlXCIpICE9PSAtMSkgPyBjb250YWluZXIuaGVpZ2h0KCkgKiBwYXJzZUZsb2F0KG9wdGlvbnNbXCJoZWlnaHRcIl0pIC8gMTAwIDogb3B0aW9uc1tcImhlaWdodFwiXTtcbiAgICBpZihvcHRpb25zW1wibGVmdFwiXSkgb3B0aW9uc1tcImxlZnRcIl0gPSAob3B0aW9uc1tcImxlZnRcIl0uaW5kZXhPZihcIiVcIikgIT09IC0xKSA/IGVsZW1lbnRzWzBdLm9mZnNldFdpZHRoICogcGFyc2VGbG9hdChvcHRpb25zW1wibGVmdFwiXSkgLyAxMDAgOiBvcHRpb25zW1wibGVmdFwiXTtcbiAgICBpZihvcHRpb25zW1widG9wXCJdKSBvcHRpb25zW1widG9wXCJdID0gKG9wdGlvbnNbXCJ0b3BcIl0uaW5kZXhPZihcIiVcIikgIT09IC0xKSA/IGVsZW1lbnRzWzBdLm9mZnNldEhlaWdodCAqIHBhcnNlRmxvYXQob3B0aW9uc1tcInRvcFwiXSkgLyAxMDAgOiBvcHRpb25zW1widG9wXCJdO1xuICAgIF9odG1sMmNhbnZhcy5sb2dnaW5nID0gb3B0aW9ucy5sb2dnaW5nO1xuICAgIG9wdGlvbnMuY29tcGxldGUgPSBmdW5jdGlvbiAoaW1hZ2VzKSB7XG5cbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbnByZWxvYWRlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChvcHRpb25zLm9ucHJlbG9hZGVkKGltYWdlcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBxdWV1ZSA9IF9odG1sMmNhbnZhcy5QYXJzZShpbWFnZXMsIG9wdGlvbnMpO1xuXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25wYXJzZWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAob3B0aW9ucy5vbnBhcnNlZChxdWV1ZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbnZhcyA9IF9odG1sMmNhbnZhcy5SZW5kZXJlcihxdWV1ZSwgb3B0aW9ucyk7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25yZW5kZXJlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG9wdGlvbnMub25yZW5kZXJlZChjYW52YXMpO1xuICAgICAgfVxuXG5cbiAgICB9O1xuXG4gICAgLy8gZm9yIHBhZ2VzIHdpdGhvdXQgaW1hZ2VzLCB3ZSBzdGlsbCB3YW50IHRoaXMgdG8gYmUgYXN5bmMsIGkuZS4gcmV0dXJuIG1ldGhvZHMgYmVmb3JlIGV4ZWN1dGluZ1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIF9odG1sMmNhbnZhcy5QcmVsb2FkKG9wdGlvbnMpO1xuICAgIH0sIDApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbmRlcjogZnVuY3Rpb24gKHF1ZXVlLCBvcHRzKSB7XG4gICAgICAgIHJldHVybiBfaHRtbDJjYW52YXMuUmVuZGVyZXIocXVldWUsIF9odG1sMmNhbnZhcy5VdGlsLkV4dGVuZChvcHRzLCBvcHRpb25zKSk7XG4gICAgICB9LFxuICAgICAgcGFyc2U6IGZ1bmN0aW9uIChpbWFnZXMsIG9wdHMpIHtcbiAgICAgICAgcmV0dXJuIF9odG1sMmNhbnZhcy5QYXJzZShpbWFnZXMsIF9odG1sMmNhbnZhcy5VdGlsLkV4dGVuZChvcHRzLCBvcHRpb25zKSk7XG4gICAgICB9LFxuICAgICAgcHJlbG9hZDogZnVuY3Rpb24gKG9wdHMpIHtcbiAgICAgICAgcmV0dXJuIF9odG1sMmNhbnZhcy5QcmVsb2FkKF9odG1sMmNhbnZhcy5VdGlsLkV4dGVuZChvcHRzLCBvcHRpb25zKSk7XG4gICAgICB9LFxuICAgICAgbG9nOiBfaHRtbDJjYW52YXMuVXRpbC5sb2dcbiAgICB9O1xuICB9O1xuXG4gIHdpbmRvdy5odG1sMmNhbnZhcy5sb2cgPSBfaHRtbDJjYW52YXMuVXRpbC5sb2c7IC8vIGZvciByZW5kZXJlcnNcbiAgd2luZG93Lmh0bWwyY2FudmFzLlJlbmRlcmVyID0ge1xuICAgIENhbnZhczogdW5kZWZpbmVkIC8vIFdlIGFyZSBhc3N1bWluZyB0aGlzIHdpbGwgYmUgdXNlZFxuICB9O1xuICBfaHRtbDJjYW52YXMuUmVuZGVyZXIuQ2FudmFzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGRvYyA9IGRvY3VtZW50LFxuICAgICAgc2FmZUltYWdlcyA9IFtdLFxuICAgICAgdGVzdENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksXG4gICAgICB0ZXN0Y3R4ID0gdGVzdENhbnZhcy5nZXRDb250ZXh0KFwiMmRcIiksXG4gICAgICBVdGlsID0gX2h0bWwyY2FudmFzLlV0aWwsXG4gICAgICBjYW52YXMgPSBvcHRpb25zLmNhbnZhcyB8fCBkb2MuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTaGFwZShjdHgsIGFyZ3MpIHtcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIGN0eFthcmcubmFtZV0uYXBwbHkoY3R4LCBhcmdbJ2FyZ3VtZW50cyddKTtcbiAgICAgIH0pO1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhZmVJbWFnZShpdGVtKSB7XG4gICAgICBpZiAoc2FmZUltYWdlcy5pbmRleE9mKGl0ZW1bJ2FyZ3VtZW50cyddWzBdLnNyYykgPT09IC0xKSB7XG4gICAgICAgIHRlc3RjdHguZHJhd0ltYWdlKGl0ZW1bJ2FyZ3VtZW50cyddWzBdLCAwLCAwKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0ZXN0Y3R4LmdldEltYWdlRGF0YSgwLCAwLCAxLCAxKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHRlc3RDYW52YXMgPSBkb2MuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgICB0ZXN0Y3R4ID0gdGVzdENhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHNhZmVJbWFnZXMucHVzaChpdGVtWydhcmd1bWVudHMnXVswXS5zcmMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVySXRlbShjdHgsIGl0ZW0pIHtcbiAgICAgIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJ2YXJpYWJsZVwiOlxuICAgICAgICAgIGN0eFtpdGVtLm5hbWVdID0gaXRlbVsnYXJndW1lbnRzJ107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgICAgIHN3aXRjaCAoaXRlbS5uYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwiY3JlYXRlUGF0dGVyblwiOlxuICAgICAgICAgICAgICBpZiAoaXRlbVsnYXJndW1lbnRzJ11bMF0ud2lkdGggPiAwICYmIGl0ZW1bJ2FyZ3VtZW50cyddWzBdLmhlaWdodCA+IDApIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGN0eC5jcmVhdGVQYXR0ZXJuKGl0ZW1bJ2FyZ3VtZW50cyddWzBdLCBcInJlcGVhdFwiKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBSZW5kZXJlcjogRXJyb3IgY3JlYXRpbmcgcGF0dGVyblwiLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJkcmF3U2hhcGVcIjpcbiAgICAgICAgICAgICAgY3JlYXRlU2hhcGUoY3R4LCBpdGVtWydhcmd1bWVudHMnXSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImRyYXdJbWFnZVwiOlxuICAgICAgICAgICAgICBpZiAoaXRlbVsnYXJndW1lbnRzJ11bOF0gPiAwICYmIGl0ZW1bJ2FyZ3VtZW50cyddWzddID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy50YWludFRlc3QgfHwgKG9wdGlvbnMudGFpbnRUZXN0ICYmIHNhZmVJbWFnZShpdGVtKSkpIHtcbiAgICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UuYXBwbHkoY3R4LCBpdGVtWydhcmd1bWVudHMnXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgY3R4W2l0ZW0ubmFtZV0uYXBwbHkoY3R4LCBpdGVtWydhcmd1bWVudHMnXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJyb3dzZXJJbmZvKCkge1xuICAgICAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgdGVtLFxuICAgICAgICBNID0gdWEubWF0Y2goLyhvcGVyYXxjaHJvbWV8c2FmYXJpfGZpcmVmb3h8bXNpZXx0cmlkZW50KD89XFwvKSlcXC8/XFxzKihcXGQrKS9pKSB8fCBbXTtcbiAgICAgIGlmICgvdHJpZGVudC9pLnRlc3QoTVsxXSkpIHtcbiAgICAgICAgdGVtID0gL1xcYnJ2WyA6XSsoXFxkKykvZy5leGVjKHVhKSB8fCBbXTtcbiAgICAgICAgcmV0dXJuIFsnSUUnLCAodGVtWzFdIHx8ICcnKV07XG4gICAgICB9XG4gICAgICBpZiAoTVsxXSA9PT0gJ0Nocm9tZScpIHtcbiAgICAgICAgdGVtID0gdWEubWF0Y2goL1xcYihPUFJ8RWRnZT8pXFwvKFxcZCspLyk7XG4gICAgICAgIGlmICh0ZW0gIT0gbnVsbCkge1xuICAgICAgICAgIHZhciBzdGVtID0gdGVtLnNsaWNlKDEpO1xuICAgICAgICAgIHN0ZW1bMF0ucmVwbGFjZSgnT1BSJywgJ09wZXJhJykucmVwbGFjZSgnRWRnICcsICdFZGdlICcpO1xuICAgICAgICAgIHJldHVybiBzdGVtO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBNID0gTVsyXSA/IFtNWzFdLCBNWzJdXSA6IFtuYXZpZ2F0b3IuYXBwTmFtZSwgbmF2aWdhdG9yLmFwcFZlcnNpb24sICctPyddO1xuICAgICAgaWYgKCh0ZW0gPSB1YS5tYXRjaCgvdmVyc2lvblxcLyhcXGQrKS9pKSkgIT0gbnVsbCkgTS5zcGxpY2UoMSwgMSwgdGVtWzFdKTtcbiAgICAgIHJldHVybiBNO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJyb3dzZXJDYW52YXNMaW1pdChzY2FsZSkge1xuICAgICAgdmFyIGJyb3dzZXIgPSBnZXRCcm93c2VySW5mbygpWzBdO1xuICAgICAgdmFyIHJlc3RyaWN0aW9ucyA9IHtcbiAgICAgICAgREVGQVVMVDoge1xuICAgICAgICAgIHdpZHRoOiA4MTkyLFxuICAgICAgICAgIGhlaWdodDogODE5MlxuICAgICAgICB9LFxuICAgICAgICBFZGdlOiB7XG4gICAgICAgICAgd2lkdGg6IDgxOTIsXG4gICAgICAgICAgaGVpZ2h0OiA4MTkyXG4gICAgICAgIH0sXG4gICAgICAgIEZpcmVmb3g6IHtcbiAgICAgICAgICB3aWR0aDogMzI3NjcsXG4gICAgICAgICAgaGVpZ2h0OiAzMjc2N1xuICAgICAgICB9LFxuICAgICAgICBTYWZhcmk6IHtcbiAgICAgICAgICB3aWR0aDogMzI3NjcsXG4gICAgICAgICAgaGVpZ2h0OiAzMjc2N1xuICAgICAgICB9LFxuICAgICAgICBDaHJvbWU6IHtcbiAgICAgICAgICB3aWR0aDogMzI3NjcsXG4gICAgICAgICAgaGVpZ2h0OiAzMjc2N1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbcmVzdHJpY3Rpb25zW2Jyb3dzZXJdIHx8IHJlc3RyaWN0aW9uc1snREVGQVVMVCddLCBicm93c2VyXVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VkRGF0YSwgb3B0aW9ucywgZG9jdW1lbnQsIHF1ZXVlLCBfaHRtbDJjYW52YXMpIHtcbiAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLFxuICAgICAgICBuZXdDYW52YXMsXG4gICAgICAgIGJvdW5kcyxcbiAgICAgICAgYm91bmRTY2FsZUtleXMsXG4gICAgICAgIGZzdHlsZSxcbiAgICAgICAgelN0YWNrID0gcGFyc2VkRGF0YS5zdGFjaztcblxuICAgICAgaWYgKG9wdGlvbnMuZHBpKVxuICAgICAgICBvcHRpb25zLnNjYWxlID0gb3B0aW9ucy5kcGkgLyA5NjtcblxuICAgICAgdmFyIGJyb3dzZXJDYW52YXNMaW1pdCA9IGdldEJyb3dzZXJDYW52YXNMaW1pdChvcHRpb25zLnNjYWxlKTtcbiAgICAgIHZhciBjYW52YXNMaW1pdCA9IGJyb3dzZXJDYW52YXNMaW1pdFswXTtcblxuICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLnN0eWxlLndpZHRoID0gTWF0aC5taW4oKG9wdGlvbnMud2lkdGggfHwgelN0YWNrLmN0eC53aWR0aCkgKiBvcHRpb25zLnNjYWxlLCBjYW52YXNMaW1pdC53aWR0aCk7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLnN0eWxlLmhlaWdodCA9IE1hdGgubWluKChvcHRpb25zLmhlaWdodCB8fCB6U3RhY2suY3R4LmhlaWdodCkgKiBvcHRpb25zLnNjYWxlLCBjYW52YXNMaW1pdC5oZWlnaHQpO1xuXG4gICAgICBmc3R5bGUgPSBjdHguZmlsbFN0eWxlO1xuICAgICAgY3R4LnNjYWxlKG9wdGlvbnMuc2NhbGUsIG9wdGlvbnMuc2NhbGUpO1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IChVdGlsLmlzVHJhbnNwYXJlbnQocGFyc2VkRGF0YS5iYWNrZ3JvdW5kQ29sb3IpICYmIG9wdGlvbnMuYmFja2dyb3VuZCAhPT0gdW5kZWZpbmVkKSA/IG9wdGlvbnMuYmFja2dyb3VuZCA6IHBhcnNlZERhdGEuYmFja2dyb3VuZENvbG9yO1xuICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICBjdHguZmlsbFN0eWxlID0gZnN0eWxlO1xuXG4gICAgICBxdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChzdG9yYWdlQ29udGV4dCkge1xuICAgICAgICAvLyBzZXQgY29tbW9uIHNldHRpbmdzIGZvciBjYW52YXNcbiAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IFwiYm90dG9tXCI7XG4gICAgICAgIGN0eC5zYXZlKCk7XG5cbiAgICAgICAgaWYgKHN0b3JhZ2VDb250ZXh0LnRyYW5zZm9ybS5tYXRyaXgpIHtcbiAgICAgICAgICBjdHgudHJhbnNsYXRlKHN0b3JhZ2VDb250ZXh0LnRyYW5zZm9ybS5vcmlnaW5bMF0sIHN0b3JhZ2VDb250ZXh0LnRyYW5zZm9ybS5vcmlnaW5bMV0pO1xuICAgICAgICAgIGN0eC50cmFuc2Zvcm0uYXBwbHkoY3R4LCBzdG9yYWdlQ29udGV4dC50cmFuc2Zvcm0ubWF0cml4KTtcbiAgICAgICAgICBjdHgudHJhbnNsYXRlKC1zdG9yYWdlQ29udGV4dC50cmFuc2Zvcm0ub3JpZ2luWzBdLCAtc3RvcmFnZUNvbnRleHQudHJhbnNmb3JtLm9yaWdpblsxXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RvcmFnZUNvbnRleHQuY2xpcCkge1xuICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICBjdHgucmVjdChzdG9yYWdlQ29udGV4dC5jbGlwLmxlZnQsIHN0b3JhZ2VDb250ZXh0LmNsaXAudG9wLCBzdG9yYWdlQ29udGV4dC5jbGlwLndpZHRoLCBzdG9yYWdlQ29udGV4dC5jbGlwLmhlaWdodCk7XG4gICAgICAgICAgY3R4LmNsaXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdG9yYWdlQ29udGV4dC5jdHguc3RvcmFnZSkge1xuICAgICAgICAgIHN0b3JhZ2VDb250ZXh0LmN0eC5zdG9yYWdlLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJlbmRlckl0ZW0oY3R4LCBpdGVtKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICB9KTtcblxuICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogUmVuZGVyZXI6IENhbnZhcyByZW5kZXJlciBkb25lLCBzY2FsZWQgYXQgXCIgKyBvcHRpb25zLnNjYWxlICsgXCIgLSByZXR1cm5pbmcgY2FudmFzIG9ialwiKTtcblxuICAgICAgaWYgKG9wdGlvbnMuZWxlbWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5lbGVtZW50c1swXSA9PT0gXCJvYmplY3RcIiAmJiBvcHRpb25zLmVsZW1lbnRzWzBdLm5vZGVOYW1lICE9PSBcIkJPRFlcIikge1xuICAgICAgICAgIC8vIGNyb3AgaW1hZ2UgdG8gdGhlIGJvdW5kcyBvZiBzZWxlY3RlZCAoc2luZ2xlKSBlbGVtZW50XG5cbiAgICAgICAgICB2YXIgY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXIgfHwgb3B0aW9ucy5lbGVtZW50cztcblxuICAgICAgICAgIGJvdW5kcyA9IF9odG1sMmNhbnZhcy5VdGlsLkJvdW5kcyhjb250YWluZXJbMF0pO1xuICAgICAgICAgIGJvdW5kcy53aWR0aCAgPSBvcHRpb25zW1wid2lkdGhcIl0gIHx8IGJvdW5kcy53aWR0aDtcbiAgICAgICAgICBib3VuZHMuaGVpZ2h0ID0gb3B0aW9uc1tcImhlaWdodFwiXSB8fCBib3VuZHMuaGVpZ2h0O1xuXG4gICAgICAgICAgYm91bmRTY2FsZUtleXMgPSBbJ3dpZHRoJywgJ2hlaWdodCcsICd0b3AnLCAnbGVmdCddO1xuXG4gICAgICAgICAgYm91bmRTY2FsZUtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgbGltaXRLZXkgPSBbJ3dpZHRoJywgJ2xlZnQnXS5pbmRleE9mKGtleSkgPT09IC0xID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xuICAgICAgICAgICAgYm91bmRzW2tleV0gPSBNYXRoLm1pbihib3VuZHNba2V5XSAqIG9wdGlvbnMuc2NhbGUsIGNhbnZhc0xpbWl0W2xpbWl0S2V5XSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBuZXdDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICBuZXdDYW52YXMud2lkdGggPSBNYXRoLm1pbihib3VuZHMud2lkdGgsIGNhbnZhc0xpbWl0LndpZHRoKTtcbiAgICAgICAgICBuZXdDYW52YXMuaGVpZ2h0ID0gTWF0aC5taW4oYm91bmRzLmhlaWdodCwgY2FudmFzTGltaXQuaGVpZ2h0KTtcbiAgICAgICAgICBuZXdDYW52YXMuc3R5bGUud2lkdGggPSBuZXdDYW52YXMud2lkdGggKyAncHgnO1xuICAgICAgICAgIG5ld0NhbnZhcy5zdHlsZS5oZWlnaHQgPSBuZXdDYW52YXMuaGVpZ2h0ICsgJ3B4JztcblxuICAgICAgICAgIGN0eCA9IG5ld0NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgICAgY3R4LmRyYXdJbWFnZShjYW52YXMsIGJvdW5kcy5sZWZ0LCBib3VuZHMudG9wLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIDAsIDAsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCk7XG4gICAgICAgICAgY2FudmFzID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gbmV3Q2FudmFzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjYW52YXM7XG4gICAgfTtcbiAgfTtcbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuXG5cbndpbmRvdy5odG1sMmNhbnZhc190aWxlbWFwID0gZnVuY3Rpb24gKGVsKSB7XG5cbiAgaWYoT2JqZWN0LmtleXMoZWwpLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICBpZihlbC5sZW5ndGggPT0gMCB8fCBlbCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgdmFyIGNhbnZhcyA9IGVsIGluc3RhbmNlb2YgRWxlbWVudCA/IGVsIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCk7XG4gIGlmKGNhbnZhcy50YWdOYW1lICE9IFwiQ0FOVkFTXCIpXG4gICAgdGhyb3cgXCJFbGVtZW50IHBhc3NlZCB0aHJvdWdoIGh0bWwyY2FudmFzX3RpbGVtYXAoKSBtdXN0IGJlIGEgY2FudmFzXCI7XG5cbiAgY2FudmFzLnN0eWxlLm9iamVjdEZpdCA9IFwiY292ZXJcIjtcbiAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuICBjYW52YXMuc3R5bGUudG9wID0gXCI1MCVcIjtcbiAgY2FudmFzLnN0eWxlLmxlZnQgPSBcIjUwJVwiO1xuICBjYW52YXMuc3R5bGUudHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUoLTUwJSwgLTUwJSlcIjtcbiAgY2FudmFzLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcblxuICB2YXIgc3JjID0gY2FudmFzLmdldEF0dHJpYnV0ZShcImRhdGEtc3JjXCIpO1xuICB2YXIgd2lkdGggPSBwYXJzZUludChjYW52YXMuZ2V0QXR0cmlidXRlKFwid2lkdGhcIikpO1xuICB2YXIgaGVpZ2h0ID0gcGFyc2VJbnQoY2FudmFzLmdldEF0dHJpYnV0ZShcImhlaWdodFwiKSk7XG4gIHZhciBzY2FsZSA9IHBhcnNlRmxvYXQocGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZShjYW52YXMpLndpZHRoKSAvIHdpZHRoKSB8fCAxO1xuXG4gIHZhciBzaWduYXR1cmUgPSBjYW52YXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zaWduYXR1cmVcIik7XG4gIHZhciB0aWxlc2l6ZSAgPSBwYXJzZUludChjYW52YXMuZ2V0QXR0cmlidXRlKFwiZGF0YS10aWxlc2l6ZVwiKSkgfHwgbnVsbDtcblxuICB2YXIgeHRpbGVzICAgID0gcGFyc2VJbnQoY2FudmFzLmdldEF0dHJpYnV0ZShcImRhdGEteHRpbGVzXCIpKTtcbiAgdmFyIHl0aWxlcyAgICA9IHBhcnNlSW50KGNhbnZhcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXl0aWxlc1wiKSk7XG4gIHZhciBtaXNzaW5nICAgPSBjYW52YXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1taXNzaW5nXCIpO1xuXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICB2YXIgdGlsZUxpc3QgPSBbXTtcblxuICAvLyBUT0RPOiBPcHRpbWl6ZSByZXNvdXJjZSBsb2FkaW5nLi5cbiAgLy8gZnVuY3Rpb24gYm91bmRzT3ZlcmxhcChyMSwgcjIpIHtcbiAgLy8gICBjb25zb2xlLmxvZyhyMSk7XG4gIC8vICAgY29uc29sZS5sb2cocjIpO1xuXG4gIC8vICAgcmV0dXJuICEocjIubGVmdCA+IHIxLnJpZ2h0IHx8XG4gIC8vICAgICAgICAgIHIyLnJpZ2h0IDwgcjEubGVmdCB8fFxuICAvLyAgICAgICAgICByMi50b3AgPiByMS5ib3R0b20gfHxcbiAgLy8gICAgICAgICAgcjIuYm90dG9tIDwgcjEudG9wKTtcbiAgLy8gfVxuXG4gIGZ1bmN0aW9uIHRpbGVzTGF6eWxvYWQoKSB7XG5cbiAgICAvLyB2YXIgbGF6eXdpZHRoICA9IHBhcnNlSW50KE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fCAwLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKS9zY2FsZSk7XG4gICAgLy8gdmFyIGxhenloZWlnaHQgPSBwYXJzZUludChNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8IDAsIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwKS9zY2FsZSk7XG4gICAgLy8gdmFyIGxhenlib3VuZHMgPSB7XG4gICAgLy8gICBsZWZ0OndpZHRoLzItbGF6eXdpZHRoLzIsICB0b3A6MCxcbiAgICAvLyAgIHJpZ2h0OndpZHRoLzIrbGF6eXdpZHRoLzIsIGJvdHRvbTpsYXp5aGVpZ2h0XG4gICAgLy8gfTtcblxuICAgIGZvcihpeCA9IDA7IGl4IDwgeHRpbGVzOyBpeCsrKSB7XG4gICAgICBmb3IoaXkgPSAwOyBpeSA8IHl0aWxlczsgaXkrKynCoHtcblxuICAgICAgICB2YXIgaW5kZXggPSBpeSp4dGlsZXMgKyBpeDtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImluZGV4OlwiLCBpbmRleCk7XG5cbiAgICAgICAgaWYodGlsZUxpc3RbaW5kZXhdID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aWxlTGlzdFtpbmRleF0gPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgICB0aWxlTGlzdFtpbmRleF0ub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5vbmVycm9yID0gXCJcIjtcbiAgICAgICAgICAgIHRoaXMuc3JjID0gbWlzc2luZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhciBkeCA9IGl4KnRpbGVzaXplLCBkeSA9IGl5KnRpbGVzaXplO1xuICAgICAgICAvLyB2YXIgZHcgPSAodGlsZXNpemUgfHwgd2lkdGgpLCBkaCA9ICh0aWxlc2l6ZSB8fCBoZWlnaHQpO1xuICAgICAgICAvLyB2YXIgdGlsZWJvdW5kcyA9IHtsZWZ0OmR4LCB0b3A6ZHksIHJpZ2h0OmR4K2R3LCBib3R0b206ZHkrZGh9O1xuXG4gICAgICAgIC8vIHZhciBsYXp5bG9hZCA9IGJvdW5kc092ZXJsYXAodGlsZWJvdW5kcywgbGF6eWJvdW5kcyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibGF6eWxvYWQ6XCIsIGxhenlsb2FkKTtcbiAgICAgICAgLy8gaWYobGF6eWxvYWQgJiYgdGlsZUxpc3RbaW5kZXhdLnNyYyA9PSBcIlwiKSB7XG4gICAgICAgIC8vICAgdGlsZUxpc3RbaW5kZXhdLnNyYyA9IHNyYyArIFwiL1wiICsgc2lnbmF0dXJlICsgXCIvXCIgKyBpbmRleDtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhcIkNhbGwuLiBcIiwgdGlsZUxpc3RbaW5kZXhdLnNyYywgbGF6eWxvYWQpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgdmFyIHRtcF9zcmMgPSBzcmM7XG4gICAgICAgIGlmKHRtcF9zcmMuaW5kZXhPZihcIntzaWduYXR1cmV9XCIpKSB0bXBfc3JjID0gdG1wX3NyYy5yZXBsYWNlQWxsKFwie3NpZ25hdHVyZX1cIiwgc2lnbmF0dXJlKTtcbiAgICAgICAgZWxzZSB0bXBfc3JjICs9IFwiL1wiICsgc2lnbmF0dXJlO1xuICAgICAgICBpZih0bXBfc3JjLmluZGV4T2YoXCJ7aWR9XCIpKSB0bXBfc3JjID0gdG1wX3NyYy5yZXBsYWNlQWxsKFwie2lkfVwiLCBpbmRleCk7XG4gICAgICAgIGVsc2UgdG1wX3NyYyArPSBcIi9cIiArIGluZGV4O1xuXG4gICAgICAgIHRpbGVMaXN0W2luZGV4XS5zcmMgPSB0bXBfc3JjO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB3aW5kb3cub25yZXNpemUgPSB0aWxlc0xhenlsb2FkO1xuICB0aWxlc0xhenlsb2FkKCk7XG5cbiAgdmFyIGR1cmF0aW9uID0gMjUwO1xuICB2YXIgdGlsZU9wYWNpdHkgPSBbXTtcbiAgdmFyIHRpbGVQYXN0ID0gW107XG4gIHZhciB0b3RhbE9wYWNpdHlNYXggPSB0aWxlTGlzdC5sZW5ndGg7XG5cbiAgaWYodG90YWxPcGFjaXR5TWF4ID09IDApIHJldHVybjtcblxuICBmdW5jdGlvbiBhbmltYXRlKHByZXNlbnQpIHtcblxuICAgIHZhciB0b3RhbE9wYWNpdHkgICAgPSAwO1xuICAgIGZvcih2YXIgaW5kZXggPSAwOyBpbmRleCA8IHh0aWxlcyp5dGlsZXM7IGluZGV4KyspIHtcblxuICAgICAgICB2YXIgdGlsZSA9IHRpbGVMaXN0W2luZGV4XTtcbiAgICAgICAgaWYodGlsZSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIGlmKHRpbGUuY29tcGxldGUgPT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYodGlsZU9wYWNpdHlbaW5kZXhdID09IDEpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBpZih0aWxlT3BhY2l0eVtpbmRleF0gPT09IHVuZGVmaW5lZCkgdGlsZU9wYWNpdHlbaW5kZXhdID0gMDtcbiAgICAgICAgICAgIGlmKHRpbGVQYXN0W2luZGV4XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpZGxlJykpO1xuICAgICAgICAgICAgICAgIHRpbGVQYXN0W2luZGV4XSA9IHByZXNlbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkT3BhY2l0eSA9IChwcmVzZW50IC0gdGlsZVBhc3RbaW5kZXhdKSAvIGR1cmF0aW9uO1xuICAgICAgICAgICAgaWYoIXRpbGVzaXplKSBkT3BhY2l0eSA9IDE7XG5cbiAgICAgICAgICAgIHRpbGVPcGFjaXR5W2luZGV4XSArPSBkT3BhY2l0eTtcbiAgICAgICAgICAgIGlmKHRpbGVPcGFjaXR5W2luZGV4XSA+IDEpIHRpbGVPcGFjaXR5W2luZGV4XSA9IDE7XG5cbiAgICAgICAgICAgIHRvdGFsT3BhY2l0eSArPSB0aWxlT3BhY2l0eVtpbmRleF07XG4gICAgICAgICAgICB0aWxlUGFzdFtpbmRleF0gPSBwcmVzZW50O1xuXG4gICAgICAgICAgICB2YXIgaXggPSBpbmRleCAlIHh0aWxlcztcbiAgICAgICAgICAgIHZhciBpeSA9IE1hdGguZmxvb3IoaW5kZXggLyB4dGlsZXMpO1xuICAgICAgICAgICAgdmFyIGR4ID0gaXgqdGlsZXNpemUsIGR5ID0gaXkqdGlsZXNpemU7XG4gICAgICAgICAgICB2YXIgc3cgPSB0aWxlTGlzdFtpbmRleF0ud2lkdGgsIHNoID0gdGlsZUxpc3RbaW5kZXhdLmhlaWdodDtcbiAgICAgICAgICAgIHZhciBkdyA9IHRpbGVzaXplIHx8IHdpZHRoLCBkaCA9IHRpbGVzaXplIHx8IGhlaWdodDtcblxuICAgICAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gdGlsZU9wYWNpdHlbaW5kZXhdO1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aWxlLCAwLDAsIHN3LHNoLCBkeCxkeSwgZHcsZGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRvdGFsT3BhY2l0eSA8IHRvdGFsT3BhY2l0eU1heCkgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICBlbHNlIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgndGlsZXNsb2FkZWQnKSk7XG4gIH1cblxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuXG5cbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGV4aXN0cyAoZGV2ZWxvcG1lbnQgb25seSlcblx0aWYgKF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdID09PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBcIkBnbGl0Y2hyL2h0bWwyY2FudmFzXCI7XG5pbXBvcnQgXCIuL3N0eWxlcy9qcy90aWxlbWFwLmpzXCI7XG5cbi8vIGpRdWVyeSBwbHVnaW4gd3JhcHBlciBmb3IgaHRtbDJjYW52YXMgd2l0aCB0aWxpbmcgc3VwcG9ydFxuY29uc3QgaHRtbDJjYW52YXNQbHVnaW4gPSBmdW5jdGlvbihjb250YWluZXIsIG9wdHMgPSB7fSwgb25yZW5kZXJlZENhbGxiYWNrID0gbnVsbCkge1xuICAgIGNvbnN0ICQgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXM7XG5cbiAgICBjb25zdCBlbGVtZW50ID0gJChjb250YWluZXIpLmxlbmd0aCA+IDAgPyAkKGNvbnRhaW5lcilbMF0gOiB0aGlzWzBdO1xuICAgIGNvbnN0IGluc2VydCA9IG9wdHMuaW5zZXJ0IHx8ICdhcHBlbmQnO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgLi4ub3B0cyxcbiAgICAgICAgb25yZW5kZXJlZDogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICAgICAgICBpZiAob25yZW5kZXJlZENhbGxiYWNrICYmIHR5cGVvZiBvbnJlbmRlcmVkQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBvbnJlbmRlcmVkQ2FsbGJhY2soY2FudmFzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGluc2VydCA9PT0gJ3ByZXBlbmQnKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZWxlbWVudCkucHJlcGVuZChjYW52YXMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQoZWxlbWVudCkuYXBwZW5kKGNhbnZhcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRlbGV0ZSBvcHRpb25zLmluc2VydDtcbiAgICB3aW5kb3cuaHRtbDJjYW52YXMoZWxlbWVudCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBSZWdpc3RlciBwbHVnaW4gb24gZ2xvYmFsIGpRdWVyeSAobG9hZGVkIGZyb20gQ0ROKVxuaWYgKHdpbmRvdy5qUXVlcnkpIHdpbmRvdy5qUXVlcnkuZm4uaHRtbDJjYW52YXMgPSBodG1sMmNhbnZhc1BsdWdpbjtcbmlmICh3aW5kb3cuJCkgd2luZG93LiQuZm4uaHRtbDJjYW52YXMgPSBodG1sMmNhbnZhc1BsdWdpbjtcbiJdLCJuYW1lcyI6WyJfZ21UaWxlbWFwU2hvdWxkSW5pdCIsImVsIiwiaXNDb25uZWN0ZWQiLCJzdHlsZSIsIndpbmRvdyIsImdldENvbXB1dGVkU3R5bGUiLCJkaXNwbGF5IiwidmlzaWJpbGl0eSIsIm9mZnNldFBhcmVudCIsInBvc2l0aW9uIiwiaW5pdFRpbGVNYXAiLCIkIiwialF1ZXJ5IiwiY29udGFpbmVyIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiY29udGFpbmVyT2JzZXJ2ZXIiLCJJbnRlcnNlY3Rpb25PYnNlcnZlciIsImVudHJpZXMiLCJmb3JFYWNoIiwiZW50cnkiLCJpc0ludGVyc2VjdGluZyIsInRhcmdldCIsImRhdGFzZXQiLCJnbVRpbGVtYXBJbml0aWFsaXplZCIsInVub2JzZXJ2ZSIsIl9pbml0VGlsZU1hcENvbnRhaW5lciIsInJvb3RNYXJnaW4iLCJpIiwibGVuZ3RoIiwib2JzZXJ2ZSIsImoiLCJ0YWdOYW1lIiwiZG9jdW1lbnRFbGVtZW50IiwiY3NzIiwic3JjIiwiZ2V0QXR0cmlidXRlIiwic2lnbmF0dXJlIiwidGlsZXNpemUiLCJwYXJzZUludCIsInJlc29sdXRpb24iLCJ4dGlsZXMiLCJ5dGlsZXMiLCJhZGRFdmVudExpc3RlbmVyIiwibGF6eUJhY2tncm91bmRzIiwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeSIsInByb3RvdHlwZSIsImxhenlCYWNrZ3JvdW5kT2JzZXJ2ZXIiLCJvYnNlcnZlciIsImJhY2tncm91bmRJbWFnZSIsInByZWxvYWRlckltZyIsImNyZWF0ZUVsZW1lbnQiLCJldmVudCIsIm9wYWNpdHkiLCJyZW1vdmVBdHRyaWJ1dGUiLCJsYXp5QmFja2dyb3VuZCIsIm9iamVjdEZpdCIsImNvbnRhaW5zIiwiY29udGFpbmVyV2lkdGgiLCJjb250YWluZXJIZWlnaHQiLCJ3aWR0aCIsImhlaWdodCIsImRvUmF0aW8iLCJjUmF0aW8iLCJ0YXJnZXRXaWR0aCIsInRhcmdldEhlaWdodCIsInRlc3QiLCJsZWZ0IiwidG9wIiwidGlsZSIsImNsaWVudFdpZHRoIiwiY2xpZW50SGVpZ2h0IiwiZWxUaWxlIiwiZmluZCIsIml5IiwiaXgiLCJ0aWxlVyIsIk1hdGgiLCJmbG9vciIsInRpbGVIIiwidGlsZVNpemUiLCJtYXgiLCJpbmRleCIsInVuZGVmaW5lZCIsInRtcF9zcmMiLCJkZWNvZGVVUkkiLCJpbmRleE9mIiwicmVwbGFjZUFsbCIsInNldEF0dHJpYnV0ZSIsInJuZCIsInJhbmRvbSIsInRvRml4ZWQiLCJ0cmFuc2l0aW9uIiwiYXBwZW5kIiwiYmFja2dyb3VuZFNpemUiLCJkaXNwYXRjaEV2ZW50IiwiRXZlbnQiLCJodG1sMmNhbnZhc1BsdWdpbiIsIm9wdHMiLCJhcmd1bWVudHMiLCJvbnJlbmRlcmVkQ2FsbGJhY2siLCJjb25zdHJ1Y3RvciIsImVsZW1lbnQiLCJpbnNlcnQiLCJvcHRpb25zIiwiX29iamVjdFNwcmVhZCIsIm9ucmVuZGVyZWQiLCJjYW52YXMiLCJwcmVwZW5kIiwiaHRtbDJjYW52YXMiLCJmbiJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9