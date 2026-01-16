/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/styles/js/tilemap.js"
/*!*************************************!*\
  !*** ./assets/styles/js/tilemap.js ***!
  \*************************************/
() {

function initTileMap() {
  var container = document.querySelectorAll(".google-tilemap");
  var _loop = function _loop() {
      el = container[i];
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
      src = el.getAttribute("data-src");
      signature = el.getAttribute("data-signature");
      tilesize = parseInt(el.getAttribute("data-tilesize")) || null;
      resolution = 2;
      xtiles = parseInt(el.getAttribute("data-xtiles"));
      ytiles = parseInt(el.getAttribute("data-ytiles")); // var missing   = el.getAttribute("data-missing");
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
      width = xtiles * tilesize / resolution;
      height = ytiles * tilesize / resolution;
      tile = objectFit(true, width, height, el.clientWidth, el.clientHeight);
      if (tile.width == width) tile = objectFit(false, width, height, el.clientWidth, el.clientHeight);
      elTile = $(el).find("span");
      for (iy = 0; iy < ytiles; iy++) {
        for (ix = 0; ix < xtiles; ix++) {
          var tileW = Math.floor(tile.width / xtiles);
          var tileH = Math.floor(tile.height / ytiles);
          var tileSize = Math.max(tileW, tileH);
          index = iy * xtiles + ix;
          if (elTile[index] === undefined) {
            elTile[index] = document.createElement("span");
            tmp_src = decodeURI(src);
            if (tmp_src.indexOf("{signature}")) tmp_src = tmp_src.replaceAll("{signature}", signature);else tmp_src += "/" + signature;
            if (tmp_src.indexOf("{id}")) tmp_src = tmp_src.replaceAll("{id}", index);else tmp_src += "/" + index;
            elTile[index].setAttribute("id", el.getAttribute("id") + "_" + index);
            elTile[index].setAttribute("data-background-image", tmp_src); //url('"+missing+"')
            elTile[index].style.opacity = "0";
            rnd = (Math.random() * 0.5).toFixed(2);
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
    },
    el,
    src,
    signature,
    tilesize,
    resolution,
    xtiles,
    ytiles,
    width,
    height,
    tile,
    elTile,
    index,
    tmp_src,
    rnd;
  for (var i = 0; i < container.length; i++) {
    _loop();
  }
}
window.addEventListener('load', initTileMap);
window.addEventListener('resize', initTileMap);

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
      var objectFit = $(element).css("objectFit");
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
        background = getCSS($(options["container"])[0], "backgroundColor");
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
    if(options["left"]) options["left"] = (options["left"].indexOf("%") !== -1) ? $(elements[0]).width() * parseFloat(options["left"]) / 100 : options["left"];
    if(options["top"]) options["top"] = (options["top"].indexOf("%") !== -1) ? $(elements[0]).height() * parseFloat(options["top"]) / 100 : options["top"];
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

/**
 * JQuery Wrapper:
 * - includes some additional parameters (dpi, width/height, object-fit)
 * - post-process features
 */
(function ($) {
  $.fn.html2canvas = function (container = "#html2canvas", opts = {}, onrenderedCallback = null) {

    if(Object.keys(this).length === 0) return;
    if($(container).length < 1) return;

    // Repeat function to prevent loading issues
    function setIntervalN(callback, delay, nrepeat) {

      var x = 0;

      if (nrepeat < 1) return;
      callback();

      nrepeat = nrepeat - 1;
      if (nrepeat < 1) return;

      var intervalID = window.setInterval(function () {
        callback();
        if (++x === nrepeat)
          window.clearInterval(intervalID);
      }, delay);
    }

    // Define #repetition + delay
    var nrepeat = opts["repeat"] || opts["N"] || 1;
    var delay = opts["delay"] || opts["t"] || 100;
    setIntervalN(function () {

      opts["useCORS"] = opts["useCORS"] || true;
      opts["blur"] = opts["blur"] || 0;
      opts["dpi"] = opts["dpi"] || 96 * 2;
      opts["insert"] = opts["insert"] || "append";

      opts["container"] = $(container);
      opts["onrendered"] = onrenderedCallback ||
        function (canvas) {

          $(container + " > canvas").remove();
          if (opts["insert"] == "prepend") $(container).prepend(canvas);
          else $(container).append(canvas);

          $(container + " > canvas").each(function () {

            var filterVal = 'blur(' + opts["blur"] + 'px)';
            var scale = opts["dpi"] / 96 || 1;

            $(this)
              .css('filter', filterVal)
              .css('webkitFilter', filterVal)
              .css('mozFilter', filterVal)
              .css('oFilter', filterVal)
              .css('msFilter', filterVal)
              .css('width', $(this).width() / scale)
              .css('height', $(this).height() / scale);

          });
        };

      // Call html2canvas
      html2canvas(this, opts);

    }.bind(this), delay, nrepeat);

    return this;
  };

})(jQuery);

window.html2canvas_tilemap = function (el) {

  if(Object.keys(el).length === 0) return;
  if(el.length == 0 || el === undefined) return;

  var canvas = $(el)[0];
  if(canvas.tagName != "CANVAS")
    throw "Element passed through html2canvas_tilemap() must be a canvas";

  $(el).css("object-fit", "cover");
  $(el).css("position", "relative");
  $(el).css("top", "50%");
  $(el).css("left", "50%");
  $(el).css("transform", "translate(-50%, -50%)");
  $(el).css("width", "100%");
  $(el).css("height", "100%");

  var src = canvas.getAttribute("data-src");
  var width = parseInt(canvas.getAttribute("width"));
  var height = parseInt(canvas.getAttribute("height"));
  var scale = parseFloat(parseInt($(canvas).css("width"))/width) || 1;

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


})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1Q0FBdUMsUUFBUTtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTs7O0FBR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMENBQTBDLE9BQU87QUFDakQ7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsT0FBTzs7QUFFUCxNQUFNO0FB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RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTs7QUFFUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCLFNBQVM7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdFQUF3RSx3QkFBd0IsMkJBQTJCO0FBQzNILHlDQUF5Qyx3QkFBd0IsMkJBQTJCOztBQUU1Rjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscUNBQXFDO0FBQ3JDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkIsZ0JBQWdCOztBQUUzQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXOztBQUVYO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWtFO0FBQ2xFOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBdUI7O0FBRXZCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0Esd0NBQXdDO0FBQ3hDLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFQSxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYOztBQUVBO0FBQ0EsT0FBTzs7QUFFUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvRUFBb0U7O0FBRXBFO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVztBQUNYOztBQUVBO0FBQ0E7O0FBRUEsS0FBSzs7QUFFTDtBQUNBOztBQUVBLENBQUM7O0FBRUQ7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZ0JBQWdCLGFBQWE7QUFDN0Isa0JBQWtCLGFBQWE7O0FBRS9CO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNkJBQTZCOztBQUU3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2QkFBNkIsVUFBVSxtQ0FBbUMsVUFBVTtBQUNwRjtBQUNBLDZCQUE2QixHQUFHLG1DQUFtQyxHQUFHO0FBQ3RFOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQSx1QkFBdUIsdUJBQXVCOztBQUU5QztBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7O0FBR0E7Ozs7Ozs7VUNwckdBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDNUJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7Ozs7Ozs7Ozs7Ozs7O0FDTjhCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3N0eWxlcy9qcy90aWxlbWFwLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZ2xpdGNoci9odG1sMmNhbnZhcy9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL2Fzc2V0cy9tYXBzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGluaXRUaWxlTWFwKCkge1xuXG4gIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdvb2dsZS10aWxlbWFwXCIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRhaW5lci5sZW5ndGg7IGkrKykge1xuXG4gICAgdmFyIGVsID0gY29udGFpbmVyW2ldO1xuXG4gICAgaWYoZWwudGFnTmFtZSAhPSBcIkRJVlwiKVxuICAgICAgdGhyb3cgXCJFbGVtZW50IHBhc3NlZCB0aHJvdWdoIGdtX3RpbGVtYXAoKSBtdXN0IGJlIGEgZGl2XCI7XG5cbiAgICBpZiAoZWwgPT0gZG9jdW1lbnQpIGVsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgIGlmIChlbCA9PSB3aW5kb3cpIGVsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgIFxuICAgICQoZWwpLmNzcyhcIm9iamVjdC1maXRcIiwgXCJjb3ZlclwiKTtcbiAgICAkKGVsKS5jc3MoXCJwb3NpdGlvblwiLCBcInJlbGF0aXZlXCIpO1xuICAgICQoZWwpLmNzcyhcInRvcFwiLCBcIjUwJVwiKTtcbiAgICAkKGVsKS5jc3MoXCJsZWZ0XCIsIFwiNTAlXCIpO1xuICAgICQoZWwpLmNzcyhcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgtNTAlLCAtNTAlKVwiKTtcbiAgICAkKGVsKS5jc3MoXCJ3aWR0aFwiLCBcIjEwMCVcIik7XG4gICAgJChlbCkuY3NzKFwiaGVpZ2h0XCIsIFwiMTAwJVwiKTtcblxuICAgIHZhciBzcmMgPSBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNyY1wiKTtcbiAgICB2YXIgc2lnbmF0dXJlID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1zaWduYXR1cmVcIik7XG4gICAgdmFyIHRpbGVzaXplICA9IHBhcnNlSW50KGVsLmdldEF0dHJpYnV0ZShcImRhdGEtdGlsZXNpemVcIikpIHx8IG51bGw7XG4gICAgdmFyIHJlc29sdXRpb24gPSAyO1xuICAgIHZhciB4dGlsZXMgICAgPSBwYXJzZUludChlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXh0aWxlc1wiKSk7XG4gICAgdmFyIHl0aWxlcyAgICA9IHBhcnNlSW50KGVsLmdldEF0dHJpYnV0ZShcImRhdGEteXRpbGVzXCIpKTtcbiAgICAvLyB2YXIgbWlzc2luZyAgID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1taXNzaW5nXCIpO1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImxhenlsb2FkLmdtX3RpbGVtYXBcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBsYXp5QmFja2dyb3VuZHMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtYmFja2dyb3VuZC1pbWFnZV1cIik7XG5cbiAgICAgIGlmIChcIkludGVyc2VjdGlvbk9ic2VydmVyXCIgaW4gd2luZG93ICYmIFwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeVwiIGluIHdpbmRvdyAmJiBcImludGVyc2VjdGlvblJhdGlvXCIgaW4gd2luZG93LkludGVyc2VjdGlvbk9ic2VydmVyRW50cnkucHJvdG90eXBlKSB7XG4gICAgICAgIGxldCBsYXp5QmFja2dyb3VuZE9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKGZ1bmN0aW9uKGVudHJpZXMsIG9ic2VydmVyKSB7XG4gICAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcblxuICAgICAgICAgICAgICBpZihlbnRyeS50YXJnZXQuZGF0YXNldC5iYWNrZ3JvdW5kSW1hZ2UpIHtcblxuICAgICAgICAgICAgICAgIGxldCBwcmVsb2FkZXJJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZXJJbWcuc3JjID0gZW50cnkudGFyZ2V0LmRhdGFzZXQuYmFja2dyb3VuZEltYWdlO1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZXJJbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIChldmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgZW50cnkudGFyZ2V0LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKCdcIitldmVudC50YXJnZXQuc3JjK1wiJylcIjtcbiAgICAgICAgICAgICAgICAgICAgICBlbnRyeS50YXJnZXQuc3R5bGUub3BhY2l0eSAgID0gXCIxXCI7XG4gICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVySW1nID0gbnVsbDsgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBlbnRyeS50YXJnZXQucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1iYWNrZ3JvdW5kLWltYWdlXCIpOyAgICBcbiAgICAgICAgICAgICAgbGF6eUJhY2tncm91bmRPYnNlcnZlci51bm9ic2VydmUoZW50cnkudGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF6eUJhY2tncm91bmRzLmZvckVhY2goZnVuY3Rpb24obGF6eUJhY2tncm91bmQpIHtcbiAgICAgICAgICBsYXp5QmFja2dyb3VuZE9ic2VydmVyLm9ic2VydmUobGF6eUJhY2tncm91bmQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIFxuICAgIGZ1bmN0aW9uIG9iamVjdEZpdChjb250YWlucyAvKiB0cnVlID0gY29udGFpbiwgZmFsc2UgPSBjb3ZlciAqLywgY29udGFpbmVyV2lkdGgsIGNvbnRhaW5lckhlaWdodCwgd2lkdGgsIGhlaWdodCl7XG5cbiAgICAgIHZhciBkb1JhdGlvID0gd2lkdGggLyBoZWlnaHQ7XG4gICAgICB2YXIgY1JhdGlvID0gY29udGFpbmVyV2lkdGggLyBjb250YWluZXJIZWlnaHQ7XG4gICAgICB2YXIgdGFyZ2V0V2lkdGggPSAwO1xuICAgICAgdmFyIHRhcmdldEhlaWdodCA9IDA7XG4gICAgICB2YXIgdGVzdCA9IGNvbnRhaW5zID8gKGRvUmF0aW8gPiBjUmF0aW8pIDogKGRvUmF0aW8gPCBjUmF0aW8pO1xuXG4gICAgICBpZiAodGVzdCkge1xuICAgICAgICAgIHRhcmdldFdpZHRoID0gY29udGFpbmVyV2lkdGg7XG4gICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gdGFyZ2V0V2lkdGggLyBkb1JhdGlvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRIZWlnaHQgPSBjb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgdGFyZ2V0V2lkdGggPSB0YXJnZXRIZWlnaHQgKiBkb1JhdGlvO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAgIHdpZHRoOiB0YXJnZXRXaWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHRhcmdldEhlaWdodCxcbiAgICAgICAgICBsZWZ0OiAoY29udGFpbnMgPyAtMSA6IDEpICogKGNvbnRhaW5lcldpZHRoIC0gdGFyZ2V0V2lkdGgpIC8gMixcbiAgICAgICAgICB0b3A6IChjb250YWlucyA/IC0xIDogMSkgKiAoY29udGFpbmVySGVpZ2h0IC0gdGFyZ2V0SGVpZ2h0KSAvIDJcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHdpZHRoICA9IHh0aWxlcyp0aWxlc2l6ZS9yZXNvbHV0aW9uO1xuICAgIHZhciBoZWlnaHQgPSB5dGlsZXMqdGlsZXNpemUvcmVzb2x1dGlvbjtcblxuICAgIHZhciB0aWxlID0gb2JqZWN0Rml0KHRydWUsIHdpZHRoLCBoZWlnaHQsIGVsLmNsaWVudFdpZHRoLCBlbC5jbGllbnRIZWlnaHQpO1xuICAgIGlmKHRpbGUud2lkdGggPT0gd2lkdGgpIHRpbGUgPSBvYmplY3RGaXQoZmFsc2UsIHdpZHRoLCBoZWlnaHQsIGVsLmNsaWVudFdpZHRoLCBlbC5jbGllbnRIZWlnaHQpO1xuICAgIFxuICAgIHZhciBlbFRpbGUgPSAkKGVsKS5maW5kKFwic3BhblwiKVxuICAgIGZvcihpeSA9IDA7IGl5IDwgeXRpbGVzOyBpeSsrKSB7XG4gICAgXG4gICAgICBmb3IoaXggPSAwOyBpeCA8IHh0aWxlczsgaXgrKykge1xuXG4gICAgICAgIGNvbnN0IHRpbGVXID0gTWF0aC5mbG9vcih0aWxlLndpZHRoICAvIHh0aWxlcyk7XG4gICAgICAgIGNvbnN0IHRpbGVIID0gTWF0aC5mbG9vcih0aWxlLmhlaWdodCAvIHl0aWxlcyk7XG4gICAgICAgIGNvbnN0IHRpbGVTaXplID0gTWF0aC5tYXgodGlsZVcsIHRpbGVIKTtcbiAgICAgICAgdmFyIGluZGV4ID0gaXkqeHRpbGVzICsgaXg7XG5cbiAgICAgICAgaWYgKGVsVGlsZVtpbmRleF0gPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICBlbFRpbGVbaW5kZXhdID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG5cbiAgICAgICAgICAgIHZhciB0bXBfc3JjID0gZGVjb2RlVVJJKHNyYyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHRtcF9zcmMuaW5kZXhPZihcIntzaWduYXR1cmV9XCIpKSB0bXBfc3JjID0gdG1wX3NyYy5yZXBsYWNlQWxsKFwie3NpZ25hdHVyZX1cIiwgc2lnbmF0dXJlKTtcbiAgICAgICAgICAgIGVsc2UgdG1wX3NyYyArPSBcIi9cIiArIHNpZ25hdHVyZTtcbiAgICAgICAgICAgIGlmKHRtcF9zcmMuaW5kZXhPZihcIntpZH1cIikpIHRtcF9zcmMgPSB0bXBfc3JjLnJlcGxhY2VBbGwoXCJ7aWR9XCIsIGluZGV4KTtcbiAgICAgICAgICAgIGVsc2UgdG1wX3NyYyArPSBcIi9cIiArIGluZGV4O1xuXG4gICAgICAgICAgICBlbFRpbGVbaW5kZXhdLnNldEF0dHJpYnV0ZShcImlkXCIsIGVsLmdldEF0dHJpYnV0ZShcImlkXCIpK1wiX1wiK2luZGV4KTtcbiAgICAgICAgICAgIGVsVGlsZVtpbmRleF0uc2V0QXR0cmlidXRlKFwiZGF0YS1iYWNrZ3JvdW5kLWltYWdlXCIsIHRtcF9zcmMpOyAvL3VybCgnXCIrbWlzc2luZytcIicpXG4gICAgICAgICAgICBlbFRpbGVbaW5kZXhdLnN0eWxlLm9wYWNpdHkgICA9IFwiMFwiO1xuXG4gICAgICAgICAgICB2YXIgcm5kID0gKE1hdGgucmFuZG9tKCkqMC41KS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgZWxUaWxlW2luZGV4XS5zdHlsZS50cmFuc2l0aW9uICAgPSBcIm9wYWNpdHkgMC41cyBlYXNlIFwiK3JuZCtcInNcIjtcbiAgICAgICAgICAgIGVsLmFwcGVuZChlbFRpbGVbaW5kZXhdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aWxlLmxlZnQgKyBpeCAqIHRpbGVTaXplO1xuICAgICAgICBjb25zdCB0b3AgID0gdGlsZS50b3AgICsgaXkgKiB0aWxlU2l6ZTtcbiAgICAgICAgY29uc3Qgd2lkdGggID0gKGl4ID09PSB4dGlsZXMgLSAxKSA/IHRpbGUud2lkdGggIC0gdGlsZVNpemUgKiBpeDogdGlsZVNpemU7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IChpeSA9PT0geXRpbGVzIC0gMSkgPyB0aWxlLmhlaWdodCAtIHRpbGVTaXplICogaXk6IHRpbGVTaXplO1xuXG4gICAgICAgIGVsVGlsZVtpbmRleF0uc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICAgIGVsVGlsZVtpbmRleF0uc3R5bGUubGVmdCAgID0gbGVmdCArIFwicHhcIjtcbiAgICAgICAgZWxUaWxlW2luZGV4XS5zdHlsZS50b3AgICAgPSB0b3AgICsgXCJweFwiO1xuICAgICAgICBlbFRpbGVbaW5kZXhdLnN0eWxlLndpZHRoICA9ICh3aWR0aCAgKyAwLjEpICsgXCJweFwiO1xuICAgICAgICBlbFRpbGVbaW5kZXhdLnN0eWxlLmhlaWdodCA9IChoZWlnaHQgKyAwLjEpICsgXCJweFwiO1xuICAgICAgICBlbFRpbGVbaW5kZXhdLnN0eWxlLmJhY2tncm91bmRTaXplID0gKHdpZHRoICArIDAuMSkgKyBcInB4IFwiICsgKGhlaWdodCArIDAuMSkgKyBcInB4XCI7XG4gICAgICAgIFxuICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImxhenlsb2FkLmdtX3RpbGVtYXBcIikpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGluaXRUaWxlTWFwKTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbml0VGlsZU1hcCk7XG4iLCIvKlxuICBodG1sMmNhbnZhcy1kcGkgMC40LjkgPGh0dHA6Ly9odG1sMmNhbnZhcy5oZXJ0emVuLmNvbT5cbiAgQ29weXJpZ2h0IChjKSAyMDIwIE5pa2xhcyB2b24gSGVydHplblxuXG4gIFJlbGVhc2VkIHVuZGVyIE1JVCBMaWNlbnNlXG4qL1xuXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBfaHRtbDJjYW52YXMgPSB7fSxcbiAgICBwcmV2aW91c0VsZW1lbnQsXG4gICAgY29tcHV0ZWRDU1M7XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwgPSB7fTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC5sb2cgPSBmdW5jdGlvbiAoYSkge1xuICAgIGlmIChfaHRtbDJjYW52YXMubG9nZ2luZyAmJiB3aW5kb3cuY29uc29sZSAmJiB3aW5kb3cuY29uc29sZS5sb2cpIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlLmxvZyhhKTtcbiAgICB9XG4gIH07XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwudHJpbVRleHQgPSAoZnVuY3Rpb24gKGlzTmF0aXZlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgcmV0dXJuIGlzTmF0aXZlID8gaXNOYXRpdmUuYXBwbHkoaW5wdXQpIDogKChpbnB1dCB8fCAnJykgKyAnJykucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgIH07XG4gIH0pKFN0cmluZy5wcm90b3R5cGUudHJpbSk7XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwuYXNGbG9hdCA9IGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQodik7XG4gIH07XG5cbiAgKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBUT0RPOiBzdXBwb3J0IGFsbCBwb3NzaWJsZSBsZW5ndGggdmFsdWVzXG4gICAgdmFyIFRFWFRfU0hBRE9XX1BST1BFUlRZID0gLygocmdiYXxyZ2IpXFwoW15cXCldK1xcKShcXHMtP1xcZCtweCl7MCx9KS9nO1xuICAgIHZhciBURVhUX1NIQURPV19WQUxVRVMgPSAvKC0/XFxkK3B4KXwoIy4rKXwocmdiXFwoLitcXCkpfChyZ2JhXFwoLitcXCkpL2c7XG4gICAgX2h0bWwyY2FudmFzLlV0aWwucGFyc2VUZXh0U2hhZG93cyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZSA9PT0gJ25vbmUnKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgLy8gZmluZCBtdWx0aXBsZSBzaGFkb3cgZGVjbGFyYXRpb25zXG4gICAgICB2YXIgc2hhZG93cyA9IHZhbHVlLm1hdGNoKFRFWFRfU0hBRE9XX1BST1BFUlRZKSxcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IHNoYWRvd3MgJiYgKGkgPCBzaGFkb3dzLmxlbmd0aCk7IGkrKykge1xuICAgICAgICB2YXIgcyA9IHNoYWRvd3NbaV0ubWF0Y2goVEVYVF9TSEFET1dfVkFMVUVTKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICBjb2xvcjogc1swXSxcbiAgICAgICAgICBvZmZzZXRYOiBzWzFdID8gc1sxXS5yZXBsYWNlKCdweCcsICcnKSA6IDAsXG4gICAgICAgICAgb2Zmc2V0WTogc1syXSA/IHNbMl0ucmVwbGFjZSgncHgnLCAnJykgOiAwLFxuICAgICAgICAgIGJsdXI6IHNbM10gPyBzWzNdLnJlcGxhY2UoJ3B4JywgJycpIDogMFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG4gIH0pKCk7XG5cblxuICBfaHRtbDJjYW52YXMuVXRpbC5wYXJzZUJhY2tncm91bmRJbWFnZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciB3aGl0ZXNwYWNlID0gJyBcXHJcXG5cXHQnLFxuICAgICAgbWV0aG9kLCBkZWZpbml0aW9uLCBwcmVmaXgsIHByZWZpeF9pLCBibG9jaywgcmVzdWx0cyA9IFtdLFxuICAgICAgYywgbW9kZSA9IDAsXG4gICAgICBudW1QYXJlbiA9IDAsXG4gICAgICBxdW90ZSwgYXJncztcblxuICAgIHZhciBhcHBlbmRSZXN1bHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAobWV0aG9kKSB7XG4gICAgICAgIGlmIChkZWZpbml0aW9uLnN1YnN0cigwLCAxKSA9PT0gJ1wiJykge1xuICAgICAgICAgIGRlZmluaXRpb24gPSBkZWZpbml0aW9uLnN1YnN0cigxLCBkZWZpbml0aW9uLmxlbmd0aCAtIDIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWZpbml0aW9uKSB7XG4gICAgICAgICAgYXJncy5wdXNoKGRlZmluaXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZXRob2Quc3Vic3RyKDAsIDEpID09PSAnLScgJiZcbiAgICAgICAgICAocHJlZml4X2kgPSBtZXRob2QuaW5kZXhPZignLScsIDEpICsgMSkgPiAwKSB7XG4gICAgICAgICAgcHJlZml4ID0gbWV0aG9kLnN1YnN0cigwLCBwcmVmaXhfaSk7XG4gICAgICAgICAgbWV0aG9kID0gbWV0aG9kLnN1YnN0cihwcmVmaXhfaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICBwcmVmaXg6IHByZWZpeCxcbiAgICAgICAgICBtZXRob2Q6IG1ldGhvZC50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgIHZhbHVlOiBibG9jayxcbiAgICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYXJncyA9IFtdOyAvL2ZvciBzb21lIG9kZCByZWFzb24sIHNldHRpbmcgLmxlbmd0aCA9IDAgZGlkbid0IHdvcmsgaW4gc2FmYXJpXG4gICAgICBtZXRob2QgPVxuICAgICAgICBwcmVmaXggPVxuICAgICAgICBkZWZpbml0aW9uID1cbiAgICAgICAgYmxvY2sgPSAnJztcbiAgICB9O1xuXG4gICAgYXBwZW5kUmVzdWx0KCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGlpID0gdmFsdWUubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgYyA9IHZhbHVlW2ldO1xuICAgICAgaWYgKG1vZGUgPT09IDAgJiYgd2hpdGVzcGFjZS5pbmRleE9mKGMpID4gLTEpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKGMpIHtcbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgIGlmICghcXVvdGUpIHtcbiAgICAgICAgICAgIHF1b3RlID0gYztcbiAgICAgICAgICB9IGVsc2UgaWYgKHF1b3RlID09PSBjKSB7XG4gICAgICAgICAgICBxdW90ZSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJygnOlxuICAgICAgICAgIGlmIChxdW90ZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIGlmIChtb2RlID09PSAwKSB7XG4gICAgICAgICAgICBtb2RlID0gMTtcbiAgICAgICAgICAgIGJsb2NrICs9IGM7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbnVtUGFyZW4rKztcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnKSc6XG4gICAgICAgICAgaWYgKHF1b3RlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IDEpIHtcbiAgICAgICAgICAgIGlmIChudW1QYXJlbiA9PT0gMCkge1xuICAgICAgICAgICAgICBtb2RlID0gMDtcbiAgICAgICAgICAgICAgYmxvY2sgKz0gYztcbiAgICAgICAgICAgICAgYXBwZW5kUmVzdWx0KCk7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbnVtUGFyZW4tLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnLCc6XG4gICAgICAgICAgaWYgKHF1b3RlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IDApIHtcbiAgICAgICAgICAgIGFwcGVuZFJlc3VsdCgpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChtb2RlID09PSAxKSB7XG4gICAgICAgICAgICBpZiAobnVtUGFyZW4gPT09IDAgJiYgIW1ldGhvZC5tYXRjaCgvXnVybCQvaSkpIHtcbiAgICAgICAgICAgICAgYXJncy5wdXNoKGRlZmluaXRpb24pO1xuICAgICAgICAgICAgICBkZWZpbml0aW9uID0gJyc7XG4gICAgICAgICAgICAgIGJsb2NrICs9IGM7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgYmxvY2sgKz0gYztcbiAgICAgIGlmIChtb2RlID09PSAwKSB7XG4gICAgICAgIG1ldGhvZCArPSBjO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmaW5pdGlvbiArPSBjO1xuICAgICAgfVxuICAgIH1cbiAgICBhcHBlbmRSZXN1bHQoKTtcblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLkJvdW5kcyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgdmFyIGNsaWVudFJlY3QsIGJvdW5kcyA9IHt9O1xuXG4gICAgaWYgKGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KSB7XG4gICAgICBjbGllbnRSZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgLy8gVE9ETyBhZGQgc2Nyb2xsIHBvc2l0aW9uIHRvIGJvdW5kcywgc28gbm8gc2Nyb2xsaW5nIG9mIHdpbmRvdyBuZWNlc3NhcnlcbiAgICAgIGJvdW5kcy50b3AgPSBjbGllbnRSZWN0LnRvcDtcbiAgICAgIGJvdW5kcy5ib3R0b20gPSBjbGllbnRSZWN0LmJvdHRvbSB8fCAoY2xpZW50UmVjdC50b3AgKyBjbGllbnRSZWN0LmhlaWdodCk7XG4gICAgICBib3VuZHMubGVmdCA9IGNsaWVudFJlY3QubGVmdDtcblxuICAgICAgYm91bmRzLndpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgIGJvdW5kcy5oZWlnaHQgPSBlbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4gYm91bmRzO1xuICB9O1xuXG4gIC8vIFRPRE8gaWRlYWxseSwgd2UnZCB3YW50IGV2ZXJ5dGhpbmcgdG8gZ28gdGhyb3VnaCB0aGlzIGZ1bmN0aW9uIGluc3RlYWQgb2YgVXRpbC5Cb3VuZHMsXG4gIC8vIGJ1dCB3b3VsZCByZXF1aXJlIGZ1cnRoZXIgd29yayB0byBjYWxjdWxhdGUgdGhlIGNvcnJlY3QgcG9zaXRpb25zIGZvciBlbGVtZW50cyB3aXRoIG9mZnNldFBhcmVudHNcbiAgX2h0bWwyY2FudmFzLlV0aWwuT2Zmc2V0Qm91bmRzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICB2YXIgcGFyZW50ID0gZWxlbWVudC5vZmZzZXRQYXJlbnQgPyBfaHRtbDJjYW52YXMuVXRpbC5PZmZzZXRCb3VuZHMoZWxlbWVudC5vZmZzZXRQYXJlbnQpIDoge1xuICAgICAgdG9wOiAwLFxuICAgICAgbGVmdDogMFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgdG9wOiBlbGVtZW50Lm9mZnNldFRvcCArIHBhcmVudC50b3AsXG4gICAgICBib3R0b206IGVsZW1lbnQub2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQgKyBwYXJlbnQudG9wLFxuICAgICAgbGVmdDogZWxlbWVudC5vZmZzZXRMZWZ0ICsgcGFyZW50LmxlZnQsXG4gICAgICB3aWR0aDogZWxlbWVudC5vZmZzZXRXaWR0aCxcbiAgICAgIGhlaWdodDogZWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHRvUFgoZWxlbWVudCwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIHZhciByc0xlZnQgPSBlbGVtZW50LnJ1bnRpbWVTdHlsZSAmJiBlbGVtZW50LnJ1bnRpbWVTdHlsZVthdHRyaWJ1dGVdLFxuICAgICAgbGVmdCxcbiAgICAgIHN0eWxlID0gZWxlbWVudC5zdHlsZTtcblxuICAgIC8vIENoZWNrIGlmIHdlIGFyZSBub3QgZGVhbGluZyB3aXRoIHBpeGVscywgKE9wZXJhIGhhcyBpc3N1ZXMgd2l0aCB0aGlzKVxuICAgIC8vIFBvcnRlZCBmcm9tIGpRdWVyeSBjc3MuanNcbiAgICAvLyBGcm9tIHRoZSBhd2Vzb21lIGhhY2sgYnkgRGVhbiBFZHdhcmRzXG4gICAgLy8gaHR0cDovL2VyaWsuZWFlLm5ldC9hcmNoaXZlcy8yMDA3LzA3LzI3LzE4LjU0LjE1LyNjb21tZW50LTEwMjI5MVxuXG4gICAgLy8gSWYgd2UncmUgbm90IGRlYWxpbmcgd2l0aCBhIHJlZ3VsYXIgcGl4ZWwgbnVtYmVyXG4gICAgLy8gYnV0IGEgbnVtYmVyIHRoYXQgaGFzIGEgd2VpcmQgZW5kaW5nLCB3ZSBuZWVkIHRvIGNvbnZlcnQgaXQgdG8gcGl4ZWxzXG5cbiAgICBpZiAoIS9eLT9bMC05XStcXC4/WzAtOV0qKD86cHgpPyQvaS50ZXN0KHZhbHVlKSAmJiAvXi0/XFxkLy50ZXN0KHZhbHVlKSkge1xuICAgICAgLy8gUmVtZW1iZXIgdGhlIG9yaWdpbmFsIHZhbHVlc1xuICAgICAgbGVmdCA9IHN0eWxlLmxlZnQ7XG5cbiAgICAgIC8vIFB1dCBpbiB0aGUgbmV3IHZhbHVlcyB0byBnZXQgYSBjb21wdXRlZCB2YWx1ZSBvdXRcbiAgICAgIGlmIChyc0xlZnQpIHtcbiAgICAgICAgZWxlbWVudC5ydW50aW1lU3R5bGUubGVmdCA9IGVsZW1lbnQuY3VycmVudFN0eWxlLmxlZnQ7XG4gICAgICB9XG4gICAgICBzdHlsZS5sZWZ0ID0gYXR0cmlidXRlID09PSBcImZvbnRTaXplXCIgPyBcIjFlbVwiIDogKHZhbHVlIHx8IDApO1xuICAgICAgdmFsdWUgPSBzdHlsZS5waXhlbExlZnQgKyBcInB4XCI7XG5cbiAgICAgIC8vIFJldmVydCB0aGUgY2hhbmdlZCB2YWx1ZXNcbiAgICAgIHN0eWxlLmxlZnQgPSBsZWZ0O1xuICAgICAgaWYgKHJzTGVmdCkge1xuICAgICAgICBlbGVtZW50LnJ1bnRpbWVTdHlsZS5sZWZ0ID0gcnNMZWZ0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghL14odGhpbnxtZWRpdW18dGhpY2spJC9pLnRlc3QodmFsdWUpKSB7XG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChwYXJzZUZsb2F0KHZhbHVlKSkgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gYXNJbnQodmFsKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KHZhbCwgMTApO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VCYWNrZ3JvdW5kU2l6ZVBvc2l0aW9uKHZhbHVlLCBlbGVtZW50LCBhdHRyaWJ1dGUsIGluZGV4KSB7XG4gICAgdmFsdWUgPSAodmFsdWUgfHwgJycpLnNwbGl0KCcsJyk7XG4gICAgdmFsdWUgPSB2YWx1ZVtpbmRleCB8fCAwXSB8fCB2YWx1ZVswXSB8fCAnYXV0byc7XG4gICAgdmFsdWUgPSBfaHRtbDJjYW52YXMuVXRpbC50cmltVGV4dCh2YWx1ZSkuc3BsaXQoJyAnKTtcblxuICAgIGlmIChhdHRyaWJ1dGUgPT09ICdiYWNrZ3JvdW5kU2l6ZScgJiYgKHZhbHVlWzBdICYmIHZhbHVlWzBdLm1hdGNoKC9eKGNvdmVyfGNvbnRhaW58YXV0bykkLykpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlWzBdID0gKHZhbHVlWzBdLmluZGV4T2YoXCIlXCIpID09PSAtMSkgPyB0b1BYKGVsZW1lbnQsIGF0dHJpYnV0ZSArIFwiWFwiLCB2YWx1ZVswXSkgOiB2YWx1ZVswXTtcbiAgICAgIGlmICh2YWx1ZVsxXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChhdHRyaWJ1dGUgPT09ICdiYWNrZ3JvdW5kU2l6ZScpIHtcbiAgICAgICAgICB2YWx1ZVsxXSA9ICdhdXRvJztcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSUUgOSBkb2Vzbid0IHJldHVybiBkb3VibGUgZGlnaXQgYWx3YXlzXG4gICAgICAgICAgdmFsdWVbMV0gPSB2YWx1ZVswXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFsdWVbMV0gPSAodmFsdWVbMV0uaW5kZXhPZihcIiVcIikgPT09IC0xKSA/IHRvUFgoZWxlbWVudCwgYXR0cmlidXRlICsgXCJZXCIsIHZhbHVlWzFdKSA6IHZhbHVlWzFdO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBfaHRtbDJjYW52YXMuVXRpbC5nZXRDU1MgPSBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlLCBpbmRleCkge1xuICAgIGlmIChwcmV2aW91c0VsZW1lbnQgIT09IGVsZW1lbnQpIHtcbiAgICAgIGNvbXB1dGVkQ1NTID0gZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50LCBudWxsKTtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSBjb21wdXRlZENTU1thdHRyaWJ1dGVdO1xuXG4gICAgaWYgKC9eYmFja2dyb3VuZChTaXplfFBvc2l0aW9uKSQvLnRlc3QoYXR0cmlidXRlKSkge1xuICAgICAgcmV0dXJuIHBhcnNlQmFja2dyb3VuZFNpemVQb3NpdGlvbih2YWx1ZSwgZWxlbWVudCwgYXR0cmlidXRlLCBpbmRleCk7XG4gICAgfSBlbHNlIGlmICgvYm9yZGVyKFRvcHxCb3R0b20pKExlZnR8UmlnaHQpUmFkaXVzLy50ZXN0KGF0dHJpYnV0ZSkpIHtcbiAgICAgIHZhciBhcnIgPSB2YWx1ZS5zcGxpdChcIiBcIik7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgIGFyclsxXSA9IGFyclswXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcnIubWFwKGFzSW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwucmVzaXplQm91bmRzID0gZnVuY3Rpb24gKGN1cnJlbnRfd2lkdGgsIGN1cnJlbnRfaGVpZ2h0LCB0YXJnZXRfd2lkdGgsIHRhcmdldF9oZWlnaHQsIHN0cmV0Y2hfbW9kZSkge1xuICAgIHZhciB0YXJnZXRfcmF0aW8gPSB0YXJnZXRfd2lkdGggLyB0YXJnZXRfaGVpZ2h0LFxuICAgICAgY3VycmVudF9yYXRpbyA9IGN1cnJlbnRfd2lkdGggLyBjdXJyZW50X2hlaWdodCxcbiAgICAgIG91dHB1dF93aWR0aCwgb3V0cHV0X2hlaWdodCwgb3V0cHV0X2xlZnQsIG91dHB1dF90b3A7XG5cbiAgICAgIG91dHB1dF9sZWZ0ID0gMDtcbiAgICAgIG91dHB1dF90b3AgID0gMDtcblxuICAgICAgaWYgKCFzdHJldGNoX21vZGUgfHwgc3RyZXRjaF9tb2RlID09PSAnYXV0bycpIHtcbiAgICAgIG91dHB1dF93aWR0aCA9IHRhcmdldF93aWR0aDtcbiAgICAgIG91dHB1dF9oZWlnaHQgPSB0YXJnZXRfaGVpZ2h0O1xuICAgIH0gZWxzZSBpZiAodGFyZ2V0X3JhdGlvIDwgY3VycmVudF9yYXRpbyBeIHN0cmV0Y2hfbW9kZSA9PT0gJ2NvbnRhaW4nKSB7XG4gICAgICBvdXRwdXRfaGVpZ2h0ID0gdGFyZ2V0X2hlaWdodDtcbiAgICAgIG91dHB1dF93aWR0aCA9IHRhcmdldF9oZWlnaHQgKiBjdXJyZW50X3JhdGlvO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXRfd2lkdGggPSB0YXJnZXRfd2lkdGg7XG4gICAgICBvdXRwdXRfaGVpZ2h0ID0gdGFyZ2V0X3dpZHRoIC8gY3VycmVudF9yYXRpbztcbiAgICB9XG5cbiAgICBvdXRwdXRfbGVmdCA9ICh0YXJnZXRfd2lkdGgtb3V0cHV0X3dpZHRoKS8yO1xuICAgIG91dHB1dF90b3AgPSAodGFyZ2V0X2hlaWdodC1vdXRwdXRfaGVpZ2h0KS8yO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoIDogb3V0cHV0X3dpZHRoLFxuICAgICAgaGVpZ2h0OiBvdXRwdXRfaGVpZ2h0LFxuICAgICAgbGVmdCAgOiBvdXRwdXRfbGVmdCxcbiAgICAgIHRvcCAgIDogb3V0cHV0X3RvcFxuICAgIH07XG4gIH07XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwuQmFja2dyb3VuZFBvc2l0aW9uID0gZnVuY3Rpb24gKGVsZW1lbnQsIGJvdW5kcywgaW1hZ2UsIGltYWdlSW5kZXgsIGJhY2tncm91bmRTaXplKSB7XG4gICAgdmFyIGJhY2tncm91bmRQb3NpdGlvbiA9IF9odG1sMmNhbnZhcy5VdGlsLmdldENTUyhlbGVtZW50LCAnYmFja2dyb3VuZFBvc2l0aW9uJywgaW1hZ2VJbmRleCksXG4gICAgICBsZWZ0UG9zaXRpb24sXG4gICAgICB0b3BQb3NpdGlvbjtcbiAgICBpZiAoYmFja2dyb3VuZFBvc2l0aW9uLmxlbmd0aCA9PT0gMSkge1xuICAgICAgYmFja2dyb3VuZFBvc2l0aW9uID0gW2JhY2tncm91bmRQb3NpdGlvblswXSwgYmFja2dyb3VuZFBvc2l0aW9uWzBdXTtcbiAgICB9XG4gICAgaWYgKGJhY2tncm91bmRQb3NpdGlvblswXS50b1N0cmluZygpLmluZGV4T2YoXCIlXCIpICE9PSAtMSkge1xuICAgICAgbGVmdFBvc2l0aW9uID0gKGJvdW5kcy53aWR0aCAtIChiYWNrZ3JvdW5kU2l6ZSB8fCBpbWFnZSkud2lkdGgpICogKHBhcnNlRmxvYXQoYmFja2dyb3VuZFBvc2l0aW9uWzBdKSAvIDEwMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IHBhcnNlSW50KGJhY2tncm91bmRQb3NpdGlvblswXSwgMTApO1xuICAgIH1cbiAgICBpZiAoYmFja2dyb3VuZFBvc2l0aW9uWzFdID09PSAnYXV0bycpIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gbGVmdFBvc2l0aW9uIC8gaW1hZ2Uud2lkdGggKiBpbWFnZS5oZWlnaHQ7XG4gICAgfSBlbHNlIGlmIChiYWNrZ3JvdW5kUG9zaXRpb25bMV0udG9TdHJpbmcoKS5pbmRleE9mKFwiJVwiKSAhPT0gLTEpIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gKGJvdW5kcy5oZWlnaHQgLSAoYmFja2dyb3VuZFNpemUgfHwgaW1hZ2UpLmhlaWdodCkgKiBwYXJzZUZsb2F0KGJhY2tncm91bmRQb3NpdGlvblsxXSkgLyAxMDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvcFBvc2l0aW9uID0gcGFyc2VJbnQoYmFja2dyb3VuZFBvc2l0aW9uWzFdLCAxMCk7XG4gICAgfVxuICAgIGlmIChiYWNrZ3JvdW5kUG9zaXRpb25bMF0gPT09ICdhdXRvJykge1xuICAgICAgbGVmdFBvc2l0aW9uID0gdG9wUG9zaXRpb24gLyBpbWFnZS5oZWlnaHQgKiBpbWFnZS53aWR0aDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQ6IGxlZnRQb3NpdGlvbixcbiAgICAgIHRvcDogdG9wUG9zaXRpb25cbiAgICB9O1xuICB9O1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLkJhY2tncm91bmRTaXplID0gZnVuY3Rpb24gKGVsZW1lbnQsIGJvdW5kcywgaW1hZ2UsIGltYWdlSW5kZXgpIHtcbiAgICB2YXIgYmFja2dyb3VuZFNpemUgPSBfaHRtbDJjYW52YXMuVXRpbC5nZXRDU1MoZWxlbWVudCwgJ2JhY2tncm91bmRTaXplJywgaW1hZ2VJbmRleCksXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodDtcblxuICAgIGlmIChiYWNrZ3JvdW5kU2l6ZS5sZW5ndGggPT09IDEpIHtcbiAgICAgIGJhY2tncm91bmRTaXplID0gW2JhY2tncm91bmRTaXplWzBdLCBiYWNrZ3JvdW5kU2l6ZVswXV07XG4gICAgfVxuXG4gICAgaWYgKGJhY2tncm91bmRTaXplWzBdLnRvU3RyaW5nKCkuaW5kZXhPZihcIiVcIikgIT09IC0xKSB7XG4gICAgICB3aWR0aCA9IGJvdW5kcy53aWR0aCAqIHBhcnNlRmxvYXQoYmFja2dyb3VuZFNpemVbMF0pIC8gMTAwO1xuICAgIH0gZWxzZSBpZiAoYmFja2dyb3VuZFNpemVbMF0gPT09ICdhdXRvJykge1xuICAgICAgd2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKC9jb250YWlufGNvdmVyLy50ZXN0KGJhY2tncm91bmRTaXplWzBdKSkge1xuICAgICAgICB2YXIgcmVzaXplZCA9IF9odG1sMmNhbnZhcy5VdGlsLnJlc2l6ZUJvdW5kcyhpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIGJhY2tncm91bmRTaXplWzBdKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB3aWR0aDogcmVzaXplZC53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHJlc2l6ZWQuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aWR0aCA9IHBhcnNlSW50KGJhY2tncm91bmRTaXplWzBdLCAxMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGJhY2tncm91bmRTaXplWzFdID09PSAnYXV0bycpIHtcbiAgICAgIGhlaWdodCA9IHdpZHRoIC8gaW1hZ2Uud2lkdGggKiBpbWFnZS5oZWlnaHQ7XG4gICAgfSBlbHNlIGlmIChiYWNrZ3JvdW5kU2l6ZVsxXS50b1N0cmluZygpLmluZGV4T2YoXCIlXCIpICE9PSAtMSkge1xuICAgICAgaGVpZ2h0ID0gYm91bmRzLmhlaWdodCAqIHBhcnNlRmxvYXQoYmFja2dyb3VuZFNpemVbMV0pIC8gMTAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBoZWlnaHQgPSBwYXJzZUludChiYWNrZ3JvdW5kU2l6ZVsxXSwgMTApO1xuICAgIH1cblxuXG4gICAgaWYgKGJhY2tncm91bmRTaXplWzBdID09PSAnYXV0bycpIHtcbiAgICAgIHdpZHRoID0gaGVpZ2h0IC8gaW1hZ2UuaGVpZ2h0ICogaW1hZ2Uud2lkdGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfTtcbiAgfTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC5FeHRlbmQgPSBmdW5jdGlvbiAob3B0aW9ucywgZGVmYXVsdHMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgaWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBkZWZhdWx0c1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdHM7XG4gIH07XG5cblxuICAvKlxuICAgKiBEZXJpdmVkIGZyb20galF1ZXJ5LmNvbnRlbnRzKClcbiAgICogQ29weXJpZ2h0IDIwMTAsIEpvaG4gUmVzaWdcbiAgICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBWZXJzaW9uIDIgbGljZW5zZXMuXG4gICAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAgICovXG4gIF9odG1sMmNhbnZhcy5VdGlsLkNoaWxkcmVuID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICB2YXIgY2hpbGRyZW47XG4gICAgdHJ5IHtcbiAgICAgIGNoaWxkcmVuID0gKGVsZW0ubm9kZU5hbWUgJiYgZWxlbS5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpID09PSBcIklGUkFNRVwiKSA/IGVsZW0uY29udGVudERvY3VtZW50IHx8IGVsZW0uY29udGVudFdpbmRvdy5kb2N1bWVudCA6IChmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgdmFyIHJldCA9IFtdO1xuICAgICAgICBpZiAoYXJyYXkgIT09IG51bGwpIHtcbiAgICAgICAgICAoZnVuY3Rpb24gKGZpcnN0LCBzZWNvbmQpIHtcbiAgICAgICAgICAgIHZhciBpID0gZmlyc3QubGVuZ3RoLFxuICAgICAgICAgICAgICBqID0gMDtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWNvbmQubGVuZ3RoID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIGwgPSBzZWNvbmQubGVuZ3RoOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RbaSsrXSA9IHNlY29uZFtqXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgd2hpbGUgKHNlY29uZFtqXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RbaSsrXSA9IHNlY29uZFtqKytdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZpcnN0Lmxlbmd0aCA9IGk7XG5cbiAgICAgICAgICAgIHJldHVybiBmaXJzdDtcbiAgICAgICAgICB9KShyZXQsIGFycmF5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfSkoZWxlbS5jaGlsZE5vZGVzKTtcblxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICBfaHRtbDJjYW52YXMuVXRpbC5sb2coXCJodG1sMmNhbnZhcy5VdGlsLkNoaWxkcmVuIGZhaWxlZCB3aXRoIGV4Y2VwdGlvbjogXCIgKyBleC5tZXNzYWdlKTtcbiAgICAgIGNoaWxkcmVuID0gW107XG4gICAgfVxuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC5pc1RyYW5zcGFyZW50ID0gZnVuY3Rpb24gKGJhY2tncm91bmRDb2xvcikge1xuICAgIHJldHVybiAoIWJhY2tncm91bmRDb2xvciB8fCBiYWNrZ3JvdW5kQ29sb3IgPT09IFwidHJhbnNwYXJlbnRcIiB8fCBiYWNrZ3JvdW5kQ29sb3IgPT09IFwicmdiYSgwLCAwLCAwLCAwKVwiKTtcbiAgfTtcbiAgX2h0bWwyY2FudmFzLlV0aWwuRm9udCA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZm9udERhdGEgPSB7fTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoZm9udCwgZm9udFNpemUsIGRvYykge1xuICAgICAgaWYgKGZvbnREYXRhW2ZvbnQgKyBcIi1cIiArIGZvbnRTaXplXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBmb250RGF0YVtmb250ICsgXCItXCIgKyBmb250U2l6ZV07XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250YWluZXIgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIGltZyA9IGRvYy5jcmVhdGVFbGVtZW50KCdpbWcnKSxcbiAgICAgICAgc3BhbiA9IGRvYy5jcmVhdGVFbGVtZW50KCdzcGFuJyksXG4gICAgICAgIHNhbXBsZVRleHQgPSAnSGlkZGVuIFRleHQnLFxuICAgICAgICBiYXNlbGluZSxcbiAgICAgICAgbWlkZGxlLFxuICAgICAgICBtZXRyaWNzT2JqO1xuXG4gICAgICBjb250YWluZXIuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICBjb250YWluZXIuc3R5bGUuZm9udEZhbWlseSA9IGZvbnQ7XG4gICAgICBjb250YWluZXIuc3R5bGUuZm9udFNpemUgPSBmb250U2l6ZTtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5tYXJnaW4gPSAwO1xuICAgICAgY29udGFpbmVyLnN0eWxlLnBhZGRpbmcgPSAwO1xuXG4gICAgICBkb2MuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuXG4gICAgICAvLyBodHRwOi8vcHJvYmFibHlwcm9ncmFtbWluZy5jb20vMjAwOS8wMy8xNS90aGUtdGluaWVzdC1naWYtZXZlciAoaGFuZHRpbnl3aGl0ZS5naWYpXG4gICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQkFQLy8vd0FBQUN3QUFBQUFBUUFCQUFBQ0FrUUJBRHM9XCI7XG4gICAgICBpbWcud2lkdGggPSAxO1xuICAgICAgaW1nLmhlaWdodCA9IDE7XG5cbiAgICAgIGltZy5zdHlsZS5tYXJnaW4gPSAwO1xuICAgICAgaW1nLnN0eWxlLnBhZGRpbmcgPSAwO1xuICAgICAgaW1nLnN0eWxlLnZlcnRpY2FsQWxpZ24gPSBcImJhc2VsaW5lXCI7XG5cbiAgICAgIHNwYW4uc3R5bGUuZm9udEZhbWlseSA9IGZvbnQ7XG4gICAgICBzcGFuLnN0eWxlLmZvbnRTaXplID0gZm9udFNpemU7XG4gICAgICBzcGFuLnN0eWxlLm1hcmdpbiA9IDA7XG4gICAgICBzcGFuLnN0eWxlLnBhZGRpbmcgPSAwO1xuXG4gICAgICBzcGFuLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShzYW1wbGVUZXh0KSk7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc3Bhbik7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgIGJhc2VsaW5lID0gKGltZy5vZmZzZXRUb3AgLSBzcGFuLm9mZnNldFRvcCkgKyAxO1xuXG4gICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoc3Bhbik7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKHNhbXBsZVRleHQpKTtcblxuICAgICAgY29udGFpbmVyLnN0eWxlLmxpbmVIZWlnaHQgPSBcIm5vcm1hbFwiO1xuICAgICAgaW1nLnN0eWxlLnZlcnRpY2FsQWxpZ24gPSBcInN1cGVyXCI7XG5cbiAgICAgIG1pZGRsZSA9IChpbWcub2Zmc2V0VG9wIC0gY29udGFpbmVyLm9mZnNldFRvcCkgKyAxO1xuICAgICAgbWV0cmljc09iaiA9IHtcbiAgICAgICAgYmFzZWxpbmU6IGJhc2VsaW5lLFxuICAgICAgICBsaW5lV2lkdGg6IDEsXG4gICAgICAgIG1pZGRsZTogbWlkZGxlXG4gICAgICB9O1xuXG4gICAgICBmb250RGF0YVtmb250ICsgXCItXCIgKyBmb250U2l6ZV0gPSBtZXRyaWNzT2JqO1xuXG4gICAgICBkb2MuYm9keS5yZW1vdmVDaGlsZChjb250YWluZXIpO1xuXG4gICAgICByZXR1cm4gbWV0cmljc09iajtcbiAgICB9O1xuICB9KSgpO1xuXG4gIChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIFV0aWwgPSBfaHRtbDJjYW52YXMuVXRpbCxcbiAgICAgIEdlbmVyYXRlID0ge307XG5cbiAgICBfaHRtbDJjYW52YXMuR2VuZXJhdGUgPSBHZW5lcmF0ZTtcblxuICAgIHZhciByZUdyYWRpZW50cyA9IFtcbiAgICAgIC9eKC13ZWJraXQtbGluZWFyLWdyYWRpZW50KVxcKChbYS16XFxzXSspKFtcXHdcXGRcXC5cXHMsJVxcKFxcKV0rKVxcKSQvLFxuICAgICAgL14oLW8tbGluZWFyLWdyYWRpZW50KVxcKChbYS16XFxzXSspKFtcXHdcXGRcXC5cXHMsJVxcKFxcKV0rKVxcKSQvLFxuICAgICAgL14oLXdlYmtpdC1ncmFkaWVudClcXCgobGluZWFyfHJhZGlhbCksXFxzKCg/OlxcZHsxLDN9JT8pXFxzKD86XFxkezEsM30lPyksXFxzKD86XFxkezEsM30lPylcXHMoPzpcXGR7MSwzfSU/KSkoW1xcd1xcZFxcLlxccywlXFwoXFwpXFwtXSspXFwpJC8sXG4gICAgICAvXigtbW96LWxpbmVhci1ncmFkaWVudClcXCgoKD86XFxkezEsM30lPylcXHMoPzpcXGR7MSwzfSU/KSkoW1xcd1xcZFxcLlxccywlXFwoXFwpXSspXFwpJC8sXG4gICAgICAvXigtd2Via2l0LXJhZGlhbC1ncmFkaWVudClcXCgoKD86XFxkezEsM30lPylcXHMoPzpcXGR7MSwzfSU/KSksXFxzKFxcdyspXFxzKFthLXpcXC1dKykoW1xcd1xcZFxcLlxccywlXFwoXFwpXSspXFwpJC8sXG4gICAgICAvXigtbW96LXJhZGlhbC1ncmFkaWVudClcXCgoKD86XFxkezEsM30lPylcXHMoPzpcXGR7MSwzfSU/KSksXFxzKFxcdyspXFxzPyhbYS16XFwtXSopKFtcXHdcXGRcXC5cXHMsJVxcKFxcKV0rKVxcKSQvLFxuICAgICAgL14oLW8tcmFkaWFsLWdyYWRpZW50KVxcKCgoPzpcXGR7MSwzfSU/KVxccyg/OlxcZHsxLDN9JT8pKSxcXHMoXFx3KylcXHMoW2EtelxcLV0rKShbXFx3XFxkXFwuXFxzLCVcXChcXCldKylcXCkkL1xuICAgIF07XG5cbiAgICAvKlxuICAgICAqIFRPRE86IEFkZCBJRTEwIHZlbmRvciBwcmVmaXggKC1tcykgc3VwcG9ydFxuICAgICAqIFRPRE86IEFkZCBXM0MgZ3JhZGllbnQgKGxpbmVhci1ncmFkaWVudCkgc3VwcG9ydFxuICAgICAqIFRPRE86IEFkZCBvbGQgV2Via2l0IC13ZWJraXQtZ3JhZGllbnQocmFkaWFsLCAuLi4pIHN1cHBvcnRcbiAgICAgKiBUT0RPOiBNYXliZSBzb21lIFJlZ0V4cCBvcHRpbWl6YXRpb25zIGFyZSBwb3NzaWJsZSA7bylcbiAgICAgKi9cbiAgICBHZW5lcmF0ZS5wYXJzZUdyYWRpZW50ID0gZnVuY3Rpb24gKGNzcywgYm91bmRzKSB7XG4gICAgICB2YXIgZ3JhZGllbnQsIGksIGxlbiA9IHJlR3JhZGllbnRzLmxlbmd0aCxcbiAgICAgICAgbTEsIHN0b3AsIG0yLCBtMkxlbiwgc3RlcCwgbTMsIHRsLCB0ciwgYnIsIGJsO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgbTEgPSBjc3MubWF0Y2gocmVHcmFkaWVudHNbaV0pO1xuICAgICAgICBpZiAobTEpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobTEpIHtcbiAgICAgICAgc3dpdGNoIChtMVsxXSkge1xuICAgICAgICAgIGNhc2UgJy13ZWJraXQtbGluZWFyLWdyYWRpZW50JzpcbiAgICAgICAgICBjYXNlICctby1saW5lYXItZ3JhZGllbnQnOlxuXG4gICAgICAgICAgICBncmFkaWVudCA9IHtcbiAgICAgICAgICAgICAgdHlwZTogJ2xpbmVhcicsXG4gICAgICAgICAgICAgIHgwOiBudWxsLFxuICAgICAgICAgICAgICB5MDogbnVsbCxcbiAgICAgICAgICAgICAgeDE6IG51bGwsXG4gICAgICAgICAgICAgIHkxOiBudWxsLFxuICAgICAgICAgICAgICBjb2xvclN0b3BzOiBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gZ2V0IGNvb3JkaW5hdGVzXG4gICAgICAgICAgICBtMiA9IG0xWzJdLm1hdGNoKC9cXHcrL2cpO1xuICAgICAgICAgICAgaWYgKG0yKSB7XG4gICAgICAgICAgICAgIG0yTGVuID0gbTIubGVuZ3RoO1xuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbTJMZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAobTJbaV0pIHtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnkwID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueTEgPSBib3VuZHMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC54MCA9IGJvdW5kcy53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueDEgPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueTAgPSBib3VuZHMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC55MSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueDAgPSAwO1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC54MSA9IGJvdW5kcy53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ3JhZGllbnQueDAgPT09IG51bGwgJiYgZ3JhZGllbnQueDEgPT09IG51bGwpIHsgLy8gY2VudGVyXG4gICAgICAgICAgICAgIGdyYWRpZW50LngwID0gZ3JhZGllbnQueDEgPSBib3VuZHMud2lkdGggLyAyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGdyYWRpZW50LnkwID09PSBudWxsICYmIGdyYWRpZW50LnkxID09PSBudWxsKSB7IC8vIGNlbnRlclxuICAgICAgICAgICAgICBncmFkaWVudC55MCA9IGdyYWRpZW50LnkxID0gYm91bmRzLmhlaWdodCAvIDI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGdldCBjb2xvcnMgYW5kIHN0b3BzXG4gICAgICAgICAgICBtMiA9IG0xWzNdLm1hdGNoKC8oKD86cmdifHJnYmEpXFwoXFxkezEsM30sXFxzXFxkezEsM30sXFxzXFxkezEsM30oPzosXFxzWzAtOVxcLl0rKT9cXCkoPzpcXHNcXGR7MSwzfSg/OiV8cHgpKT8pKy9nKTtcbiAgICAgICAgICAgIGlmIChtMikge1xuICAgICAgICAgICAgICBtMkxlbiA9IG0yLmxlbmd0aDtcbiAgICAgICAgICAgICAgc3RlcCA9IDEgLyBNYXRoLm1heChtMkxlbiAtIDEsIDEpO1xuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbTJMZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIG0zID0gbTJbaV0ubWF0Y2goLygoPzpyZ2J8cmdiYSlcXChcXGR7MSwzfSxcXHNcXGR7MSwzfSxcXHNcXGR7MSwzfSg/OixcXHNbMC05XFwuXSspP1xcKSlcXHMqKFxcZHsxLDN9KT8oJXxweCk/Lyk7XG4gICAgICAgICAgICAgICAgaWYgKG0zWzJdKSB7XG4gICAgICAgICAgICAgICAgICBzdG9wID0gcGFyc2VGbG9hdChtM1syXSk7XG4gICAgICAgICAgICAgICAgICBpZiAobTNbM10gPT09ICclJykge1xuICAgICAgICAgICAgICAgICAgICBzdG9wIC89IDEwMDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHB4IC0gc3R1cGlkIG9wZXJhXG4gICAgICAgICAgICAgICAgICAgIHN0b3AgLz0gYm91bmRzLndpZHRoO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzdG9wID0gaSAqIHN0ZXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyYWRpZW50LmNvbG9yU3RvcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogbTNbMV0sXG4gICAgICAgICAgICAgICAgICBzdG9wOiBzdG9wXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnLXdlYmtpdC1ncmFkaWVudCc6XG5cbiAgICAgICAgICAgIGdyYWRpZW50ID0ge1xuICAgICAgICAgICAgICB0eXBlOiBtMVsyXSA9PT0gJ3JhZGlhbCcgPyAnY2lyY2xlJyA6IG0xWzJdLCAvLyBUT0RPOiBBZGQgcmFkaWFsIGdyYWRpZW50IHN1cHBvcnQgZm9yIG9sZGVyIG1vemlsbGEgZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgeDA6IDAsXG4gICAgICAgICAgICAgIHkwOiAwLFxuICAgICAgICAgICAgICB4MTogMCxcbiAgICAgICAgICAgICAgeTE6IDAsXG4gICAgICAgICAgICAgIGNvbG9yU3RvcHM6IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBnZXQgY29vcmRpbmF0ZXNcbiAgICAgICAgICAgIG0yID0gbTFbM10ubWF0Y2goLyhcXGR7MSwzfSklP1xccyhcXGR7MSwzfSklPyxcXHMoXFxkezEsM30pJT9cXHMoXFxkezEsM30pJT8vKTtcbiAgICAgICAgICAgIGlmIChtMikge1xuICAgICAgICAgICAgICBncmFkaWVudC54MCA9IChtMlsxXSAqIGJvdW5kcy53aWR0aCkgLyAxMDA7XG4gICAgICAgICAgICAgIGdyYWRpZW50LnkwID0gKG0yWzJdICogYm91bmRzLmhlaWdodCkgLyAxMDA7XG4gICAgICAgICAgICAgIGdyYWRpZW50LngxID0gKG0yWzNdICogYm91bmRzLndpZHRoKSAvIDEwMDtcbiAgICAgICAgICAgICAgZ3JhZGllbnQueTEgPSAobTJbNF0gKiBib3VuZHMuaGVpZ2h0KSAvIDEwMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZ2V0IGNvbG9ycyBhbmQgc3RvcHNcbiAgICAgICAgICAgIG0yID0gbTFbNF0ubWF0Y2goLygoPzpmcm9tfHRvfGNvbG9yLXN0b3ApXFwoKD86WzAtOVxcLl0rLFxccyk/KD86cmdifHJnYmEpXFwoXFxkezEsM30sXFxzXFxkezEsM30sXFxzXFxkezEsM30oPzosXFxzWzAtOVxcLl0rKT9cXClcXCkpKy9nKTtcbiAgICAgICAgICAgIGlmIChtMikge1xuICAgICAgICAgICAgICBtMkxlbiA9IG0yLmxlbmd0aDtcbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG0yTGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBtMyA9IG0yW2ldLm1hdGNoKC8oZnJvbXx0b3xjb2xvci1zdG9wKVxcKChbMC05XFwuXSspPyg/OixcXHMpPygoPzpyZ2J8cmdiYSlcXChcXGR7MSwzfSxcXHNcXGR7MSwzfSxcXHNcXGR7MSwzfSg/OixcXHNbMC05XFwuXSspP1xcKSlcXCkvKTtcbiAgICAgICAgICAgICAgICBzdG9wID0gcGFyc2VGbG9hdChtM1syXSk7XG4gICAgICAgICAgICAgICAgaWYgKG0zWzFdID09PSAnZnJvbScpIHtcbiAgICAgICAgICAgICAgICAgIHN0b3AgPSAwLjA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtM1sxXSA9PT0gJ3RvJykge1xuICAgICAgICAgICAgICAgICAgc3RvcCA9IDEuMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3JhZGllbnQuY29sb3JTdG9wcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBtM1szXSxcbiAgICAgICAgICAgICAgICAgIHN0b3A6IHN0b3BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICctbW96LWxpbmVhci1ncmFkaWVudCc6XG5cbiAgICAgICAgICAgIGdyYWRpZW50ID0ge1xuICAgICAgICAgICAgICB0eXBlOiAnbGluZWFyJyxcbiAgICAgICAgICAgICAgeDA6IDAsXG4gICAgICAgICAgICAgIHkwOiAwLFxuICAgICAgICAgICAgICB4MTogMCxcbiAgICAgICAgICAgICAgeTE6IDAsXG4gICAgICAgICAgICAgIGNvbG9yU3RvcHM6IFtdXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBnZXQgY29vcmRpbmF0ZXNcbiAgICAgICAgICAgIG0yID0gbTFbMl0ubWF0Y2goLyhcXGR7MSwzfSklP1xccyhcXGR7MSwzfSklPy8pO1xuXG4gICAgICAgICAgICAvLyBtMlsxXSA9PSAwJSAgIC0+IGxlZnRcbiAgICAgICAgICAgIC8vIG0yWzFdID09IDUwJSAgLT4gY2VudGVyXG4gICAgICAgICAgICAvLyBtMlsxXSA9PSAxMDAlIC0+IHJpZ2h0XG5cbiAgICAgICAgICAgIC8vIG0yWzJdID09IDAlICAgLT4gdG9wXG4gICAgICAgICAgICAvLyBtMlsyXSA9PSA1MCUgIC0+IGNlbnRlclxuICAgICAgICAgICAgLy8gbTJbMl0gPT0gMTAwJSAtPiBib3R0b21cblxuICAgICAgICAgICAgaWYgKG0yKSB7XG4gICAgICAgICAgICAgIGdyYWRpZW50LngwID0gKG0yWzFdICogYm91bmRzLndpZHRoKSAvIDEwMDtcbiAgICAgICAgICAgICAgZ3JhZGllbnQueTAgPSAobTJbMl0gKiBib3VuZHMuaGVpZ2h0KSAvIDEwMDtcbiAgICAgICAgICAgICAgZ3JhZGllbnQueDEgPSBib3VuZHMud2lkdGggLSBncmFkaWVudC54MDtcbiAgICAgICAgICAgICAgZ3JhZGllbnQueTEgPSBib3VuZHMuaGVpZ2h0IC0gZ3JhZGllbnQueTA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGdldCBjb2xvcnMgYW5kIHN0b3BzXG4gICAgICAgICAgICBtMiA9IG0xWzNdLm1hdGNoKC8oKD86cmdifHJnYmEpXFwoXFxkezEsM30sXFxzXFxkezEsM30sXFxzXFxkezEsM30oPzosXFxzWzAtOVxcLl0rKT9cXCkoPzpcXHNcXGR7MSwzfSUpPykrL2cpO1xuICAgICAgICAgICAgaWYgKG0yKSB7XG4gICAgICAgICAgICAgIG0yTGVuID0gbTIubGVuZ3RoO1xuICAgICAgICAgICAgICBzdGVwID0gMSAvIE1hdGgubWF4KG0yTGVuIC0gMSwgMSk7XG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtMkxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbTMgPSBtMltpXS5tYXRjaCgvKCg/OnJnYnxyZ2JhKVxcKFxcZHsxLDN9LFxcc1xcZHsxLDN9LFxcc1xcZHsxLDN9KD86LFxcc1swLTlcXC5dKyk/XFwpKVxccyooXFxkezEsM30pPyglKT8vKTtcbiAgICAgICAgICAgICAgICBpZiAobTNbMl0pIHtcbiAgICAgICAgICAgICAgICAgIHN0b3AgPSBwYXJzZUZsb2F0KG0zWzJdKTtcbiAgICAgICAgICAgICAgICAgIGlmIChtM1szXSkgeyAvLyBwZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgICAgIHN0b3AgLz0gMTAwO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzdG9wID0gaSAqIHN0ZXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyYWRpZW50LmNvbG9yU3RvcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogbTNbMV0sXG4gICAgICAgICAgICAgICAgICBzdG9wOiBzdG9wXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnLXdlYmtpdC1yYWRpYWwtZ3JhZGllbnQnOlxuICAgICAgICAgIGNhc2UgJy1tb3otcmFkaWFsLWdyYWRpZW50JzpcbiAgICAgICAgICBjYXNlICctby1yYWRpYWwtZ3JhZGllbnQnOlxuXG4gICAgICAgICAgICBncmFkaWVudCA9IHtcbiAgICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgIHgwOiAwLFxuICAgICAgICAgICAgICB5MDogMCxcbiAgICAgICAgICAgICAgeDE6IGJvdW5kcy53aWR0aCxcbiAgICAgICAgICAgICAgeTE6IGJvdW5kcy5oZWlnaHQsXG4gICAgICAgICAgICAgIGN4OiAwLFxuICAgICAgICAgICAgICBjeTogMCxcbiAgICAgICAgICAgICAgcng6IDAsXG4gICAgICAgICAgICAgIHJ5OiAwLFxuICAgICAgICAgICAgICBjb2xvclN0b3BzOiBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gY2VudGVyXG4gICAgICAgICAgICBtMiA9IG0xWzJdLm1hdGNoKC8oXFxkezEsM30pJT9cXHMoXFxkezEsM30pJT8vKTtcbiAgICAgICAgICAgIGlmIChtMikge1xuICAgICAgICAgICAgICBncmFkaWVudC5jeCA9IChtMlsxXSAqIGJvdW5kcy53aWR0aCkgLyAxMDA7XG4gICAgICAgICAgICAgIGdyYWRpZW50LmN5ID0gKG0yWzJdICogYm91bmRzLmhlaWdodCkgLyAxMDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNpemVcbiAgICAgICAgICAgIG0yID0gbTFbM10ubWF0Y2goL1xcdysvKTtcbiAgICAgICAgICAgIG0zID0gbTFbNF0ubWF0Y2goL1thLXpcXC1dKi8pO1xuICAgICAgICAgICAgaWYgKG0yICYmIG0zKSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAobTNbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdmYXJ0aGVzdC1jb3JuZXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvdmVyJzogLy8gaXMgZXF1aXZhbGVudCB0byBmYXJ0aGVzdC1jb3JuZXJcbiAgICAgICAgICAgICAgICBjYXNlICcnOiAvLyBtb3ppbGxhIHJlbW92ZXMgXCJjb3ZlclwiIGZyb20gZGVmaW5pdGlvbiA6KFxuICAgICAgICAgICAgICAgICAgdGwgPSBNYXRoLnNxcnQoTWF0aC5wb3coZ3JhZGllbnQuY3gsIDIpICsgTWF0aC5wb3coZ3JhZGllbnQuY3ksIDIpKTtcbiAgICAgICAgICAgICAgICAgIHRyID0gTWF0aC5zcXJ0KE1hdGgucG93KGdyYWRpZW50LmN4LCAyKSArIE1hdGgucG93KGdyYWRpZW50LnkxIC0gZ3JhZGllbnQuY3ksIDIpKTtcbiAgICAgICAgICAgICAgICAgIGJyID0gTWF0aC5zcXJ0KE1hdGgucG93KGdyYWRpZW50LngxIC0gZ3JhZGllbnQuY3gsIDIpICsgTWF0aC5wb3coZ3JhZGllbnQueTEgLSBncmFkaWVudC5jeSwgMikpO1xuICAgICAgICAgICAgICAgICAgYmwgPSBNYXRoLnNxcnQoTWF0aC5wb3coZ3JhZGllbnQueDEgLSBncmFkaWVudC5jeCwgMikgKyBNYXRoLnBvdyhncmFkaWVudC5jeSwgMikpO1xuICAgICAgICAgICAgICAgICAgZ3JhZGllbnQucnggPSBncmFkaWVudC5yeSA9IE1hdGgubWF4KHRsLCB0ciwgYnIsIGJsKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Nsb3Nlc3QtY29ybmVyJzpcbiAgICAgICAgICAgICAgICAgIHRsID0gTWF0aC5zcXJ0KE1hdGgucG93KGdyYWRpZW50LmN4LCAyKSArIE1hdGgucG93KGdyYWRpZW50LmN5LCAyKSk7XG4gICAgICAgICAgICAgICAgICB0ciA9IE1hdGguc3FydChNYXRoLnBvdyhncmFkaWVudC5jeCwgMikgKyBNYXRoLnBvdyhncmFkaWVudC55MSAtIGdyYWRpZW50LmN5LCAyKSk7XG4gICAgICAgICAgICAgICAgICBiciA9IE1hdGguc3FydChNYXRoLnBvdyhncmFkaWVudC54MSAtIGdyYWRpZW50LmN4LCAyKSArIE1hdGgucG93KGdyYWRpZW50LnkxIC0gZ3JhZGllbnQuY3ksIDIpKTtcbiAgICAgICAgICAgICAgICAgIGJsID0gTWF0aC5zcXJ0KE1hdGgucG93KGdyYWRpZW50LngxIC0gZ3JhZGllbnQuY3gsIDIpICsgTWF0aC5wb3coZ3JhZGllbnQuY3ksIDIpKTtcbiAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnJ4ID0gZ3JhZGllbnQucnkgPSBNYXRoLm1pbih0bCwgdHIsIGJyLCBibCk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdmYXJ0aGVzdC1zaWRlJzpcbiAgICAgICAgICAgICAgICAgIGlmIChtMlswXSA9PT0gJ2NpcmNsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQucnggPSBncmFkaWVudC5yeSA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmN4LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmN5LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LngxIC0gZ3JhZGllbnQuY3gsXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueTEgLSBncmFkaWVudC5jeVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gZWxsaXBzZVxuXG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnR5cGUgPSBtMlswXTtcblxuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5yeCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmN4LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LngxIC0gZ3JhZGllbnQuY3hcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQucnkgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5jeSxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC55MSAtIGdyYWRpZW50LmN5XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjbG9zZXN0LXNpZGUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbnRhaW4nOiAvLyBpcyBlcXVpdmFsZW50IHRvIGNsb3Nlc3Qtc2lkZVxuICAgICAgICAgICAgICAgICAgaWYgKG0yWzBdID09PSAnY2lyY2xlJykge1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5yeCA9IGdyYWRpZW50LnJ5ID0gTWF0aC5taW4oXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuY3gsXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuY3ksXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueDEgLSBncmFkaWVudC5jeCxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC55MSAtIGdyYWRpZW50LmN5XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBlbGxpcHNlXG5cbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQudHlwZSA9IG0yWzBdO1xuXG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnJ4ID0gTWF0aC5taW4oXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuY3gsXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueDEgLSBncmFkaWVudC5jeFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5yeSA9IE1hdGgubWluKFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmN5LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnkxIC0gZ3JhZGllbnQuY3lcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAvLyBUT0RPOiBhZGQgc3VwcG9ydCBmb3IgXCIzMHB4IDQwcHhcIiBzaXplcyAod2Via2l0IG9ubHkpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29sb3Igc3RvcHNcbiAgICAgICAgICAgIG0yID0gbTFbNV0ubWF0Y2goLygoPzpyZ2J8cmdiYSlcXChcXGR7MSwzfSxcXHNcXGR7MSwzfSxcXHNcXGR7MSwzfSg/OixcXHNbMC05XFwuXSspP1xcKSg/Olxcc1xcZHsxLDN9KD86JXxweCkpPykrL2cpO1xuICAgICAgICAgICAgaWYgKG0yKSB7XG4gICAgICAgICAgICAgIG0yTGVuID0gbTIubGVuZ3RoO1xuICAgICAgICAgICAgICBzdGVwID0gMSAvIE1hdGgubWF4KG0yTGVuIC0gMSwgMSk7XG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtMkxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbTMgPSBtMltpXS5tYXRjaCgvKCg/OnJnYnxyZ2JhKVxcKFxcZHsxLDN9LFxcc1xcZHsxLDN9LFxcc1xcZHsxLDN9KD86LFxcc1swLTlcXC5dKyk/XFwpKVxccyooXFxkezEsM30pPyglfHB4KT8vKTtcbiAgICAgICAgICAgICAgICBpZiAobTNbMl0pIHtcbiAgICAgICAgICAgICAgICAgIHN0b3AgPSBwYXJzZUZsb2F0KG0zWzJdKTtcbiAgICAgICAgICAgICAgICAgIGlmIChtM1szXSA9PT0gJyUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AgLz0gMTAwO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gcHggLSBzdHVwaWQgb3BlcmFcbiAgICAgICAgICAgICAgICAgICAgc3RvcCAvPSBib3VuZHMud2lkdGg7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHN0b3AgPSBpICogc3RlcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3JhZGllbnQuY29sb3JTdG9wcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBtM1sxXSxcbiAgICAgICAgICAgICAgICAgIHN0b3A6IHN0b3BcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGdyYWRpZW50O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBhZGRTY3JvbGxTdG9wcyhncmFkKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGNvbG9yU3RvcCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGdyYWQuYWRkQ29sb3JTdG9wKGNvbG9yU3RvcC5zdG9wLCBjb2xvclN0b3AuY29sb3IpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgVXRpbC5sb2coWydmYWlsZWQgdG8gYWRkIGNvbG9yIHN0b3A6ICcsIGUsICc7IHRyaWVkIHRvIGFkZDogJywgY29sb3JTdG9wXSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgR2VuZXJhdGUuR3JhZGllbnQgPSBmdW5jdGlvbiAoc3JjLCBib3VuZHMpIHtcbiAgICAgIGlmIChib3VuZHMud2lkdGggPT09IDAgfHwgYm91bmRzLmhlaWdodCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgIGdyYWRpZW50LCBncmFkO1xuXG4gICAgICBjYW52YXMud2lkdGggPSBib3VuZHMud2lkdGg7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gYm91bmRzLmhlaWdodDtcblxuICAgICAgLy8gVE9ETzogYWRkIHN1cHBvcnQgZm9yIG11bHRpIGRlZmluZWQgYmFja2dyb3VuZCBncmFkaWVudHNcbiAgICAgIGdyYWRpZW50ID0gX2h0bWwyY2FudmFzLkdlbmVyYXRlLnBhcnNlR3JhZGllbnQoc3JjLCBib3VuZHMpO1xuXG4gICAgICBpZiAoZ3JhZGllbnQpIHtcbiAgICAgICAgc3dpdGNoIChncmFkaWVudC50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnbGluZWFyJzpcbiAgICAgICAgICAgIGdyYWQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoZ3JhZGllbnQueDAsIGdyYWRpZW50LnkwLCBncmFkaWVudC54MSwgZ3JhZGllbnQueTEpO1xuICAgICAgICAgICAgZ3JhZGllbnQuY29sb3JTdG9wcy5mb3JFYWNoKGFkZFNjcm9sbFN0b3BzKGdyYWQpKTtcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICAgICAgICBncmFkID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KGdyYWRpZW50LmN4LCBncmFkaWVudC5jeSwgMCwgZ3JhZGllbnQuY3gsIGdyYWRpZW50LmN5LCBncmFkaWVudC5yeCk7XG4gICAgICAgICAgICBncmFkaWVudC5jb2xvclN0b3BzLmZvckVhY2goYWRkU2Nyb2xsU3RvcHMoZ3JhZCkpO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnZWxsaXBzZSc6XG4gICAgICAgICAgICB2YXIgY2FudmFzUmFkaWFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICAgICAgICAgIGN0eFJhZGlhbCA9IGNhbnZhc1JhZGlhbC5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgICAgICAgICByaSA9IE1hdGgubWF4KGdyYWRpZW50LnJ4LCBncmFkaWVudC5yeSksXG4gICAgICAgICAgICAgIGRpID0gcmkgKiAyO1xuXG4gICAgICAgICAgICBjYW52YXNSYWRpYWwud2lkdGggPSBjYW52YXNSYWRpYWwuaGVpZ2h0ID0gZGk7XG5cbiAgICAgICAgICAgIGdyYWQgPSBjdHhSYWRpYWwuY3JlYXRlUmFkaWFsR3JhZGllbnQoZ3JhZGllbnQucngsIGdyYWRpZW50LnJ5LCAwLCBncmFkaWVudC5yeCwgZ3JhZGllbnQucnksIHJpKTtcbiAgICAgICAgICAgIGdyYWRpZW50LmNvbG9yU3RvcHMuZm9yRWFjaChhZGRTY3JvbGxTdG9wcyhncmFkKSk7XG5cbiAgICAgICAgICAgIGN0eFJhZGlhbC5maWxsU3R5bGUgPSBncmFkO1xuICAgICAgICAgICAgY3R4UmFkaWFsLmZpbGxSZWN0KDAsIDAsIGRpLCBkaSk7XG5cbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBncmFkaWVudC5jb2xvclN0b3BzW2dyYWRpZW50LmNvbG9yU3RvcHMubGVuZ3RoIC0gMV0uY29sb3I7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoY2FudmFzUmFkaWFsLCBncmFkaWVudC5jeCAtIGdyYWRpZW50LnJ4LCBncmFkaWVudC5jeSAtIGdyYWRpZW50LnJ5LCAyICogZ3JhZGllbnQucngsIDIgKiBncmFkaWVudC5yeSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2FudmFzO1xuICAgIH07XG5cbiAgICBHZW5lcmF0ZS5MaXN0QWxwaGEgPSBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgICB2YXIgdG1wID0gXCJcIixcbiAgICAgICAgbW9kdWx1cztcblxuICAgICAgZG8ge1xuICAgICAgICBtb2R1bHVzID0gbnVtYmVyICUgMjY7XG4gICAgICAgIHRtcCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoKG1vZHVsdXMpICsgNjQpICsgdG1wO1xuICAgICAgICBudW1iZXIgPSBudW1iZXIgLyAyNjtcbiAgICAgIH0gd2hpbGUgKChudW1iZXIgKiAyNikgPiAyNik7XG5cbiAgICAgIHJldHVybiB0bXA7XG4gICAgfTtcblxuICAgIEdlbmVyYXRlLkxpc3RSb21hbiA9IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICAgIHZhciByb21hbkFycmF5ID0gW1wiTVwiLCBcIkNNXCIsIFwiRFwiLCBcIkNEXCIsIFwiQ1wiLCBcIlhDXCIsIFwiTFwiLCBcIlhMXCIsIFwiWFwiLCBcIklYXCIsIFwiVlwiLCBcIklWXCIsIFwiSVwiXSxcbiAgICAgICAgZGVjaW1hbCA9IFsxMDAwLCA5MDAsIDUwMCwgNDAwLCAxMDAsIDkwLCA1MCwgNDAsIDEwLCA5LCA1LCA0LCAxXSxcbiAgICAgICAgcm9tYW4gPSBcIlwiLFxuICAgICAgICB2LFxuICAgICAgICBsZW4gPSByb21hbkFycmF5Lmxlbmd0aDtcblxuICAgICAgaWYgKG51bWJlciA8PSAwIHx8IG51bWJlciA+PSA0MDAwKSB7XG4gICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICB9XG5cbiAgICAgIGZvciAodiA9IDA7IHYgPCBsZW47IHYgKz0gMSkge1xuICAgICAgICB3aGlsZSAobnVtYmVyID49IGRlY2ltYWxbdl0pIHtcbiAgICAgICAgICBudW1iZXIgLT0gZGVjaW1hbFt2XTtcbiAgICAgICAgICByb21hbiArPSByb21hbkFycmF5W3ZdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByb21hbjtcbiAgICB9O1xuICB9KSgpO1xuXG4gIGZ1bmN0aW9uIGgyY1JlbmRlckNvbnRleHQod2lkdGgsIGhlaWdodCkge1xuICAgIHZhciBzdG9yYWdlID0gW107XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0b3JhZ2U6IHN0b3JhZ2UsXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgIGNsaXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJjbGlwXCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB0cmFuc2xhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJ0cmFuc2xhdGVcIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZpbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJmaWxsXCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBzYXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwic2F2ZVwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVzdG9yZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcInJlc3RvcmVcIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZpbGxSZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwiZmlsbFJlY3RcIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGNyZWF0ZVBhdHRlcm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJjcmVhdGVQYXR0ZXJuXCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBkcmF3U2hhcGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgc2hhcGUgPSBbXTtcblxuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcImRyYXdTaGFwZVwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBzaGFwZVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1vdmVUbzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2hhcGUucHVzaCh7XG4gICAgICAgICAgICAgIG5hbWU6IFwibW92ZVRvXCIsXG4gICAgICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgbGluZVRvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzaGFwZS5wdXNoKHtcbiAgICAgICAgICAgICAgbmFtZTogXCJsaW5lVG9cIixcbiAgICAgICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmNUbzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2hhcGUucHVzaCh7XG4gICAgICAgICAgICAgIG5hbWU6IFwiYXJjVG9cIixcbiAgICAgICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBiZXppZXJDdXJ2ZVRvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzaGFwZS5wdXNoKHtcbiAgICAgICAgICAgICAgbmFtZTogXCJiZXppZXJDdXJ2ZVRvXCIsXG4gICAgICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcXVhZHJhdGljQ3VydmVUbzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2hhcGUucHVzaCh7XG4gICAgICAgICAgICAgIG5hbWU6IFwicXVhZHJhdGljQ3VydmVUb1wiLFxuICAgICAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIH0sXG4gICAgICBkcmF3SW1hZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJkcmF3SW1hZ2VcIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZpbGxUZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwiZmlsbFRleHRcIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHNldFZhcmlhYmxlOiBmdW5jdGlvbiAodmFyaWFibGUsIHZhbHVlKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJ2YXJpYWJsZVwiLFxuICAgICAgICAgIG5hbWU6IHZhcmlhYmxlLFxuICAgICAgICAgICdhcmd1bWVudHMnOiB2YWx1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgX2h0bWwyY2FudmFzLlBhcnNlID0gZnVuY3Rpb24gKGltYWdlcywgb3B0aW9ucykge1xuXG4gICAgaWYgKG9wdGlvbnMuYXV0b3Njcm9sbCB8fCBmYWxzZSkgd2luZG93LnNjcm9sbCgwLCAwKTtcblxuICAgIHZhciBlbGVtZW50ID0gKChvcHRpb25zLmVsZW1lbnRzID09PSB1bmRlZmluZWQpID8gZG9jdW1lbnQuYm9keSA6IG9wdGlvbnMuZWxlbWVudHNbMF0pLCAvLyBzZWxlY3QgYm9keSBieSBkZWZhdWx0XG4gICAgICBudW1EcmF3cyA9IDAsXG4gICAgICBkb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQsXG4gICAgICBVdGlsID0gX2h0bWwyY2FudmFzLlV0aWwsXG4gICAgICBzdXBwb3J0ID0gVXRpbC5TdXBwb3J0KG9wdGlvbnMsIGRvYyksXG4gICAgICBpZ25vcmVFbGVtZW50c1JlZ0V4cCA9IG5ldyBSZWdFeHAoXCIoXCIgKyBvcHRpb25zLmlnbm9yZUVsZW1lbnRzICsgXCIpXCIpLFxuICAgICAgYm9keSA9IGRvYy5ib2R5LFxuICAgICAgZ2V0Q1NTID0gVXRpbC5nZXRDU1MsXG4gICAgICBwc2V1ZG9IaWRlID0gXCJfX19odG1sMmNhbnZhc19fX3BzZXVkb2VsZW1lbnRcIixcbiAgICAgIGhpZGVQc2V1ZG9FbGVtZW50cyA9IGRvYy5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgaGlkZVBzZXVkb0VsZW1lbnRzLmlubmVySFRNTCA9ICcuJyArIHBzZXVkb0hpZGUgKyAnLWJlZm9yZTpiZWZvcmUgeyBjb250ZW50OiBcIlwiICFpbXBvcnRhbnQ7IGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDsgfScgK1xuICAgICAgJy4nICsgcHNldWRvSGlkZSArICctYWZ0ZXI6YWZ0ZXIgeyBjb250ZW50OiBcIlwiICFpbXBvcnRhbnQ7IGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDsgfSc7XG5cbiAgICBib2R5LmFwcGVuZENoaWxkKGhpZGVQc2V1ZG9FbGVtZW50cyk7XG5cbiAgICBpbWFnZXMgPSBpbWFnZXMgfHwge307XG5cbiAgICBmdW5jdGlvbiBkb2N1bWVudFdpZHRoKCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICBNYXRoLm1heChkb2MuYm9keS5zY3JvbGxXaWR0aCwgZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCksXG4gICAgICAgIE1hdGgubWF4KGRvYy5ib2R5Lm9mZnNldFdpZHRoLCBkb2MuZG9jdW1lbnRFbGVtZW50Lm9mZnNldFdpZHRoKSxcbiAgICAgICAgTWF0aC5tYXgoZG9jLmJvZHkuY2xpZW50V2lkdGgsIGRvYy5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpXG4gICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvY3VtZW50SGVpZ2h0KCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICBNYXRoLm1heChkb2MuYm9keS5zY3JvbGxIZWlnaHQsIGRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KSxcbiAgICAgICAgTWF0aC5tYXgoZG9jLmJvZHkub2Zmc2V0SGVpZ2h0LCBkb2MuZG9jdW1lbnRFbGVtZW50Lm9mZnNldEhlaWdodCksXG4gICAgICAgIE1hdGgubWF4KGRvYy5ib2R5LmNsaWVudEhlaWdodCwgZG9jLmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpXG4gICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldENTU0ludChlbGVtZW50LCBhdHRyaWJ1dGUpIHtcbiAgICAgIHZhciB2YWwgPSBwYXJzZUludChnZXRDU1MoZWxlbWVudCwgYXR0cmlidXRlKSwgMTApO1xuICAgICAgcmV0dXJuIChpc05hTih2YWwpKSA/IDAgOiB2YWw7IC8vIGJvcmRlcnMgaW4gb2xkIElFIGFyZSB0aHJvd2luZyAnbWVkaXVtJyBmb3IgZGVtby5odG1sXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyUmVjdChjdHgsIHgsIHksIHcsIGgsIGJnY29sb3IpIHtcbiAgICAgIGlmIChiZ2NvbG9yICE9PSBcInRyYW5zcGFyZW50XCIpIHtcbiAgICAgICAgY3R4LnNldFZhcmlhYmxlKFwiZmlsbFN0eWxlXCIsIGJnY29sb3IpO1xuICAgICAgICBjdHguZmlsbFJlY3QoeCwgeSwgdywgaCk7XG4gICAgICAgIG51bURyYXdzICs9IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FwaXRhbGl6ZShtLCBwMSwgcDIpIHtcbiAgICAgIGlmIChtLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHAxICsgcDIudG9VcHBlckNhc2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0ZXh0VHJhbnNmb3JtKHRleHQsIHRyYW5zZm9ybSkge1xuICAgICAgc3dpdGNoICh0cmFuc2Zvcm0pIHtcbiAgICAgICAgY2FzZSBcImxvd2VyY2FzZVwiOlxuICAgICAgICAgIHJldHVybiB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNhc2UgXCJjYXBpdGFsaXplXCI6XG4gICAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvKF58XFxzfDp8LXxcXCh8XFwpKShbYS16XSkvZywgY2FwaXRhbGl6ZSk7XG4gICAgICAgIGNhc2UgXCJ1cHBlcmNhc2VcIjpcbiAgICAgICAgICByZXR1cm4gdGV4dC50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vTGV0dGVyU3BhY2luZyhsZXR0ZXJfc3BhY2luZykge1xuICAgICAgcmV0dXJuICgvXihub3JtYWx8bm9uZXwwcHgpJC8udGVzdChsZXR0ZXJfc3BhY2luZykpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdUZXh0KGN1cnJlbnRUZXh0LCB4LCB5LCBjdHgpIHtcbiAgICAgIGlmIChjdXJyZW50VGV4dCAhPT0gbnVsbCAmJiBVdGlsLnRyaW1UZXh0KGN1cnJlbnRUZXh0KS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN0eC5maWxsVGV4dChjdXJyZW50VGV4dCwgeCwgeSk7XG4gICAgICAgIG51bURyYXdzICs9IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0VGV4dFZhcmlhYmxlcyhjdHgsIGVsLCB0ZXh0X2RlY29yYXRpb24sIGNvbG9yKSB7XG4gICAgICB2YXIgYWxpZ24gPSBmYWxzZSxcbiAgICAgICAgYm9sZCA9IGdldENTUyhlbCwgXCJmb250V2VpZ2h0XCIpLFxuICAgICAgICBmYW1pbHkgPSBnZXRDU1MoZWwsIFwiZm9udEZhbWlseVwiKSxcbiAgICAgICAgc2l6ZSA9IGdldENTUyhlbCwgXCJmb250U2l6ZVwiKSxcbiAgICAgICAgc2hhZG93cyA9IFV0aWwucGFyc2VUZXh0U2hhZG93cyhnZXRDU1MoZWwsIFwidGV4dFNoYWRvd1wiKSk7XG5cbiAgICAgIHN3aXRjaCAocGFyc2VJbnQoYm9sZCwgMTApKSB7XG4gICAgICAgIGNhc2UgNDAxOlxuICAgICAgICAgIGJvbGQgPSBcImJvbGRcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MDA6XG4gICAgICAgICAgYm9sZCA9IFwibm9ybWFsXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGN0eC5zZXRWYXJpYWJsZShcImZpbGxTdHlsZVwiLCBjb2xvcik7XG4gICAgICBjdHguc2V0VmFyaWFibGUoXCJmb250XCIsIFtnZXRDU1MoZWwsIFwiZm9udFN0eWxlXCIpLCBnZXRDU1MoZWwsIFwiZm9udFZhcmlhbnRcIiksIGJvbGQsIHNpemUsIGZhbWlseV0uam9pbihcIiBcIikpO1xuICAgICAgY3R4LnNldFZhcmlhYmxlKFwidGV4dEFsaWduXCIsIChhbGlnbikgPyBcInJpZ2h0XCIgOiBcImxlZnRcIik7XG5cbiAgICAgIGlmIChzaGFkb3dzLmxlbmd0aCkge1xuICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IG11bHRpcGxlIHRleHQgc2hhZG93c1xuICAgICAgICAvLyBhcHBseSB0aGUgZmlyc3QgdGV4dCBzaGFkb3dcbiAgICAgICAgY3R4LnNldFZhcmlhYmxlKFwic2hhZG93Q29sb3JcIiwgc2hhZG93c1swXS5jb2xvcik7XG4gICAgICAgIGN0eC5zZXRWYXJpYWJsZShcInNoYWRvd09mZnNldFhcIiwgc2hhZG93c1swXS5vZmZzZXRYKTtcbiAgICAgICAgY3R4LnNldFZhcmlhYmxlKFwic2hhZG93T2Zmc2V0WVwiLCBzaGFkb3dzWzBdLm9mZnNldFkpO1xuICAgICAgICBjdHguc2V0VmFyaWFibGUoXCJzaGFkb3dCbHVyXCIsIHNoYWRvd3NbMF0uYmx1cik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0ZXh0X2RlY29yYXRpb24gIT09IFwibm9uZVwiKSB7XG4gICAgICAgIHJldHVybiBVdGlsLkZvbnQoZmFtaWx5LCBzaXplLCBkb2MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlclRleHREZWNvcmF0aW9uKGN0eCwgdGV4dF9kZWNvcmF0aW9uLCBib3VuZHMsIG1ldHJpY3MsIGNvbG9yKSB7XG4gICAgICBzd2l0Y2ggKHRleHRfZGVjb3JhdGlvbikge1xuICAgICAgICBjYXNlIFwidW5kZXJsaW5lXCI6XG4gICAgICAgICAgLy8gRHJhd3MgYSBsaW5lIGF0IHRoZSBiYXNlbGluZSBvZiB0aGUgZm9udFxuICAgICAgICAgIC8vIFRPRE8gQXMgc29tZSBicm93c2VycyBkaXNwbGF5IHRoZSBsaW5lIGFzIG1vcmUgdGhhbiAxcHggaWYgdGhlIGZvbnQtc2l6ZSBpcyBiaWcsIG5lZWQgdG8gdGFrZSB0aGF0IGludG8gYWNjb3VudCBib3RoIGluIHBvc2l0aW9uIGFuZCBzaXplXG4gICAgICAgICAgcmVuZGVyUmVjdChjdHgsIGJvdW5kcy5sZWZ0LCBNYXRoLnJvdW5kKGJvdW5kcy50b3AgKyBtZXRyaWNzLmJhc2VsaW5lICsgbWV0cmljcy5saW5lV2lkdGgpLCBib3VuZHMud2lkdGgsIDEsIGNvbG9yKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm92ZXJsaW5lXCI6XG4gICAgICAgICAgcmVuZGVyUmVjdChjdHgsIGJvdW5kcy5sZWZ0LCBNYXRoLnJvdW5kKGJvdW5kcy50b3ApLCBib3VuZHMud2lkdGgsIDEsIGNvbG9yKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImxpbmUtdGhyb3VnaFwiOlxuICAgICAgICAgIC8vIFRPRE8gdHJ5IGFuZCBmaW5kIGV4YWN0IHBvc2l0aW9uIGZvciBsaW5lLXRocm91Z2hcbiAgICAgICAgICByZW5kZXJSZWN0KGN0eCwgYm91bmRzLmxlZnQsIE1hdGguY2VpbChib3VuZHMudG9wICsgbWV0cmljcy5taWRkbGUgKyBtZXRyaWNzLmxpbmVXaWR0aCksIGJvdW5kcy53aWR0aCwgMSwgY29sb3IpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFRleHRCb3VuZHMoc3RhdGUsIHRleHQsIHRleHREZWNvcmF0aW9uLCBpc0xhc3QsIHRyYW5zZm9ybSkge1xuICAgICAgdmFyIGJvdW5kcztcbiAgICAgIGlmIChzdXBwb3J0LnJhbmdlQm91bmRzICYmICF0cmFuc2Zvcm0pIHtcbiAgICAgICAgaWYgKHRleHREZWNvcmF0aW9uICE9PSBcIm5vbmVcIiB8fCBVdGlsLnRyaW1UZXh0KHRleHQpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgIGJvdW5kcyA9IHRleHRSYW5nZUJvdW5kcyh0ZXh0LCBzdGF0ZS5ub2RlLCBzdGF0ZS50ZXh0T2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS50ZXh0T2Zmc2V0ICs9IHRleHQubGVuZ3RoO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZS5ub2RlICYmIHR5cGVvZiBzdGF0ZS5ub2RlLm5vZGVWYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICB2YXIgbmV3VGV4dE5vZGUgPSAoaXNMYXN0KSA/IHN0YXRlLm5vZGUuc3BsaXRUZXh0KHRleHQubGVuZ3RoKSA6IG51bGw7XG4gICAgICAgIGJvdW5kcyA9IHRleHRXcmFwcGVyQm91bmRzKHN0YXRlLm5vZGUsIHRyYW5zZm9ybSk7XG4gICAgICAgIHN0YXRlLm5vZGUgPSBuZXdUZXh0Tm9kZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGV4dFJhbmdlQm91bmRzKHRleHQsIHRleHROb2RlLCB0ZXh0T2Zmc2V0KSB7XG4gICAgICB2YXIgcmFuZ2UgPSBkb2MuY3JlYXRlUmFuZ2UoKTtcbiAgICAgIHJhbmdlLnNldFN0YXJ0KHRleHROb2RlLCB0ZXh0T2Zmc2V0KTtcbiAgICAgIHJhbmdlLnNldEVuZCh0ZXh0Tm9kZSwgdGV4dE9mZnNldCArIHRleHQubGVuZ3RoKTtcbiAgICAgIHJldHVybiByYW5nZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0ZXh0V3JhcHBlckJvdW5kcyhvbGRUZXh0Tm9kZSwgdHJhbnNmb3JtKSB7XG4gICAgICB2YXIgcGFyZW50ID0gb2xkVGV4dE5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgd3JhcEVsZW1lbnQgPSBkb2MuY3JlYXRlRWxlbWVudCgnd3JhcHBlcicpLFxuICAgICAgICBiYWNrdXBUZXh0ID0gb2xkVGV4dE5vZGUuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICB3cmFwRWxlbWVudC5hcHBlbmRDaGlsZChvbGRUZXh0Tm9kZS5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgcGFyZW50LnJlcGxhY2VDaGlsZCh3cmFwRWxlbWVudCwgb2xkVGV4dE5vZGUpO1xuXG4gICAgICB2YXIgYm91bmRzID0gdHJhbnNmb3JtID8gVXRpbC5PZmZzZXRCb3VuZHMod3JhcEVsZW1lbnQpIDogVXRpbC5Cb3VuZHMod3JhcEVsZW1lbnQpO1xuICAgICAgcGFyZW50LnJlcGxhY2VDaGlsZChiYWNrdXBUZXh0LCB3cmFwRWxlbWVudCk7XG4gICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlclRleHQoZWwsIHRleHROb2RlLCBzdGFjaykge1xuICAgICAgdmFyIGN0eCA9IHN0YWNrLmN0eCxcbiAgICAgICAgY29sb3IgPSBnZXRDU1MoZWwsIFwiY29sb3JcIiksXG4gICAgICAgIHRleHREZWNvcmF0aW9uID0gZ2V0Q1NTKGVsLCBcInRleHREZWNvcmF0aW9uXCIpLFxuICAgICAgICB0ZXh0QWxpZ24gPSBnZXRDU1MoZWwsIFwidGV4dEFsaWduXCIpLFxuICAgICAgICBtZXRyaWNzLFxuICAgICAgICB0ZXh0TGlzdCxcbiAgICAgICAgc3RhdGUgPSB7XG4gICAgICAgICAgbm9kZTogdGV4dE5vZGUsXG4gICAgICAgICAgdGV4dE9mZnNldDogMFxuICAgICAgICB9O1xuXG4gICAgICBpZiAoVXRpbC50cmltVGV4dCh0ZXh0Tm9kZS5ub2RlVmFsdWUpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGV4dE5vZGUubm9kZVZhbHVlID0gdGV4dFRyYW5zZm9ybSh0ZXh0Tm9kZS5ub2RlVmFsdWUsIGdldENTUyhlbCwgXCJ0ZXh0VHJhbnNmb3JtXCIpKTtcbiAgICAgICAgdGV4dEFsaWduID0gdGV4dEFsaWduLnJlcGxhY2UoW1wiLXdlYmtpdC1hdXRvXCJdLCBbXCJhdXRvXCJdKTtcblxuICAgICAgICB0ZXh0TGlzdCA9ICghb3B0aW9ucy5sZXR0ZXJSZW5kZXJpbmcgJiYgL14obGVmdHxyaWdodHxqdXN0aWZ5fGF1dG8pJC8udGVzdCh0ZXh0QWxpZ24pICYmIG5vTGV0dGVyU3BhY2luZyhnZXRDU1MoZWwsIFwibGV0dGVyU3BhY2luZ1wiKSkpID9cbiAgICAgICAgICB0ZXh0Tm9kZS5ub2RlVmFsdWUuc3BsaXQoLyhcXGJ8ICkvKSA6XG4gICAgICAgICAgdGV4dE5vZGUubm9kZVZhbHVlLnNwbGl0KFwiXCIpO1xuXG4gICAgICAgIG1ldHJpY3MgPSBzZXRUZXh0VmFyaWFibGVzKGN0eCwgZWwsIHRleHREZWNvcmF0aW9uLCBjb2xvcik7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY2hpbmVzZSkge1xuICAgICAgICAgIHRleHRMaXN0LmZvckVhY2goZnVuY3Rpb24gKHdvcmQsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAoLy4qW1xcdTRFMDAtXFx1OUZBNV0uKiQvLnRlc3Qod29yZCkpIHtcbiAgICAgICAgICAgICAgd29yZCA9IHdvcmQuc3BsaXQoXCJcIik7XG4gICAgICAgICAgICAgIHdvcmQudW5zaGlmdChpbmRleCwgMSk7XG4gICAgICAgICAgICAgIHRleHRMaXN0LnNwbGljZS5hcHBseSh0ZXh0TGlzdCwgd29yZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0TGlzdC5mb3JFYWNoKGZ1bmN0aW9uICh0ZXh0LCBpbmRleCkge1xuICAgICAgICAgIHZhciBib3VuZHMgPSBnZXRUZXh0Qm91bmRzKHN0YXRlLCB0ZXh0LCB0ZXh0RGVjb3JhdGlvbiwgKGluZGV4IDwgdGV4dExpc3QubGVuZ3RoIC0gMSksIHN0YWNrLnRyYW5zZm9ybS5tYXRyaXgpO1xuICAgICAgICAgIGlmIChib3VuZHMpIHtcbiAgICAgICAgICAgIGRyYXdUZXh0KHRleHQsIGJvdW5kcy5sZWZ0LCBib3VuZHMuYm90dG9tLCBjdHgpO1xuICAgICAgICAgICAgcmVuZGVyVGV4dERlY29yYXRpb24oY3R4LCB0ZXh0RGVjb3JhdGlvbiwgYm91bmRzLCBtZXRyaWNzLCBjb2xvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaXN0UG9zaXRpb24oZWxlbWVudCwgdmFsKSB7XG4gICAgICB2YXIgYm91bmRFbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJib3VuZGVsZW1lbnRcIiksXG4gICAgICAgIG9yaWdpbmFsVHlwZSxcbiAgICAgICAgYm91bmRzO1xuXG4gICAgICBib3VuZEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lXCI7XG5cbiAgICAgIG9yaWdpbmFsVHlwZSA9IGVsZW1lbnQuc3R5bGUubGlzdFN0eWxlVHlwZTtcbiAgICAgIGVsZW1lbnQuc3R5bGUubGlzdFN0eWxlVHlwZSA9IFwibm9uZVwiO1xuXG4gICAgICBib3VuZEVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKHZhbCkpO1xuXG4gICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShib3VuZEVsZW1lbnQsIGVsZW1lbnQuZmlyc3RDaGlsZCk7XG5cbiAgICAgIGJvdW5kcyA9IFV0aWwuQm91bmRzKGJvdW5kRWxlbWVudCk7XG4gICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKGJvdW5kRWxlbWVudCk7XG4gICAgICBlbGVtZW50LnN0eWxlLmxpc3RTdHlsZVR5cGUgPSBvcmlnaW5hbFR5cGU7XG4gICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVsZW1lbnRJbmRleChlbCkge1xuICAgICAgdmFyIGkgPSAtMSxcbiAgICAgICAgY291bnQgPSAxLFxuICAgICAgICBjaGlsZHMgPSBlbC5wYXJlbnROb2RlLmNoaWxkTm9kZXM7XG5cbiAgICAgIGlmIChlbC5wYXJlbnROb2RlKSB7XG4gICAgICAgIHdoaWxlIChjaGlsZHNbKytpXSAhPT0gZWwpIHtcbiAgICAgICAgICBpZiAoY2hpbGRzW2ldLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdEl0ZW1UZXh0KGVsZW1lbnQsIHR5cGUpIHtcbiAgICAgIHZhciBjdXJyZW50SW5kZXggPSBlbGVtZW50SW5kZXgoZWxlbWVudCksXG4gICAgICAgIHRleHQ7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBcImRlY2ltYWxcIjpcbiAgICAgICAgICB0ZXh0ID0gY3VycmVudEluZGV4O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZGVjaW1hbC1sZWFkaW5nLXplcm9cIjpcbiAgICAgICAgICB0ZXh0ID0gKGN1cnJlbnRJbmRleC50b1N0cmluZygpLmxlbmd0aCA9PT0gMSkgPyBjdXJyZW50SW5kZXggPSBcIjBcIiArIGN1cnJlbnRJbmRleC50b1N0cmluZygpIDogY3VycmVudEluZGV4LnRvU3RyaW5nKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJ1cHBlci1yb21hblwiOlxuICAgICAgICAgIHRleHQgPSBfaHRtbDJjYW52YXMuR2VuZXJhdGUuTGlzdFJvbWFuKGN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJsb3dlci1yb21hblwiOlxuICAgICAgICAgIHRleHQgPSBfaHRtbDJjYW52YXMuR2VuZXJhdGUuTGlzdFJvbWFuKGN1cnJlbnRJbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImxvd2VyLWFscGhhXCI6XG4gICAgICAgICAgdGV4dCA9IF9odG1sMmNhbnZhcy5HZW5lcmF0ZS5MaXN0QWxwaGEoY3VycmVudEluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwidXBwZXItYWxwaGFcIjpcbiAgICAgICAgICB0ZXh0ID0gX2h0bWwyY2FudmFzLkdlbmVyYXRlLkxpc3RBbHBoYShjdXJyZW50SW5kZXgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGV4dCArIFwiLiBcIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJMaXN0SXRlbShlbGVtZW50LCBzdGFjaywgZWxCb3VuZHMpIHtcbiAgICAgIHZhciB4LFxuICAgICAgICB0ZXh0LFxuICAgICAgICBjdHggPSBzdGFjay5jdHgsXG4gICAgICAgIHR5cGUgPSBnZXRDU1MoZWxlbWVudCwgXCJsaXN0U3R5bGVUeXBlXCIpLFxuICAgICAgICBsaXN0Qm91bmRzO1xuXG4gICAgICBpZiAoL14oZGVjaW1hbHxkZWNpbWFsLWxlYWRpbmctemVyb3x1cHBlci1hbHBoYXx1cHBlci1sYXRpbnx1cHBlci1yb21hbnxsb3dlci1hbHBoYXxsb3dlci1ncmVla3xsb3dlci1sYXRpbnxsb3dlci1yb21hbikkL2kudGVzdCh0eXBlKSkge1xuICAgICAgICB0ZXh0ID0gbGlzdEl0ZW1UZXh0KGVsZW1lbnQsIHR5cGUpO1xuICAgICAgICBsaXN0Qm91bmRzID0gbGlzdFBvc2l0aW9uKGVsZW1lbnQsIHRleHQpO1xuICAgICAgICBzZXRUZXh0VmFyaWFibGVzKGN0eCwgZWxlbWVudCwgXCJub25lXCIsIGdldENTUyhlbGVtZW50LCBcImNvbG9yXCIpKTtcblxuICAgICAgICBpZiAoZ2V0Q1NTKGVsZW1lbnQsIFwibGlzdFN0eWxlUG9zaXRpb25cIikgPT09IFwiaW5zaWRlXCIpIHtcbiAgICAgICAgICBjdHguc2V0VmFyaWFibGUoXCJ0ZXh0QWxpZ25cIiwgXCJsZWZ0XCIpO1xuICAgICAgICAgIHggPSBlbEJvdW5kcy5sZWZ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRyYXdUZXh0KHRleHQsIHgsIGxpc3RCb3VuZHMuYm90dG9tLCBjdHgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRJbWFnZShzcmMpIHtcbiAgICAgIHZhciBpbWcgPSBpbWFnZXNbc3JjXTtcbiAgICAgIHJldHVybiAoaW1nICYmIGltZy5zdWNjZWVkZWQgPT09IHRydWUpID8gaW1nLmltZyA6IGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsaXBCb3VuZHMoc3JjLCBkc3QpIHtcbiAgICAgIHZhciB4ID0gTWF0aC5tYXgoc3JjLmxlZnQsIGRzdC5sZWZ0KSxcbiAgICAgICAgeSA9IE1hdGgubWF4KHNyYy50b3AsIGRzdC50b3ApLFxuICAgICAgICB4MiA9IE1hdGgubWluKChzcmMubGVmdCArIHNyYy53aWR0aCksIChkc3QubGVmdCArIGRzdC53aWR0aCkpLFxuICAgICAgICB5MiA9IE1hdGgubWluKChzcmMudG9wICsgc3JjLmhlaWdodCksIChkc3QudG9wICsgZHN0LmhlaWdodCkpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiB4LFxuICAgICAgICB0b3A6IHksXG4gICAgICAgIHdpZHRoOiB4MiAtIHgsXG4gICAgICAgIGhlaWdodDogeTIgLSB5XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFooZWxlbWVudCwgc3RhY2ssIHBhcmVudFN0YWNrKSB7XG4gICAgICB2YXIgbmV3Q29udGV4dCxcbiAgICAgICAgaXNQb3NpdGlvbmVkID0gc3RhY2suY3NzUG9zaXRpb24gIT09ICdzdGF0aWMnLFxuICAgICAgICB6SW5kZXggPSBpc1Bvc2l0aW9uZWQgPyBnZXRDU1MoZWxlbWVudCwgJ3pJbmRleCcpIDogJ2F1dG8nLFxuICAgICAgICBvcGFjaXR5ID0gZ2V0Q1NTKGVsZW1lbnQsICdvcGFjaXR5JyksXG4gICAgICAgIGlzRmxvYXRlZCA9IGdldENTUyhlbGVtZW50LCAnY3NzRmxvYXQnKSAhPT0gJ25vbmUnO1xuXG4gICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9HdWlkZS9DU1MvVW5kZXJzdGFuZGluZ196X2luZGV4L1RoZV9zdGFja2luZ19jb250ZXh0XG4gICAgICAvLyBXaGVuIGEgbmV3IHN0YWNraW5nIGNvbnRleHQgc2hvdWxkIGJlIGNyZWF0ZWQ6XG4gICAgICAvLyB0aGUgcm9vdCBlbGVtZW50IChIVE1MKSxcbiAgICAgIC8vIHBvc2l0aW9uZWQgKGFic29sdXRlbHkgb3IgcmVsYXRpdmVseSkgd2l0aCBhIHotaW5kZXggdmFsdWUgb3RoZXIgdGhhbiBcImF1dG9cIixcbiAgICAgIC8vIGVsZW1lbnRzIHdpdGggYW4gb3BhY2l0eSB2YWx1ZSBsZXNzIHRoYW4gMS4gKFNlZSB0aGUgc3BlY2lmaWNhdGlvbiBmb3Igb3BhY2l0eSksXG4gICAgICAvLyBvbiBtb2JpbGUgV2ViS2l0IGFuZCBDaHJvbWUgMjIrLCBwb3NpdGlvbjogZml4ZWQgYWx3YXlzIGNyZWF0ZXMgYSBuZXcgc3RhY2tpbmcgY29udGV4dCwgZXZlbiB3aGVuIHotaW5kZXggaXMgXCJhdXRvXCIgKFNlZSB0aGlzIHBvc3QpXG5cbiAgICAgIHN0YWNrLnpJbmRleCA9IG5ld0NvbnRleHQgPSBoMmN6Q29udGV4dCh6SW5kZXgpO1xuICAgICAgbmV3Q29udGV4dC5pc1Bvc2l0aW9uZWQgPSBpc1Bvc2l0aW9uZWQ7XG4gICAgICBuZXdDb250ZXh0LmlzRmxvYXRlZCA9IGlzRmxvYXRlZDtcbiAgICAgIG5ld0NvbnRleHQub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgICBuZXdDb250ZXh0Lm93blN0YWNraW5nID0gKHpJbmRleCAhPT0gJ2F1dG8nIHx8IG9wYWNpdHkgPCAxKTtcblxuICAgICAgaWYgKHBhcmVudFN0YWNrKSB7XG4gICAgICAgIHBhcmVudFN0YWNrLnpJbmRleC5jaGlsZHJlbi5wdXNoKHN0YWNrKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJJbWFnZShjdHgsIGVsZW1lbnQsIGltYWdlLCBib3VuZHMsIGJvcmRlcnMpIHtcblxuICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gZ2V0Q1NTSW50KGVsZW1lbnQsICdwYWRkaW5nTGVmdCcpLFxuICAgICAgICBwYWRkaW5nVG9wID0gZ2V0Q1NTSW50KGVsZW1lbnQsICdwYWRkaW5nVG9wJyksXG4gICAgICAgIHBhZGRpbmdSaWdodCA9IGdldENTU0ludChlbGVtZW50LCAncGFkZGluZ1JpZ2h0JyksXG4gICAgICAgIHBhZGRpbmdCb3R0b20gPSBnZXRDU1NJbnQoZWxlbWVudCwgJ3BhZGRpbmdCb3R0b20nKTtcblxuICAgICAgdmFyIG9mZnNldFRvcCAgPSBvcHRpb25zW1widG9wXCJdICB8fCAwO1xuICAgICAgdmFyIG9mZnNldExlZnQgPSBvcHRpb25zW1wibGVmdFwiXSB8fCAwO1xuXG4gICAgICAvLyBSZXNpemUgaW1hZ2UgYmFzZWQgb24gb2JqZWN0Rml0XG4gICAgICB2YXIgb2JqZWN0Rml0ID0gJChlbGVtZW50KS5jc3MoXCJvYmplY3RGaXRcIik7XG4gICAgICBpZiAoL2NvbnRhaW58Y292ZXIvLnRlc3Qob2JqZWN0Rml0KSkge1xuICAgICAgICB2YXIgcmVzaXplZEJvdW5kcyA9IF9odG1sMmNhbnZhcy5VdGlsLnJlc2l6ZUJvdW5kcyhpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIG9iamVjdEZpdCk7XG4gICAgICAgIGJvdW5kcy53aWR0aCAgPSByZXNpemVkQm91bmRzLndpZHRoO1xuICAgICAgICBib3VuZHMuaGVpZ2h0ID0gcmVzaXplZEJvdW5kcy5oZWlnaHQ7XG4gICAgICAgIG9mZnNldExlZnQgKz0gcmVzaXplZEJvdW5kcy5sZWZ0O1xuICAgICAgICBvZmZzZXRUb3AgICs9IHJlc2l6ZWRCb3VuZHMudG9wO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3ggPSAwO1xuICAgICAgdmFyIHN5ID0gMDtcbiAgICAgIHZhciBzdyA9IGltYWdlLndpZHRoO1xuICAgICAgdmFyIHNoID0gaW1hZ2UuaGVpZ2h0O1xuXG4gICAgICB2YXIgZHggPSBib3VuZHMubGVmdCArIHBhZGRpbmdMZWZ0ICsgYm9yZGVyc1szXS53aWR0aCArIG9mZnNldExlZnQ7XG4gICAgICB2YXIgZHkgPSBib3VuZHMudG9wICsgcGFkZGluZ1RvcCArIGJvcmRlcnNbMF0ud2lkdGggKyBvZmZzZXRUb3A7XG4gICAgICB2YXIgZHcgPSBib3VuZHMud2lkdGggLSAoYm9yZGVyc1sxXS53aWR0aCArIGJvcmRlcnNbM10ud2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodCk7XG4gICAgICB2YXIgZGggPSBib3VuZHMuaGVpZ2h0IC0gKGJvcmRlcnNbMF0ud2lkdGggKyBib3JkZXJzWzJdLndpZHRoICsgcGFkZGluZ1RvcCArIHBhZGRpbmdCb3R0b20pO1xuXG4gICAgICBkcmF3SW1hZ2UoY3R4LCBpbWFnZSxcbiAgICAgICAgc3gsIHN5LCBzdywgc2gsXG4gICAgICAgIGR4LCBkeSwgZHcsIGRoXG4gICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJvcmRlckRhdGEoZWxlbWVudCkge1xuICAgICAgcmV0dXJuIFtcIlRvcFwiLCBcIlJpZ2h0XCIsIFwiQm90dG9tXCIsIFwiTGVmdFwiXS5tYXAoZnVuY3Rpb24gKHNpZGUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB3aWR0aDogZ2V0Q1NTSW50KGVsZW1lbnQsICdib3JkZXInICsgc2lkZSArICdXaWR0aCcpLFxuICAgICAgICAgIGNvbG9yOiBnZXRDU1MoZWxlbWVudCwgJ2JvcmRlcicgKyBzaWRlICsgJ0NvbG9yJylcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJvcmRlclJhZGl1c0RhdGEoZWxlbWVudCkge1xuICAgICAgcmV0dXJuIFtcIlRvcExlZnRcIiwgXCJUb3BSaWdodFwiLCBcIkJvdHRvbVJpZ2h0XCIsIFwiQm90dG9tTGVmdFwiXS5tYXAoZnVuY3Rpb24gKHNpZGUpIHtcbiAgICAgICAgcmV0dXJuIGdldENTUyhlbGVtZW50LCAnYm9yZGVyJyArIHNpZGUgKyAnUmFkaXVzJyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgZ2V0Q3VydmVQb2ludHMgPSAoZnVuY3Rpb24gKGthcHBhKSB7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbiAoeCwgeSwgcjEsIHIyKSB7XG4gICAgICAgIHZhciBveCA9IChyMSkgKiBrYXBwYSwgLy8gY29udHJvbCBwb2ludCBvZmZzZXQgaG9yaXpvbnRhbFxuICAgICAgICAgIG95ID0gKHIyKSAqIGthcHBhLCAvLyBjb250cm9sIHBvaW50IG9mZnNldCB2ZXJ0aWNhbFxuICAgICAgICAgIHhtID0geCArIHIxLCAvLyB4LW1pZGRsZVxuICAgICAgICAgIHltID0geSArIHIyOyAvLyB5LW1pZGRsZVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRvcExlZnQ6IGJlemllckN1cnZlKHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5bVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5bSAtIG95XG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeG0gLSBveCxcbiAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4bSxcbiAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0b3BSaWdodDogYmV6aWVyQ3VydmUoe1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4ICsgb3gsXG4gICAgICAgICAgICB5OiB5XG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeG0sXG4gICAgICAgICAgICB5OiB5bSAtIG95XG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeG0sXG4gICAgICAgICAgICB5OiB5bVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGJvdHRvbVJpZ2h0OiBiZXppZXJDdXJ2ZSh7XG4gICAgICAgICAgICB4OiB4bSxcbiAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4bSxcbiAgICAgICAgICAgIHk6IHkgKyBveVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHggKyBveCxcbiAgICAgICAgICAgIHk6IHltXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHltXG4gICAgICAgICAgfSksXG4gICAgICAgICAgYm90dG9tTGVmdDogYmV6aWVyQ3VydmUoe1xuICAgICAgICAgICAgeDogeG0sXG4gICAgICAgICAgICB5OiB5bVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHhtIC0gb3gsXG4gICAgICAgICAgICB5OiB5bVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5ICsgb3lcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeVxuICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH0pKDQgKiAoKE1hdGguc3FydCgyKSAtIDEpIC8gMykpO1xuXG4gICAgZnVuY3Rpb24gYmV6aWVyQ3VydmUoc3RhcnQsIHN0YXJ0Q29udHJvbCwgZW5kQ29udHJvbCwgZW5kKSB7XG5cbiAgICAgIHZhciBsZXJwID0gZnVuY3Rpb24gKGEsIGIsIHQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiBhLnggKyAoYi54IC0gYS54KSAqIHQsXG4gICAgICAgICAgeTogYS55ICsgKGIueSAtIGEueSkgKiB0XG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIHN0YXJ0Q29udHJvbDogc3RhcnRDb250cm9sLFxuICAgICAgICBlbmRDb250cm9sOiBlbmRDb250cm9sLFxuICAgICAgICBlbmQ6IGVuZCxcbiAgICAgICAgc3ViZGl2aWRlOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgIHZhciBhYiA9IGxlcnAoc3RhcnQsIHN0YXJ0Q29udHJvbCwgdCksXG4gICAgICAgICAgICBiYyA9IGxlcnAoc3RhcnRDb250cm9sLCBlbmRDb250cm9sLCB0KSxcbiAgICAgICAgICAgIGNkID0gbGVycChlbmRDb250cm9sLCBlbmQsIHQpLFxuICAgICAgICAgICAgYWJiYyA9IGxlcnAoYWIsIGJjLCB0KSxcbiAgICAgICAgICAgIGJjY2QgPSBsZXJwKGJjLCBjZCwgdCksXG4gICAgICAgICAgICBkZXN0ID0gbGVycChhYmJjLCBiY2NkLCB0KTtcbiAgICAgICAgICByZXR1cm4gW2JlemllckN1cnZlKHN0YXJ0LCBhYiwgYWJiYywgZGVzdCksIGJlemllckN1cnZlKGRlc3QsIGJjY2QsIGNkLCBlbmQpXTtcbiAgICAgICAgfSxcbiAgICAgICAgY3VydmVUbzogZnVuY3Rpb24gKGJvcmRlckFyZ3MpIHtcbiAgICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wiYmV6aWVyQ3VydmVcIiwgc3RhcnRDb250cm9sLngsIHN0YXJ0Q29udHJvbC55LCBlbmRDb250cm9sLngsIGVuZENvbnRyb2wueSwgZW5kLngsIGVuZC55XSk7XG4gICAgICAgIH0sXG4gICAgICAgIGN1cnZlVG9SZXZlcnNlZDogZnVuY3Rpb24gKGJvcmRlckFyZ3MpIHtcbiAgICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wiYmV6aWVyQ3VydmVcIiwgZW5kQ29udHJvbC54LCBlbmRDb250cm9sLnksIHN0YXJ0Q29udHJvbC54LCBzdGFydENvbnRyb2wueSwgc3RhcnQueCwgc3RhcnQueV0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlQ29ybmVyKGJvcmRlckFyZ3MsIHJhZGl1czEsIHJhZGl1czIsIGNvcm5lcjEsIGNvcm5lcjIsIHgsIHkpIHtcbiAgICAgIGlmIChyYWRpdXMxWzBdID4gMCB8fCByYWRpdXMxWzFdID4gMCkge1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBjb3JuZXIxWzBdLnN0YXJ0LngsIGNvcm5lcjFbMF0uc3RhcnQueV0pO1xuICAgICAgICBjb3JuZXIxWzBdLmN1cnZlVG8oYm9yZGVyQXJncyk7XG4gICAgICAgIGNvcm5lcjFbMV0uY3VydmVUbyhib3JkZXJBcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIHgsIHldKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJhZGl1czJbMF0gPiAwIHx8IHJhZGl1czJbMV0gPiAwKSB7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIGNvcm5lcjJbMF0uc3RhcnQueCwgY29ybmVyMlswXS5zdGFydC55XSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd1NpZGUoYm9yZGVyRGF0YSwgcmFkaXVzMSwgcmFkaXVzMiwgb3V0ZXIxLCBpbm5lcjEsIG91dGVyMiwgaW5uZXIyKSB7XG4gICAgICB2YXIgYm9yZGVyQXJncyA9IFtdO1xuXG4gICAgICBpZiAocmFkaXVzMVswXSA+IDAgfHwgcmFkaXVzMVsxXSA+IDApIHtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgb3V0ZXIxWzFdLnN0YXJ0LngsIG91dGVyMVsxXS5zdGFydC55XSk7XG4gICAgICAgIG91dGVyMVsxXS5jdXJ2ZVRvKGJvcmRlckFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgYm9yZGVyRGF0YS5jMVswXSwgYm9yZGVyRGF0YS5jMVsxXV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocmFkaXVzMlswXSA+IDAgfHwgcmFkaXVzMlsxXSA+IDApIHtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgb3V0ZXIyWzBdLnN0YXJ0LngsIG91dGVyMlswXS5zdGFydC55XSk7XG4gICAgICAgIG91dGVyMlswXS5jdXJ2ZVRvKGJvcmRlckFyZ3MpO1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBpbm5lcjJbMF0uZW5kLngsIGlubmVyMlswXS5lbmQueV0pO1xuICAgICAgICBpbm5lcjJbMF0uY3VydmVUb1JldmVyc2VkKGJvcmRlckFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgYm9yZGVyRGF0YS5jMlswXSwgYm9yZGVyRGF0YS5jMlsxXV0pO1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBib3JkZXJEYXRhLmMzWzBdLCBib3JkZXJEYXRhLmMzWzFdXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyYWRpdXMxWzBdID4gMCB8fCByYWRpdXMxWzFdID4gMCkge1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBpbm5lcjFbMV0uZW5kLngsIGlubmVyMVsxXS5lbmQueV0pO1xuICAgICAgICBpbm5lcjFbMV0uY3VydmVUb1JldmVyc2VkKGJvcmRlckFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgYm9yZGVyRGF0YS5jNFswXSwgYm9yZGVyRGF0YS5jNFsxXV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYm9yZGVyQXJncztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxjdWxhdGVDdXJ2ZVBvaW50cyhib3VuZHMsIGJvcmRlclJhZGl1cywgYm9yZGVycykge1xuXG4gICAgICB2YXIgeCA9IGJvdW5kcy5sZWZ0LFxuICAgICAgICB5ID0gYm91bmRzLnRvcCxcbiAgICAgICAgd2lkdGggPSBib3VuZHMud2lkdGgsXG4gICAgICAgIGhlaWdodCA9IGJvdW5kcy5oZWlnaHQsXG5cbiAgICAgICAgdGxoID0gYm9yZGVyUmFkaXVzWzBdWzBdLFxuICAgICAgICB0bHYgPSBib3JkZXJSYWRpdXNbMF1bMV0sXG4gICAgICAgIHRyaCA9IGJvcmRlclJhZGl1c1sxXVswXSxcbiAgICAgICAgdHJ2ID0gYm9yZGVyUmFkaXVzWzFdWzFdLFxuICAgICAgICBicmggPSBib3JkZXJSYWRpdXNbMl1bMF0sXG4gICAgICAgIGJydiA9IGJvcmRlclJhZGl1c1syXVsxXSxcbiAgICAgICAgYmxoID0gYm9yZGVyUmFkaXVzWzNdWzBdLFxuICAgICAgICBibHYgPSBib3JkZXJSYWRpdXNbM11bMV07XG5cbiAgICAgIHZhciBoYWxmSGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgLyAyKTtcbiAgICAgIHRsaCA9IHRsaCA+IGhhbGZIZWlnaHQgPyBoYWxmSGVpZ2h0IDogdGxoO1xuICAgICAgdGx2ID0gdGx2ID4gaGFsZkhlaWdodCA/IGhhbGZIZWlnaHQgOiB0bHY7XG4gICAgICB0cmggPSB0cmggPiBoYWxmSGVpZ2h0ID8gaGFsZkhlaWdodCA6IHRyaDtcbiAgICAgIHRydiA9IHRydiA+IGhhbGZIZWlnaHQgPyBoYWxmSGVpZ2h0IDogdHJ2O1xuICAgICAgYnJoID0gYnJoID4gaGFsZkhlaWdodCA/IGhhbGZIZWlnaHQgOiBicmg7XG4gICAgICBicnYgPSBicnYgPiBoYWxmSGVpZ2h0ID8gaGFsZkhlaWdodCA6IGJydjtcbiAgICAgIGJsaCA9IGJsaCA+IGhhbGZIZWlnaHQgPyBoYWxmSGVpZ2h0IDogYmxoO1xuICAgICAgYmx2ID0gYmx2ID4gaGFsZkhlaWdodCA/IGhhbGZIZWlnaHQgOiBibHY7XG5cbiAgICAgIHZhciB0b3BXaWR0aCA9IHdpZHRoIC0gdHJoLFxuICAgICAgICByaWdodEhlaWdodCA9IGhlaWdodCAtIGJydixcbiAgICAgICAgYm90dG9tV2lkdGggPSB3aWR0aCAtIGJyaCxcbiAgICAgICAgbGVmdEhlaWdodCA9IGhlaWdodCAtIGJsdjtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9wTGVmdE91dGVyOiBnZXRDdXJ2ZVBvaW50cyhcbiAgICAgICAgICB4LFxuICAgICAgICAgIHksXG4gICAgICAgICAgdGxoLFxuICAgICAgICAgIHRsdlxuICAgICAgICApLnRvcExlZnQuc3ViZGl2aWRlKDAuNSksXG5cbiAgICAgICAgdG9wTGVmdElubmVyOiBnZXRDdXJ2ZVBvaW50cyhcbiAgICAgICAgICB4ICsgYm9yZGVyc1szXS53aWR0aCxcbiAgICAgICAgICB5ICsgYm9yZGVyc1swXS53aWR0aCxcbiAgICAgICAgICBNYXRoLm1heCgwLCB0bGggLSBib3JkZXJzWzNdLndpZHRoKSxcbiAgICAgICAgICBNYXRoLm1heCgwLCB0bHYgLSBib3JkZXJzWzBdLndpZHRoKVxuICAgICAgICApLnRvcExlZnQuc3ViZGl2aWRlKDAuNSksXG5cbiAgICAgICAgdG9wUmlnaHRPdXRlcjogZ2V0Q3VydmVQb2ludHMoXG4gICAgICAgICAgeCArIHRvcFdpZHRoLFxuICAgICAgICAgIHksXG4gICAgICAgICAgdHJoLFxuICAgICAgICAgIHRydlxuICAgICAgICApLnRvcFJpZ2h0LnN1YmRpdmlkZSgwLjUpLFxuXG4gICAgICAgIHRvcFJpZ2h0SW5uZXI6IGdldEN1cnZlUG9pbnRzKFxuICAgICAgICAgIHggKyBNYXRoLm1pbih0b3BXaWR0aCwgd2lkdGggKyBib3JkZXJzWzNdLndpZHRoKSxcbiAgICAgICAgICB5ICsgYm9yZGVyc1swXS53aWR0aCxcbiAgICAgICAgICAodG9wV2lkdGggPiB3aWR0aCArIGJvcmRlcnNbM10ud2lkdGgpID8gMCA6IHRyaCAtIGJvcmRlcnNbM10ud2lkdGgsXG4gICAgICAgICAgdHJ2IC0gYm9yZGVyc1swXS53aWR0aFxuICAgICAgICApLnRvcFJpZ2h0LnN1YmRpdmlkZSgwLjUpLFxuXG4gICAgICAgIGJvdHRvbVJpZ2h0T3V0ZXI6IGdldEN1cnZlUG9pbnRzKFxuICAgICAgICAgIHggKyBib3R0b21XaWR0aCxcbiAgICAgICAgICB5ICsgcmlnaHRIZWlnaHQsXG4gICAgICAgICAgYnJoLFxuICAgICAgICAgIGJydlxuICAgICAgICApLmJvdHRvbVJpZ2h0LnN1YmRpdmlkZSgwLjUpLFxuXG4gICAgICAgIGJvdHRvbVJpZ2h0SW5uZXI6IGdldEN1cnZlUG9pbnRzKFxuICAgICAgICAgIHggKyBNYXRoLm1pbihib3R0b21XaWR0aCwgd2lkdGggKyBib3JkZXJzWzNdLndpZHRoKSxcbiAgICAgICAgICB5ICsgTWF0aC5taW4ocmlnaHRIZWlnaHQsIGhlaWdodCArIGJvcmRlcnNbMF0ud2lkdGgpLFxuICAgICAgICAgIE1hdGgubWF4KDAsIGJyaCAtIGJvcmRlcnNbMV0ud2lkdGgpLFxuICAgICAgICAgIE1hdGgubWF4KDAsIGJydiAtIGJvcmRlcnNbMl0ud2lkdGgpXG4gICAgICAgICkuYm90dG9tUmlnaHQuc3ViZGl2aWRlKDAuNSksXG5cbiAgICAgICAgYm90dG9tTGVmdE91dGVyOiBnZXRDdXJ2ZVBvaW50cyhcbiAgICAgICAgICB4LFxuICAgICAgICAgIHkgKyBsZWZ0SGVpZ2h0LFxuICAgICAgICAgIGJsaCxcbiAgICAgICAgICBibHZcbiAgICAgICAgKS5ib3R0b21MZWZ0LnN1YmRpdmlkZSgwLjUpLFxuXG4gICAgICAgIGJvdHRvbUxlZnRJbm5lcjogZ2V0Q3VydmVQb2ludHMoXG4gICAgICAgICAgeCArIGJvcmRlcnNbM10ud2lkdGgsXG4gICAgICAgICAgeSArIGxlZnRIZWlnaHQsXG4gICAgICAgICAgTWF0aC5tYXgoMCwgYmxoIC0gYm9yZGVyc1szXS53aWR0aCksXG4gICAgICAgICAgTWF0aC5tYXgoMCwgYmx2IC0gYm9yZGVyc1syXS53aWR0aClcbiAgICAgICAgKS5ib3R0b21MZWZ0LnN1YmRpdmlkZSgwLjUpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJvcmRlckNsaXAoZWxlbWVudCwgYm9yZGVyUG9pbnRzLCBib3JkZXJzLCByYWRpdXMsIGJvdW5kcykge1xuICAgICAgdmFyIGJhY2tncm91bmRDbGlwID0gZ2V0Q1NTKGVsZW1lbnQsICdiYWNrZ3JvdW5kQ2xpcCcpLFxuICAgICAgICBib3JkZXJBcmdzID0gW107XG5cbiAgICAgIHN3aXRjaCAoYmFja2dyb3VuZENsaXApIHtcbiAgICAgICAgY2FzZSBcImNvbnRlbnQtYm94XCI6XG4gICAgICAgIGNhc2UgXCJwYWRkaW5nLWJveFwiOlxuICAgICAgICAgIHBhcnNlQ29ybmVyKGJvcmRlckFyZ3MsIHJhZGl1c1swXSwgcmFkaXVzWzFdLCBib3JkZXJQb2ludHMudG9wTGVmdElubmVyLCBib3JkZXJQb2ludHMudG9wUmlnaHRJbm5lciwgYm91bmRzLmxlZnQgKyBib3JkZXJzWzNdLndpZHRoLCBib3VuZHMudG9wICsgYm9yZGVyc1swXS53aWR0aCk7XG4gICAgICAgICAgcGFyc2VDb3JuZXIoYm9yZGVyQXJncywgcmFkaXVzWzFdLCByYWRpdXNbMl0sIGJvcmRlclBvaW50cy50b3BSaWdodElubmVyLCBib3JkZXJQb2ludHMuYm90dG9tUmlnaHRJbm5lciwgYm91bmRzLmxlZnQgKyBib3VuZHMud2lkdGggLSBib3JkZXJzWzFdLndpZHRoLCBib3VuZHMudG9wICsgYm9yZGVyc1swXS53aWR0aCk7XG4gICAgICAgICAgcGFyc2VDb3JuZXIoYm9yZGVyQXJncywgcmFkaXVzWzJdLCByYWRpdXNbM10sIGJvcmRlclBvaW50cy5ib3R0b21SaWdodElubmVyLCBib3JkZXJQb2ludHMuYm90dG9tTGVmdElubmVyLCBib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCAtIGJvcmRlcnNbMV0ud2lkdGgsIGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0IC0gYm9yZGVyc1syXS53aWR0aCk7XG4gICAgICAgICAgcGFyc2VDb3JuZXIoYm9yZGVyQXJncywgcmFkaXVzWzNdLCByYWRpdXNbMF0sIGJvcmRlclBvaW50cy5ib3R0b21MZWZ0SW5uZXIsIGJvcmRlclBvaW50cy50b3BMZWZ0SW5uZXIsIGJvdW5kcy5sZWZ0ICsgYm9yZGVyc1szXS53aWR0aCwgYm91bmRzLnRvcCArIGJvdW5kcy5oZWlnaHQgLSBib3JkZXJzWzJdLndpZHRoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHBhcnNlQ29ybmVyKGJvcmRlckFyZ3MsIHJhZGl1c1swXSwgcmFkaXVzWzFdLCBib3JkZXJQb2ludHMudG9wTGVmdE91dGVyLCBib3JkZXJQb2ludHMudG9wUmlnaHRPdXRlciwgYm91bmRzLmxlZnQsIGJvdW5kcy50b3ApO1xuICAgICAgICAgIHBhcnNlQ29ybmVyKGJvcmRlckFyZ3MsIHJhZGl1c1sxXSwgcmFkaXVzWzJdLCBib3JkZXJQb2ludHMudG9wUmlnaHRPdXRlciwgYm9yZGVyUG9pbnRzLmJvdHRvbVJpZ2h0T3V0ZXIsIGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoLCBib3VuZHMudG9wKTtcbiAgICAgICAgICBwYXJzZUNvcm5lcihib3JkZXJBcmdzLCByYWRpdXNbMl0sIHJhZGl1c1szXSwgYm9yZGVyUG9pbnRzLmJvdHRvbVJpZ2h0T3V0ZXIsIGJvcmRlclBvaW50cy5ib3R0b21MZWZ0T3V0ZXIsIGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoLCBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodCk7XG4gICAgICAgICAgcGFyc2VDb3JuZXIoYm9yZGVyQXJncywgcmFkaXVzWzNdLCByYWRpdXNbMF0sIGJvcmRlclBvaW50cy5ib3R0b21MZWZ0T3V0ZXIsIGJvcmRlclBvaW50cy50b3BMZWZ0T3V0ZXIsIGJvdW5kcy5sZWZ0LCBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBib3JkZXJBcmdzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlQm9yZGVycyhlbGVtZW50LCBib3VuZHMsIGJvcmRlcnMpIHtcbiAgICAgIHZhciB4ID0gYm91bmRzLmxlZnQsXG4gICAgICAgIHkgPSBib3VuZHMudG9wLFxuICAgICAgICB3aWR0aCA9IGJvdW5kcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0ID0gYm91bmRzLmhlaWdodCxcbiAgICAgICAgYm9yZGVyU2lkZSxcbiAgICAgICAgYngsXG4gICAgICAgIGJ5LFxuICAgICAgICBidyxcbiAgICAgICAgYmgsXG4gICAgICAgIGJvcmRlckFyZ3MsXG4gICAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtYmFja2dyb3VuZC8jdGhlLWJvcmRlci1yYWRpdXNcbiAgICAgICAgYm9yZGVyUmFkaXVzID0gZ2V0Qm9yZGVyUmFkaXVzRGF0YShlbGVtZW50KSxcbiAgICAgICAgYm9yZGVyUG9pbnRzID0gY2FsY3VsYXRlQ3VydmVQb2ludHMoYm91bmRzLCBib3JkZXJSYWRpdXMsIGJvcmRlcnMpLFxuICAgICAgICBib3JkZXJEYXRhID0ge1xuICAgICAgICAgIGNsaXA6IGdldEJvcmRlckNsaXAoZWxlbWVudCwgYm9yZGVyUG9pbnRzLCBib3JkZXJzLCBib3JkZXJSYWRpdXMsIGJvdW5kcyksXG4gICAgICAgICAgYm9yZGVyczogW11cbiAgICAgICAgfTtcblxuICAgICAgZm9yIChib3JkZXJTaWRlID0gMDsgYm9yZGVyU2lkZSA8IDQ7IGJvcmRlclNpZGUrKykge1xuXG4gICAgICAgIGlmIChib3JkZXJzW2JvcmRlclNpZGVdLndpZHRoID4gMCkge1xuICAgICAgICAgIGJ4ID0geDtcbiAgICAgICAgICBieSA9IHk7XG4gICAgICAgICAgYncgPSB3aWR0aDtcbiAgICAgICAgICBiaCA9IGhlaWdodCAtIChib3JkZXJzWzJdLndpZHRoKTtcblxuICAgICAgICAgIHN3aXRjaCAoYm9yZGVyU2lkZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAvLyB0b3AgYm9yZGVyXG4gICAgICAgICAgICAgIGJoID0gYm9yZGVyc1swXS53aWR0aDtcblxuICAgICAgICAgICAgICBib3JkZXJBcmdzID0gZHJhd1NpZGUoe1xuICAgICAgICAgICAgICAgICAgYzE6IFtieCwgYnldLFxuICAgICAgICAgICAgICAgICAgYzI6IFtieCArIGJ3LCBieV0sXG4gICAgICAgICAgICAgICAgICBjMzogW2J4ICsgYncgLSBib3JkZXJzWzFdLndpZHRoLCBieSArIGJoXSxcbiAgICAgICAgICAgICAgICAgIGM0OiBbYnggKyBib3JkZXJzWzNdLndpZHRoLCBieSArIGJoXVxuICAgICAgICAgICAgICAgIH0sIGJvcmRlclJhZGl1c1swXSwgYm9yZGVyUmFkaXVzWzFdLFxuICAgICAgICAgICAgICAgIGJvcmRlclBvaW50cy50b3BMZWZ0T3V0ZXIsIGJvcmRlclBvaW50cy50b3BMZWZ0SW5uZXIsIGJvcmRlclBvaW50cy50b3BSaWdodE91dGVyLCBib3JkZXJQb2ludHMudG9wUmlnaHRJbm5lcik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAvLyByaWdodCBib3JkZXJcbiAgICAgICAgICAgICAgYnggPSB4ICsgd2lkdGggLSAoYm9yZGVyc1sxXS53aWR0aCk7XG4gICAgICAgICAgICAgIGJ3ID0gYm9yZGVyc1sxXS53aWR0aDtcblxuICAgICAgICAgICAgICBib3JkZXJBcmdzID0gZHJhd1NpZGUoe1xuICAgICAgICAgICAgICAgICAgYzE6IFtieCArIGJ3LCBieV0sXG4gICAgICAgICAgICAgICAgICBjMjogW2J4ICsgYncsIGJ5ICsgYmggKyBib3JkZXJzWzJdLndpZHRoXSxcbiAgICAgICAgICAgICAgICAgIGMzOiBbYngsIGJ5ICsgYmhdLFxuICAgICAgICAgICAgICAgICAgYzQ6IFtieCwgYnkgKyBib3JkZXJzWzBdLndpZHRoXVxuICAgICAgICAgICAgICAgIH0sIGJvcmRlclJhZGl1c1sxXSwgYm9yZGVyUmFkaXVzWzJdLFxuICAgICAgICAgICAgICAgIGJvcmRlclBvaW50cy50b3BSaWdodE91dGVyLCBib3JkZXJQb2ludHMudG9wUmlnaHRJbm5lciwgYm9yZGVyUG9pbnRzLmJvdHRvbVJpZ2h0T3V0ZXIsIGJvcmRlclBvaW50cy5ib3R0b21SaWdodElubmVyKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIC8vIGJvdHRvbSBib3JkZXJcbiAgICAgICAgICAgICAgYnkgPSAoYnkgKyBoZWlnaHQpIC0gKGJvcmRlcnNbMl0ud2lkdGgpO1xuICAgICAgICAgICAgICBiaCA9IGJvcmRlcnNbMl0ud2lkdGg7XG5cbiAgICAgICAgICAgICAgYm9yZGVyQXJncyA9IGRyYXdTaWRlKHtcbiAgICAgICAgICAgICAgICAgIGMxOiBbYnggKyBidywgYnkgKyBiaF0sXG4gICAgICAgICAgICAgICAgICBjMjogW2J4LCBieSArIGJoXSxcbiAgICAgICAgICAgICAgICAgIGMzOiBbYnggKyBib3JkZXJzWzNdLndpZHRoLCBieV0sXG4gICAgICAgICAgICAgICAgICBjNDogW2J4ICsgYncgLSBib3JkZXJzWzNdLndpZHRoLCBieV1cbiAgICAgICAgICAgICAgICB9LCBib3JkZXJSYWRpdXNbMl0sIGJvcmRlclJhZGl1c1szXSxcbiAgICAgICAgICAgICAgICBib3JkZXJQb2ludHMuYm90dG9tUmlnaHRPdXRlciwgYm9yZGVyUG9pbnRzLmJvdHRvbVJpZ2h0SW5uZXIsIGJvcmRlclBvaW50cy5ib3R0b21MZWZ0T3V0ZXIsIGJvcmRlclBvaW50cy5ib3R0b21MZWZ0SW5uZXIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgLy8gbGVmdCBib3JkZXJcbiAgICAgICAgICAgICAgYncgPSBib3JkZXJzWzNdLndpZHRoO1xuXG4gICAgICAgICAgICAgIGJvcmRlckFyZ3MgPSBkcmF3U2lkZSh7XG4gICAgICAgICAgICAgICAgICBjMTogW2J4LCBieSArIGJoICsgYm9yZGVyc1syXS53aWR0aF0sXG4gICAgICAgICAgICAgICAgICBjMjogW2J4LCBieV0sXG4gICAgICAgICAgICAgICAgICBjMzogW2J4ICsgYncsIGJ5ICsgYm9yZGVyc1swXS53aWR0aF0sXG4gICAgICAgICAgICAgICAgICBjNDogW2J4ICsgYncsIGJ5ICsgYmhdXG4gICAgICAgICAgICAgICAgfSwgYm9yZGVyUmFkaXVzWzNdLCBib3JkZXJSYWRpdXNbMF0sXG4gICAgICAgICAgICAgICAgYm9yZGVyUG9pbnRzLmJvdHRvbUxlZnRPdXRlciwgYm9yZGVyUG9pbnRzLmJvdHRvbUxlZnRJbm5lciwgYm9yZGVyUG9pbnRzLnRvcExlZnRPdXRlciwgYm9yZGVyUG9pbnRzLnRvcExlZnRJbm5lcik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJvcmRlckRhdGEuYm9yZGVycy5wdXNoKHtcbiAgICAgICAgICAgIGFyZ3M6IGJvcmRlckFyZ3MsXG4gICAgICAgICAgICBjb2xvcjogYm9yZGVyc1tib3JkZXJTaWRlXS5jb2xvclxuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJvcmRlckRhdGE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlU2hhcGUoY3R4LCBhcmdzKSB7XG4gICAgICB2YXIgc2hhcGUgPSBjdHguZHJhd1NoYXBlKCk7XG4gICAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24gKGJvcmRlciwgaW5kZXgpIHtcbiAgICAgICAgc2hhcGVbKGluZGV4ID09PSAwKSA/IFwibW92ZVRvXCIgOiBib3JkZXJbMF0gKyBcIlRvXCJdLmFwcGx5KG51bGwsIGJvcmRlci5zbGljZSgxKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzaGFwZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJCb3JkZXJzKGN0eCwgYm9yZGVyQXJncywgY29sb3IpIHtcbiAgICAgIGlmIChjb2xvciAhPT0gXCJ0cmFuc3BhcmVudFwiKSB7XG4gICAgICAgIGN0eC5zZXRWYXJpYWJsZShcImZpbGxTdHlsZVwiLCBjb2xvcik7XG4gICAgICAgIGNyZWF0ZVNoYXBlKGN0eCwgYm9yZGVyQXJncyk7XG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgIG51bURyYXdzICs9IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyRm9ybVZhbHVlKGVsLCBib3VuZHMsIHN0YWNrKSB7XG5cbiAgICAgIHZhciB2YWx1ZVdyYXAgPSBkb2MuY3JlYXRlRWxlbWVudCgndmFsdWV3cmFwJyksXG4gICAgICAgIGNzc1Byb3BlcnR5QXJyYXkgPSBbJ2xpbmVIZWlnaHQnLCAndGV4dEFsaWduJywgJ2ZvbnRGYW1pbHknLCAnY29sb3InLCAnZm9udFNpemUnLCAncGFkZGluZ0xlZnQnLCAncGFkZGluZ1RvcCcsICd3aWR0aCcsICdoZWlnaHQnLCAnYm9yZGVyJywgJ2JvcmRlckxlZnRXaWR0aCcsICdib3JkZXJUb3BXaWR0aCddLFxuICAgICAgICB0ZXh0VmFsdWUsXG4gICAgICAgIHRleHROb2RlO1xuXG4gICAgICBjc3NQcm9wZXJ0eUFycmF5LmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFsdWVXcmFwLnN0eWxlW3Byb3BlcnR5XSA9IGdldENTUyhlbCwgcHJvcGVydHkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gT2xkZXIgSUUgaGFzIGlzc3VlcyB3aXRoIFwiYm9yZGVyXCJcbiAgICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBQYXJzZTogRXhjZXB0aW9uIGNhdWdodCBpbiByZW5kZXJGb3JtVmFsdWU6IFwiICsgZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhbHVlV3JhcC5zdHlsZS5ib3JkZXJDb2xvciA9IFwiYmxhY2tcIjtcbiAgICAgIHZhbHVlV3JhcC5zdHlsZS5ib3JkZXJTdHlsZSA9IFwic29saWRcIjtcbiAgICAgIHZhbHVlV3JhcC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgdmFsdWVXcmFwLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuXG4gICAgICBpZiAoL14oc3VibWl0fHJlc2V0fGJ1dHRvbnx0ZXh0fHBhc3N3b3JkKSQvLnRlc3QoZWwudHlwZSkgfHwgZWwubm9kZU5hbWUgPT09IFwiU0VMRUNUXCIpIHtcbiAgICAgICAgdmFsdWVXcmFwLnN0eWxlLmxpbmVIZWlnaHQgPSBnZXRDU1MoZWwsIFwiaGVpZ2h0XCIpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZVdyYXAuc3R5bGUudG9wID0gYm91bmRzLnRvcCArIFwicHhcIjtcbiAgICAgIHZhbHVlV3JhcC5zdHlsZS5sZWZ0ID0gYm91bmRzLmxlZnQgKyBcInB4XCI7XG5cbiAgICAgIHRleHRWYWx1ZSA9IChlbC5ub2RlTmFtZSA9PT0gXCJTRUxFQ1RcIikgPyAoZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XSB8fCAwKS50ZXh0IDogZWwudmFsdWU7XG4gICAgICBpZiAoIXRleHRWYWx1ZSkge1xuICAgICAgICB0ZXh0VmFsdWUgPSBlbC5wbGFjZWhvbGRlcjtcbiAgICAgIH1cblxuICAgICAgdGV4dE5vZGUgPSBkb2MuY3JlYXRlVGV4dE5vZGUodGV4dFZhbHVlKTtcblxuICAgICAgdmFsdWVXcmFwLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgIGJvZHkuYXBwZW5kQ2hpbGQodmFsdWVXcmFwKTtcblxuICAgICAgcmVuZGVyVGV4dChlbCwgdGV4dE5vZGUsIHN0YWNrKTtcbiAgICAgIGJvZHkucmVtb3ZlQ2hpbGQodmFsdWVXcmFwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3SW1hZ2UoY3R4KSB7XG4gICAgICBjdHguZHJhd0ltYWdlLmFwcGx5KGN0eCwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICBudW1EcmF3cyArPSAxO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFBzZXVkb0VsZW1lbnQoZWwsIHdoaWNoKSB7XG4gICAgICB2YXIgZWxTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsLCB3aGljaCk7XG4gICAgICBpZiAoIWVsU3R5bGUgfHwgIWVsU3R5bGUuY29udGVudCB8fCBlbFN0eWxlLmNvbnRlbnQgPT09IFwibm9uZVwiIHx8IGVsU3R5bGUuY29udGVudCA9PT0gXCItbW96LWFsdC1jb250ZW50XCIgfHwgZWxTdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgY29udGVudCA9IGVsU3R5bGUuY29udGVudCArICcnLFxuICAgICAgICBmaXJzdCA9IGNvbnRlbnQuc3Vic3RyKDAsIDEpO1xuICAgICAgLy9zdHJpcHMgcXVvdGVzXG4gICAgICBpZiAoZmlyc3QgPT09IGNvbnRlbnQuc3Vic3RyKGNvbnRlbnQubGVuZ3RoIC0gMSkgJiYgZmlyc3QubWF0Y2goLyd8XCIvKSkge1xuICAgICAgICBjb250ZW50ID0gY29udGVudC5zdWJzdHIoMSwgY29udGVudC5sZW5ndGggLSAyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGlzSW1hZ2UgPSBjb250ZW50LnN1YnN0cigwLCAzKSA9PT0gJ3VybCcsXG4gICAgICAgIGVscHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGlzSW1hZ2UgPyAnaW1nJyA6ICdzcGFuJyk7XG5cbiAgICAgIGVscHMuY2xhc3NOYW1lID0gcHNldWRvSGlkZSArIFwiLWJlZm9yZSBcIiArIHBzZXVkb0hpZGUgKyBcIi1hZnRlclwiO1xuXG4gICAgICBPYmplY3Qua2V5cyhlbFN0eWxlKS5maWx0ZXIoaW5kZXhlZFByb3BlcnR5KS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgIC8vIFByZXZlbnQgYXNzaWduaW5nIG9mIHJlYWQgb25seSBDU1MgUnVsZXMsIGV4LiBsZW5ndGgsIHBhcmVudFJ1bGVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBlbHBzLnN0eWxlW3Byb3BdID0gZWxTdHlsZVtwcm9wXTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIFV0aWwubG9nKFsnVHJpZWQgdG8gYXNzaWduIHJlYWRvbmx5IHByb3BlcnR5ICcsIHByb3AsICdFcnJvcjonLCBlXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBlbHBzLnN0eWxlWydmb250RmFtaWx5J10gPSBlbFN0eWxlWydmb250RmFtaWx5J107XG4gICAgICBlbHBzLnN0eWxlWydmb250LWZhbWlseSddID0gZWxTdHlsZVsnZm9udC1mYW1pbHknXTtcblxuICAgICAgaWYgKGlzSW1hZ2UpIHtcbiAgICAgICAgZWxwcy5zcmMgPSBVdGlsLnBhcnNlQmFja2dyb3VuZEltYWdlKGNvbnRlbnQpWzBdLmFyZ3NbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbHBzLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gZWxwcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbmRleGVkUHJvcGVydHkocHJvcGVydHkpIHtcbiAgICAgIHJldHVybiAoaXNOYU4od2luZG93LnBhcnNlSW50KHByb3BlcnR5LCAxMCkpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbmplY3RQc2V1ZG9FbGVtZW50cyhlbCwgc3RhY2spIHtcbiAgICAgIHZhciBiZWZvcmUgPSBnZXRQc2V1ZG9FbGVtZW50KGVsLCAnOmJlZm9yZScpLFxuICAgICAgICBhZnRlciA9IGdldFBzZXVkb0VsZW1lbnQoZWwsICc6YWZ0ZXInKTtcbiAgICAgIGlmICghYmVmb3JlICYmICFhZnRlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgZWwuY2xhc3NOYW1lICs9IFwiIFwiICsgcHNldWRvSGlkZSArIFwiLWJlZm9yZVwiO1xuICAgICAgICBlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShiZWZvcmUsIGVsKTtcbiAgICAgICAgcGFyc2VFbGVtZW50KGJlZm9yZSwgc3RhY2ssIHRydWUpO1xuICAgICAgICBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGJlZm9yZSk7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKHBzZXVkb0hpZGUgKyBcIi1iZWZvcmVcIiwgXCJcIikudHJpbSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWZ0ZXIpIHtcbiAgICAgICAgZWwuY2xhc3NOYW1lICs9IFwiIFwiICsgcHNldWRvSGlkZSArIFwiLWFmdGVyXCI7XG4gICAgICAgIGVsLmFwcGVuZENoaWxkKGFmdGVyKTtcbiAgICAgICAgcGFyc2VFbGVtZW50KGFmdGVyLCBzdGFjaywgdHJ1ZSk7XG4gICAgICAgIGVsLnJlbW92ZUNoaWxkKGFmdGVyKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UocHNldWRvSGlkZSArIFwiLWFmdGVyXCIsIFwiXCIpLnRyaW0oKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlckJhY2tncm91bmRSZXBlYXQoY3R4LCBpbWFnZSwgYmFja2dyb3VuZFBvc2l0aW9uLCBib3VuZHMpIHtcbiAgICAgIHZhciBvZmZzZXRYID0gTWF0aC5yb3VuZChib3VuZHMubGVmdCArIGJhY2tncm91bmRQb3NpdGlvbi5sZWZ0KSxcbiAgICAgICAgb2Zmc2V0WSA9IE1hdGgucm91bmQoYm91bmRzLnRvcCArIGJhY2tncm91bmRQb3NpdGlvbi50b3ApO1xuXG4gICAgICBjdHguY3JlYXRlUGF0dGVybihpbWFnZSk7XG4gICAgICBjdHgudHJhbnNsYXRlKG9mZnNldFgsIG9mZnNldFkpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC50cmFuc2xhdGUoLW9mZnNldFgsIC1vZmZzZXRZKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiYWNrZ3JvdW5kUmVwZWF0U2hhcGUoY3R4LCBpbWFnZSwgYmFja2dyb3VuZFBvc2l0aW9uLCBib3VuZHMsIGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgIGFyZ3MucHVzaChbXCJsaW5lXCIsIE1hdGgucm91bmQobGVmdCksIE1hdGgucm91bmQodG9wKV0pO1xuICAgICAgYXJncy5wdXNoKFtcImxpbmVcIiwgTWF0aC5yb3VuZChsZWZ0ICsgd2lkdGgpLCBNYXRoLnJvdW5kKHRvcCldKTtcbiAgICAgIGFyZ3MucHVzaChbXCJsaW5lXCIsIE1hdGgucm91bmQobGVmdCArIHdpZHRoKSwgTWF0aC5yb3VuZChoZWlnaHQgKyB0b3ApXSk7XG4gICAgICBhcmdzLnB1c2goW1wibGluZVwiLCBNYXRoLnJvdW5kKGxlZnQpLCBNYXRoLnJvdW5kKGhlaWdodCArIHRvcCldKTtcbiAgICAgIGNyZWF0ZVNoYXBlKGN0eCwgYXJncyk7XG4gICAgICBjdHguc2F2ZSgpO1xuICAgICAgY3R4LmNsaXAoKTtcbiAgICAgIHJlbmRlckJhY2tncm91bmRSZXBlYXQoY3R4LCBpbWFnZSwgYmFja2dyb3VuZFBvc2l0aW9uLCBib3VuZHMpO1xuICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJCYWNrZ3JvdW5kQ29sb3IoY3R4LCBiYWNrZ3JvdW5kQm91bmRzLCBiZ2NvbG9yKSB7XG4gICAgICByZW5kZXJSZWN0KFxuICAgICAgICBjdHgsXG4gICAgICAgIGJhY2tncm91bmRCb3VuZHMubGVmdCxcbiAgICAgICAgYmFja2dyb3VuZEJvdW5kcy50b3AsXG4gICAgICAgIGJhY2tncm91bmRCb3VuZHMud2lkdGgsXG4gICAgICAgIGJhY2tncm91bmRCb3VuZHMuaGVpZ2h0LFxuICAgICAgICBiZ2NvbG9yXG4gICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlckJhY2tncm91bmRSZXBlYXRpbmcoZWwsIGJvdW5kcywgY3R4LCBpbWFnZSwgaW1hZ2VJbmRleCkge1xuICAgICAgdmFyIGJhY2tncm91bmRTaXplID0gVXRpbC5CYWNrZ3JvdW5kU2l6ZShlbCwgYm91bmRzLCBpbWFnZSwgaW1hZ2VJbmRleCksXG4gICAgICAgIGJhY2tncm91bmRQb3NpdGlvbiA9IFV0aWwuQmFja2dyb3VuZFBvc2l0aW9uKGVsLCBib3VuZHMsIGltYWdlLCBpbWFnZUluZGV4LCBiYWNrZ3JvdW5kU2l6ZSksXG4gICAgICAgIGJhY2tncm91bmRSZXBlYXQgPSBnZXRDU1MoZWwsIFwiYmFja2dyb3VuZFJlcGVhdFwiKS5zcGxpdChcIixcIikubWFwKFV0aWwudHJpbVRleHQpO1xuXG4gICAgICBpbWFnZSA9IHJlc2l6ZUltYWdlKGltYWdlLCBiYWNrZ3JvdW5kU2l6ZSk7XG5cbiAgICAgIGJhY2tncm91bmRSZXBlYXQgPSBiYWNrZ3JvdW5kUmVwZWF0W2ltYWdlSW5kZXhdIHx8IGJhY2tncm91bmRSZXBlYXRbMF07XG5cbiAgICAgIHN3aXRjaCAoYmFja2dyb3VuZFJlcGVhdCkge1xuICAgICAgICBjYXNlIFwicmVwZWF0LXhcIjpcbiAgICAgICAgICBiYWNrZ3JvdW5kUmVwZWF0U2hhcGUoY3R4LCBpbWFnZSwgYmFja2dyb3VuZFBvc2l0aW9uLCBib3VuZHMsXG4gICAgICAgICAgICBib3VuZHMubGVmdCwgYm91bmRzLnRvcCArIGJhY2tncm91bmRQb3NpdGlvbi50b3AsIDk5OTk5LCBpbWFnZS5oZWlnaHQpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJyZXBlYXQteVwiOlxuICAgICAgICAgIGJhY2tncm91bmRSZXBlYXRTaGFwZShjdHgsIGltYWdlLCBiYWNrZ3JvdW5kUG9zaXRpb24sIGJvdW5kcyxcbiAgICAgICAgICAgIGJvdW5kcy5sZWZ0ICsgYmFja2dyb3VuZFBvc2l0aW9uLmxlZnQsIGJvdW5kcy50b3AsIGltYWdlLndpZHRoLCA5OTk5OSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIm5vLXJlcGVhdFwiOlxuICAgICAgICAgIGJhY2tncm91bmRSZXBlYXRTaGFwZShjdHgsIGltYWdlLCBiYWNrZ3JvdW5kUG9zaXRpb24sIGJvdW5kcyxcbiAgICAgICAgICAgIGJvdW5kcy5sZWZ0ICsgYmFja2dyb3VuZFBvc2l0aW9uLmxlZnQsIGJvdW5kcy50b3AgKyBiYWNrZ3JvdW5kUG9zaXRpb24udG9wLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0KTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJlbmRlckJhY2tncm91bmRSZXBlYXQoY3R4LCBpbWFnZSwgYmFja2dyb3VuZFBvc2l0aW9uLCB7XG4gICAgICAgICAgICB0b3A6IGJvdW5kcy50b3AsXG4gICAgICAgICAgICBsZWZ0OiBib3VuZHMubGVmdCxcbiAgICAgICAgICAgIHdpZHRoOiBpbWFnZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaW1hZ2UuaGVpZ2h0XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyQmFja2dyb3VuZEltYWdlKGVsZW1lbnQsIGJvdW5kcywgY3R4KSB7XG4gICAgICB2YXIgYmFja2dyb3VuZEltYWdlID0gZ2V0Q1NTKGVsZW1lbnQsIFwiYmFja2dyb3VuZEltYWdlXCIpLFxuICAgICAgICBiYWNrZ3JvdW5kSW1hZ2VzID0gVXRpbC5wYXJzZUJhY2tncm91bmRJbWFnZShiYWNrZ3JvdW5kSW1hZ2UpLFxuICAgICAgICBpbWFnZSxcbiAgICAgICAgaW1hZ2VJbmRleCA9IGJhY2tncm91bmRJbWFnZXMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaW1hZ2VJbmRleC0tKSB7XG4gICAgICAgIGJhY2tncm91bmRJbWFnZSA9IGJhY2tncm91bmRJbWFnZXNbaW1hZ2VJbmRleF07XG5cbiAgICAgICAgaWYgKCFiYWNrZ3JvdW5kSW1hZ2UuYXJncyB8fCBiYWNrZ3JvdW5kSW1hZ2UuYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBrZXkgPSBiYWNrZ3JvdW5kSW1hZ2UubWV0aG9kID09PSAndXJsJyA/XG4gICAgICAgICAgYmFja2dyb3VuZEltYWdlLmFyZ3NbMF0gOlxuICAgICAgICAgIGJhY2tncm91bmRJbWFnZS52YWx1ZTtcblxuICAgICAgICBpbWFnZSA9IGxvYWRJbWFnZShrZXkpO1xuXG4gICAgICAgIC8vIFRPRE8gYWRkIHN1cHBvcnQgZm9yIGJhY2tncm91bmQtb3JpZ2luXG4gICAgICAgIGlmIChpbWFnZSkge1xuICAgICAgICAgIHJlbmRlckJhY2tncm91bmRSZXBlYXRpbmcoZWxlbWVudCwgYm91bmRzLCBjdHgsIGltYWdlLCBpbWFnZUluZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBFcnJvciBsb2FkaW5nIGJhY2tncm91bmQ6XCIsIGJhY2tncm91bmRJbWFnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNpemVJbWFnZShpbWFnZSwgYm91bmRzKSB7XG5cbiAgICAgIGlmIChpbWFnZS53aWR0aCA9PT0gYm91bmRzLndpZHRoICYmIGltYWdlLmhlaWdodCA9PT0gYm91bmRzLmhlaWdodClcbiAgICAgICAgcmV0dXJuIGltYWdlO1xuXG4gICAgICB2YXIgY3R4LCBjYW52YXMgPSBkb2MuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICBjYW52YXMud2lkdGggPSBib3VuZHMud2lkdGg7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gYm91bmRzLmhlaWdodDtcblxuICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgIGRyYXdJbWFnZShjdHgsIGltYWdlLCAwLCAwLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LCAwLCAwLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQpO1xuICAgICAgcmV0dXJuIGNhbnZhcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRPcGFjaXR5KGN0eCwgZWxlbWVudCwgcGFyZW50U3RhY2spIHtcbiAgICAgIHJldHVybiBjdHguc2V0VmFyaWFibGUoXCJnbG9iYWxBbHBoYVwiLCBnZXRDU1MoZWxlbWVudCwgXCJvcGFjaXR5XCIpICogKChwYXJlbnRTdGFjaykgPyBwYXJlbnRTdGFjay5vcGFjaXR5IDogMSkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZVB4KHN0cikge1xuICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKFwicHhcIiwgXCJcIik7XG4gICAgfVxuXG4gICAgdmFyIHRyYW5zZm9ybVJlZ0V4cCA9IC8obWF0cml4KVxcKCguKylcXCkvO1xuXG4gICAgZnVuY3Rpb24gZ2V0VHJhbnNmb3JtKGVsZW1lbnQsIHBhcmVudFN0YWNrKSB7XG4gICAgICB2YXIgdHJhbnNmb3JtID0gZ2V0Q1NTKGVsZW1lbnQsIFwidHJhbnNmb3JtXCIpIHx8IGdldENTUyhlbGVtZW50LCBcIi13ZWJraXQtdHJhbnNmb3JtXCIpIHx8IGdldENTUyhlbGVtZW50LCBcIi1tb3otdHJhbnNmb3JtXCIpIHx8IGdldENTUyhlbGVtZW50LCBcIi1tcy10cmFuc2Zvcm1cIikgfHwgZ2V0Q1NTKGVsZW1lbnQsIFwiLW8tdHJhbnNmb3JtXCIpO1xuICAgICAgdmFyIHRyYW5zZm9ybU9yaWdpbiA9IGdldENTUyhlbGVtZW50LCBcInRyYW5zZm9ybS1vcmlnaW5cIikgfHwgZ2V0Q1NTKGVsZW1lbnQsIFwiLXdlYmtpdC10cmFuc2Zvcm0tb3JpZ2luXCIpIHx8IGdldENTUyhlbGVtZW50LCBcIi1tb3otdHJhbnNmb3JtLW9yaWdpblwiKSB8fCBnZXRDU1MoZWxlbWVudCwgXCItbXMtdHJhbnNmb3JtLW9yaWdpblwiKSB8fCBnZXRDU1MoZWxlbWVudCwgXCItby10cmFuc2Zvcm0tb3JpZ2luXCIpIHx8IFwiMHB4IDBweFwiO1xuXG4gICAgICB0cmFuc2Zvcm1PcmlnaW4gPSB0cmFuc2Zvcm1PcmlnaW4uc3BsaXQoXCIgXCIpLm1hcChyZW1vdmVQeCkubWFwKFV0aWwuYXNGbG9hdCk7XG5cbiAgICAgIHZhciBtYXRyaXg7XG4gICAgICBpZiAodHJhbnNmb3JtICYmIHRyYW5zZm9ybSAhPT0gXCJub25lXCIpIHtcbiAgICAgICAgdmFyIG1hdGNoID0gdHJhbnNmb3JtLm1hdGNoKHRyYW5zZm9ybVJlZ0V4cCk7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIHN3aXRjaCAobWF0Y2hbMV0pIHtcbiAgICAgICAgICAgIGNhc2UgXCJtYXRyaXhcIjpcbiAgICAgICAgICAgICAgbWF0cml4ID0gbWF0Y2hbMl0uc3BsaXQoXCIsXCIpLm1hcChVdGlsLnRyaW1UZXh0KS5tYXAoVXRpbC5hc0Zsb2F0KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9yaWdpbjogdHJhbnNmb3JtT3JpZ2luLFxuICAgICAgICBtYXRyaXg6IG1hdHJpeFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTdGFjayhlbGVtZW50LCBwYXJlbnRTdGFjaywgYm91bmRzLCB0cmFuc2Zvcm0pIHtcbiAgICAgIHZhciBjdHggPSBoMmNSZW5kZXJDb250ZXh0KCghcGFyZW50U3RhY2spID8gZG9jdW1lbnRXaWR0aCgpIDogYm91bmRzLndpZHRoLCAoIXBhcmVudFN0YWNrKSA/IGRvY3VtZW50SGVpZ2h0KCkgOiBib3VuZHMuaGVpZ2h0KSxcbiAgICAgICAgc3RhY2sgPSB7XG4gICAgICAgICAgY3R4OiBjdHgsXG4gICAgICAgICAgb3BhY2l0eTogc2V0T3BhY2l0eShjdHgsIGVsZW1lbnQsIHBhcmVudFN0YWNrKSxcbiAgICAgICAgICBjc3NQb3NpdGlvbjogZ2V0Q1NTKGVsZW1lbnQsIFwicG9zaXRpb25cIiksXG4gICAgICAgICAgYm9yZGVyczogZ2V0Qm9yZGVyRGF0YShlbGVtZW50KSxcbiAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgICBjbGlwOiAocGFyZW50U3RhY2sgJiYgcGFyZW50U3RhY2suY2xpcCkgPyBVdGlsLkV4dGVuZCh7fSwgcGFyZW50U3RhY2suY2xpcCkgOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgIHNldFooZWxlbWVudCwgc3RhY2ssIHBhcmVudFN0YWNrKTtcblxuICAgICAgLy8gVE9ETyBjb3JyZWN0IG92ZXJmbG93IGZvciBhYnNvbHV0ZSBjb250ZW50IHJlc2lkaW5nIHVuZGVyIGEgc3RhdGljIHBvc2l0aW9uXG4gICAgICBpZiAob3B0aW9ucy51c2VPdmVyZmxvdyA9PT0gdHJ1ZSAmJiAvKGhpZGRlbnxzY3JvbGx8YXV0bykvLnRlc3QoZ2V0Q1NTKGVsZW1lbnQsIFwib3ZlcmZsb3dcIikpID09PSB0cnVlICYmIC8oQk9EWSkvaS50ZXN0KGVsZW1lbnQubm9kZU5hbWUpID09PSBmYWxzZSkge1xuICAgICAgICBzdGFjay5jbGlwID0gKHN0YWNrLmNsaXApID8gY2xpcEJvdW5kcyhzdGFjay5jbGlwLCBib3VuZHMpIDogYm91bmRzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhY2s7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QmFja2dyb3VuZEJvdW5kcyhib3JkZXJzLCBib3VuZHMsIGNsaXApIHtcbiAgICAgIHZhciBiYWNrZ3JvdW5kQm91bmRzID0ge1xuICAgICAgICBsZWZ0OiBib3VuZHMubGVmdCArIGJvcmRlcnNbM10ud2lkdGgsXG4gICAgICAgIHRvcDogYm91bmRzLnRvcCArIGJvcmRlcnNbMF0ud2lkdGgsXG4gICAgICAgIHdpZHRoOiBib3VuZHMud2lkdGggLSAoYm9yZGVyc1sxXS53aWR0aCArIGJvcmRlcnNbM10ud2lkdGgpLFxuICAgICAgICBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQgLSAoYm9yZGVyc1swXS53aWR0aCArIGJvcmRlcnNbMl0ud2lkdGgpXG4gICAgICB9O1xuXG4gICAgICBpZiAoY2xpcCkge1xuICAgICAgICBiYWNrZ3JvdW5kQm91bmRzID0gY2xpcEJvdW5kcyhiYWNrZ3JvdW5kQm91bmRzLCBjbGlwKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJhY2tncm91bmRCb3VuZHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Qm91bmRzKGVsZW1lbnQsIHRyYW5zZm9ybSkge1xuICAgICAgdmFyIGJvdW5kcyA9ICh0cmFuc2Zvcm0ubWF0cml4KSA/IFV0aWwuT2Zmc2V0Qm91bmRzKGVsZW1lbnQpIDogVXRpbC5Cb3VuZHMoZWxlbWVudCk7XG4gICAgICB0cmFuc2Zvcm0ub3JpZ2luWzBdICs9IGJvdW5kcy5sZWZ0O1xuICAgICAgdHJhbnNmb3JtLm9yaWdpblsxXSArPSBib3VuZHMudG9wO1xuICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJFbGVtZW50KGVsZW1lbnQsIHBhcmVudFN0YWNrLCBwc2V1ZG9FbGVtZW50LCBpZ25vcmVCYWNrZ3JvdW5kKSB7XG4gICAgICB2YXIgdHJhbnNmb3JtID0gZ2V0VHJhbnNmb3JtKGVsZW1lbnQsIHBhcmVudFN0YWNrKSxcbiAgICAgICAgYm91bmRzID0gZ2V0Qm91bmRzKGVsZW1lbnQsIHRyYW5zZm9ybSksXG4gICAgICAgIGltYWdlLFxuICAgICAgICBzdGFjayA9IGNyZWF0ZVN0YWNrKGVsZW1lbnQsIHBhcmVudFN0YWNrLCBib3VuZHMsIHRyYW5zZm9ybSksXG4gICAgICAgIGJvcmRlcnMgPSBzdGFjay5ib3JkZXJzLFxuICAgICAgICBjdHggPSBzdGFjay5jdHgsXG4gICAgICAgIGJhY2tncm91bmRCb3VuZHMgPSBnZXRCYWNrZ3JvdW5kQm91bmRzKGJvcmRlcnMsIGJvdW5kcywgc3RhY2suY2xpcCksXG4gICAgICAgIGJvcmRlckRhdGEgPSBwYXJzZUJvcmRlcnMoZWxlbWVudCwgYm91bmRzLCBib3JkZXJzKSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yID0gKGlnbm9yZUVsZW1lbnRzUmVnRXhwLnRlc3QoZWxlbWVudC5ub2RlTmFtZSkpID8gXCIjZWZlZmVmXCIgOiBnZXRDU1MoZWxlbWVudCwgXCJiYWNrZ3JvdW5kQ29sb3JcIik7XG5cblxuICAgICAgY3JlYXRlU2hhcGUoY3R4LCBib3JkZXJEYXRhLmNsaXApO1xuXG4gICAgICBjdHguc2F2ZSgpO1xuICAgICAgY3R4LmNsaXAoKTtcblxuICAgICAgaWYgKGJhY2tncm91bmRCb3VuZHMuaGVpZ2h0ID4gMCAmJiBiYWNrZ3JvdW5kQm91bmRzLndpZHRoID4gMCAmJiAhaWdub3JlQmFja2dyb3VuZCkge1xuICAgICAgICByZW5kZXJCYWNrZ3JvdW5kQ29sb3IoY3R4LCBib3VuZHMsIGJhY2tncm91bmRDb2xvcik7XG4gICAgICAgIHJlbmRlckJhY2tncm91bmRJbWFnZShlbGVtZW50LCBiYWNrZ3JvdW5kQm91bmRzLCBjdHgpO1xuICAgICAgfSBlbHNlIGlmIChpZ25vcmVCYWNrZ3JvdW5kKSB7XG4gICAgICAgIHN0YWNrLmJhY2tncm91bmRDb2xvciA9IGJhY2tncm91bmRDb2xvcjtcbiAgICAgIH1cblxuICAgICAgY3R4LnJlc3RvcmUoKTtcblxuICAgICAgYm9yZGVyRGF0YS5ib3JkZXJzLmZvckVhY2goZnVuY3Rpb24gKGJvcmRlcikge1xuICAgICAgICByZW5kZXJCb3JkZXJzKGN0eCwgYm9yZGVyLmFyZ3MsIGJvcmRlci5jb2xvcik7XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFwc2V1ZG9FbGVtZW50KSB7XG4gICAgICAgIGluamVjdFBzZXVkb0VsZW1lbnRzKGVsZW1lbnQsIHN0YWNrKTtcbiAgICAgIH1cblxuICAgICAgc3dpdGNoIChlbGVtZW50Lm5vZGVOYW1lKSB7XG4gICAgICAgIGNhc2UgXCJJTUdcIjpcbiAgICAgICAgICBpZiAoKGltYWdlID0gbG9hZEltYWdlKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSkpKSB7XG4gICAgICAgICAgICByZW5kZXJJbWFnZShjdHgsIGVsZW1lbnQsIGltYWdlLCBib3VuZHMsIGJvcmRlcnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBFcnJvciBsb2FkaW5nIDxpbWc+OlwiICsgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJJTlBVVFwiOlxuICAgICAgICAgIC8vIFRPRE8gYWRkIGFsbCByZWxldmFudCB0eXBlJ3MsIGkuZS4gSFRNTDUgbmV3IHN0dWZmXG4gICAgICAgICAgLy8gdG9kbyBhZGQgc3VwcG9ydCBmb3IgcGxhY2Vob2xkZXIgYXR0cmlidXRlIGZvciBicm93c2VycyB3aGljaCBzdXBwb3J0IGl0XG4gICAgICAgICAgaWYgKC9eKHRleHR8dXJsfGVtYWlsfHN1Ym1pdHxidXR0b258cmVzZXQpJC8udGVzdChlbGVtZW50LnR5cGUpICYmIChlbGVtZW50LnZhbHVlIHx8IGVsZW1lbnQucGxhY2Vob2xkZXIgfHwgXCJcIikubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmVuZGVyRm9ybVZhbHVlKGVsZW1lbnQsIGJvdW5kcywgc3RhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIlRFWFRBUkVBXCI6XG4gICAgICAgICAgaWYgKChlbGVtZW50LnZhbHVlIHx8IGVsZW1lbnQucGxhY2Vob2xkZXIgfHwgXCJcIikubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmVuZGVyRm9ybVZhbHVlKGVsZW1lbnQsIGJvdW5kcywgc3RhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIlNFTEVDVFwiOlxuICAgICAgICAgIGlmICgoZWxlbWVudC5vcHRpb25zIHx8IGVsZW1lbnQucGxhY2Vob2xkZXIgfHwgXCJcIikubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmVuZGVyRm9ybVZhbHVlKGVsZW1lbnQsIGJvdW5kcywgc3RhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkxJXCI6XG4gICAgICAgICAgcmVuZGVyTGlzdEl0ZW0oZWxlbWVudCwgc3RhY2ssIGJhY2tncm91bmRCb3VuZHMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiQ0FOVkFTXCI6XG4gICAgICAgICAgcmVuZGVySW1hZ2UoY3R4LCBlbGVtZW50LCBlbGVtZW50LCBib3VuZHMsIGJvcmRlcnMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhY2s7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50VmlzaWJsZShlbGVtZW50KSB7XG4gICAgICByZXR1cm4gKGdldENTUyhlbGVtZW50LCAnZGlzcGxheScpICE9PSBcIm5vbmVcIiAmJiBnZXRDU1MoZWxlbWVudCwgJ3Zpc2liaWxpdHknKSAhPT0gXCJoaWRkZW5cIiAmJiAhZWxlbWVudC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWh0bWwyY2FudmFzLWlnbm9yZVwiKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VFbGVtZW50KGVsZW1lbnQsIHN0YWNrLCBwc2V1ZG9FbGVtZW50KSB7XG4gICAgICBpZiAoaXNFbGVtZW50VmlzaWJsZShlbGVtZW50KSkge1xuICAgICAgICBzdGFjayA9IHJlbmRlckVsZW1lbnQoZWxlbWVudCwgc3RhY2ssIHBzZXVkb0VsZW1lbnQsIGZhbHNlKSB8fCBzdGFjaztcbiAgICAgICAgaWYgKCFpZ25vcmVFbGVtZW50c1JlZ0V4cC50ZXN0KGVsZW1lbnQubm9kZU5hbWUpKSB7XG4gICAgICAgICAgcGFyc2VDaGlsZHJlbihlbGVtZW50LCBzdGFjaywgcHNldWRvRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUNoaWxkcmVuKGVsZW1lbnQsIHN0YWNrLCBwc2V1ZG9FbGVtZW50KSB7XG4gICAgICBVdGlsLkNoaWxkcmVuKGVsZW1lbnQpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IG5vZGUuRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgcGFyc2VFbGVtZW50KG5vZGUsIHN0YWNrLCBwc2V1ZG9FbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSBub2RlLlRFWFRfTk9ERSkge1xuICAgICAgICAgIHJlbmRlclRleHQoZWxlbWVudCwgbm9kZSwgc3RhY2spO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgICB2YXIgYmFja2dyb3VuZCA9IG9wdGlvbnNbXCJiYWNrZ3JvdW5kLWNvbG9yXCJdO1xuICAgICAgaWYoYmFja2dyb3VuZCA9PSBcInJnYmEoMCwgMCwgMCwgMClcIiB8fMKgYmFja2dyb3VuZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBiYWNrZ3JvdW5kID0gb3B0aW9uc1tcImJhY2tncm91bmRDb2xvclwiXTtcbiAgICAgIGlmKGJhY2tncm91bmQgPT0gXCJyZ2JhKDAsIDAsIDAsIDApXCIgfHzCoGJhY2tncm91bmQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgYmFja2dyb3VuZCA9IG9wdGlvbnNbXCJiYWNrZ3JvdW5kXCJdO1xuICAgICAgaWYoYmFja2dyb3VuZCA9PSBcInJnYmEoMCwgMCwgMCwgMClcIiB8fMKgYmFja2dyb3VuZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBiYWNrZ3JvdW5kID0gZ2V0Q1NTKCQob3B0aW9uc1tcImNvbnRhaW5lclwiXSlbMF0sIFwiYmFja2dyb3VuZENvbG9yXCIpO1xuICAgICAgaWYoYmFja2dyb3VuZCA9PSBcInJnYmEoMCwgMCwgMCwgMClcIiB8fMKgYmFja2dyb3VuZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBiYWNrZ3JvdW5kID0gZ2V0Q1NTKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgXCJiYWNrZ3JvdW5kQ29sb3JcIik7XG4gICAgICBpZihiYWNrZ3JvdW5kID09IFwicmdiYSgwLCAwLCAwLCAwKVwiIHx8wqBiYWNrZ3JvdW5kID09PSB1bmRlZmluZWQpXG4gICAgICAgIGJhY2tncm91bmQgPSBnZXRDU1MoZG9jdW1lbnQuYm9keSwgXCJiYWNrZ3JvdW5kQ29sb3JcIik7XG5cbiAgICAgIHZhciB0cmFuc3BhcmVudEJhY2tncm91bmQgPSAoVXRpbC5pc1RyYW5zcGFyZW50KGJhY2tncm91bmQpICYmIGVsZW1lbnQgPT09IGRvY3VtZW50LmJvZHkpLFxuICAgICAgICAgIHN0YWNrID0gcmVuZGVyRWxlbWVudChlbGVtZW50LCBudWxsLCBmYWxzZSwgdHJhbnNwYXJlbnRCYWNrZ3JvdW5kKTtcblxuICAgICAgcGFyc2VDaGlsZHJlbihlbGVtZW50LCBzdGFjayk7XG5cbiAgICAgIGlmICh0cmFuc3BhcmVudEJhY2tncm91bmQpIHtcbiAgICAgICAgYmFja2dyb3VuZCA9IHN0YWNrLmJhY2tncm91bmRDb2xvcjtcbiAgICAgIH1cblxuICAgICAgYm9keS5yZW1vdmVDaGlsZChoaWRlUHNldWRvRWxlbWVudHMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGJhY2tncm91bmQsXG4gICAgICAgIHN0YWNrOiBzdGFja1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5pdCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGgyY3pDb250ZXh0KHppbmRleCkge1xuICAgIHJldHVybiB7XG4gICAgICB6aW5kZXg6IHppbmRleCxcbiAgICAgIGNoaWxkcmVuOiBbXVxuICAgIH07XG4gIH1cblxuICBfaHRtbDJjYW52YXMuUHJlbG9hZCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cbiAgICB2YXIgaW1hZ2VzID0ge1xuICAgICAgICBudW1Mb2FkZWQ6IDAsIC8vIGFsc28gZmFpbGVkIGFyZSBjb3VudGVkIGhlcmVcbiAgICAgICAgbnVtRmFpbGVkOiAwLFxuICAgICAgICBudW1Ub3RhbDogMCxcbiAgICAgICAgY2xlYW51cERvbmU6IGZhbHNlXG4gICAgICB9LFxuICAgICAgcGFnZU9yaWdpbixcbiAgICAgIFV0aWwgPSBfaHRtbDJjYW52YXMuVXRpbCxcbiAgICAgIG1ldGhvZHMsXG4gICAgICBpLFxuICAgICAgY291bnQgPSAwLFxuICAgICAgZWxlbWVudCA9IG9wdGlvbnMuZWxlbWVudHNbMF0gfHwgZG9jdW1lbnQuYm9keSxcbiAgICAgIGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCxcbiAgICAgIGRvbUltYWdlcyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpLCAvLyBGZXRjaCBpbWFnZXMgb2YgdGhlIHByZXNlbnQgZWxlbWVudCBvbmx5XG4gICAgICBpbWdMZW4gPSBkb21JbWFnZXMubGVuZ3RoLFxuICAgICAgbGluayA9IGRvYy5jcmVhdGVFbGVtZW50KFwiYVwiKSxcbiAgICAgIHN1cHBvcnRDT1JTID0gKGZ1bmN0aW9uIChpbWcpIHtcbiAgICAgICAgcmV0dXJuIChpbWcuY3Jvc3NPcmlnaW4gIT09IHVuZGVmaW5lZCk7XG4gICAgICB9KShuZXcgSW1hZ2UoKSksXG4gICAgICB0aW1lb3V0VGltZXI7XG5cbiAgICBsaW5rLmhyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICBwYWdlT3JpZ2luID0gbGluay5wcm90b2NvbCArIGxpbmsuaG9zdDtcblxuICAgIGZ1bmN0aW9uIGlzU2FtZU9yaWdpbih1cmwpIHtcbiAgICAgIGxpbmsuaHJlZiA9IHVybDtcbiAgICAgIGxpbmsuaHJlZiA9IGxpbmsuaHJlZjsgLy8gWUVTLCBCRUxJRVZFIElUIE9SIE5PVCwgdGhhdCBpcyByZXF1aXJlZCBmb3IgSUU5IC0gaHR0cDovL2pzZmlkZGxlLm5ldC9uaWtsYXN2aC8yZTQ4Yi9cbiAgICAgIHZhciBvcmlnaW4gPSBsaW5rLnByb3RvY29sICsgbGluay5ob3N0O1xuICAgICAgcmV0dXJuIChvcmlnaW4gPT09IHBhZ2VPcmlnaW4pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogc3RhcnQ6IGltYWdlczogXCIgKyBpbWFnZXMubnVtTG9hZGVkICsgXCIgLyBcIiArIGltYWdlcy5udW1Ub3RhbCArIFwiIChmYWlsZWQ6IFwiICsgaW1hZ2VzLm51bUZhaWxlZCArIFwiKVwiKTtcbiAgICAgIGlmICghaW1hZ2VzLmZpcnN0UnVuICYmIGltYWdlcy5udW1Mb2FkZWQgPj0gaW1hZ2VzLm51bVRvdGFsKSB7XG4gICAgICAgIFV0aWwubG9nKFwiRmluaXNoZWQgbG9hZGluZyBpbWFnZXM6ICMgXCIgKyBpbWFnZXMubnVtVG90YWwgKyBcIiAoZmFpbGVkOiBcIiArIGltYWdlcy5udW1GYWlsZWQgKyBcIilcIik7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBvcHRpb25zLmNvbXBsZXRlKGltYWdlcyk7XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE8gbW9kaWZ5IHByb3h5IHRvIHNlcnZlIGltYWdlcyB3aXRoIENPUlMgZW5hYmxlZCwgd2hlcmUgYXZhaWxhYmxlXG4gICAgZnVuY3Rpb24gcHJveHlHZXRJbWFnZSh1cmwsIGltZywgaW1hZ2VPYmopIHtcbiAgICAgIHZhciBjYWxsYmFja19uYW1lLFxuICAgICAgICBzY3JpcHRVcmwgPSBvcHRpb25zLnByb3h5LFxuICAgICAgICBzY3JpcHQ7XG5cbiAgICAgIGxpbmsuaHJlZiA9IHVybDtcbiAgICAgIHVybCA9IGxpbmsuaHJlZjsgLy8gd29yayBhcm91bmQgZm9yIHBhZ2VzIHdpdGggYmFzZSBocmVmPVwiXCIgc2V0IC0gV0FSTklORzogdGhpcyBtYXkgY2hhbmdlIHRoZSB1cmxcblxuICAgICAgY2FsbGJhY2tfbmFtZSA9ICdodG1sMmNhbnZhc18nICsgKGNvdW50KyspO1xuICAgICAgaW1hZ2VPYmouY2FsbGJhY2tuYW1lID0gY2FsbGJhY2tfbmFtZTtcblxuICAgICAgaWYgKHNjcmlwdFVybC5pbmRleE9mKFwiP1wiKSA+IC0xKSB7XG4gICAgICAgIHNjcmlwdFVybCArPSBcIiZcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjcmlwdFVybCArPSBcIj9cIjtcbiAgICAgIH1cbiAgICAgIHNjcmlwdFVybCArPSAndXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQodXJsKSArICcmY2FsbGJhY2s9JyArIGNhbGxiYWNrX25hbWU7XG4gICAgICBzY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcblxuICAgICAgd2luZG93W2NhbGxiYWNrX25hbWVdID0gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgaWYgKGEuc3Vic3RyaW5nKDAsIDYpID09PSBcImVycm9yOlwiKSB7XG4gICAgICAgICAgaW1hZ2VPYmouc3VjY2VlZGVkID0gZmFsc2U7XG4gICAgICAgICAgaW1hZ2VzLm51bUxvYWRlZCsrO1xuICAgICAgICAgIGltYWdlcy5udW1GYWlsZWQrKztcbiAgICAgICAgICBzdGFydCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldEltYWdlTG9hZEhhbmRsZXJzKGltZywgaW1hZ2VPYmopO1xuICAgICAgICAgIGltZy5zcmMgPSBhO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvd1tjYWxsYmFja19uYW1lXSA9IHVuZGVmaW5lZDsgLy8gdG8gd29yayB3aXRoIElFPDkgIC8vIE5PVEU6IHRoYXQgdGhlIHVuZGVmaW5lZCBjYWxsYmFjayBwcm9wZXJ0eS1uYW1lIHN0aWxsIGV4aXN0cyBvbiB0aGUgd2luZG93IG9iamVjdCAoZm9yIElFPDkpXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGVsZXRlIHdpbmRvd1tjYWxsYmFja19uYW1lXTsgLy8gZm9yIGFsbCBicm93c2VyIHRoYXQgc3VwcG9ydCB0aGlzXG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7fVxuICAgICAgICBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgICBzY3JpcHQgPSBudWxsO1xuICAgICAgICBkZWxldGUgaW1hZ2VPYmouc2NyaXB0O1xuICAgICAgICBkZWxldGUgaW1hZ2VPYmouY2FsbGJhY2tuYW1lO1xuICAgICAgfTtcblxuICAgICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJ0ZXh0L2phdmFzY3JpcHRcIik7XG4gICAgICBzY3JpcHQuc2V0QXR0cmlidXRlKFwic3JjXCIsIHNjcmlwdFVybCk7XG4gICAgICBpbWFnZU9iai5zY3JpcHQgPSBzY3JpcHQ7XG4gICAgICB3aW5kb3cuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZFBzZXVkb0VsZW1lbnQoZWxlbWVudCwgdHlwZSkge1xuICAgICAgdmFyIHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgdHlwZSksXG4gICAgICAgIGNvbnRlbnQgPSBzdHlsZS5jb250ZW50O1xuICAgICAgaWYgKGNvbnRlbnQuc3Vic3RyKDAsIDMpID09PSAndXJsJykge1xuICAgICAgICBtZXRob2RzLmxvYWRJbWFnZShfaHRtbDJjYW52YXMuVXRpbC5wYXJzZUJhY2tncm91bmRJbWFnZShjb250ZW50KVswXS5hcmdzWzBdKTtcbiAgICAgIH1cbiAgICAgIGxvYWRCYWNrZ3JvdW5kSW1hZ2VzKHN0eWxlLmJhY2tncm91bmRJbWFnZSwgZWxlbWVudCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZFBzZXVkb0VsZW1lbnRJbWFnZXMoZWxlbWVudCkge1xuICAgICAgbG9hZFBzZXVkb0VsZW1lbnQoZWxlbWVudCwgXCI6YmVmb3JlXCIpO1xuICAgICAgbG9hZFBzZXVkb0VsZW1lbnQoZWxlbWVudCwgXCI6YWZ0ZXJcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZEdyYWRpZW50SW1hZ2UoYmFja2dyb3VuZEltYWdlLCBib3VuZHMpIHtcbiAgICAgIHZhciBpbWcgPSBfaHRtbDJjYW52YXMuR2VuZXJhdGUuR3JhZGllbnQoYmFja2dyb3VuZEltYWdlLCBib3VuZHMpO1xuXG4gICAgICBpZiAoaW1nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaW1hZ2VzW2JhY2tncm91bmRJbWFnZV0gPSB7XG4gICAgICAgICAgaW1nOiBpbWcsXG4gICAgICAgICAgc3VjY2VlZGVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIGltYWdlcy5udW1Ub3RhbCsrO1xuICAgICAgICBpbWFnZXMubnVtTG9hZGVkKys7XG4gICAgICAgIHN0YXJ0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW52YWxpZEJhY2tncm91bmRzKGJhY2tncm91bmRfaW1hZ2UpIHtcbiAgICAgIHJldHVybiAoYmFja2dyb3VuZF9pbWFnZSAmJiBiYWNrZ3JvdW5kX2ltYWdlLm1ldGhvZCAmJiBiYWNrZ3JvdW5kX2ltYWdlLmFyZ3MgJiYgYmFja2dyb3VuZF9pbWFnZS5hcmdzLmxlbmd0aCA+IDApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRCYWNrZ3JvdW5kSW1hZ2VzKGJhY2tncm91bmRfaW1hZ2UsIGVsKSB7XG4gICAgICB2YXIgYm91bmRzO1xuXG4gICAgICBfaHRtbDJjYW52YXMuVXRpbC5wYXJzZUJhY2tncm91bmRJbWFnZShiYWNrZ3JvdW5kX2ltYWdlKS5maWx0ZXIoaW52YWxpZEJhY2tncm91bmRzKS5mb3JFYWNoKGZ1bmN0aW9uIChiYWNrZ3JvdW5kX2ltYWdlKSB7XG4gICAgICAgIGlmIChiYWNrZ3JvdW5kX2ltYWdlLm1ldGhvZCA9PT0gJ3VybCcpIHtcbiAgICAgICAgICBtZXRob2RzLmxvYWRJbWFnZShiYWNrZ3JvdW5kX2ltYWdlLmFyZ3NbMF0pO1xuICAgICAgICB9IGVsc2UgaWYgKGJhY2tncm91bmRfaW1hZ2UubWV0aG9kLm1hdGNoKC9cXC0/Z3JhZGllbnQkLykpIHtcbiAgICAgICAgICBpZiAoYm91bmRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGJvdW5kcyA9IF9odG1sMmNhbnZhcy5VdGlsLkJvdW5kcyhlbCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxvYWRHcmFkaWVudEltYWdlKGJhY2tncm91bmRfaW1hZ2UudmFsdWUsIGJvdW5kcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEltYWdlcyhlbCkge1xuICAgICAgdmFyIGVsTm9kZVR5cGUgPSBmYWxzZTtcblxuICAgICAgLy8gRmlyZWZveCBmYWlscyB3aXRoIHBlcm1pc3Npb24gZGVuaWVkIG9uIHBhZ2VzIHdpdGggaWZyYW1lc1xuICAgICAgdHJ5IHtcbiAgICAgICAgVXRpbC5DaGlsZHJlbihlbCkuZm9yRWFjaChnZXRJbWFnZXMpO1xuICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgdHJ5IHtcbiAgICAgICAgZWxOb2RlVHlwZSA9IGVsLm5vZGVUeXBlO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgZWxOb2RlVHlwZSA9IGZhbHNlO1xuICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBmYWlsZWQgdG8gYWNjZXNzIHNvbWUgZWxlbWVudCdzIG5vZGVUeXBlIC0gRXhjZXB0aW9uOiBcIiArIGV4Lm1lc3NhZ2UpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZWxOb2RlVHlwZSA9PT0gMSB8fCBlbE5vZGVUeXBlID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICBsb2FkUHNldWRvRWxlbWVudEltYWdlcyhlbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbG9hZEJhY2tncm91bmRJbWFnZXMoVXRpbC5nZXRDU1MoZWwsICdiYWNrZ3JvdW5kSW1hZ2UnKSwgZWwpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogZmFpbGVkIHRvIGdldCBiYWNrZ3JvdW5kLWltYWdlIC0gRXhjZXB0aW9uOiBcIiArIGUubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgbG9hZEJhY2tncm91bmRJbWFnZXMoZWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldEltYWdlTG9hZEhhbmRsZXJzKGltZywgaW1hZ2VPYmopIHtcblxuICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaW1hZ2VPYmoudGltZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIENPUlMgc3VjY2VlZGVkXG4gICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChpbWFnZU9iai50aW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICBpbWFnZXMubnVtTG9hZGVkKys7XG4gICAgICAgIGltYWdlT2JqLnN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICAgIGltZy5vbmVycm9yID0gaW1nLm9ubG9hZCA9IG51bGw7XG4gICAgICAgIHN0YXJ0KCk7XG4gICAgICB9O1xuXG4gICAgICBpbWcub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAoaW1nLmNyb3NzT3JpZ2luID09PSBcImFub255bW91c1wiKSB7XG4gICAgICAgICAgLy8gQ09SUyBmYWlsZWRcbiAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGltYWdlT2JqLnRpbWVyKTtcblxuICAgICAgICAgIC8vIGxldCdzIHRyeSB3aXRoIHByb3h5IGluc3RlYWRcbiAgICAgICAgICBpZiAob3B0aW9ucy5wcm94eSkge1xuICAgICAgICAgICAgdmFyIHNyYyA9IGltZy5zcmM7XG4gICAgICAgICAgICBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltYWdlT2JqLmltZyA9IGltZztcbiAgICAgICAgICAgIGltZy5zcmMgPSBzcmM7XG5cbiAgICAgICAgICAgIHByb3h5R2V0SW1hZ2UoaW1nLnNyYywgaW1nLCBpbWFnZU9iaik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW1hZ2VzLm51bUxvYWRlZCsrO1xuICAgICAgICBpbWFnZXMubnVtRmFpbGVkKys7XG4gICAgICAgIGltYWdlT2JqLnN1Y2NlZWRlZCA9IGZhbHNlO1xuICAgICAgICBpbWcub25lcnJvciA9IGltZy5vbmxvYWQgPSBudWxsO1xuXG4gICAgICAgIHN0YXJ0KCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIG1ldGhvZHMgPSB7XG4gICAgICBsb2FkSW1hZ2U6IGZ1bmN0aW9uIChzcmMpIHtcblxuICAgICAgICB2YXIgaW1nLCBpbWFnZU9iajtcbiAgICAgICAgaWYgKHNyYyAmJiBpbWFnZXNbc3JjXSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaWYgKHNyYy5tYXRjaCgvZGF0YTppbWFnZVxcLy4qO2Jhc2U2NCwvaSkpIHtcbiAgICAgICAgICAgICAgaW1nLnNyYyA9IHNyYy5yZXBsYWNlKC91cmxcXChbJ1wiXXswLH18WydcIl17MCx9XFwpJC9pZywgJycpO1xuICAgICAgICAgICAgICBpbWFnZU9iaiA9IGltYWdlc1tzcmNdID0ge1xuICAgICAgICAgICAgICAgIGltZzogaW1nXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGltYWdlcy5udW1Ub3RhbCsrO1xuICAgICAgICAgICAgICBzZXRJbWFnZUxvYWRIYW5kbGVycyhpbWcsIGltYWdlT2JqKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNTYW1lT3JpZ2luKHNyYykgfHwgb3B0aW9ucy5hbGxvd1RhaW50ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgIGltYWdlT2JqID0gaW1hZ2VzW3NyY10gPSB7XG4gICAgICAgICAgICAgICAgaW1nOiBpbWdcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgaW1hZ2VzLm51bVRvdGFsKys7XG4gICAgICAgICAgICAgIHNldEltYWdlTG9hZEhhbmRsZXJzKGltZywgaW1hZ2VPYmopO1xuICAgICAgICAgICAgICBpbWcuc3JjID0gc3JjO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnRDT1JTICYmICFvcHRpb25zLmFsbG93VGFpbnQgJiYgb3B0aW9ucy51c2VDT1JTKSB7XG4gICAgICAgICAgICAgIC8vIGF0dGVtcHQgdG8gbG9hZCB3aXRoIENPUlNcblxuICAgICAgICAgICAgICBpbWcuY3Jvc3NPcmlnaW4gPSBcImFub255bW91c1wiO1xuICAgICAgICAgICAgICBpbWFnZU9iaiA9IGltYWdlc1tzcmNdID0geyBpbWc6IGltZyB9O1xuICAgICAgICAgICAgICBpbWFnZXMubnVtVG90YWwrKztcblxuICAgICAgICAgICAgICBzZXRJbWFnZUxvYWRIYW5kbGVycyhpbWcsIGltYWdlT2JqKTtcbiAgICAgICAgICAgICAgaW1nLnNyYyA9IHNyYztcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnByb3h5KSB7XG4gICAgICAgICAgICAgIGltYWdlT2JqID0gaW1hZ2VzW3NyY10gPSB7XG4gICAgICAgICAgICAgICAgaW1nOiBpbWdcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgaW1hZ2VzLm51bVRvdGFsKys7XG4gICAgICAgICAgICAgIHByb3h5R2V0SW1hZ2Uoc3JjLCBpbWcsIGltYWdlT2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9LFxuICAgICAgY2xlYW51cERPTTogZnVuY3Rpb24gKGNhdXNlKSB7XG5cbiAgICAgICAgdmFyIGltZywgc3JjO1xuICAgICAgICBpZiAoIWltYWdlcy5jbGVhbnVwRG9uZSkge1xuICAgICAgICAgIGlmIChjYXVzZSAmJiB0eXBlb2YgY2F1c2UgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IENsZWFudXAgYmVjYXVzZTogXCIgKyBjYXVzZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IENsZWFudXAgYWZ0ZXIgdGltZW91dDogXCIgKyBvcHRpb25zLnRpbWVvdXQgKyBcIiBtcy5cIik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yIChzcmMgaW4gaW1hZ2VzKSB7XG4gICAgICAgICAgICBpZiAoaW1hZ2VzLmhhc093blByb3BlcnR5KHNyYykpIHtcbiAgICAgICAgICAgICAgaW1nID0gaW1hZ2VzW3NyY107XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgaW1nID09PSBcIm9iamVjdFwiICYmIGltZy5jYWxsYmFja25hbWUgJiYgaW1nLnN1Y2NlZWRlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FuY2VsIHByb3h5IGltYWdlIHJlcXVlc3RcbiAgICAgICAgICAgICAgICB3aW5kb3dbaW1nLmNhbGxiYWNrbmFtZV0gPSB1bmRlZmluZWQ7IC8vIHRvIHdvcmsgd2l0aCBJRTw5ICAvLyBOT1RFOiB0aGF0IHRoZSB1bmRlZmluZWQgY2FsbGJhY2sgcHJvcGVydHktbmFtZSBzdGlsbCBleGlzdHMgb24gdGhlIHdpbmRvdyBvYmplY3QgKGZvciBJRTw5KVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBkZWxldGUgd2luZG93W2ltZy5jYWxsYmFja25hbWVdOyAvLyBmb3IgYWxsIGJyb3dzZXIgdGhhdCBzdXBwb3J0IHRoaXNcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleCkge31cbiAgICAgICAgICAgICAgICBpZiAoaW1nLnNjcmlwdCAmJiBpbWcuc2NyaXB0LnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgIGltZy5zY3JpcHQuc2V0QXR0cmlidXRlKFwic3JjXCIsIFwiYWJvdXQ6YmxhbmtcIik7IC8vIHRyeSB0byBjYW5jZWwgcnVubmluZyByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICBpbWcuc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaW1nLnNjcmlwdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGltYWdlcy5udW1Mb2FkZWQrKztcbiAgICAgICAgICAgICAgICBpbWFnZXMubnVtRmFpbGVkKys7XG4gICAgICAgICAgICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogQ2xlYW5lZCB1cCBmYWlsZWQgaW1nOiAnXCIgKyBzcmMgKyBcIicgU3RlcHM6IFwiICsgaW1hZ2VzLm51bUxvYWRlZCArIFwiIC8gXCIgKyBpbWFnZXMubnVtVG90YWwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gY2FuY2VsIGFueSBwZW5kaW5nIHJlcXVlc3RzXG4gICAgICAgICAgaWYgKHdpbmRvdy5zdG9wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zdG9wKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5leGVjQ29tbWFuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcIlN0b3BcIiwgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZG9jdW1lbnQuY2xvc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuY2xvc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW1hZ2VzLmNsZWFudXBEb25lID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoIShjYXVzZSAmJiB0eXBlb2YgY2F1c2UgPT09IFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICBzdGFydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgcmVuZGVyaW5nRG9uZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmICh0aW1lb3V0VGltZXIpIHtcbiAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRUaW1lcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMudGltZW91dCA+IDApIHtcbiAgICAgIHRpbWVvdXRUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KG1ldGhvZHMuY2xlYW51cERPTSwgb3B0aW9ucy50aW1lb3V0KTtcbiAgICB9XG5cbiAgICBVdGlsLmxvZygnaHRtbDJjYW52YXM6IFByZWxvYWQgc3RhcnRzOiBmaW5kaW5nIGJhY2tncm91bmQtaW1hZ2VzJyk7XG4gICAgaW1hZ2VzLmZpcnN0UnVuID0gdHJ1ZTtcblxuICAgIGdldEltYWdlcyhlbGVtZW50KTtcblxuICAgIFV0aWwubG9nKCdodG1sMmNhbnZhczogUHJlbG9hZDogRmluZGluZyBpbWFnZXMnKTtcbiAgICAvLyBsb2FkIDxpbWc+IGltYWdlc1xuICAgIGZvciAoaSA9IDA7IGkgPCBpbWdMZW47IGkgKz0gMSkge1xuICAgICAgbWV0aG9kcy5sb2FkSW1hZ2UoZG9tSW1hZ2VzW2ldLmdldEF0dHJpYnV0ZShcInNyY1wiKSk7XG4gICAgfVxuXG4gICAgaW1hZ2VzLmZpcnN0UnVuID0gZmFsc2U7XG4gICAgVXRpbC5sb2coJ2h0bWwyY2FudmFzOiBQcmVsb2FkOiBEb25lLicpO1xuICAgIGlmIChpbWFnZXMubnVtVG90YWwgPT09IGltYWdlcy5udW1Mb2FkZWQpXG4gICAgICBzdGFydCgpO1xuXG4gICAgcmV0dXJuIG1ldGhvZHM7XG4gIH07XG5cbiAgX2h0bWwyY2FudmFzLlJlbmRlcmVyID0gZnVuY3Rpb24gKHBhcnNlUXVldWUsIG9wdGlvbnMpIHtcblxuICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL0NTUzIxL3ppbmRleC5odG1sXG4gICAgZnVuY3Rpb24gY3JlYXRlUmVuZGVyUXVldWUocGFyc2VRdWV1ZSkge1xuICAgICAgdmFyIHF1ZXVlID0gW10sXG4gICAgICAgIHJvb3RDb250ZXh0O1xuXG4gICAgICByb290Q29udGV4dCA9IChmdW5jdGlvbiBidWlsZFN0YWNraW5nQ29udGV4dChyb290Tm9kZSkge1xuICAgICAgICB2YXIgcm9vdENvbnRleHQgPSB7fTtcblxuICAgICAgICBmdW5jdGlvbiBpbnNlcnQoY29udGV4dCwgbm9kZSwgc3BlY2lhbFBhcmVudCkge1xuICAgICAgICAgIHZhciB6aSA9IChub2RlLnpJbmRleC56aW5kZXggPT09ICdhdXRvJykgPyAwIDogTnVtYmVyKG5vZGUuekluZGV4LnppbmRleCksXG4gICAgICAgICAgICBjb250ZXh0Rm9yQ2hpbGRyZW4gPSBjb250ZXh0LCAvLyB0aGUgc3RhY2tpbmcgY29udGV4dCBmb3IgY2hpbGRyZW5cbiAgICAgICAgICAgIGlzUG9zaXRpb25lZCA9IG5vZGUuekluZGV4LmlzUG9zaXRpb25lZCxcbiAgICAgICAgICAgIGlzRmxvYXRlZCA9IG5vZGUuekluZGV4LmlzRmxvYXRlZCxcbiAgICAgICAgICAgIHN0dWIgPSB7XG4gICAgICAgICAgICAgIG5vZGU6IG5vZGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGlsZHJlbkRlc3QgPSBzcGVjaWFsUGFyZW50OyAvLyB3aGVyZSBjaGlsZHJlbiB3aXRob3V0IHotaW5kZXggc2hvdWxkIGJlIHB1c2hlZCBpbnRvXG5cbiAgICAgICAgICBpZiAobm9kZS56SW5kZXgub3duU3RhY2tpbmcpIHtcbiAgICAgICAgICAgIC8vICchJyBjb21lcyBiZWZvcmUgbnVtYmVycyBpbiBzb3J0ZWQgYXJyYXlcbiAgICAgICAgICAgIGNvbnRleHRGb3JDaGlsZHJlbiA9IHN0dWIuY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgJyEnOiBbe1xuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdXG4gICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2hpbGRyZW5EZXN0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaXNQb3NpdGlvbmVkIHx8IGlzRmxvYXRlZCkge1xuICAgICAgICAgICAgY2hpbGRyZW5EZXN0ID0gc3R1Yi5jaGlsZHJlbiA9IFtdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh6aSA9PT0gMCAmJiBzcGVjaWFsUGFyZW50KSB7XG4gICAgICAgICAgICBzcGVjaWFsUGFyZW50LnB1c2goc3R1Yik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghY29udGV4dFt6aV0pIHtcbiAgICAgICAgICAgICAgY29udGV4dFt6aV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRleHRbemldLnB1c2goc3R1Yik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbm9kZS56SW5kZXguY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGROb2RlKSB7XG4gICAgICAgICAgICBpbnNlcnQoY29udGV4dEZvckNoaWxkcmVuLCBjaGlsZE5vZGUsIGNoaWxkcmVuRGVzdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaW5zZXJ0KHJvb3RDb250ZXh0LCByb290Tm9kZSk7XG4gICAgICAgIHJldHVybiByb290Q29udGV4dDtcbiAgICAgIH0pKHBhcnNlUXVldWUpO1xuXG4gICAgICBmdW5jdGlvbiBzb3J0Wihjb250ZXh0KSB7XG4gICAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQpLnNvcnQoKS5mb3JFYWNoKGZ1bmN0aW9uICh6aSkge1xuICAgICAgICAgIHZhciBub25Qb3NpdGlvbmVkID0gW10sXG4gICAgICAgICAgICBmbG9hdGVkID0gW10sXG4gICAgICAgICAgICBwb3NpdGlvbmVkID0gW10sXG4gICAgICAgICAgICBsaXN0ID0gW107XG5cbiAgICAgICAgICAvLyBwb3NpdGlvbmVkIGFmdGVyIHN0YXRpY1xuICAgICAgICAgIGNvbnRleHRbemldLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmICh2Lm5vZGUuekluZGV4LmlzUG9zaXRpb25lZCB8fCB2Lm5vZGUuekluZGV4Lm9wYWNpdHkgPCAxKSB7XG4gICAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtY29sb3IvI3RyYW5zcGFyZW5jeVxuICAgICAgICAgICAgICAvLyBub24tcG9zaXRpb25lZCBlbGVtZW50IHdpdGggb3BhY3RpeSA8IDEgc2hvdWxkIGJlIHN0YWNrZWQgYXMgaWYgaXQgd2VyZSBhIHBvc2l0aW9uZWQgZWxlbWVudCB3aXRoIOKAmHotaW5kZXg6IDDigJkgYW5kIOKAmG9wYWNpdHk6IDHigJkuXG4gICAgICAgICAgICAgIHBvc2l0aW9uZWQucHVzaCh2KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodi5ub2RlLnpJbmRleC5pc0Zsb2F0ZWQpIHtcbiAgICAgICAgICAgICAgZmxvYXRlZC5wdXNoKHYpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbm9uUG9zaXRpb25lZC5wdXNoKHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgKGZ1bmN0aW9uIHdhbGsoYXJyKSB7XG4gICAgICAgICAgICBhcnIuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICBsaXN0LnB1c2godik7XG4gICAgICAgICAgICAgIGlmICh2LmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgd2Fsayh2LmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkobm9uUG9zaXRpb25lZC5jb25jYXQoZmxvYXRlZCwgcG9zaXRpb25lZCkpO1xuXG4gICAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICBpZiAodi5jb250ZXh0KSB7XG4gICAgICAgICAgICAgIHNvcnRaKHYuY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBxdWV1ZS5wdXNoKHYubm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBzb3J0Wihyb290Q29udGV4dCk7XG5cbiAgICAgIHJldHVybiBxdWV1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRSZW5kZXJlcihyZW5kZXJlck5hbWUpIHtcbiAgICAgIHZhciByZW5kZXJlcjtcblxuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnJlbmRlcmVyID09PSBcInN0cmluZ1wiICYmIF9odG1sMmNhbnZhcy5SZW5kZXJlcltyZW5kZXJlck5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVuZGVyZXIgPSBfaHRtbDJjYW52YXMuUmVuZGVyZXJbcmVuZGVyZXJOYW1lXShvcHRpb25zKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlbmRlcmVyTmFtZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJlbmRlcmVyID0gcmVuZGVyZXJOYW1lKG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biByZW5kZXJlclwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiByZW5kZXJlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcmVuZGVyZXIgZGVmaW5lZFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZW5kZXJlcjtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0UmVuZGVyZXIob3B0aW9ucy5yZW5kZXJlcikocGFyc2VRdWV1ZSwgb3B0aW9ucywgZG9jdW1lbnQsIGNyZWF0ZVJlbmRlclF1ZXVlKHBhcnNlUXVldWUuc3RhY2spLCBfaHRtbDJjYW52YXMpO1xuICB9O1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLlN1cHBvcnQgPSBmdW5jdGlvbiAob3B0aW9ucywgZG9jKSB7XG5cbiAgICBmdW5jdGlvbiBzdXBwb3J0U1ZHUmVuZGVyaW5nKCkge1xuICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpLFxuICAgICAgICBjYW52YXMgPSBkb2MuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKSxcbiAgICAgICAgY3R4ID0gKGNhbnZhcy5nZXRDb250ZXh0ID09PSB1bmRlZmluZWQpID8gZmFsc2UgOiBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgaWYgKGN0eCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLmhlaWdodCA9IDEwO1xuICAgICAgaW1nLnNyYyA9IFtcbiAgICAgICAgXCJkYXRhOmltYWdlL3N2Zyt4bWwsXCIsXG4gICAgICAgIFwiPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+XCIsXG4gICAgICAgIFwiPGZvcmVpZ25PYmplY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJz5cIixcbiAgICAgICAgXCI8ZGl2IHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJyBzdHlsZT0nd2lkdGg6MTA7aGVpZ2h0OjEwOyc+XCIsXG4gICAgICAgIFwic3VwXCIsXG4gICAgICAgIFwiPC9kaXY+XCIsXG4gICAgICAgIFwiPC9mb3JlaWduT2JqZWN0PlwiLFxuICAgICAgICBcIjwvc3ZnPlwiXG4gICAgICBdLmpvaW4oXCJcIik7XG4gICAgICB0cnkge1xuICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgICAgIGNhbnZhcy50b0RhdGFVUkwoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgX2h0bWwyY2FudmFzLlV0aWwubG9nKCdodG1sMmNhbnZhczogUGFyc2U6IFNWRyBwb3dlcmVkIHJlbmRlcmluZyBhdmFpbGFibGUnKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRlc3Qgd2hldGhlciB3ZSBjYW4gdXNlIHJhbmdlcyB0byBtZWFzdXJlIGJvdW5kaW5nIGJveGVzXG4gICAgLy8gT3BlcmEgZG9lc24ndCBwcm92aWRlIHZhbGlkIGJvdW5kcy5oZWlnaHQvYm90dG9tIGV2ZW4gdGhvdWdoIGl0IHN1cHBvcnRzIHRoZSBtZXRob2QuXG5cbiAgICBmdW5jdGlvbiBzdXBwb3J0UmFuZ2VCb3VuZHMoKSB7XG4gICAgICB2YXIgciwgdGVzdEVsZW1lbnQsIHJhbmdlQm91bmRzLCByYW5nZUhlaWdodCwgc3VwcG9ydCA9IGZhbHNlO1xuXG4gICAgICBpZiAoZG9jLmNyZWF0ZVJhbmdlKSB7XG4gICAgICAgIHIgPSBkb2MuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgaWYgKHIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KSB7XG4gICAgICAgICAgdGVzdEVsZW1lbnQgPSBkb2MuY3JlYXRlRWxlbWVudCgnYm91bmR0ZXN0Jyk7XG4gICAgICAgICAgdGVzdEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gXCIxMjNweFwiO1xuICAgICAgICAgIHRlc3RFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgZG9jLmJvZHkuYXBwZW5kQ2hpbGQodGVzdEVsZW1lbnQpO1xuXG4gICAgICAgICAgci5zZWxlY3ROb2RlKHRlc3RFbGVtZW50KTtcbiAgICAgICAgICByYW5nZUJvdW5kcyA9IHIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgcmFuZ2VIZWlnaHQgPSByYW5nZUJvdW5kcy5oZWlnaHQ7XG5cbiAgICAgICAgICBpZiAocmFuZ2VIZWlnaHQgPT09IDEyMykge1xuICAgICAgICAgICAgc3VwcG9ydCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRvYy5ib2R5LnJlbW92ZUNoaWxkKHRlc3RFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3VwcG9ydDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2VCb3VuZHM6IHN1cHBvcnRSYW5nZUJvdW5kcygpLFxuICAgICAgc3ZnUmVuZGVyaW5nOiBvcHRpb25zLnN2Z1JlbmRlcmluZyAmJiBzdXBwb3J0U1ZHUmVuZGVyaW5nKClcbiAgICB9O1xuICB9O1xuICB3aW5kb3cuaHRtbDJjYW52YXMgPSBmdW5jdGlvbiAoZWxlbWVudHMsIG9wdHMpIHtcblxuICAgIGVsZW1lbnRzID0gKGVsZW1lbnRzLmxlbmd0aCkgPyBlbGVtZW50cyA6IFtlbGVtZW50c107XG4gICAgdmFyIHF1ZXVlLFxuICAgICAgY2FudmFzLFxuICAgICAgb3B0aW9ucyA9IHtcblxuICAgICAgICAvLyBnZW5lcmFsXG4gICAgICAgIGxvZ2dpbmc6IGZhbHNlLFxuICAgICAgICBjb250YWluZXI6IG51bGwsXG4gICAgICAgIGVsZW1lbnRzOiBlbGVtZW50cyxcbiAgICAgICAgYmFja2dyb3VuZDogdW5kZWZpbmVkLFxuXG4gICAgICAgIC8vIHByZWxvYWQgb3B0aW9uc1xuICAgICAgICBwcm94eTogbnVsbCxcbiAgICAgICAgdGltZW91dDogMCwgLy8gbm8gdGltZW91dFxuICAgICAgICB1c2VDT1JTOiBmYWxzZSwgLy8gdHJ5IHRvIGxvYWQgaW1hZ2VzIGFzIENPUlMgKHdoZXJlIGF2YWlsYWJsZSksIGJlZm9yZSBmYWxsaW5nIGJhY2sgdG8gcHJveHlcbiAgICAgICAgYWxsb3dUYWludDogZmFsc2UsIC8vIHdoZXRoZXIgdG8gYWxsb3cgaW1hZ2VzIHRvIHRhaW50IHRoZSBjYW52YXMsIHdvbid0IG5lZWQgcHJveHkgaWYgc2V0IHRvIHRydWVcblxuICAgICAgICAvLyBwYXJzZSBvcHRpb25zXG4gICAgICAgIHN2Z1JlbmRlcmluZzogZmFsc2UsIC8vIHVzZSBzdmcgcG93ZXJlZCByZW5kZXJpbmcgd2hlcmUgYXZhaWxhYmxlIChGRjExKylcbiAgICAgICAgaWdub3JlRWxlbWVudHM6IFwiSUZSQU1FfE9CSkVDVHxQQVJBTVwiLFxuICAgICAgICB1c2VPdmVyZmxvdzogdHJ1ZSxcbiAgICAgICAgbGV0dGVyUmVuZGVyaW5nOiBmYWxzZSxcbiAgICAgICAgY2hpbmVzZTogZmFsc2UsXG5cbiAgICAgICAgLy8gcmVuZGVyIG9wdGlvbnNcbiAgICAgICAgd2lkdGg6IG51bGwsXG4gICAgICAgIGhlaWdodDogbnVsbCxcbiAgICAgICAgc2NhbGU6IDEsXG4gICAgICAgIHRhaW50VGVzdDogdHJ1ZSwgLy8gZG8gYSB0YWludCB0ZXN0IHdpdGggYWxsIGltYWdlcyBiZWZvcmUgYXBwbHlpbmcgdG8gY2FudmFzXG4gICAgICAgIHJlbmRlcmVyOiBcIkNhbnZhc1wiXG4gICAgICB9O1xuXG4gICAgb3B0aW9ucyA9IF9odG1sMmNhbnZhcy5VdGlsLkV4dGVuZChvcHRzLCBvcHRpb25zKTtcbiAgICB2YXIgY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXIgfHzCoG9wdGlvbnMuZWxlbWVudHNbMF07XG4gICAgaWYob3B0aW9uc1tcIndpZHRoXCJdKSAgb3B0aW9uc1tcIndpZHRoXCJdICA9IChvcHRpb25zW1wid2lkdGhcIl0uaW5kZXhPZihcIiVcIikgIT09IC0xKSA/IGNvbnRhaW5lci53aWR0aCgpICogcGFyc2VGbG9hdChvcHRpb25zW1wid2lkdGhcIl0pIC8gMTAwIDogb3B0aW9uc1tcIndpZHRoXCJdO1xuICAgIGlmKG9wdGlvbnNbXCJoZWlnaHRcIl0pIG9wdGlvbnNbXCJoZWlnaHRcIl0gPSAob3B0aW9uc1tcImhlaWdodFwiXS5pbmRleE9mKFwiJVwiKSAhPT0gLTEpID8gY29udGFpbmVyLmhlaWdodCgpICogcGFyc2VGbG9hdChvcHRpb25zW1wiaGVpZ2h0XCJdKSAvIDEwMCA6IG9wdGlvbnNbXCJoZWlnaHRcIl07XG4gICAgaWYob3B0aW9uc1tcImxlZnRcIl0pIG9wdGlvbnNbXCJsZWZ0XCJdID0gKG9wdGlvbnNbXCJsZWZ0XCJdLmluZGV4T2YoXCIlXCIpICE9PSAtMSkgPyAkKGVsZW1lbnRzWzBdKS53aWR0aCgpICogcGFyc2VGbG9hdChvcHRpb25zW1wibGVmdFwiXSkgLyAxMDAgOiBvcHRpb25zW1wibGVmdFwiXTtcbiAgICBpZihvcHRpb25zW1widG9wXCJdKSBvcHRpb25zW1widG9wXCJdID0gKG9wdGlvbnNbXCJ0b3BcIl0uaW5kZXhPZihcIiVcIikgIT09IC0xKSA/ICQoZWxlbWVudHNbMF0pLmhlaWdodCgpICogcGFyc2VGbG9hdChvcHRpb25zW1widG9wXCJdKSAvIDEwMCA6IG9wdGlvbnNbXCJ0b3BcIl07XG4gICAgX2h0bWwyY2FudmFzLmxvZ2dpbmcgPSBvcHRpb25zLmxvZ2dpbmc7XG4gICAgb3B0aW9ucy5jb21wbGV0ZSA9IGZ1bmN0aW9uIChpbWFnZXMpIHtcblxuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9ucHJlbG9hZGVkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMub25wcmVsb2FkZWQoaW1hZ2VzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHF1ZXVlID0gX2h0bWwyY2FudmFzLlBhcnNlKGltYWdlcywgb3B0aW9ucyk7XG5cbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbnBhcnNlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChvcHRpb25zLm9ucGFyc2VkKHF1ZXVlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FudmFzID0gX2h0bWwyY2FudmFzLlJlbmRlcmVyKHF1ZXVlLCBvcHRpb25zKTtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbnJlbmRlcmVkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgb3B0aW9ucy5vbnJlbmRlcmVkKGNhbnZhcyk7XG4gICAgICB9XG5cblxuICAgIH07XG5cbiAgICAvLyBmb3IgcGFnZXMgd2l0aG91dCBpbWFnZXMsIHdlIHN0aWxsIHdhbnQgdGhpcyB0byBiZSBhc3luYywgaS5lLiByZXR1cm4gbWV0aG9kcyBiZWZvcmUgZXhlY3V0aW5nXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgX2h0bWwyY2FudmFzLlByZWxvYWQob3B0aW9ucyk7XG4gICAgfSwgMCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVuZGVyOiBmdW5jdGlvbiAocXVldWUsIG9wdHMpIHtcbiAgICAgICAgcmV0dXJuIF9odG1sMmNhbnZhcy5SZW5kZXJlcihxdWV1ZSwgX2h0bWwyY2FudmFzLlV0aWwuRXh0ZW5kKG9wdHMsIG9wdGlvbnMpKTtcbiAgICAgIH0sXG4gICAgICBwYXJzZTogZnVuY3Rpb24gKGltYWdlcywgb3B0cykge1xuICAgICAgICByZXR1cm4gX2h0bWwyY2FudmFzLlBhcnNlKGltYWdlcywgX2h0bWwyY2FudmFzLlV0aWwuRXh0ZW5kKG9wdHMsIG9wdGlvbnMpKTtcbiAgICAgIH0sXG4gICAgICBwcmVsb2FkOiBmdW5jdGlvbiAob3B0cykge1xuICAgICAgICByZXR1cm4gX2h0bWwyY2FudmFzLlByZWxvYWQoX2h0bWwyY2FudmFzLlV0aWwuRXh0ZW5kKG9wdHMsIG9wdGlvbnMpKTtcbiAgICAgIH0sXG4gICAgICBsb2c6IF9odG1sMmNhbnZhcy5VdGlsLmxvZ1xuICAgIH07XG4gIH07XG5cbiAgd2luZG93Lmh0bWwyY2FudmFzLmxvZyA9IF9odG1sMmNhbnZhcy5VdGlsLmxvZzsgLy8gZm9yIHJlbmRlcmVyc1xuICB3aW5kb3cuaHRtbDJjYW52YXMuUmVuZGVyZXIgPSB7XG4gICAgQ2FudmFzOiB1bmRlZmluZWQgLy8gV2UgYXJlIGFzc3VtaW5nIHRoaXMgd2lsbCBiZSB1c2VkXG4gIH07XG4gIF9odG1sMmNhbnZhcy5SZW5kZXJlci5DYW52YXMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgZG9jID0gZG9jdW1lbnQsXG4gICAgICBzYWZlSW1hZ2VzID0gW10sXG4gICAgICB0ZXN0Q2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKSxcbiAgICAgIHRlc3RjdHggPSB0ZXN0Q2FudmFzLmdldENvbnRleHQoXCIyZFwiKSxcbiAgICAgIFV0aWwgPSBfaHRtbDJjYW52YXMuVXRpbCxcbiAgICAgIGNhbnZhcyA9IG9wdGlvbnMuY2FudmFzIHx8IGRvYy5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNoYXBlKGN0eCwgYXJncykge1xuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgY3R4W2FyZy5uYW1lXS5hcHBseShjdHgsIGFyZ1snYXJndW1lbnRzJ10pO1xuICAgICAgfSk7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2FmZUltYWdlKGl0ZW0pIHtcbiAgICAgIGlmIChzYWZlSW1hZ2VzLmluZGV4T2YoaXRlbVsnYXJndW1lbnRzJ11bMF0uc3JjKSA9PT0gLTEpIHtcbiAgICAgICAgdGVzdGN0eC5kcmF3SW1hZ2UoaXRlbVsnYXJndW1lbnRzJ11bMF0sIDAsIDApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRlc3RjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIDEsIDEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGVzdENhbnZhcyA9IGRvYy5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICAgIHRlc3RjdHggPSB0ZXN0Q2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgc2FmZUltYWdlcy5wdXNoKGl0ZW1bJ2FyZ3VtZW50cyddWzBdLnNyYyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJJdGVtKGN0eCwgaXRlbSkge1xuICAgICAgc3dpdGNoIChpdGVtLnR5cGUpIHtcbiAgICAgICAgY2FzZSBcInZhcmlhYmxlXCI6XG4gICAgICAgICAgY3R4W2l0ZW0ubmFtZV0gPSBpdGVtWydhcmd1bWVudHMnXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICAgICAgc3dpdGNoIChpdGVtLm5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJjcmVhdGVQYXR0ZXJuXCI6XG4gICAgICAgICAgICAgIGlmIChpdGVtWydhcmd1bWVudHMnXVswXS53aWR0aCA+IDAgJiYgaXRlbVsnYXJndW1lbnRzJ11bMF0uaGVpZ2h0ID4gMCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gY3R4LmNyZWF0ZVBhdHRlcm4oaXRlbVsnYXJndW1lbnRzJ11bMF0sIFwicmVwZWF0XCIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IFJlbmRlcmVyOiBFcnJvciBjcmVhdGluZyBwYXR0ZXJuXCIsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImRyYXdTaGFwZVwiOlxuICAgICAgICAgICAgICBjcmVhdGVTaGFwZShjdHgsIGl0ZW1bJ2FyZ3VtZW50cyddKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZHJhd0ltYWdlXCI6XG4gICAgICAgICAgICAgIGlmIChpdGVtWydhcmd1bWVudHMnXVs4XSA+IDAgJiYgaXRlbVsnYXJndW1lbnRzJ11bN10gPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnRhaW50VGVzdCB8fCAob3B0aW9ucy50YWludFRlc3QgJiYgc2FmZUltYWdlKGl0ZW0pKSkge1xuICAgICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZS5hcHBseShjdHgsIGl0ZW1bJ2FyZ3VtZW50cyddKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBjdHhbaXRlbS5uYW1lXS5hcHBseShjdHgsIGl0ZW1bJ2FyZ3VtZW50cyddKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QnJvd3NlckluZm8oKSB7XG4gICAgICB2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICB0ZW0sXG4gICAgICAgIE0gPSB1YS5tYXRjaCgvKG9wZXJhfGNocm9tZXxzYWZhcml8ZmlyZWZveHxtc2llfHRyaWRlbnQoPz1cXC8pKVxcLz9cXHMqKFxcZCspL2kpIHx8IFtdO1xuICAgICAgaWYgKC90cmlkZW50L2kudGVzdChNWzFdKSkge1xuICAgICAgICB0ZW0gPSAvXFxicnZbIDpdKyhcXGQrKS9nLmV4ZWModWEpIHx8IFtdO1xuICAgICAgICByZXR1cm4gWydJRScsICh0ZW1bMV0gfHwgJycpXTtcbiAgICAgIH1cbiAgICAgIGlmIChNWzFdID09PSAnQ2hyb21lJykge1xuICAgICAgICB0ZW0gPSB1YS5tYXRjaCgvXFxiKE9QUnxFZGdlPylcXC8oXFxkKykvKTtcbiAgICAgICAgaWYgKHRlbSAhPSBudWxsKSB7XG4gICAgICAgICAgdmFyIHN0ZW0gPSB0ZW0uc2xpY2UoMSk7XG4gICAgICAgICAgc3RlbVswXS5yZXBsYWNlKCdPUFInLCAnT3BlcmEnKS5yZXBsYWNlKCdFZGcgJywgJ0VkZ2UgJyk7XG4gICAgICAgICAgcmV0dXJuIHN0ZW07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIE0gPSBNWzJdID8gW01bMV0sIE1bMl1dIDogW25hdmlnYXRvci5hcHBOYW1lLCBuYXZpZ2F0b3IuYXBwVmVyc2lvbiwgJy0/J107XG4gICAgICBpZiAoKHRlbSA9IHVhLm1hdGNoKC92ZXJzaW9uXFwvKFxcZCspL2kpKSAhPSBudWxsKSBNLnNwbGljZSgxLCAxLCB0ZW1bMV0pO1xuICAgICAgcmV0dXJuIE07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QnJvd3NlckNhbnZhc0xpbWl0KHNjYWxlKSB7XG4gICAgICB2YXIgYnJvd3NlciA9IGdldEJyb3dzZXJJbmZvKClbMF07XG4gICAgICB2YXIgcmVzdHJpY3Rpb25zID0ge1xuICAgICAgICBERUZBVUxUOiB7XG4gICAgICAgICAgd2lkdGg6IDgxOTIsXG4gICAgICAgICAgaGVpZ2h0OiA4MTkyXG4gICAgICAgIH0sXG4gICAgICAgIEVkZ2U6IHtcbiAgICAgICAgICB3aWR0aDogODE5MixcbiAgICAgICAgICBoZWlnaHQ6IDgxOTJcbiAgICAgICAgfSxcbiAgICAgICAgRmlyZWZveDoge1xuICAgICAgICAgIHdpZHRoOiAzMjc2NyxcbiAgICAgICAgICBoZWlnaHQ6IDMyNzY3XG4gICAgICAgIH0sXG4gICAgICAgIFNhZmFyaToge1xuICAgICAgICAgIHdpZHRoOiAzMjc2NyxcbiAgICAgICAgICBoZWlnaHQ6IDMyNzY3XG4gICAgICAgIH0sXG4gICAgICAgIENocm9tZToge1xuICAgICAgICAgIHdpZHRoOiAzMjc2NyxcbiAgICAgICAgICBoZWlnaHQ6IDMyNzY3XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtyZXN0cmljdGlvbnNbYnJvd3Nlcl0gfHwgcmVzdHJpY3Rpb25zWydERUZBVUxUJ10sIGJyb3dzZXJdXG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwYXJzZWREYXRhLCBvcHRpb25zLCBkb2N1bWVudCwgcXVldWUsIF9odG1sMmNhbnZhcykge1xuICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIiksXG4gICAgICAgIG5ld0NhbnZhcyxcbiAgICAgICAgYm91bmRzLFxuICAgICAgICBib3VuZFNjYWxlS2V5cyxcbiAgICAgICAgZnN0eWxlLFxuICAgICAgICB6U3RhY2sgPSBwYXJzZWREYXRhLnN0YWNrO1xuXG4gICAgICBpZiAob3B0aW9ucy5kcGkpXG4gICAgICAgIG9wdGlvbnMuc2NhbGUgPSBvcHRpb25zLmRwaSAvIDk2O1xuXG4gICAgICB2YXIgYnJvd3NlckNhbnZhc0xpbWl0ID0gZ2V0QnJvd3NlckNhbnZhc0xpbWl0KG9wdGlvbnMuc2NhbGUpO1xuICAgICAgdmFyIGNhbnZhc0xpbWl0ID0gYnJvd3NlckNhbnZhc0xpbWl0WzBdO1xuXG4gICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuc3R5bGUud2lkdGggPSBNYXRoLm1pbigob3B0aW9ucy53aWR0aCB8fCB6U3RhY2suY3R4LndpZHRoKSAqIG9wdGlvbnMuc2NhbGUsIGNhbnZhc0xpbWl0LndpZHRoKTtcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gTWF0aC5taW4oKG9wdGlvbnMuaGVpZ2h0IHx8IHpTdGFjay5jdHguaGVpZ2h0KSAqIG9wdGlvbnMuc2NhbGUsIGNhbnZhc0xpbWl0LmhlaWdodCk7XG5cbiAgICAgIGZzdHlsZSA9IGN0eC5maWxsU3R5bGU7XG4gICAgICBjdHguc2NhbGUob3B0aW9ucy5zY2FsZSwgb3B0aW9ucy5zY2FsZSk7XG4gICAgICBjdHguZmlsbFN0eWxlID0gKFV0aWwuaXNUcmFuc3BhcmVudChwYXJzZWREYXRhLmJhY2tncm91bmRDb2xvcikgJiYgb3B0aW9ucy5iYWNrZ3JvdW5kICE9PSB1bmRlZmluZWQpID8gb3B0aW9ucy5iYWNrZ3JvdW5kIDogcGFyc2VkRGF0YS5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBmc3R5bGU7XG5cbiAgICAgIHF1ZXVlLmZvckVhY2goZnVuY3Rpb24gKHN0b3JhZ2VDb250ZXh0KSB7XG4gICAgICAgIC8vIHNldCBjb21tb24gc2V0dGluZ3MgZm9yIGNhbnZhc1xuICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJib3R0b21cIjtcbiAgICAgICAgY3R4LnNhdmUoKTtcblxuICAgICAgICBpZiAoc3RvcmFnZUNvbnRleHQudHJhbnNmb3JtLm1hdHJpeCkge1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUoc3RvcmFnZUNvbnRleHQudHJhbnNmb3JtLm9yaWdpblswXSwgc3RvcmFnZUNvbnRleHQudHJhbnNmb3JtLm9yaWdpblsxXSk7XG4gICAgICAgICAgY3R4LnRyYW5zZm9ybS5hcHBseShjdHgsIHN0b3JhZ2VDb250ZXh0LnRyYW5zZm9ybS5tYXRyaXgpO1xuICAgICAgICAgIGN0eC50cmFuc2xhdGUoLXN0b3JhZ2VDb250ZXh0LnRyYW5zZm9ybS5vcmlnaW5bMF0sIC1zdG9yYWdlQ29udGV4dC50cmFuc2Zvcm0ub3JpZ2luWzFdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdG9yYWdlQ29udGV4dC5jbGlwKSB7XG4gICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgIGN0eC5yZWN0KHN0b3JhZ2VDb250ZXh0LmNsaXAubGVmdCwgc3RvcmFnZUNvbnRleHQuY2xpcC50b3AsIHN0b3JhZ2VDb250ZXh0LmNsaXAud2lkdGgsIHN0b3JhZ2VDb250ZXh0LmNsaXAuaGVpZ2h0KTtcbiAgICAgICAgICBjdHguY2xpcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0b3JhZ2VDb250ZXh0LmN0eC5zdG9yYWdlKSB7XG4gICAgICAgICAgc3RvcmFnZUNvbnRleHQuY3R4LnN0b3JhZ2UuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmVuZGVySXRlbShjdHgsIGl0ZW0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgIH0pO1xuXG4gICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBSZW5kZXJlcjogQ2FudmFzIHJlbmRlcmVyIGRvbmUsIHNjYWxlZCBhdCBcIiArIG9wdGlvbnMuc2NhbGUgKyBcIiAtIHJldHVybmluZyBjYW52YXMgb2JqXCIpO1xuXG4gICAgICBpZiAob3B0aW9ucy5lbGVtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmVsZW1lbnRzWzBdID09PSBcIm9iamVjdFwiICYmIG9wdGlvbnMuZWxlbWVudHNbMF0ubm9kZU5hbWUgIT09IFwiQk9EWVwiKSB7XG4gICAgICAgICAgLy8gY3JvcCBpbWFnZSB0byB0aGUgYm91bmRzIG9mIHNlbGVjdGVkIChzaW5nbGUpIGVsZW1lbnRcblxuICAgICAgICAgIHZhciBjb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lciB8fCBvcHRpb25zLmVsZW1lbnRzO1xuXG4gICAgICAgICAgYm91bmRzID0gX2h0bWwyY2FudmFzLlV0aWwuQm91bmRzKGNvbnRhaW5lclswXSk7XG4gICAgICAgICAgYm91bmRzLndpZHRoICA9IG9wdGlvbnNbXCJ3aWR0aFwiXSAgfHwgYm91bmRzLndpZHRoO1xuICAgICAgICAgIGJvdW5kcy5oZWlnaHQgPSBvcHRpb25zW1wiaGVpZ2h0XCJdIHx8IGJvdW5kcy5oZWlnaHQ7XG5cbiAgICAgICAgICBib3VuZFNjYWxlS2V5cyA9IFsnd2lkdGgnLCAnaGVpZ2h0JywgJ3RvcCcsICdsZWZ0J107XG5cbiAgICAgICAgICBib3VuZFNjYWxlS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBsaW1pdEtleSA9IFsnd2lkdGgnLCAnbGVmdCddLmluZGV4T2Yoa2V5KSA9PT0gLTEgPyAnaGVpZ2h0JyA6ICd3aWR0aCc7XG4gICAgICAgICAgICBib3VuZHNba2V5XSA9IE1hdGgubWluKGJvdW5kc1trZXldICogb3B0aW9ucy5zY2FsZSwgY2FudmFzTGltaXRbbGltaXRLZXldKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG5ld0NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgIG5ld0NhbnZhcy53aWR0aCA9IE1hdGgubWluKGJvdW5kcy53aWR0aCwgY2FudmFzTGltaXQud2lkdGgpO1xuICAgICAgICAgIG5ld0NhbnZhcy5oZWlnaHQgPSBNYXRoLm1pbihib3VuZHMuaGVpZ2h0LCBjYW52YXNMaW1pdC5oZWlnaHQpO1xuICAgICAgICAgIG5ld0NhbnZhcy5zdHlsZS53aWR0aCA9IG5ld0NhbnZhcy53aWR0aCArICdweCc7XG4gICAgICAgICAgbmV3Q2FudmFzLnN0eWxlLmhlaWdodCA9IG5ld0NhbnZhcy5oZWlnaHQgKyAncHgnO1xuXG4gICAgICAgICAgY3R4ID0gbmV3Q2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgICBjdHguZHJhd0ltYWdlKGNhbnZhcywgYm91bmRzLmxlZnQsIGJvdW5kcy50b3AsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgMCwgMCwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0KTtcbiAgICAgICAgICBjYW52YXMgPSBudWxsO1xuICAgICAgICAgIHJldHVybiBuZXdDYW52YXM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNhbnZhcztcbiAgICB9O1xuICB9O1xufSkod2luZG93LCBkb2N1bWVudCk7XG5cbi8qKlxuICogSlF1ZXJ5IFdyYXBwZXI6XG4gKiAtIGluY2x1ZGVzIHNvbWUgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIChkcGksIHdpZHRoL2hlaWdodCwgb2JqZWN0LWZpdClcbiAqIC0gcG9zdC1wcm9jZXNzIGZlYXR1cmVzXG4gKi9cbihmdW5jdGlvbiAoJCkge1xuICAkLmZuLmh0bWwyY2FudmFzID0gZnVuY3Rpb24gKGNvbnRhaW5lciA9IFwiI2h0bWwyY2FudmFzXCIsIG9wdHMgPSB7fSwgb25yZW5kZXJlZENhbGxiYWNrID0gbnVsbCkge1xuXG4gICAgaWYoT2JqZWN0LmtleXModGhpcykubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgaWYoJChjb250YWluZXIpLmxlbmd0aCA8IDEpIHJldHVybjtcblxuICAgIC8vIFJlcGVhdCBmdW5jdGlvbiB0byBwcmV2ZW50IGxvYWRpbmcgaXNzdWVzXG4gICAgZnVuY3Rpb24gc2V0SW50ZXJ2YWxOKGNhbGxiYWNrLCBkZWxheSwgbnJlcGVhdCkge1xuXG4gICAgICB2YXIgeCA9IDA7XG5cbiAgICAgIGlmIChucmVwZWF0IDwgMSkgcmV0dXJuO1xuICAgICAgY2FsbGJhY2soKTtcblxuICAgICAgbnJlcGVhdCA9IG5yZXBlYXQgLSAxO1xuICAgICAgaWYgKG5yZXBlYXQgPCAxKSByZXR1cm47XG5cbiAgICAgIHZhciBpbnRlcnZhbElEID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgaWYgKCsreCA9PT0gbnJlcGVhdClcbiAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChpbnRlcnZhbElEKTtcbiAgICAgIH0sIGRlbGF5KTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgI3JlcGV0aXRpb24gKyBkZWxheVxuICAgIHZhciBucmVwZWF0ID0gb3B0c1tcInJlcGVhdFwiXSB8fCBvcHRzW1wiTlwiXSB8fCAxO1xuICAgIHZhciBkZWxheSA9IG9wdHNbXCJkZWxheVwiXSB8fCBvcHRzW1widFwiXSB8fCAxMDA7XG4gICAgc2V0SW50ZXJ2YWxOKGZ1bmN0aW9uICgpIHtcblxuICAgICAgb3B0c1tcInVzZUNPUlNcIl0gPSBvcHRzW1widXNlQ09SU1wiXSB8fCB0cnVlO1xuICAgICAgb3B0c1tcImJsdXJcIl0gPSBvcHRzW1wiYmx1clwiXSB8fCAwO1xuICAgICAgb3B0c1tcImRwaVwiXSA9IG9wdHNbXCJkcGlcIl0gfHwgOTYgKiAyO1xuICAgICAgb3B0c1tcImluc2VydFwiXSA9IG9wdHNbXCJpbnNlcnRcIl0gfHwgXCJhcHBlbmRcIjtcblxuICAgICAgb3B0c1tcImNvbnRhaW5lclwiXSA9ICQoY29udGFpbmVyKTtcbiAgICAgIG9wdHNbXCJvbnJlbmRlcmVkXCJdID0gb25yZW5kZXJlZENhbGxiYWNrIHx8XG4gICAgICAgIGZ1bmN0aW9uIChjYW52YXMpIHtcblxuICAgICAgICAgICQoY29udGFpbmVyICsgXCIgPiBjYW52YXNcIikucmVtb3ZlKCk7XG4gICAgICAgICAgaWYgKG9wdHNbXCJpbnNlcnRcIl0gPT0gXCJwcmVwZW5kXCIpICQoY29udGFpbmVyKS5wcmVwZW5kKGNhbnZhcyk7XG4gICAgICAgICAgZWxzZSAkKGNvbnRhaW5lcikuYXBwZW5kKGNhbnZhcyk7XG5cbiAgICAgICAgICAkKGNvbnRhaW5lciArIFwiID4gY2FudmFzXCIpLmVhY2goZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgZmlsdGVyVmFsID0gJ2JsdXIoJyArIG9wdHNbXCJibHVyXCJdICsgJ3B4KSc7XG4gICAgICAgICAgICB2YXIgc2NhbGUgPSBvcHRzW1wiZHBpXCJdIC8gOTYgfHwgMTtcblxuICAgICAgICAgICAgJCh0aGlzKVxuICAgICAgICAgICAgICAuY3NzKCdmaWx0ZXInLCBmaWx0ZXJWYWwpXG4gICAgICAgICAgICAgIC5jc3MoJ3dlYmtpdEZpbHRlcicsIGZpbHRlclZhbClcbiAgICAgICAgICAgICAgLmNzcygnbW96RmlsdGVyJywgZmlsdGVyVmFsKVxuICAgICAgICAgICAgICAuY3NzKCdvRmlsdGVyJywgZmlsdGVyVmFsKVxuICAgICAgICAgICAgICAuY3NzKCdtc0ZpbHRlcicsIGZpbHRlclZhbClcbiAgICAgICAgICAgICAgLmNzcygnd2lkdGgnLCAkKHRoaXMpLndpZHRoKCkgLyBzY2FsZSlcbiAgICAgICAgICAgICAgLmNzcygnaGVpZ2h0JywgJCh0aGlzKS5oZWlnaHQoKSAvIHNjYWxlKTtcblxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAvLyBDYWxsIGh0bWwyY2FudmFzXG4gICAgICBodG1sMmNhbnZhcyh0aGlzLCBvcHRzKTtcblxuICAgIH0uYmluZCh0aGlzKSwgZGVsYXksIG5yZXBlYXQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbn0pKGpRdWVyeSk7XG5cbndpbmRvdy5odG1sMmNhbnZhc190aWxlbWFwID0gZnVuY3Rpb24gKGVsKSB7XG5cbiAgaWYoT2JqZWN0LmtleXMoZWwpLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICBpZihlbC5sZW5ndGggPT0gMCB8fCBlbCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgdmFyIGNhbnZhcyA9ICQoZWwpWzBdO1xuICBpZihjYW52YXMudGFnTmFtZSAhPSBcIkNBTlZBU1wiKVxuICAgIHRocm93IFwiRWxlbWVudCBwYXNzZWQgdGhyb3VnaCBodG1sMmNhbnZhc190aWxlbWFwKCkgbXVzdCBiZSBhIGNhbnZhc1wiO1xuXG4gICQoZWwpLmNzcyhcIm9iamVjdC1maXRcIiwgXCJjb3ZlclwiKTtcbiAgJChlbCkuY3NzKFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKTtcbiAgJChlbCkuY3NzKFwidG9wXCIsIFwiNTAlXCIpO1xuICAkKGVsKS5jc3MoXCJsZWZ0XCIsIFwiNTAlXCIpO1xuICAkKGVsKS5jc3MoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoLTUwJSwgLTUwJSlcIik7XG4gICQoZWwpLmNzcyhcIndpZHRoXCIsIFwiMTAwJVwiKTtcbiAgJChlbCkuY3NzKFwiaGVpZ2h0XCIsIFwiMTAwJVwiKTtcblxuICB2YXIgc3JjID0gY2FudmFzLmdldEF0dHJpYnV0ZShcImRhdGEtc3JjXCIpO1xuICB2YXIgd2lkdGggPSBwYXJzZUludChjYW52YXMuZ2V0QXR0cmlidXRlKFwid2lkdGhcIikpO1xuICB2YXIgaGVpZ2h0ID0gcGFyc2VJbnQoY2FudmFzLmdldEF0dHJpYnV0ZShcImhlaWdodFwiKSk7XG4gIHZhciBzY2FsZSA9IHBhcnNlRmxvYXQocGFyc2VJbnQoJChjYW52YXMpLmNzcyhcIndpZHRoXCIpKS93aWR0aCkgfHzCoDE7XG5cbiAgdmFyIHNpZ25hdHVyZSA9IGNhbnZhcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNpZ25hdHVyZVwiKTtcbiAgdmFyIHRpbGVzaXplICA9IHBhcnNlSW50KGNhbnZhcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRpbGVzaXplXCIpKSB8fCBudWxsO1xuXG4gIHZhciB4dGlsZXMgICAgPSBwYXJzZUludChjYW52YXMuZ2V0QXR0cmlidXRlKFwiZGF0YS14dGlsZXNcIikpO1xuICB2YXIgeXRpbGVzICAgID0gcGFyc2VJbnQoY2FudmFzLmdldEF0dHJpYnV0ZShcImRhdGEteXRpbGVzXCIpKTtcbiAgdmFyIG1pc3NpbmcgICA9IGNhbnZhcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLW1pc3NpbmdcIik7XG5cbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIHZhciB0aWxlTGlzdCA9IFtdO1xuXG4gIC8vIFRPRE86IE9wdGltaXplIHJlc291cmNlIGxvYWRpbmcuLlxuICAvLyBmdW5jdGlvbiBib3VuZHNPdmVybGFwKHIxLCByMikge1xuICAvLyAgIGNvbnNvbGUubG9nKHIxKTtcbiAgLy8gICBjb25zb2xlLmxvZyhyMik7XG5cbiAgLy8gICByZXR1cm4gIShyMi5sZWZ0ID4gcjEucmlnaHQgfHxcbiAgLy8gICAgICAgICAgcjIucmlnaHQgPCByMS5sZWZ0IHx8XG4gIC8vICAgICAgICAgIHIyLnRvcCA+IHIxLmJvdHRvbSB8fFxuICAvLyAgICAgICAgICByMi5ib3R0b20gPCByMS50b3ApO1xuICAvLyB9XG5cbiAgZnVuY3Rpb24gdGlsZXNMYXp5bG9hZCgpIHtcblxuICAgIC8vIHZhciBsYXp5d2lkdGggID0gcGFyc2VJbnQoTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IDAsIHdpbmRvdy5pbm5lcldpZHRoIHx8IDApL3NjYWxlKTtcbiAgICAvLyB2YXIgbGF6eWhlaWdodCA9IHBhcnNlSW50KE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgMCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApL3NjYWxlKTtcbiAgICAvLyB2YXIgbGF6eWJvdW5kcyA9IHtcbiAgICAvLyAgIGxlZnQ6d2lkdGgvMi1sYXp5d2lkdGgvMiwgIHRvcDowLFxuICAgIC8vICAgcmlnaHQ6d2lkdGgvMitsYXp5d2lkdGgvMiwgYm90dG9tOmxhenloZWlnaHRcbiAgICAvLyB9O1xuXG4gICAgZm9yKGl4ID0gMDsgaXggPCB4dGlsZXM7IGl4KyspIHtcbiAgICAgIGZvcihpeSA9IDA7IGl5IDwgeXRpbGVzOyBpeSsrKcKge1xuXG4gICAgICAgIHZhciBpbmRleCA9IGl5Knh0aWxlcyArIGl4O1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiaW5kZXg6XCIsIGluZGV4KTtcblxuICAgICAgICBpZih0aWxlTGlzdFtpbmRleF0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRpbGVMaXN0W2luZGV4XSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgIHRpbGVMaXN0W2luZGV4XS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLm9uZXJyb3IgPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5zcmMgPSBtaXNzaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFyIGR4ID0gaXgqdGlsZXNpemUsIGR5ID0gaXkqdGlsZXNpemU7XG4gICAgICAgIC8vIHZhciBkdyA9ICh0aWxlc2l6ZSB8fCB3aWR0aCksIGRoID0gKHRpbGVzaXplIHx8IGhlaWdodCk7XG4gICAgICAgIC8vIHZhciB0aWxlYm91bmRzID0ge2xlZnQ6ZHgsIHRvcDpkeSwgcmlnaHQ6ZHgrZHcsIGJvdHRvbTpkeStkaH07XG5cbiAgICAgICAgLy8gdmFyIGxhenlsb2FkID0gYm91bmRzT3ZlcmxhcCh0aWxlYm91bmRzLCBsYXp5Ym91bmRzKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJsYXp5bG9hZDpcIiwgbGF6eWxvYWQpO1xuICAgICAgICAvLyBpZihsYXp5bG9hZCAmJiB0aWxlTGlzdFtpbmRleF0uc3JjID09IFwiXCIpIHtcbiAgICAgICAgLy8gICB0aWxlTGlzdFtpbmRleF0uc3JjID0gc3JjICsgXCIvXCIgKyBzaWduYXR1cmUgKyBcIi9cIiArIGluZGV4O1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKFwiQ2FsbC4uIFwiLCB0aWxlTGlzdFtpbmRleF0uc3JjLCBsYXp5bG9hZCk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICB2YXIgdG1wX3NyYyA9IHNyYztcbiAgICAgICAgaWYodG1wX3NyYy5pbmRleE9mKFwie3NpZ25hdHVyZX1cIikpIHRtcF9zcmMgPSB0bXBfc3JjLnJlcGxhY2VBbGwoXCJ7c2lnbmF0dXJlfVwiLCBzaWduYXR1cmUpO1xuICAgICAgICBlbHNlIHRtcF9zcmMgKz0gXCIvXCIgKyBzaWduYXR1cmU7XG4gICAgICAgIGlmKHRtcF9zcmMuaW5kZXhPZihcIntpZH1cIikpIHRtcF9zcmMgPSB0bXBfc3JjLnJlcGxhY2VBbGwoXCJ7aWR9XCIsIGluZGV4KTtcbiAgICAgICAgZWxzZSB0bXBfc3JjICs9IFwiL1wiICsgaW5kZXg7XG5cbiAgICAgICAgdGlsZUxpc3RbaW5kZXhdLnNyYyA9IHRtcF9zcmM7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHdpbmRvdy5vbnJlc2l6ZSA9IHRpbGVzTGF6eWxvYWQ7XG4gIHRpbGVzTGF6eWxvYWQoKTtcblxuICB2YXIgZHVyYXRpb24gPSAyNTA7XG4gIHZhciB0aWxlT3BhY2l0eSA9IFtdO1xuICB2YXIgdGlsZVBhc3QgPSBbXTtcbiAgdmFyIHRvdGFsT3BhY2l0eU1heCA9IHRpbGVMaXN0Lmxlbmd0aDtcblxuICBpZih0b3RhbE9wYWNpdHlNYXggPT0gMCkgcmV0dXJuO1xuXG4gIGZ1bmN0aW9uIGFuaW1hdGUocHJlc2VudCkge1xuXG4gICAgdmFyIHRvdGFsT3BhY2l0eSAgICA9IDA7XG4gICAgZm9yKHZhciBpbmRleCA9IDA7IGluZGV4IDwgeHRpbGVzKnl0aWxlczsgaW5kZXgrKykge1xuXG4gICAgICAgIHZhciB0aWxlID0gdGlsZUxpc3RbaW5kZXhdO1xuICAgICAgICBpZih0aWxlICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgaWYodGlsZS5jb21wbGV0ZSA9PSBmYWxzZSkgY29udGludWU7XG4gICAgICAgICAgICBpZih0aWxlT3BhY2l0eVtpbmRleF0gPT0gMSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGlmKHRpbGVPcGFjaXR5W2luZGV4XSA9PT0gdW5kZWZpbmVkKSB0aWxlT3BhY2l0eVtpbmRleF0gPSAwO1xuICAgICAgICAgICAgaWYodGlsZVBhc3RbaW5kZXhdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lkbGUnKSk7XG4gICAgICAgICAgICAgICAgdGlsZVBhc3RbaW5kZXhdID0gcHJlc2VudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRPcGFjaXR5ID0gKHByZXNlbnQgLSB0aWxlUGFzdFtpbmRleF0pIC8gZHVyYXRpb247XG4gICAgICAgICAgICBpZighdGlsZXNpemUpIGRPcGFjaXR5ID0gMTtcblxuICAgICAgICAgICAgdGlsZU9wYWNpdHlbaW5kZXhdICs9IGRPcGFjaXR5O1xuICAgICAgICAgICAgaWYodGlsZU9wYWNpdHlbaW5kZXhdID4gMSkgdGlsZU9wYWNpdHlbaW5kZXhdID0gMTtcblxuICAgICAgICAgICAgdG90YWxPcGFjaXR5ICs9IHRpbGVPcGFjaXR5W2luZGV4XTtcbiAgICAgICAgICAgIHRpbGVQYXN0W2luZGV4XSA9IHByZXNlbnQ7XG5cbiAgICAgICAgICAgIHZhciBpeCA9IGluZGV4ICUgeHRpbGVzO1xuICAgICAgICAgICAgdmFyIGl5ID0gTWF0aC5mbG9vcihpbmRleCAvIHh0aWxlcyk7XG4gICAgICAgICAgICB2YXIgZHggPSBpeCp0aWxlc2l6ZSwgZHkgPSBpeSp0aWxlc2l6ZTtcbiAgICAgICAgICAgIHZhciBzdyA9IHRpbGVMaXN0W2luZGV4XS53aWR0aCwgc2ggPSB0aWxlTGlzdFtpbmRleF0uaGVpZ2h0O1xuICAgICAgICAgICAgdmFyIGR3ID0gdGlsZXNpemUgfHwgd2lkdGgsIGRoID0gdGlsZXNpemUgfHwgaGVpZ2h0O1xuXG4gICAgICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSB0aWxlT3BhY2l0eVtpbmRleF07XG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKHRpbGUsIDAsMCwgc3csc2gsIGR4LGR5LCBkdyxkaCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodG90YWxPcGFjaXR5IDwgdG90YWxPcGFjaXR5TWF4KSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgIGVsc2Ugd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCd0aWxlc2xvYWRlZCcpKTtcbiAgfVxuXG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG5cblxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDaGVjayBpZiBtb2R1bGUgZXhpc3RzIChkZXZlbG9wbWVudCBvbmx5KVxuXHRpZiAoX193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IFwiQGdsaXRjaHIvaHRtbDJjYW52YXNcIjtcbmltcG9ydCBcIi4vc3R5bGVzL2pzL3RpbGVtYXAuanNcIjsiXSwibmFtZXMiOlsiaW5pdFRpbGVNYXAiLCJjb250YWluZXIiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJfbG9vcCIsImVsIiwiaSIsInRhZ05hbWUiLCJkb2N1bWVudEVsZW1lbnQiLCJ3aW5kb3ciLCIkIiwiY3NzIiwic3JjIiwiZ2V0QXR0cmlidXRlIiwic2lnbmF0dXJlIiwidGlsZXNpemUiLCJwYXJzZUludCIsInJlc29sdXRpb24iLCJ4dGlsZXMiLCJ5dGlsZXMiLCJhZGRFdmVudExpc3RlbmVyIiwibGF6eUJhY2tncm91bmRzIiwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeSIsInByb3RvdHlwZSIsImxhenlCYWNrZ3JvdW5kT2JzZXJ2ZXIiLCJJbnRlcnNlY3Rpb25PYnNlcnZlciIsImVudHJpZXMiLCJvYnNlcnZlciIsImZvckVhY2giLCJlbnRyeSIsImlzSW50ZXJzZWN0aW5nIiwidGFyZ2V0IiwiZGF0YXNldCIsImJhY2tncm91bmRJbWFnZSIsInByZWxvYWRlckltZyIsImNyZWF0ZUVsZW1lbnQiLCJldmVudCIsInN0eWxlIiwib3BhY2l0eSIsInJlbW92ZUF0dHJpYnV0ZSIsInVub2JzZXJ2ZSIsImxhenlCYWNrZ3JvdW5kIiwib2JzZXJ2ZSIsIm9iamVjdEZpdCIsImNvbnRhaW5zIiwiY29udGFpbmVyV2lkdGgiLCJjb250YWluZXJIZWlnaHQiLCJ3aWR0aCIsImhlaWdodCIsImRvUmF0aW8iLCJjUmF0aW8iLCJ0YXJnZXRXaWR0aCIsInRhcmdldEhlaWdodCIsInRlc3QiLCJsZWZ0IiwidG9wIiwidGlsZSIsImNsaWVudFdpZHRoIiwiY2xpZW50SGVpZ2h0IiwiZWxUaWxlIiwiZmluZCIsIml5IiwiaXgiLCJ0aWxlVyIsIk1hdGgiLCJmbG9vciIsInRpbGVIIiwidGlsZVNpemUiLCJtYXgiLCJpbmRleCIsInVuZGVmaW5lZCIsInRtcF9zcmMiLCJkZWNvZGVVUkkiLCJpbmRleE9mIiwicmVwbGFjZUFsbCIsInNldEF0dHJpYnV0ZSIsInJuZCIsInJhbmRvbSIsInRvRml4ZWQiLCJ0cmFuc2l0aW9uIiwiYXBwZW5kIiwicG9zaXRpb24iLCJiYWNrZ3JvdW5kU2l6ZSIsImRpc3BhdGNoRXZlbnQiLCJFdmVudCIsImxlbmd0aCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9