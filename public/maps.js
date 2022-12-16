/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@glitchr/html2canvas/src/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@glitchr/html2canvas/src/index.js ***!
  \********************************************************/
/***/ (() => {

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


/***/ }),

/***/ "./assets/styles/js/tilemap.js":
/*!*************************************!*\
  !*** ./assets/styles/js/tilemap.js ***!
  \*************************************/
/***/ (() => {

window.addEventListener('DOMContentLoaded', function () {
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
    $(el).css("width", "105%");
    $(el).css("height", "105%");
    src = el.getAttribute("data-src");
    signature = el.getAttribute("data-signature");
    tilesize = parseInt(el.getAttribute("data-tilesize")) || null;
    resolution = 2;
    xtiles = parseInt(el.getAttribute("data-xtiles"));
    ytiles = parseInt(el.getAttribute("data-ytiles"));
    missing = el.getAttribute("data-missing");
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
    function tilesLazyload() {
      var width = xtiles * tilesize / resolution;
      var height = ytiles * tilesize / resolution;
      var tile = objectFit(true, width, height, el.clientWidth, el.clientHeight);
      if (tile.width == width) tile = objectFit(false, width, height, el.clientWidth, el.clientHeight);
      var elTile = $(el).find("span");
      for (iy = 0; iy < ytiles; iy++) {
        for (ix = 0; ix < xtiles; ix++) {
          var _tilesize = Math.max(tile.height / ytiles, tile.width / xtiles);
          var index = iy * xtiles + ix;
          if (elTile[index] === undefined) {
            elTile[index] = document.createElement("span");
            var tmp_src = src;
            if (tmp_src.indexOf("{signature}")) tmp_src = tmp_src.replaceAll("{signature}", signature);else tmp_src += "/" + signature;
            if (tmp_src.indexOf("{id}")) tmp_src = tmp_src.replaceAll("{id}", index);else tmp_src += "/" + index;
            elTile[index].setAttribute("id", el.getAttribute("id") + "_" + index);
            elTile[index].setAttribute("data-background-image", tmp_src); //url('"+missing+"')
            elTile[index].style.opacity = "0";
            elTile[index].style.transition = "opacity 0.5s ease";
            el.append(elTile[index]);
          }
          elTile[index].style.position = "absolute";
          elTile[index].style.left = tile.left + _tilesize * ix + "px";
          elTile[index].style.top = tile.top + _tilesize * iy + "px";
          elTile[index].style.width = _tilesize + "px";
          elTile[index].style.height = _tilesize + "px";
          elTile[index].style.backgroundSize = _tilesize + "px";
          el.dispatchEvent(new Event("lazyload.gm_tilemap"));
        }
      }
    }
    window.addEventListener("resize", tilesLazyload);
    window.addEventListener("orientationChange", tilesLazyload);
    tilesLazyload();
  };
  for (var i = 0; i < container.length; i++) {
    var el;
    var src;
    var signature;
    var tilesize;
    var resolution;
    var xtiles;
    var ytiles;
    var missing;
    _loop();
  }
});

/***/ })

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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
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


window.addEventListener('load', function (event) {});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwcy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSx1QkFBdUI7QUFDdkI7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlFQUFpRSxHQUFHO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGlDQUFpQztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7O0FBR0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUNBQXVDLFFBQVE7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FB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QTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkJBQTJCLGdCQUFnQjs7QUFFM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtFQUFrRTtBQUNsRTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUJBQXVCOztBQUV2QjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQztBQUMzQztBQUNBLHdDQUF3QztBQUN4QyxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFROztBQUVSO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsMENBQTBDO0FBQzFDLCtDQUErQyxHQUFHLE1BQU0sR0FBRztBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQSx5Q0FBeUM7QUFDekM7O0FBRUE7QUFDQTs7QUFFQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRDtBQUN0RDtBQUNBLG1EQUFtRDtBQUNuRCxrQkFBa0I7QUFDbEI7QUFDQSxpRUFBaUU7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQixZQUFZO0FBQzVCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLDBDQUEwQzs7QUFFMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsU0FBUztBQUNUOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1FQUFtRSxVQUFVO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUEsa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDs7QUFFQTtBQUNBLE9BQU87O0FBRVA7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXOztB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QUFFQSxDQUFDLEdBQUdKLFNBQVMsQ0FBQzRFLE1BQU0sRUFBRXhFLENBQUMsRUFBRSxFQUFFO0lBQUEsSUFFckNELEVBQUU7SUFBQSxJQWdCRk0sR0FBRztJQUFBLElBQ0hFLFNBQVM7SUFBQSxJQUNUQyxRQUFRO0lBQUEsSUFDUkUsVUFBVTtJQUFBLElBQ1ZDLE1BQU07SUFBQSxJQUNOQyxNQUFNO0lBQUEsSUFDTkMsT0FBTztJQUFBO0VBMkdiO0FBQ0YsQ0FBQyxDQUFDOzs7Ozs7VUN2SUY7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOOEI7QUFDRTtBQUVoQ25CLE1BQU0sQ0FBQ0MsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFVBQVNrQyxLQUFLLEVBQUUsQ0FFaEQsQ0FBQyxDQUFDLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGdsaXRjaHIvaHRtbDJjYW52YXMvc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL2Fzc2V0cy9zdHlsZXMvanMvdGlsZW1hcC5qcyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL21hcHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAgaHRtbDJjYW52YXMtZHBpIDAuNC45IDxodHRwOi8vaHRtbDJjYW52YXMuaGVydHplbi5jb20+XG4gIENvcHlyaWdodCAoYykgMjAyMCBOaWtsYXMgdm9uIEhlcnR6ZW5cblxuICBSZWxlYXNlZCB1bmRlciBNSVQgTGljZW5zZVxuKi9cblxuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgX2h0bWwyY2FudmFzID0ge30sXG4gICAgcHJldmlvdXNFbGVtZW50LFxuICAgIGNvbXB1dGVkQ1NTO1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsID0ge307XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwubG9nID0gZnVuY3Rpb24gKGEpIHtcbiAgICBpZiAoX2h0bWwyY2FudmFzLmxvZ2dpbmcgJiYgd2luZG93LmNvbnNvbGUgJiYgd2luZG93LmNvbnNvbGUubG9nKSB7XG4gICAgICB3aW5kb3cuY29uc29sZS5sb2coYSk7XG4gICAgfVxuICB9O1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLnRyaW1UZXh0ID0gKGZ1bmN0aW9uIChpc05hdGl2ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgIHJldHVybiBpc05hdGl2ZSA/IGlzTmF0aXZlLmFwcGx5KGlucHV0KSA6ICgoaW5wdXQgfHwgJycpICsgJycpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICB9O1xuICB9KShTdHJpbmcucHJvdG90eXBlLnRyaW0pO1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLmFzRmxvYXQgPSBmdW5jdGlvbiAodikge1xuICAgIHJldHVybiBwYXJzZUZsb2F0KHYpO1xuICB9O1xuXG4gIChmdW5jdGlvbiAoKSB7XG4gICAgLy8gVE9ETzogc3VwcG9ydCBhbGwgcG9zc2libGUgbGVuZ3RoIHZhbHVlc1xuICAgIHZhciBURVhUX1NIQURPV19QUk9QRVJUWSA9IC8oKHJnYmF8cmdiKVxcKFteXFwpXStcXCkoXFxzLT9cXGQrcHgpezAsfSkvZztcbiAgICB2YXIgVEVYVF9TSEFET1dfVkFMVUVTID0gLygtP1xcZCtweCl8KCMuKyl8KHJnYlxcKC4rXFwpKXwocmdiYVxcKC4rXFwpKS9nO1xuICAgIF9odG1sMmNhbnZhcy5VdGlsLnBhcnNlVGV4dFNoYWRvd3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICghdmFsdWUgfHwgdmFsdWUgPT09ICdub25lJykge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIC8vIGZpbmQgbXVsdGlwbGUgc2hhZG93IGRlY2xhcmF0aW9uc1xuICAgICAgdmFyIHNoYWRvd3MgPSB2YWx1ZS5tYXRjaChURVhUX1NIQURPV19QUk9QRVJUWSksXG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBzaGFkb3dzICYmIChpIDwgc2hhZG93cy5sZW5ndGgpOyBpKyspIHtcbiAgICAgICAgdmFyIHMgPSBzaGFkb3dzW2ldLm1hdGNoKFRFWFRfU0hBRE9XX1ZBTFVFUyk7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgY29sb3I6IHNbMF0sXG4gICAgICAgICAgb2Zmc2V0WDogc1sxXSA/IHNbMV0ucmVwbGFjZSgncHgnLCAnJykgOiAwLFxuICAgICAgICAgIG9mZnNldFk6IHNbMl0gPyBzWzJdLnJlcGxhY2UoJ3B4JywgJycpIDogMCxcbiAgICAgICAgICBibHVyOiBzWzNdID8gc1szXS5yZXBsYWNlKCdweCcsICcnKSA6IDBcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuICB9KSgpO1xuXG5cbiAgX2h0bWwyY2FudmFzLlV0aWwucGFyc2VCYWNrZ3JvdW5kSW1hZ2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgd2hpdGVzcGFjZSA9ICcgXFxyXFxuXFx0JyxcbiAgICAgIG1ldGhvZCwgZGVmaW5pdGlvbiwgcHJlZml4LCBwcmVmaXhfaSwgYmxvY2ssIHJlc3VsdHMgPSBbXSxcbiAgICAgIGMsIG1vZGUgPSAwLFxuICAgICAgbnVtUGFyZW4gPSAwLFxuICAgICAgcXVvdGUsIGFyZ3M7XG5cbiAgICB2YXIgYXBwZW5kUmVzdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKG1ldGhvZCkge1xuICAgICAgICBpZiAoZGVmaW5pdGlvbi5zdWJzdHIoMCwgMSkgPT09ICdcIicpIHtcbiAgICAgICAgICBkZWZpbml0aW9uID0gZGVmaW5pdGlvbi5zdWJzdHIoMSwgZGVmaW5pdGlvbi5sZW5ndGggLSAyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmaW5pdGlvbikge1xuICAgICAgICAgIGFyZ3MucHVzaChkZWZpbml0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWV0aG9kLnN1YnN0cigwLCAxKSA9PT0gJy0nICYmXG4gICAgICAgICAgKHByZWZpeF9pID0gbWV0aG9kLmluZGV4T2YoJy0nLCAxKSArIDEpID4gMCkge1xuICAgICAgICAgIHByZWZpeCA9IG1ldGhvZC5zdWJzdHIoMCwgcHJlZml4X2kpO1xuICAgICAgICAgIG1ldGhvZCA9IG1ldGhvZC5zdWJzdHIocHJlZml4X2kpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgcHJlZml4OiBwcmVmaXgsXG4gICAgICAgICAgbWV0aG9kOiBtZXRob2QudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICB2YWx1ZTogYmxvY2ssXG4gICAgICAgICAgYXJnczogYXJnc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGFyZ3MgPSBbXTsgLy9mb3Igc29tZSBvZGQgcmVhc29uLCBzZXR0aW5nIC5sZW5ndGggPSAwIGRpZG4ndCB3b3JrIGluIHNhZmFyaVxuICAgICAgbWV0aG9kID1cbiAgICAgICAgcHJlZml4ID1cbiAgICAgICAgZGVmaW5pdGlvbiA9XG4gICAgICAgIGJsb2NrID0gJyc7XG4gICAgfTtcblxuICAgIGFwcGVuZFJlc3VsdCgpO1xuICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHZhbHVlLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgIGMgPSB2YWx1ZVtpXTtcbiAgICAgIGlmIChtb2RlID09PSAwICYmIHdoaXRlc3BhY2UuaW5kZXhPZihjKSA+IC0xKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgc3dpdGNoIChjKSB7XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICBpZiAoIXF1b3RlKSB7XG4gICAgICAgICAgICBxdW90ZSA9IGM7XG4gICAgICAgICAgfSBlbHNlIGlmIChxdW90ZSA9PT0gYykge1xuICAgICAgICAgICAgcXVvdGUgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICcoJzpcbiAgICAgICAgICBpZiAocXVvdGUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gMCkge1xuICAgICAgICAgICAgbW9kZSA9IDE7XG4gICAgICAgICAgICBibG9jayArPSBjO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG51bVBhcmVuKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJyknOlxuICAgICAgICAgIGlmIChxdW90ZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIGlmIChtb2RlID09PSAxKSB7XG4gICAgICAgICAgICBpZiAobnVtUGFyZW4gPT09IDApIHtcbiAgICAgICAgICAgICAgbW9kZSA9IDA7XG4gICAgICAgICAgICAgIGJsb2NrICs9IGM7XG4gICAgICAgICAgICAgIGFwcGVuZFJlc3VsdCgpO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG51bVBhcmVuLS07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgIGlmIChxdW90ZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIGlmIChtb2RlID09PSAwKSB7XG4gICAgICAgICAgICBhcHBlbmRSZXN1bHQoKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gMSkge1xuICAgICAgICAgICAgaWYgKG51bVBhcmVuID09PSAwICYmICFtZXRob2QubWF0Y2goL151cmwkL2kpKSB7XG4gICAgICAgICAgICAgIGFyZ3MucHVzaChkZWZpbml0aW9uKTtcbiAgICAgICAgICAgICAgZGVmaW5pdGlvbiA9ICcnO1xuICAgICAgICAgICAgICBibG9jayArPSBjO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGJsb2NrICs9IGM7XG4gICAgICBpZiAobW9kZSA9PT0gMCkge1xuICAgICAgICBtZXRob2QgKz0gYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmluaXRpb24gKz0gYztcbiAgICAgIH1cbiAgICB9XG4gICAgYXBwZW5kUmVzdWx0KCk7XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC5Cb3VuZHMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHZhciBjbGllbnRSZWN0LCBib3VuZHMgPSB7fTtcblxuICAgIGlmIChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCkge1xuICAgICAgY2xpZW50UmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgIC8vIFRPRE8gYWRkIHNjcm9sbCBwb3NpdGlvbiB0byBib3VuZHMsIHNvIG5vIHNjcm9sbGluZyBvZiB3aW5kb3cgbmVjZXNzYXJ5XG4gICAgICBib3VuZHMudG9wID0gY2xpZW50UmVjdC50b3A7XG4gICAgICBib3VuZHMuYm90dG9tID0gY2xpZW50UmVjdC5ib3R0b20gfHwgKGNsaWVudFJlY3QudG9wICsgY2xpZW50UmVjdC5oZWlnaHQpO1xuICAgICAgYm91bmRzLmxlZnQgPSBjbGllbnRSZWN0LmxlZnQ7XG5cbiAgICAgIGJvdW5kcy53aWR0aCA9IGVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICBib3VuZHMuaGVpZ2h0ID0gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJvdW5kcztcbiAgfTtcblxuICAvLyBUT0RPIGlkZWFsbHksIHdlJ2Qgd2FudCBldmVyeXRoaW5nIHRvIGdvIHRocm91Z2ggdGhpcyBmdW5jdGlvbiBpbnN0ZWFkIG9mIFV0aWwuQm91bmRzLFxuICAvLyBidXQgd291bGQgcmVxdWlyZSBmdXJ0aGVyIHdvcmsgdG8gY2FsY3VsYXRlIHRoZSBjb3JyZWN0IHBvc2l0aW9ucyBmb3IgZWxlbWVudHMgd2l0aCBvZmZzZXRQYXJlbnRzXG4gIF9odG1sMmNhbnZhcy5VdGlsLk9mZnNldEJvdW5kcyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgdmFyIHBhcmVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50ID8gX2h0bWwyY2FudmFzLlV0aWwuT2Zmc2V0Qm91bmRzKGVsZW1lbnQub2Zmc2V0UGFyZW50KSA6IHtcbiAgICAgIHRvcDogMCxcbiAgICAgIGxlZnQ6IDBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcDogZWxlbWVudC5vZmZzZXRUb3AgKyBwYXJlbnQudG9wLFxuICAgICAgYm90dG9tOiBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0ICsgcGFyZW50LnRvcCxcbiAgICAgIGxlZnQ6IGVsZW1lbnQub2Zmc2V0TGVmdCArIHBhcmVudC5sZWZ0LFxuICAgICAgd2lkdGg6IGVsZW1lbnQub2Zmc2V0V2lkdGgsXG4gICAgICBoZWlnaHQ6IGVsZW1lbnQub2Zmc2V0SGVpZ2h0XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB0b1BYKGVsZW1lbnQsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICB2YXIgcnNMZWZ0ID0gZWxlbWVudC5ydW50aW1lU3R5bGUgJiYgZWxlbWVudC5ydW50aW1lU3R5bGVbYXR0cmlidXRlXSxcbiAgICAgIGxlZnQsXG4gICAgICBzdHlsZSA9IGVsZW1lbnQuc3R5bGU7XG5cbiAgICAvLyBDaGVjayBpZiB3ZSBhcmUgbm90IGRlYWxpbmcgd2l0aCBwaXhlbHMsIChPcGVyYSBoYXMgaXNzdWVzIHdpdGggdGhpcylcbiAgICAvLyBQb3J0ZWQgZnJvbSBqUXVlcnkgY3NzLmpzXG4gICAgLy8gRnJvbSB0aGUgYXdlc29tZSBoYWNrIGJ5IERlYW4gRWR3YXJkc1xuICAgIC8vIGh0dHA6Ly9lcmlrLmVhZS5uZXQvYXJjaGl2ZXMvMjAwNy8wNy8yNy8xOC41NC4xNS8jY29tbWVudC0xMDIyOTFcblxuICAgIC8vIElmIHdlJ3JlIG5vdCBkZWFsaW5nIHdpdGggYSByZWd1bGFyIHBpeGVsIG51bWJlclxuICAgIC8vIGJ1dCBhIG51bWJlciB0aGF0IGhhcyBhIHdlaXJkIGVuZGluZywgd2UgbmVlZCB0byBjb252ZXJ0IGl0IHRvIHBpeGVsc1xuXG4gICAgaWYgKCEvXi0/WzAtOV0rXFwuP1swLTldKig/OnB4KT8kL2kudGVzdCh2YWx1ZSkgJiYgL14tP1xcZC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgIC8vIFJlbWVtYmVyIHRoZSBvcmlnaW5hbCB2YWx1ZXNcbiAgICAgIGxlZnQgPSBzdHlsZS5sZWZ0O1xuXG4gICAgICAvLyBQdXQgaW4gdGhlIG5ldyB2YWx1ZXMgdG8gZ2V0IGEgY29tcHV0ZWQgdmFsdWUgb3V0XG4gICAgICBpZiAocnNMZWZ0KSB7XG4gICAgICAgIGVsZW1lbnQucnVudGltZVN0eWxlLmxlZnQgPSBlbGVtZW50LmN1cnJlbnRTdHlsZS5sZWZ0O1xuICAgICAgfVxuICAgICAgc3R5bGUubGVmdCA9IGF0dHJpYnV0ZSA9PT0gXCJmb250U2l6ZVwiID8gXCIxZW1cIiA6ICh2YWx1ZSB8fCAwKTtcbiAgICAgIHZhbHVlID0gc3R5bGUucGl4ZWxMZWZ0ICsgXCJweFwiO1xuXG4gICAgICAvLyBSZXZlcnQgdGhlIGNoYW5nZWQgdmFsdWVzXG4gICAgICBzdHlsZS5sZWZ0ID0gbGVmdDtcbiAgICAgIGlmIChyc0xlZnQpIHtcbiAgICAgICAgZWxlbWVudC5ydW50aW1lU3R5bGUubGVmdCA9IHJzTGVmdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIS9eKHRoaW58bWVkaXVtfHRoaWNrKSQvaS50ZXN0KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIE1hdGgucm91bmQocGFyc2VGbG9hdCh2YWx1ZSkpICsgXCJweFwiO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzSW50KHZhbCkge1xuICAgIHJldHVybiBwYXJzZUludCh2YWwsIDEwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlQmFja2dyb3VuZFNpemVQb3NpdGlvbih2YWx1ZSwgZWxlbWVudCwgYXR0cmlidXRlLCBpbmRleCkge1xuICAgIHZhbHVlID0gKHZhbHVlIHx8ICcnKS5zcGxpdCgnLCcpO1xuICAgIHZhbHVlID0gdmFsdWVbaW5kZXggfHwgMF0gfHwgdmFsdWVbMF0gfHwgJ2F1dG8nO1xuICAgIHZhbHVlID0gX2h0bWwyY2FudmFzLlV0aWwudHJpbVRleHQodmFsdWUpLnNwbGl0KCcgJyk7XG5cbiAgICBpZiAoYXR0cmlidXRlID09PSAnYmFja2dyb3VuZFNpemUnICYmICh2YWx1ZVswXSAmJiB2YWx1ZVswXS5tYXRjaCgvXihjb3Zlcnxjb250YWlufGF1dG8pJC8pKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZVswXSA9ICh2YWx1ZVswXS5pbmRleE9mKFwiJVwiKSA9PT0gLTEpID8gdG9QWChlbGVtZW50LCBhdHRyaWJ1dGUgKyBcIlhcIiwgdmFsdWVbMF0pIDogdmFsdWVbMF07XG4gICAgICBpZiAodmFsdWVbMV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoYXR0cmlidXRlID09PSAnYmFja2dyb3VuZFNpemUnKSB7XG4gICAgICAgICAgdmFsdWVbMV0gPSAnYXV0byc7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElFIDkgZG9lc24ndCByZXR1cm4gZG91YmxlIGRpZ2l0IGFsd2F5c1xuICAgICAgICAgIHZhbHVlWzFdID0gdmFsdWVbMF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhbHVlWzFdID0gKHZhbHVlWzFdLmluZGV4T2YoXCIlXCIpID09PSAtMSkgPyB0b1BYKGVsZW1lbnQsIGF0dHJpYnV0ZSArIFwiWVwiLCB2YWx1ZVsxXSkgOiB2YWx1ZVsxXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwuZ2V0Q1NTID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZSwgaW5kZXgpIHtcbiAgICBpZiAocHJldmlvdXNFbGVtZW50ICE9PSBlbGVtZW50KSB7XG4gICAgICBjb21wdXRlZENTUyA9IGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgbnVsbCk7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gY29tcHV0ZWRDU1NbYXR0cmlidXRlXTtcblxuICAgIGlmICgvXmJhY2tncm91bmQoU2l6ZXxQb3NpdGlvbikkLy50ZXN0KGF0dHJpYnV0ZSkpIHtcbiAgICAgIHJldHVybiBwYXJzZUJhY2tncm91bmRTaXplUG9zaXRpb24odmFsdWUsIGVsZW1lbnQsIGF0dHJpYnV0ZSwgaW5kZXgpO1xuICAgIH0gZWxzZSBpZiAoL2JvcmRlcihUb3B8Qm90dG9tKShMZWZ0fFJpZ2h0KVJhZGl1cy8udGVzdChhdHRyaWJ1dGUpKSB7XG4gICAgICB2YXIgYXJyID0gdmFsdWUuc3BsaXQoXCIgXCIpO1xuICAgICAgaWYgKGFyci5sZW5ndGggPD0gMSkge1xuICAgICAgICBhcnJbMV0gPSBhcnJbMF07XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyLm1hcChhc0ludCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLnJlc2l6ZUJvdW5kcyA9IGZ1bmN0aW9uIChjdXJyZW50X3dpZHRoLCBjdXJyZW50X2hlaWdodCwgdGFyZ2V0X3dpZHRoLCB0YXJnZXRfaGVpZ2h0LCBzdHJldGNoX21vZGUpIHtcbiAgICB2YXIgdGFyZ2V0X3JhdGlvID0gdGFyZ2V0X3dpZHRoIC8gdGFyZ2V0X2hlaWdodCxcbiAgICAgIGN1cnJlbnRfcmF0aW8gPSBjdXJyZW50X3dpZHRoIC8gY3VycmVudF9oZWlnaHQsXG4gICAgICBvdXRwdXRfd2lkdGgsIG91dHB1dF9oZWlnaHQsIG91dHB1dF9sZWZ0LCBvdXRwdXRfdG9wO1xuXG4gICAgICBvdXRwdXRfbGVmdCA9IDA7XG4gICAgICBvdXRwdXRfdG9wICA9IDA7XG5cbiAgICAgIGlmICghc3RyZXRjaF9tb2RlIHx8IHN0cmV0Y2hfbW9kZSA9PT0gJ2F1dG8nKSB7XG4gICAgICBvdXRwdXRfd2lkdGggPSB0YXJnZXRfd2lkdGg7XG4gICAgICBvdXRwdXRfaGVpZ2h0ID0gdGFyZ2V0X2hlaWdodDtcbiAgICB9IGVsc2UgaWYgKHRhcmdldF9yYXRpbyA8IGN1cnJlbnRfcmF0aW8gXiBzdHJldGNoX21vZGUgPT09ICdjb250YWluJykge1xuICAgICAgb3V0cHV0X2hlaWdodCA9IHRhcmdldF9oZWlnaHQ7XG4gICAgICBvdXRwdXRfd2lkdGggPSB0YXJnZXRfaGVpZ2h0ICogY3VycmVudF9yYXRpbztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0X3dpZHRoID0gdGFyZ2V0X3dpZHRoO1xuICAgICAgb3V0cHV0X2hlaWdodCA9IHRhcmdldF93aWR0aCAvIGN1cnJlbnRfcmF0aW87XG4gICAgfVxuXG4gICAgb3V0cHV0X2xlZnQgPSAodGFyZ2V0X3dpZHRoLW91dHB1dF93aWR0aCkvMjtcbiAgICBvdXRwdXRfdG9wID0gKHRhcmdldF9oZWlnaHQtb3V0cHV0X2hlaWdodCkvMjtcblxuICAgIHJldHVybiB7XG4gICAgICB3aWR0aCA6IG91dHB1dF93aWR0aCxcbiAgICAgIGhlaWdodDogb3V0cHV0X2hlaWdodCxcbiAgICAgIGxlZnQgIDogb3V0cHV0X2xlZnQsXG4gICAgICB0b3AgICA6IG91dHB1dF90b3BcbiAgICB9O1xuICB9O1xuXG4gIF9odG1sMmNhbnZhcy5VdGlsLkJhY2tncm91bmRQb3NpdGlvbiA9IGZ1bmN0aW9uIChlbGVtZW50LCBib3VuZHMsIGltYWdlLCBpbWFnZUluZGV4LCBiYWNrZ3JvdW5kU2l6ZSkge1xuICAgIHZhciBiYWNrZ3JvdW5kUG9zaXRpb24gPSBfaHRtbDJjYW52YXMuVXRpbC5nZXRDU1MoZWxlbWVudCwgJ2JhY2tncm91bmRQb3NpdGlvbicsIGltYWdlSW5kZXgpLFxuICAgICAgbGVmdFBvc2l0aW9uLFxuICAgICAgdG9wUG9zaXRpb247XG4gICAgaWYgKGJhY2tncm91bmRQb3NpdGlvbi5sZW5ndGggPT09IDEpIHtcbiAgICAgIGJhY2tncm91bmRQb3NpdGlvbiA9IFtiYWNrZ3JvdW5kUG9zaXRpb25bMF0sIGJhY2tncm91bmRQb3NpdGlvblswXV07XG4gICAgfVxuICAgIGlmIChiYWNrZ3JvdW5kUG9zaXRpb25bMF0udG9TdHJpbmcoKS5pbmRleE9mKFwiJVwiKSAhPT0gLTEpIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IChib3VuZHMud2lkdGggLSAoYmFja2dyb3VuZFNpemUgfHwgaW1hZ2UpLndpZHRoKSAqIChwYXJzZUZsb2F0KGJhY2tncm91bmRQb3NpdGlvblswXSkgLyAxMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0UG9zaXRpb24gPSBwYXJzZUludChiYWNrZ3JvdW5kUG9zaXRpb25bMF0sIDEwKTtcbiAgICB9XG4gICAgaWYgKGJhY2tncm91bmRQb3NpdGlvblsxXSA9PT0gJ2F1dG8nKSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IGxlZnRQb3NpdGlvbiAvIGltYWdlLndpZHRoICogaW1hZ2UuaGVpZ2h0O1xuICAgIH0gZWxzZSBpZiAoYmFja2dyb3VuZFBvc2l0aW9uWzFdLnRvU3RyaW5nKCkuaW5kZXhPZihcIiVcIikgIT09IC0xKSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IChib3VuZHMuaGVpZ2h0IC0gKGJhY2tncm91bmRTaXplIHx8IGltYWdlKS5oZWlnaHQpICogcGFyc2VGbG9hdChiYWNrZ3JvdW5kUG9zaXRpb25bMV0pIC8gMTAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3BQb3NpdGlvbiA9IHBhcnNlSW50KGJhY2tncm91bmRQb3NpdGlvblsxXSwgMTApO1xuICAgIH1cbiAgICBpZiAoYmFja2dyb3VuZFBvc2l0aW9uWzBdID09PSAnYXV0bycpIHtcbiAgICAgIGxlZnRQb3NpdGlvbiA9IHRvcFBvc2l0aW9uIC8gaW1hZ2UuaGVpZ2h0ICogaW1hZ2Uud2lkdGg7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBsZWZ0OiBsZWZ0UG9zaXRpb24sXG4gICAgICB0b3A6IHRvcFBvc2l0aW9uXG4gICAgfTtcbiAgfTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC5CYWNrZ3JvdW5kU2l6ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBib3VuZHMsIGltYWdlLCBpbWFnZUluZGV4KSB7XG4gICAgdmFyIGJhY2tncm91bmRTaXplID0gX2h0bWwyY2FudmFzLlV0aWwuZ2V0Q1NTKGVsZW1lbnQsICdiYWNrZ3JvdW5kU2l6ZScsIGltYWdlSW5kZXgpLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQ7XG5cbiAgICBpZiAoYmFja2dyb3VuZFNpemUubGVuZ3RoID09PSAxKSB7XG4gICAgICBiYWNrZ3JvdW5kU2l6ZSA9IFtiYWNrZ3JvdW5kU2l6ZVswXSwgYmFja2dyb3VuZFNpemVbMF1dO1xuICAgIH1cblxuICAgIGlmIChiYWNrZ3JvdW5kU2l6ZVswXS50b1N0cmluZygpLmluZGV4T2YoXCIlXCIpICE9PSAtMSkge1xuICAgICAgd2lkdGggPSBib3VuZHMud2lkdGggKiBwYXJzZUZsb2F0KGJhY2tncm91bmRTaXplWzBdKSAvIDEwMDtcbiAgICB9IGVsc2UgaWYgKGJhY2tncm91bmRTaXplWzBdID09PSAnYXV0bycpIHtcbiAgICAgIHdpZHRoID0gaW1hZ2Uud2lkdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgvY29udGFpbnxjb3Zlci8udGVzdChiYWNrZ3JvdW5kU2l6ZVswXSkpIHtcbiAgICAgICAgdmFyIHJlc2l6ZWQgPSBfaHRtbDJjYW52YXMuVXRpbC5yZXNpemVCb3VuZHMoaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCBiYWNrZ3JvdW5kU2l6ZVswXSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgd2lkdGg6IHJlc2l6ZWQud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiByZXNpemVkLmhlaWdodFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2lkdGggPSBwYXJzZUludChiYWNrZ3JvdW5kU2l6ZVswXSwgMTApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChiYWNrZ3JvdW5kU2l6ZVsxXSA9PT0gJ2F1dG8nKSB7XG4gICAgICBoZWlnaHQgPSB3aWR0aCAvIGltYWdlLndpZHRoICogaW1hZ2UuaGVpZ2h0O1xuICAgIH0gZWxzZSBpZiAoYmFja2dyb3VuZFNpemVbMV0udG9TdHJpbmcoKS5pbmRleE9mKFwiJVwiKSAhPT0gLTEpIHtcbiAgICAgIGhlaWdodCA9IGJvdW5kcy5oZWlnaHQgKiBwYXJzZUZsb2F0KGJhY2tncm91bmRTaXplWzFdKSAvIDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaGVpZ2h0ID0gcGFyc2VJbnQoYmFja2dyb3VuZFNpemVbMV0sIDEwKTtcbiAgICB9XG5cblxuICAgIGlmIChiYWNrZ3JvdW5kU2l6ZVswXSA9PT0gJ2F1dG8nKSB7XG4gICAgICB3aWR0aCA9IGhlaWdodCAvIGltYWdlLmhlaWdodCAqIGltYWdlLndpZHRoO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH07XG4gIH07XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwuRXh0ZW5kID0gZnVuY3Rpb24gKG9wdGlvbnMsIGRlZmF1bHRzKSB7XG4gICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgZGVmYXVsdHNba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRzO1xuICB9O1xuXG5cbiAgLypcbiAgICogRGVyaXZlZCBmcm9tIGpRdWVyeS5jb250ZW50cygpXG4gICAqIENvcHlyaWdodCAyMDEwLCBKb2huIFJlc2lnXG4gICAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgVmVyc2lvbiAyIGxpY2Vuc2VzLlxuICAgKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gICAqL1xuICBfaHRtbDJjYW52YXMuVXRpbC5DaGlsZHJlbiA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgdmFyIGNoaWxkcmVuO1xuICAgIHRyeSB7XG4gICAgICBjaGlsZHJlbiA9IChlbGVtLm5vZGVOYW1lICYmIGVsZW0ubm9kZU5hbWUudG9VcHBlckNhc2UoKSA9PT0gXCJJRlJBTUVcIikgPyBlbGVtLmNvbnRlbnREb2N1bWVudCB8fCBlbGVtLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQgOiAoZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgICAgIHZhciByZXQgPSBbXTtcbiAgICAgICAgaWYgKGFycmF5ICE9PSBudWxsKSB7XG4gICAgICAgICAgKGZ1bmN0aW9uIChmaXJzdCwgc2Vjb25kKSB7XG4gICAgICAgICAgICB2YXIgaSA9IGZpcnN0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgaiA9IDA7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2Vjb25kLmxlbmd0aCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICBmb3IgKHZhciBsID0gc2Vjb25kLmxlbmd0aDsgaiA8IGw7IGorKykge1xuICAgICAgICAgICAgICAgIGZpcnN0W2krK10gPSBzZWNvbmRbal07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHdoaWxlIChzZWNvbmRbal0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGZpcnN0W2krK10gPSBzZWNvbmRbaisrXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaXJzdC5sZW5ndGggPSBpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmlyc3Q7XG4gICAgICAgICAgfSkocmV0LCBhcnJheSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0pKGVsZW0uY2hpbGROb2Rlcyk7XG5cbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgX2h0bWwyY2FudmFzLlV0aWwubG9nKFwiaHRtbDJjYW52YXMuVXRpbC5DaGlsZHJlbiBmYWlsZWQgd2l0aCBleGNlcHRpb246IFwiICsgZXgubWVzc2FnZSk7XG4gICAgICBjaGlsZHJlbiA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gY2hpbGRyZW47XG4gIH07XG5cbiAgX2h0bWwyY2FudmFzLlV0aWwuaXNUcmFuc3BhcmVudCA9IGZ1bmN0aW9uIChiYWNrZ3JvdW5kQ29sb3IpIHtcbiAgICByZXR1cm4gKCFiYWNrZ3JvdW5kQ29sb3IgfHwgYmFja2dyb3VuZENvbG9yID09PSBcInRyYW5zcGFyZW50XCIgfHwgYmFja2dyb3VuZENvbG9yID09PSBcInJnYmEoMCwgMCwgMCwgMClcIik7XG4gIH07XG4gIF9odG1sMmNhbnZhcy5VdGlsLkZvbnQgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGZvbnREYXRhID0ge307XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKGZvbnQsIGZvbnRTaXplLCBkb2MpIHtcbiAgICAgIGlmIChmb250RGF0YVtmb250ICsgXCItXCIgKyBmb250U2l6ZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZm9udERhdGFbZm9udCArIFwiLVwiICsgZm9udFNpemVdO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGFpbmVyID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICBpbWcgPSBkb2MuY3JlYXRlRWxlbWVudCgnaW1nJyksXG4gICAgICAgIHNwYW4gPSBkb2MuY3JlYXRlRWxlbWVudCgnc3BhbicpLFxuICAgICAgICBzYW1wbGVUZXh0ID0gJ0hpZGRlbiBUZXh0JyxcbiAgICAgICAgYmFzZWxpbmUsXG4gICAgICAgIG1pZGRsZSxcbiAgICAgICAgbWV0cmljc09iajtcblxuICAgICAgY29udGFpbmVyLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgY29udGFpbmVyLnN0eWxlLmZvbnRGYW1pbHkgPSBmb250O1xuICAgICAgY29udGFpbmVyLnN0eWxlLmZvbnRTaXplID0gZm9udFNpemU7XG4gICAgICBjb250YWluZXIuc3R5bGUubWFyZ2luID0gMDtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5wYWRkaW5nID0gMDtcblxuICAgICAgZG9jLmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICAgICAgLy8gaHR0cDovL3Byb2JhYmx5cHJvZ3JhbW1pbmcuY29tLzIwMDkvMDMvMTUvdGhlLXRpbmllc3QtZ2lmLWV2ZXIgKGhhbmR0aW55d2hpdGUuZ2lmKVxuICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUJBUC8vL3dBQUFDd0FBQUFBQVFBQkFBQUNBa1FCQURzPVwiO1xuICAgICAgaW1nLndpZHRoID0gMTtcbiAgICAgIGltZy5oZWlnaHQgPSAxO1xuXG4gICAgICBpbWcuc3R5bGUubWFyZ2luID0gMDtcbiAgICAgIGltZy5zdHlsZS5wYWRkaW5nID0gMDtcbiAgICAgIGltZy5zdHlsZS52ZXJ0aWNhbEFsaWduID0gXCJiYXNlbGluZVwiO1xuXG4gICAgICBzcGFuLnN0eWxlLmZvbnRGYW1pbHkgPSBmb250O1xuICAgICAgc3Bhbi5zdHlsZS5mb250U2l6ZSA9IGZvbnRTaXplO1xuICAgICAgc3Bhbi5zdHlsZS5tYXJnaW4gPSAwO1xuICAgICAgc3Bhbi5zdHlsZS5wYWRkaW5nID0gMDtcblxuICAgICAgc3Bhbi5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoc2FtcGxlVGV4dCkpO1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNwYW4pO1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGltZyk7XG4gICAgICBiYXNlbGluZSA9IChpbWcub2Zmc2V0VG9wIC0gc3Bhbi5vZmZzZXRUb3ApICsgMTtcblxuICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKHNwYW4pO1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShzYW1wbGVUZXh0KSk7XG5cbiAgICAgIGNvbnRhaW5lci5zdHlsZS5saW5lSGVpZ2h0ID0gXCJub3JtYWxcIjtcbiAgICAgIGltZy5zdHlsZS52ZXJ0aWNhbEFsaWduID0gXCJzdXBlclwiO1xuXG4gICAgICBtaWRkbGUgPSAoaW1nLm9mZnNldFRvcCAtIGNvbnRhaW5lci5vZmZzZXRUb3ApICsgMTtcbiAgICAgIG1ldHJpY3NPYmogPSB7XG4gICAgICAgIGJhc2VsaW5lOiBiYXNlbGluZSxcbiAgICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgICBtaWRkbGU6IG1pZGRsZVxuICAgICAgfTtcblxuICAgICAgZm9udERhdGFbZm9udCArIFwiLVwiICsgZm9udFNpemVdID0gbWV0cmljc09iajtcblxuICAgICAgZG9jLmJvZHkucmVtb3ZlQ2hpbGQoY29udGFpbmVyKTtcblxuICAgICAgcmV0dXJuIG1ldHJpY3NPYmo7XG4gICAgfTtcbiAgfSkoKTtcblxuICAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBVdGlsID0gX2h0bWwyY2FudmFzLlV0aWwsXG4gICAgICBHZW5lcmF0ZSA9IHt9O1xuXG4gICAgX2h0bWwyY2FudmFzLkdlbmVyYXRlID0gR2VuZXJhdGU7XG5cbiAgICB2YXIgcmVHcmFkaWVudHMgPSBbXG4gICAgICAvXigtd2Via2l0LWxpbmVhci1ncmFkaWVudClcXCgoW2Etelxcc10rKShbXFx3XFxkXFwuXFxzLCVcXChcXCldKylcXCkkLyxcbiAgICAgIC9eKC1vLWxpbmVhci1ncmFkaWVudClcXCgoW2Etelxcc10rKShbXFx3XFxkXFwuXFxzLCVcXChcXCldKylcXCkkLyxcbiAgICAgIC9eKC13ZWJraXQtZ3JhZGllbnQpXFwoKGxpbmVhcnxyYWRpYWwpLFxccygoPzpcXGR7MSwzfSU/KVxccyg/OlxcZHsxLDN9JT8pLFxccyg/OlxcZHsxLDN9JT8pXFxzKD86XFxkezEsM30lPykpKFtcXHdcXGRcXC5cXHMsJVxcKFxcKVxcLV0rKVxcKSQvLFxuICAgICAgL14oLW1vei1saW5lYXItZ3JhZGllbnQpXFwoKCg/OlxcZHsxLDN9JT8pXFxzKD86XFxkezEsM30lPykpKFtcXHdcXGRcXC5cXHMsJVxcKFxcKV0rKVxcKSQvLFxuICAgICAgL14oLXdlYmtpdC1yYWRpYWwtZ3JhZGllbnQpXFwoKCg/OlxcZHsxLDN9JT8pXFxzKD86XFxkezEsM30lPykpLFxccyhcXHcrKVxccyhbYS16XFwtXSspKFtcXHdcXGRcXC5cXHMsJVxcKFxcKV0rKVxcKSQvLFxuICAgICAgL14oLW1vei1yYWRpYWwtZ3JhZGllbnQpXFwoKCg/OlxcZHsxLDN9JT8pXFxzKD86XFxkezEsM30lPykpLFxccyhcXHcrKVxccz8oW2EtelxcLV0qKShbXFx3XFxkXFwuXFxzLCVcXChcXCldKylcXCkkLyxcbiAgICAgIC9eKC1vLXJhZGlhbC1ncmFkaWVudClcXCgoKD86XFxkezEsM30lPylcXHMoPzpcXGR7MSwzfSU/KSksXFxzKFxcdyspXFxzKFthLXpcXC1dKykoW1xcd1xcZFxcLlxccywlXFwoXFwpXSspXFwpJC9cbiAgICBdO1xuXG4gICAgLypcbiAgICAgKiBUT0RPOiBBZGQgSUUxMCB2ZW5kb3IgcHJlZml4ICgtbXMpIHN1cHBvcnRcbiAgICAgKiBUT0RPOiBBZGQgVzNDIGdyYWRpZW50IChsaW5lYXItZ3JhZGllbnQpIHN1cHBvcnRcbiAgICAgKiBUT0RPOiBBZGQgb2xkIFdlYmtpdCAtd2Via2l0LWdyYWRpZW50KHJhZGlhbCwgLi4uKSBzdXBwb3J0XG4gICAgICogVE9ETzogTWF5YmUgc29tZSBSZWdFeHAgb3B0aW1pemF0aW9ucyBhcmUgcG9zc2libGUgO28pXG4gICAgICovXG4gICAgR2VuZXJhdGUucGFyc2VHcmFkaWVudCA9IGZ1bmN0aW9uIChjc3MsIGJvdW5kcykge1xuICAgICAgdmFyIGdyYWRpZW50LCBpLCBsZW4gPSByZUdyYWRpZW50cy5sZW5ndGgsXG4gICAgICAgIG0xLCBzdG9wLCBtMiwgbTJMZW4sIHN0ZXAsIG0zLCB0bCwgdHIsIGJyLCBibDtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgIG0xID0gY3NzLm1hdGNoKHJlR3JhZGllbnRzW2ldKTtcbiAgICAgICAgaWYgKG0xKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG0xKSB7XG4gICAgICAgIHN3aXRjaCAobTFbMV0pIHtcbiAgICAgICAgICBjYXNlICctd2Via2l0LWxpbmVhci1ncmFkaWVudCc6XG4gICAgICAgICAgY2FzZSAnLW8tbGluZWFyLWdyYWRpZW50JzpcblxuICAgICAgICAgICAgZ3JhZGllbnQgPSB7XG4gICAgICAgICAgICAgIHR5cGU6ICdsaW5lYXInLFxuICAgICAgICAgICAgICB4MDogbnVsbCxcbiAgICAgICAgICAgICAgeTA6IG51bGwsXG4gICAgICAgICAgICAgIHgxOiBudWxsLFxuICAgICAgICAgICAgICB5MTogbnVsbCxcbiAgICAgICAgICAgICAgY29sb3JTdG9wczogW11cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGdldCBjb29yZGluYXRlc1xuICAgICAgICAgICAgbTIgPSBtMVsyXS5tYXRjaCgvXFx3Ky9nKTtcbiAgICAgICAgICAgIGlmIChtMikge1xuICAgICAgICAgICAgICBtMkxlbiA9IG0yLmxlbmd0aDtcbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG0yTGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG0yW2ldKSB7XG4gICAgICAgICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC55MCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnkxID0gYm91bmRzLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueDAgPSBib3VuZHMud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LngxID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnkwID0gYm91bmRzLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueTEgPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LngwID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueDEgPSBib3VuZHMud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGdyYWRpZW50LngwID09PSBudWxsICYmIGdyYWRpZW50LngxID09PSBudWxsKSB7IC8vIGNlbnRlclxuICAgICAgICAgICAgICBncmFkaWVudC54MCA9IGdyYWRpZW50LngxID0gYm91bmRzLndpZHRoIC8gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChncmFkaWVudC55MCA9PT0gbnVsbCAmJiBncmFkaWVudC55MSA9PT0gbnVsbCkgeyAvLyBjZW50ZXJcbiAgICAgICAgICAgICAgZ3JhZGllbnQueTAgPSBncmFkaWVudC55MSA9IGJvdW5kcy5oZWlnaHQgLyAyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBnZXQgY29sb3JzIGFuZCBzdG9wc1xuICAgICAgICAgICAgbTIgPSBtMVszXS5tYXRjaCgvKCg/OnJnYnxyZ2JhKVxcKFxcZHsxLDN9LFxcc1xcZHsxLDN9LFxcc1xcZHsxLDN9KD86LFxcc1swLTlcXC5dKyk/XFwpKD86XFxzXFxkezEsM30oPzolfHB4KSk/KSsvZyk7XG4gICAgICAgICAgICBpZiAobTIpIHtcbiAgICAgICAgICAgICAgbTJMZW4gPSBtMi5sZW5ndGg7XG4gICAgICAgICAgICAgIHN0ZXAgPSAxIC8gTWF0aC5tYXgobTJMZW4gLSAxLCAxKTtcbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG0yTGVuOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBtMyA9IG0yW2ldLm1hdGNoKC8oKD86cmdifHJnYmEpXFwoXFxkezEsM30sXFxzXFxkezEsM30sXFxzXFxkezEsM30oPzosXFxzWzAtOVxcLl0rKT9cXCkpXFxzKihcXGR7MSwzfSk/KCV8cHgpPy8pO1xuICAgICAgICAgICAgICAgIGlmIChtM1syXSkge1xuICAgICAgICAgICAgICAgICAgc3RvcCA9IHBhcnNlRmxvYXQobTNbMl0pO1xuICAgICAgICAgICAgICAgICAgaWYgKG0zWzNdID09PSAnJScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCAvPSAxMDA7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBweCAtIHN0dXBpZCBvcGVyYVxuICAgICAgICAgICAgICAgICAgICBzdG9wIC89IGJvdW5kcy53aWR0aDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc3RvcCA9IGkgKiBzdGVwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBncmFkaWVudC5jb2xvclN0b3BzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgY29sb3I6IG0zWzFdLFxuICAgICAgICAgICAgICAgICAgc3RvcDogc3RvcFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJy13ZWJraXQtZ3JhZGllbnQnOlxuXG4gICAgICAgICAgICBncmFkaWVudCA9IHtcbiAgICAgICAgICAgICAgdHlwZTogbTFbMl0gPT09ICdyYWRpYWwnID8gJ2NpcmNsZScgOiBtMVsyXSwgLy8gVE9ETzogQWRkIHJhZGlhbCBncmFkaWVudCBzdXBwb3J0IGZvciBvbGRlciBtb3ppbGxhIGRlZmluaXRpb25zXG4gICAgICAgICAgICAgIHgwOiAwLFxuICAgICAgICAgICAgICB5MDogMCxcbiAgICAgICAgICAgICAgeDE6IDAsXG4gICAgICAgICAgICAgIHkxOiAwLFxuICAgICAgICAgICAgICBjb2xvclN0b3BzOiBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gZ2V0IGNvb3JkaW5hdGVzXG4gICAgICAgICAgICBtMiA9IG0xWzNdLm1hdGNoKC8oXFxkezEsM30pJT9cXHMoXFxkezEsM30pJT8sXFxzKFxcZHsxLDN9KSU/XFxzKFxcZHsxLDN9KSU/Lyk7XG4gICAgICAgICAgICBpZiAobTIpIHtcbiAgICAgICAgICAgICAgZ3JhZGllbnQueDAgPSAobTJbMV0gKiBib3VuZHMud2lkdGgpIC8gMTAwO1xuICAgICAgICAgICAgICBncmFkaWVudC55MCA9IChtMlsyXSAqIGJvdW5kcy5oZWlnaHQpIC8gMTAwO1xuICAgICAgICAgICAgICBncmFkaWVudC54MSA9IChtMlszXSAqIGJvdW5kcy53aWR0aCkgLyAxMDA7XG4gICAgICAgICAgICAgIGdyYWRpZW50LnkxID0gKG0yWzRdICogYm91bmRzLmhlaWdodCkgLyAxMDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGdldCBjb2xvcnMgYW5kIHN0b3BzXG4gICAgICAgICAgICBtMiA9IG0xWzRdLm1hdGNoKC8oKD86ZnJvbXx0b3xjb2xvci1zdG9wKVxcKCg/OlswLTlcXC5dKyxcXHMpPyg/OnJnYnxyZ2JhKVxcKFxcZHsxLDN9LFxcc1xcZHsxLDN9LFxcc1xcZHsxLDN9KD86LFxcc1swLTlcXC5dKyk/XFwpXFwpKSsvZyk7XG4gICAgICAgICAgICBpZiAobTIpIHtcbiAgICAgICAgICAgICAgbTJMZW4gPSBtMi5sZW5ndGg7XG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBtMkxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbTMgPSBtMltpXS5tYXRjaCgvKGZyb218dG98Y29sb3Itc3RvcClcXCgoWzAtOVxcLl0rKT8oPzosXFxzKT8oKD86cmdifHJnYmEpXFwoXFxkezEsM30sXFxzXFxkezEsM30sXFxzXFxkezEsM30oPzosXFxzWzAtOVxcLl0rKT9cXCkpXFwpLyk7XG4gICAgICAgICAgICAgICAgc3RvcCA9IHBhcnNlRmxvYXQobTNbMl0pO1xuICAgICAgICAgICAgICAgIGlmIChtM1sxXSA9PT0gJ2Zyb20nKSB7XG4gICAgICAgICAgICAgICAgICBzdG9wID0gMC4wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobTNbMV0gPT09ICd0bycpIHtcbiAgICAgICAgICAgICAgICAgIHN0b3AgPSAxLjA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyYWRpZW50LmNvbG9yU3RvcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogbTNbM10sXG4gICAgICAgICAgICAgICAgICBzdG9wOiBzdG9wXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnLW1vei1saW5lYXItZ3JhZGllbnQnOlxuXG4gICAgICAgICAgICBncmFkaWVudCA9IHtcbiAgICAgICAgICAgICAgdHlwZTogJ2xpbmVhcicsXG4gICAgICAgICAgICAgIHgwOiAwLFxuICAgICAgICAgICAgICB5MDogMCxcbiAgICAgICAgICAgICAgeDE6IDAsXG4gICAgICAgICAgICAgIHkxOiAwLFxuICAgICAgICAgICAgICBjb2xvclN0b3BzOiBbXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gZ2V0IGNvb3JkaW5hdGVzXG4gICAgICAgICAgICBtMiA9IG0xWzJdLm1hdGNoKC8oXFxkezEsM30pJT9cXHMoXFxkezEsM30pJT8vKTtcblxuICAgICAgICAgICAgLy8gbTJbMV0gPT0gMCUgICAtPiBsZWZ0XG4gICAgICAgICAgICAvLyBtMlsxXSA9PSA1MCUgIC0+IGNlbnRlclxuICAgICAgICAgICAgLy8gbTJbMV0gPT0gMTAwJSAtPiByaWdodFxuXG4gICAgICAgICAgICAvLyBtMlsyXSA9PSAwJSAgIC0+IHRvcFxuICAgICAgICAgICAgLy8gbTJbMl0gPT0gNTAlICAtPiBjZW50ZXJcbiAgICAgICAgICAgIC8vIG0yWzJdID09IDEwMCUgLT4gYm90dG9tXG5cbiAgICAgICAgICAgIGlmIChtMikge1xuICAgICAgICAgICAgICBncmFkaWVudC54MCA9IChtMlsxXSAqIGJvdW5kcy53aWR0aCkgLyAxMDA7XG4gICAgICAgICAgICAgIGdyYWRpZW50LnkwID0gKG0yWzJdICogYm91bmRzLmhlaWdodCkgLyAxMDA7XG4gICAgICAgICAgICAgIGdyYWRpZW50LngxID0gYm91bmRzLndpZHRoIC0gZ3JhZGllbnQueDA7XG4gICAgICAgICAgICAgIGdyYWRpZW50LnkxID0gYm91bmRzLmhlaWdodCAtIGdyYWRpZW50LnkwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBnZXQgY29sb3JzIGFuZCBzdG9wc1xuICAgICAgICAgICAgbTIgPSBtMVszXS5tYXRjaCgvKCg/OnJnYnxyZ2JhKVxcKFxcZHsxLDN9LFxcc1xcZHsxLDN9LFxcc1xcZHsxLDN9KD86LFxcc1swLTlcXC5dKyk/XFwpKD86XFxzXFxkezEsM30lKT8pKy9nKTtcbiAgICAgICAgICAgIGlmIChtMikge1xuICAgICAgICAgICAgICBtMkxlbiA9IG0yLmxlbmd0aDtcbiAgICAgICAgICAgICAgc3RlcCA9IDEgLyBNYXRoLm1heChtMkxlbiAtIDEsIDEpO1xuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbTJMZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIG0zID0gbTJbaV0ubWF0Y2goLygoPzpyZ2J8cmdiYSlcXChcXGR7MSwzfSxcXHNcXGR7MSwzfSxcXHNcXGR7MSwzfSg/OixcXHNbMC05XFwuXSspP1xcKSlcXHMqKFxcZHsxLDN9KT8oJSk/Lyk7XG4gICAgICAgICAgICAgICAgaWYgKG0zWzJdKSB7XG4gICAgICAgICAgICAgICAgICBzdG9wID0gcGFyc2VGbG9hdChtM1syXSk7XG4gICAgICAgICAgICAgICAgICBpZiAobTNbM10pIHsgLy8gcGVyY2VudGFnZVxuICAgICAgICAgICAgICAgICAgICBzdG9wIC89IDEwMDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc3RvcCA9IGkgKiBzdGVwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBncmFkaWVudC5jb2xvclN0b3BzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgY29sb3I6IG0zWzFdLFxuICAgICAgICAgICAgICAgICAgc3RvcDogc3RvcFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJy13ZWJraXQtcmFkaWFsLWdyYWRpZW50JzpcbiAgICAgICAgICBjYXNlICctbW96LXJhZGlhbC1ncmFkaWVudCc6XG4gICAgICAgICAgY2FzZSAnLW8tcmFkaWFsLWdyYWRpZW50JzpcblxuICAgICAgICAgICAgZ3JhZGllbnQgPSB7XG4gICAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgICB4MDogMCxcbiAgICAgICAgICAgICAgeTA6IDAsXG4gICAgICAgICAgICAgIHgxOiBib3VuZHMud2lkdGgsXG4gICAgICAgICAgICAgIHkxOiBib3VuZHMuaGVpZ2h0LFxuICAgICAgICAgICAgICBjeDogMCxcbiAgICAgICAgICAgICAgY3k6IDAsXG4gICAgICAgICAgICAgIHJ4OiAwLFxuICAgICAgICAgICAgICByeTogMCxcbiAgICAgICAgICAgICAgY29sb3JTdG9wczogW11cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGNlbnRlclxuICAgICAgICAgICAgbTIgPSBtMVsyXS5tYXRjaCgvKFxcZHsxLDN9KSU/XFxzKFxcZHsxLDN9KSU/Lyk7XG4gICAgICAgICAgICBpZiAobTIpIHtcbiAgICAgICAgICAgICAgZ3JhZGllbnQuY3ggPSAobTJbMV0gKiBib3VuZHMud2lkdGgpIC8gMTAwO1xuICAgICAgICAgICAgICBncmFkaWVudC5jeSA9IChtMlsyXSAqIGJvdW5kcy5oZWlnaHQpIC8gMTAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzaXplXG4gICAgICAgICAgICBtMiA9IG0xWzNdLm1hdGNoKC9cXHcrLyk7XG4gICAgICAgICAgICBtMyA9IG0xWzRdLm1hdGNoKC9bYS16XFwtXSovKTtcbiAgICAgICAgICAgIGlmIChtMiAmJiBtMykge1xuICAgICAgICAgICAgICBzd2l0Y2ggKG0zWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZmFydGhlc3QtY29ybmVyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjb3Zlcic6IC8vIGlzIGVxdWl2YWxlbnQgdG8gZmFydGhlc3QtY29ybmVyXG4gICAgICAgICAgICAgICAgY2FzZSAnJzogLy8gbW96aWxsYSByZW1vdmVzIFwiY292ZXJcIiBmcm9tIGRlZmluaXRpb24gOihcbiAgICAgICAgICAgICAgICAgIHRsID0gTWF0aC5zcXJ0KE1hdGgucG93KGdyYWRpZW50LmN4LCAyKSArIE1hdGgucG93KGdyYWRpZW50LmN5LCAyKSk7XG4gICAgICAgICAgICAgICAgICB0ciA9IE1hdGguc3FydChNYXRoLnBvdyhncmFkaWVudC5jeCwgMikgKyBNYXRoLnBvdyhncmFkaWVudC55MSAtIGdyYWRpZW50LmN5LCAyKSk7XG4gICAgICAgICAgICAgICAgICBiciA9IE1hdGguc3FydChNYXRoLnBvdyhncmFkaWVudC54MSAtIGdyYWRpZW50LmN4LCAyKSArIE1hdGgucG93KGdyYWRpZW50LnkxIC0gZ3JhZGllbnQuY3ksIDIpKTtcbiAgICAgICAgICAgICAgICAgIGJsID0gTWF0aC5zcXJ0KE1hdGgucG93KGdyYWRpZW50LngxIC0gZ3JhZGllbnQuY3gsIDIpICsgTWF0aC5wb3coZ3JhZGllbnQuY3ksIDIpKTtcbiAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnJ4ID0gZ3JhZGllbnQucnkgPSBNYXRoLm1heCh0bCwgdHIsIGJyLCBibCk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjbG9zZXN0LWNvcm5lcic6XG4gICAgICAgICAgICAgICAgICB0bCA9IE1hdGguc3FydChNYXRoLnBvdyhncmFkaWVudC5jeCwgMikgKyBNYXRoLnBvdyhncmFkaWVudC5jeSwgMikpO1xuICAgICAgICAgICAgICAgICAgdHIgPSBNYXRoLnNxcnQoTWF0aC5wb3coZ3JhZGllbnQuY3gsIDIpICsgTWF0aC5wb3coZ3JhZGllbnQueTEgLSBncmFkaWVudC5jeSwgMikpO1xuICAgICAgICAgICAgICAgICAgYnIgPSBNYXRoLnNxcnQoTWF0aC5wb3coZ3JhZGllbnQueDEgLSBncmFkaWVudC5jeCwgMikgKyBNYXRoLnBvdyhncmFkaWVudC55MSAtIGdyYWRpZW50LmN5LCAyKSk7XG4gICAgICAgICAgICAgICAgICBibCA9IE1hdGguc3FydChNYXRoLnBvdyhncmFkaWVudC54MSAtIGdyYWRpZW50LmN4LCAyKSArIE1hdGgucG93KGdyYWRpZW50LmN5LCAyKSk7XG4gICAgICAgICAgICAgICAgICBncmFkaWVudC5yeCA9IGdyYWRpZW50LnJ5ID0gTWF0aC5taW4odGwsIHRyLCBiciwgYmwpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZmFydGhlc3Qtc2lkZSc6XG4gICAgICAgICAgICAgICAgICBpZiAobTJbMF0gPT09ICdjaXJjbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnJ4ID0gZ3JhZGllbnQucnkgPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5jeCxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5jeSxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC54MSAtIGdyYWRpZW50LmN4LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnkxIC0gZ3JhZGllbnQuY3lcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIGVsbGlwc2VcblxuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC50eXBlID0gbTJbMF07XG5cbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQucnggPSBNYXRoLm1heChcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5jeCxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC54MSAtIGdyYWRpZW50LmN4XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnJ5ID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuY3ksXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueTEgLSBncmFkaWVudC5jeVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2xvc2VzdC1zaWRlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjb250YWluJzogLy8gaXMgZXF1aXZhbGVudCB0byBjbG9zZXN0LXNpZGVcbiAgICAgICAgICAgICAgICAgIGlmIChtMlswXSA9PT0gJ2NpcmNsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQucnggPSBncmFkaWVudC5yeSA9IE1hdGgubWluKFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmN4LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmN5LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LngxIC0gZ3JhZGllbnQuY3gsXG4gICAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQueTEgLSBncmFkaWVudC5jeVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gZWxsaXBzZVxuXG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LnR5cGUgPSBtMlswXTtcblxuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5yeCA9IE1hdGgubWluKFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmN4LFxuICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LngxIC0gZ3JhZGllbnQuY3hcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQucnkgPSBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5jeSxcbiAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudC55MSAtIGdyYWRpZW50LmN5XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgLy8gVE9ETzogYWRkIHN1cHBvcnQgZm9yIFwiMzBweCA0MHB4XCIgc2l6ZXMgKHdlYmtpdCBvbmx5KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbG9yIHN0b3BzXG4gICAgICAgICAgICBtMiA9IG0xWzVdLm1hdGNoKC8oKD86cmdifHJnYmEpXFwoXFxkezEsM30sXFxzXFxkezEsM30sXFxzXFxkezEsM30oPzosXFxzWzAtOVxcLl0rKT9cXCkoPzpcXHNcXGR7MSwzfSg/OiV8cHgpKT8pKy9nKTtcbiAgICAgICAgICAgIGlmIChtMikge1xuICAgICAgICAgICAgICBtMkxlbiA9IG0yLmxlbmd0aDtcbiAgICAgICAgICAgICAgc3RlcCA9IDEgLyBNYXRoLm1heChtMkxlbiAtIDEsIDEpO1xuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbTJMZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIG0zID0gbTJbaV0ubWF0Y2goLygoPzpyZ2J8cmdiYSlcXChcXGR7MSwzfSxcXHNcXGR7MSwzfSxcXHNcXGR7MSwzfSg/OixcXHNbMC05XFwuXSspP1xcKSlcXHMqKFxcZHsxLDN9KT8oJXxweCk/Lyk7XG4gICAgICAgICAgICAgICAgaWYgKG0zWzJdKSB7XG4gICAgICAgICAgICAgICAgICBzdG9wID0gcGFyc2VGbG9hdChtM1syXSk7XG4gICAgICAgICAgICAgICAgICBpZiAobTNbM10gPT09ICclJykge1xuICAgICAgICAgICAgICAgICAgICBzdG9wIC89IDEwMDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHB4IC0gc3R1cGlkIG9wZXJhXG4gICAgICAgICAgICAgICAgICAgIHN0b3AgLz0gYm91bmRzLndpZHRoO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzdG9wID0gaSAqIHN0ZXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyYWRpZW50LmNvbG9yU3RvcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogbTNbMV0sXG4gICAgICAgICAgICAgICAgICBzdG9wOiBzdG9wXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBncmFkaWVudDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gYWRkU2Nyb2xsU3RvcHMoZ3JhZCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb2xvclN0b3ApIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBncmFkLmFkZENvbG9yU3RvcChjb2xvclN0b3Auc3RvcCwgY29sb3JTdG9wLmNvbG9yKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIFV0aWwubG9nKFsnZmFpbGVkIHRvIGFkZCBjb2xvciBzdG9wOiAnLCBlLCAnOyB0cmllZCB0byBhZGQ6ICcsIGNvbG9yU3RvcF0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIEdlbmVyYXRlLkdyYWRpZW50ID0gZnVuY3Rpb24gKHNyYywgYm91bmRzKSB7XG4gICAgICBpZiAoYm91bmRzLndpZHRoID09PSAwIHx8IGJvdW5kcy5oZWlnaHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgICBncmFkaWVudCwgZ3JhZDtcblxuICAgICAgY2FudmFzLndpZHRoID0gYm91bmRzLndpZHRoO1xuICAgICAgY2FudmFzLmhlaWdodCA9IGJvdW5kcy5oZWlnaHQ7XG5cbiAgICAgIC8vIFRPRE86IGFkZCBzdXBwb3J0IGZvciBtdWx0aSBkZWZpbmVkIGJhY2tncm91bmQgZ3JhZGllbnRzXG4gICAgICBncmFkaWVudCA9IF9odG1sMmNhbnZhcy5HZW5lcmF0ZS5wYXJzZUdyYWRpZW50KHNyYywgYm91bmRzKTtcblxuICAgICAgaWYgKGdyYWRpZW50KSB7XG4gICAgICAgIHN3aXRjaCAoZ3JhZGllbnQudHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2xpbmVhcic6XG4gICAgICAgICAgICBncmFkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KGdyYWRpZW50LngwLCBncmFkaWVudC55MCwgZ3JhZGllbnQueDEsIGdyYWRpZW50LnkxKTtcbiAgICAgICAgICAgIGdyYWRpZW50LmNvbG9yU3RvcHMuZm9yRWFjaChhZGRTY3JvbGxTdG9wcyhncmFkKSk7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudChncmFkaWVudC5jeCwgZ3JhZGllbnQuY3ksIDAsIGdyYWRpZW50LmN4LCBncmFkaWVudC5jeSwgZ3JhZGllbnQucngpO1xuICAgICAgICAgICAgZ3JhZGllbnQuY29sb3JTdG9wcy5mb3JFYWNoKGFkZFNjcm9sbFN0b3BzKGdyYWQpKTtcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBncmFkO1xuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgJ2VsbGlwc2UnOlxuICAgICAgICAgICAgdmFyIGNhbnZhc1JhZGlhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgICAgICAgICBjdHhSYWRpYWwgPSBjYW52YXNSYWRpYWwuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgICAgICAgICAgcmkgPSBNYXRoLm1heChncmFkaWVudC5yeCwgZ3JhZGllbnQucnkpLFxuICAgICAgICAgICAgICBkaSA9IHJpICogMjtcblxuICAgICAgICAgICAgY2FudmFzUmFkaWFsLndpZHRoID0gY2FudmFzUmFkaWFsLmhlaWdodCA9IGRpO1xuXG4gICAgICAgICAgICBncmFkID0gY3R4UmFkaWFsLmNyZWF0ZVJhZGlhbEdyYWRpZW50KGdyYWRpZW50LnJ4LCBncmFkaWVudC5yeSwgMCwgZ3JhZGllbnQucngsIGdyYWRpZW50LnJ5LCByaSk7XG4gICAgICAgICAgICBncmFkaWVudC5jb2xvclN0b3BzLmZvckVhY2goYWRkU2Nyb2xsU3RvcHMoZ3JhZCkpO1xuXG4gICAgICAgICAgICBjdHhSYWRpYWwuZmlsbFN0eWxlID0gZ3JhZDtcbiAgICAgICAgICAgIGN0eFJhZGlhbC5maWxsUmVjdCgwLCAwLCBkaSwgZGkpO1xuXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gZ3JhZGllbnQuY29sb3JTdG9wc1tncmFkaWVudC5jb2xvclN0b3BzLmxlbmd0aCAtIDFdLmNvbG9yO1xuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGNhbnZhc1JhZGlhbCwgZ3JhZGllbnQuY3ggLSBncmFkaWVudC5yeCwgZ3JhZGllbnQuY3kgLSBncmFkaWVudC5yeSwgMiAqIGdyYWRpZW50LnJ4LCAyICogZ3JhZGllbnQucnkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNhbnZhcztcbiAgICB9O1xuXG4gICAgR2VuZXJhdGUuTGlzdEFscGhhID0gZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgdmFyIHRtcCA9IFwiXCIsXG4gICAgICAgIG1vZHVsdXM7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgbW9kdWx1cyA9IG51bWJlciAlIDI2O1xuICAgICAgICB0bXAgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChtb2R1bHVzKSArIDY0KSArIHRtcDtcbiAgICAgICAgbnVtYmVyID0gbnVtYmVyIC8gMjY7XG4gICAgICB9IHdoaWxlICgobnVtYmVyICogMjYpID4gMjYpO1xuXG4gICAgICByZXR1cm4gdG1wO1xuICAgIH07XG5cbiAgICBHZW5lcmF0ZS5MaXN0Um9tYW4gPSBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgICB2YXIgcm9tYW5BcnJheSA9IFtcIk1cIiwgXCJDTVwiLCBcIkRcIiwgXCJDRFwiLCBcIkNcIiwgXCJYQ1wiLCBcIkxcIiwgXCJYTFwiLCBcIlhcIiwgXCJJWFwiLCBcIlZcIiwgXCJJVlwiLCBcIklcIl0sXG4gICAgICAgIGRlY2ltYWwgPSBbMTAwMCwgOTAwLCA1MDAsIDQwMCwgMTAwLCA5MCwgNTAsIDQwLCAxMCwgOSwgNSwgNCwgMV0sXG4gICAgICAgIHJvbWFuID0gXCJcIixcbiAgICAgICAgdixcbiAgICAgICAgbGVuID0gcm9tYW5BcnJheS5sZW5ndGg7XG5cbiAgICAgIGlmIChudW1iZXIgPD0gMCB8fCBudW1iZXIgPj0gNDAwMCkge1xuICAgICAgICByZXR1cm4gbnVtYmVyO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHYgPSAwOyB2IDwgbGVuOyB2ICs9IDEpIHtcbiAgICAgICAgd2hpbGUgKG51bWJlciA+PSBkZWNpbWFsW3ZdKSB7XG4gICAgICAgICAgbnVtYmVyIC09IGRlY2ltYWxbdl07XG4gICAgICAgICAgcm9tYW4gKz0gcm9tYW5BcnJheVt2XTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcm9tYW47XG4gICAgfTtcbiAgfSkoKTtcblxuICBmdW5jdGlvbiBoMmNSZW5kZXJDb250ZXh0KHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgc3RvcmFnZSA9IFtdO1xuICAgIHJldHVybiB7XG4gICAgICBzdG9yYWdlOiBzdG9yYWdlLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICBjbGlwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwiY2xpcFwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdHJhbnNsYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwidHJhbnNsYXRlXCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmaWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwiZmlsbFwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgc2F2ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcInNhdmVcIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHJlc3RvcmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJyZXN0b3JlXCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmaWxsUmVjdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcImZpbGxSZWN0XCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBjcmVhdGVQYXR0ZXJuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwiY3JlYXRlUGF0dGVyblwiLFxuICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZHJhd1NoYXBlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIHNoYXBlID0gW107XG5cbiAgICAgICAgc3RvcmFnZS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgICAgbmFtZTogXCJkcmF3U2hhcGVcIixcbiAgICAgICAgICAnYXJndW1lbnRzJzogc2hhcGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBtb3ZlVG86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNoYXBlLnB1c2goe1xuICAgICAgICAgICAgICBuYW1lOiBcIm1vdmVUb1wiLFxuICAgICAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGxpbmVUbzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2hhcGUucHVzaCh7XG4gICAgICAgICAgICAgIG5hbWU6IFwibGluZVRvXCIsXG4gICAgICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYXJjVG86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNoYXBlLnB1c2goe1xuICAgICAgICAgICAgICBuYW1lOiBcImFyY1RvXCIsXG4gICAgICAgICAgICAgICdhcmd1bWVudHMnOiBhcmd1bWVudHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYmV6aWVyQ3VydmVUbzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2hhcGUucHVzaCh7XG4gICAgICAgICAgICAgIG5hbWU6IFwiYmV6aWVyQ3VydmVUb1wiLFxuICAgICAgICAgICAgICAnYXJndW1lbnRzJzogYXJndW1lbnRzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHF1YWRyYXRpY0N1cnZlVG86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNoYXBlLnB1c2goe1xuICAgICAgICAgICAgICBuYW1lOiBcInF1YWRyYXRpY0N1cnZlVG9cIixcbiAgICAgICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICB9LFxuICAgICAgZHJhd0ltYWdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JhZ2UucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxuICAgICAgICAgIG5hbWU6IFwiZHJhd0ltYWdlXCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmaWxsVGV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcbiAgICAgICAgICBuYW1lOiBcImZpbGxUZXh0XCIsXG4gICAgICAgICAgJ2FyZ3VtZW50cyc6IGFyZ3VtZW50c1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBzZXRWYXJpYWJsZTogZnVuY3Rpb24gKHZhcmlhYmxlLCB2YWx1ZSkge1xuICAgICAgICBzdG9yYWdlLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwidmFyaWFibGVcIixcbiAgICAgICAgICBuYW1lOiB2YXJpYWJsZSxcbiAgICAgICAgICAnYXJndW1lbnRzJzogdmFsdWVcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIF9odG1sMmNhbnZhcy5QYXJzZSA9IGZ1bmN0aW9uIChpbWFnZXMsIG9wdGlvbnMpIHtcblxuICAgIGlmIChvcHRpb25zLmF1dG9zY3JvbGwgfHwgZmFsc2UpIHdpbmRvdy5zY3JvbGwoMCwgMCk7XG5cbiAgICB2YXIgZWxlbWVudCA9ICgob3B0aW9ucy5lbGVtZW50cyA9PT0gdW5kZWZpbmVkKSA/IGRvY3VtZW50LmJvZHkgOiBvcHRpb25zLmVsZW1lbnRzWzBdKSwgLy8gc2VsZWN0IGJvZHkgYnkgZGVmYXVsdFxuICAgICAgbnVtRHJhd3MgPSAwLFxuICAgICAgZG9jID0gZWxlbWVudC5vd25lckRvY3VtZW50LFxuICAgICAgVXRpbCA9IF9odG1sMmNhbnZhcy5VdGlsLFxuICAgICAgc3VwcG9ydCA9IFV0aWwuU3VwcG9ydChvcHRpb25zLCBkb2MpLFxuICAgICAgaWdub3JlRWxlbWVudHNSZWdFeHAgPSBuZXcgUmVnRXhwKFwiKFwiICsgb3B0aW9ucy5pZ25vcmVFbGVtZW50cyArIFwiKVwiKSxcbiAgICAgIGJvZHkgPSBkb2MuYm9keSxcbiAgICAgIGdldENTUyA9IFV0aWwuZ2V0Q1NTLFxuICAgICAgcHNldWRvSGlkZSA9IFwiX19faHRtbDJjYW52YXNfX19wc2V1ZG9lbGVtZW50XCIsXG4gICAgICBoaWRlUHNldWRvRWxlbWVudHMgPSBkb2MuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgIGhpZGVQc2V1ZG9FbGVtZW50cy5pbm5lckhUTUwgPSAnLicgKyBwc2V1ZG9IaWRlICsgJy1iZWZvcmU6YmVmb3JlIHsgY29udGVudDogXCJcIiAhaW1wb3J0YW50OyBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7IH0nICtcbiAgICAgICcuJyArIHBzZXVkb0hpZGUgKyAnLWFmdGVyOmFmdGVyIHsgY29udGVudDogXCJcIiAhaW1wb3J0YW50OyBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7IH0nO1xuXG4gICAgYm9keS5hcHBlbmRDaGlsZChoaWRlUHNldWRvRWxlbWVudHMpO1xuXG4gICAgaW1hZ2VzID0gaW1hZ2VzIHx8IHt9O1xuXG4gICAgZnVuY3Rpb24gZG9jdW1lbnRXaWR0aCgpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgTWF0aC5tYXgoZG9jLmJvZHkuc2Nyb2xsV2lkdGgsIGRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGgpLFxuICAgICAgICBNYXRoLm1heChkb2MuYm9keS5vZmZzZXRXaWR0aCwgZG9jLmRvY3VtZW50RWxlbWVudC5vZmZzZXRXaWR0aCksXG4gICAgICAgIE1hdGgubWF4KGRvYy5ib2R5LmNsaWVudFdpZHRoLCBkb2MuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb2N1bWVudEhlaWdodCgpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgTWF0aC5tYXgoZG9jLmJvZHkuc2Nyb2xsSGVpZ2h0LCBkb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCksXG4gICAgICAgIE1hdGgubWF4KGRvYy5ib2R5Lm9mZnNldEhlaWdodCwgZG9jLmRvY3VtZW50RWxlbWVudC5vZmZzZXRIZWlnaHQpLFxuICAgICAgICBNYXRoLm1heChkb2MuYm9keS5jbGllbnRIZWlnaHQsIGRvYy5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDU1NJbnQoZWxlbWVudCwgYXR0cmlidXRlKSB7XG4gICAgICB2YXIgdmFsID0gcGFyc2VJbnQoZ2V0Q1NTKGVsZW1lbnQsIGF0dHJpYnV0ZSksIDEwKTtcbiAgICAgIHJldHVybiAoaXNOYU4odmFsKSkgPyAwIDogdmFsOyAvLyBib3JkZXJzIGluIG9sZCBJRSBhcmUgdGhyb3dpbmcgJ21lZGl1bScgZm9yIGRlbW8uaHRtbFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlclJlY3QoY3R4LCB4LCB5LCB3LCBoLCBiZ2NvbG9yKSB7XG4gICAgICBpZiAoYmdjb2xvciAhPT0gXCJ0cmFuc3BhcmVudFwiKSB7XG4gICAgICAgIGN0eC5zZXRWYXJpYWJsZShcImZpbGxTdHlsZVwiLCBiZ2NvbG9yKTtcbiAgICAgICAgY3R4LmZpbGxSZWN0KHgsIHksIHcsIGgpO1xuICAgICAgICBudW1EcmF3cyArPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhcGl0YWxpemUobSwgcDEsIHAyKSB7XG4gICAgICBpZiAobS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBwMSArIHAyLnRvVXBwZXJDYXNlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGV4dFRyYW5zZm9ybSh0ZXh0LCB0cmFuc2Zvcm0pIHtcbiAgICAgIHN3aXRjaCAodHJhbnNmb3JtKSB7XG4gICAgICAgIGNhc2UgXCJsb3dlcmNhc2VcIjpcbiAgICAgICAgICByZXR1cm4gdGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjYXNlIFwiY2FwaXRhbGl6ZVwiOlxuICAgICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoLyhefFxcc3w6fC18XFwofFxcKSkoW2Etel0pL2csIGNhcGl0YWxpemUpO1xuICAgICAgICBjYXNlIFwidXBwZXJjYXNlXCI6XG4gICAgICAgICAgcmV0dXJuIHRleHQudG9VcHBlckNhc2UoKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub0xldHRlclNwYWNpbmcobGV0dGVyX3NwYWNpbmcpIHtcbiAgICAgIHJldHVybiAoL14obm9ybWFsfG5vbmV8MHB4KSQvLnRlc3QobGV0dGVyX3NwYWNpbmcpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3VGV4dChjdXJyZW50VGV4dCwgeCwgeSwgY3R4KSB7XG4gICAgICBpZiAoY3VycmVudFRleHQgIT09IG51bGwgJiYgVXRpbC50cmltVGV4dChjdXJyZW50VGV4dCkubGVuZ3RoID4gMCkge1xuICAgICAgICBjdHguZmlsbFRleHQoY3VycmVudFRleHQsIHgsIHkpO1xuICAgICAgICBudW1EcmF3cyArPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFRleHRWYXJpYWJsZXMoY3R4LCBlbCwgdGV4dF9kZWNvcmF0aW9uLCBjb2xvcikge1xuICAgICAgdmFyIGFsaWduID0gZmFsc2UsXG4gICAgICAgIGJvbGQgPSBnZXRDU1MoZWwsIFwiZm9udFdlaWdodFwiKSxcbiAgICAgICAgZmFtaWx5ID0gZ2V0Q1NTKGVsLCBcImZvbnRGYW1pbHlcIiksXG4gICAgICAgIHNpemUgPSBnZXRDU1MoZWwsIFwiZm9udFNpemVcIiksXG4gICAgICAgIHNoYWRvd3MgPSBVdGlsLnBhcnNlVGV4dFNoYWRvd3MoZ2V0Q1NTKGVsLCBcInRleHRTaGFkb3dcIikpO1xuXG4gICAgICBzd2l0Y2ggKHBhcnNlSW50KGJvbGQsIDEwKSkge1xuICAgICAgICBjYXNlIDQwMTpcbiAgICAgICAgICBib2xkID0gXCJib2xkXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDAwOlxuICAgICAgICAgIGJvbGQgPSBcIm5vcm1hbFwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjdHguc2V0VmFyaWFibGUoXCJmaWxsU3R5bGVcIiwgY29sb3IpO1xuICAgICAgY3R4LnNldFZhcmlhYmxlKFwiZm9udFwiLCBbZ2V0Q1NTKGVsLCBcImZvbnRTdHlsZVwiKSwgZ2V0Q1NTKGVsLCBcImZvbnRWYXJpYW50XCIpLCBib2xkLCBzaXplLCBmYW1pbHldLmpvaW4oXCIgXCIpKTtcbiAgICAgIGN0eC5zZXRWYXJpYWJsZShcInRleHRBbGlnblwiLCAoYWxpZ24pID8gXCJyaWdodFwiIDogXCJsZWZ0XCIpO1xuXG4gICAgICBpZiAoc2hhZG93cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gVE9ETzogc3VwcG9ydCBtdWx0aXBsZSB0ZXh0IHNoYWRvd3NcbiAgICAgICAgLy8gYXBwbHkgdGhlIGZpcnN0IHRleHQgc2hhZG93XG4gICAgICAgIGN0eC5zZXRWYXJpYWJsZShcInNoYWRvd0NvbG9yXCIsIHNoYWRvd3NbMF0uY29sb3IpO1xuICAgICAgICBjdHguc2V0VmFyaWFibGUoXCJzaGFkb3dPZmZzZXRYXCIsIHNoYWRvd3NbMF0ub2Zmc2V0WCk7XG4gICAgICAgIGN0eC5zZXRWYXJpYWJsZShcInNoYWRvd09mZnNldFlcIiwgc2hhZG93c1swXS5vZmZzZXRZKTtcbiAgICAgICAgY3R4LnNldFZhcmlhYmxlKFwic2hhZG93Qmx1clwiLCBzaGFkb3dzWzBdLmJsdXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGV4dF9kZWNvcmF0aW9uICE9PSBcIm5vbmVcIikge1xuICAgICAgICByZXR1cm4gVXRpbC5Gb250KGZhbWlseSwgc2l6ZSwgZG9jKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJUZXh0RGVjb3JhdGlvbihjdHgsIHRleHRfZGVjb3JhdGlvbiwgYm91bmRzLCBtZXRyaWNzLCBjb2xvcikge1xuICAgICAgc3dpdGNoICh0ZXh0X2RlY29yYXRpb24pIHtcbiAgICAgICAgY2FzZSBcInVuZGVybGluZVwiOlxuICAgICAgICAgIC8vIERyYXdzIGEgbGluZSBhdCB0aGUgYmFzZWxpbmUgb2YgdGhlIGZvbnRcbiAgICAgICAgICAvLyBUT0RPIEFzIHNvbWUgYnJvd3NlcnMgZGlzcGxheSB0aGUgbGluZSBhcyBtb3JlIHRoYW4gMXB4IGlmIHRoZSBmb250LXNpemUgaXMgYmlnLCBuZWVkIHRvIHRha2UgdGhhdCBpbnRvIGFjY291bnQgYm90aCBpbiBwb3NpdGlvbiBhbmQgc2l6ZVxuICAgICAgICAgIHJlbmRlclJlY3QoY3R4LCBib3VuZHMubGVmdCwgTWF0aC5yb3VuZChib3VuZHMudG9wICsgbWV0cmljcy5iYXNlbGluZSArIG1ldHJpY3MubGluZVdpZHRoKSwgYm91bmRzLndpZHRoLCAxLCBjb2xvcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJvdmVybGluZVwiOlxuICAgICAgICAgIHJlbmRlclJlY3QoY3R4LCBib3VuZHMubGVmdCwgTWF0aC5yb3VuZChib3VuZHMudG9wKSwgYm91bmRzLndpZHRoLCAxLCBjb2xvcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJsaW5lLXRocm91Z2hcIjpcbiAgICAgICAgICAvLyBUT0RPIHRyeSBhbmQgZmluZCBleGFjdCBwb3NpdGlvbiBmb3IgbGluZS10aHJvdWdoXG4gICAgICAgICAgcmVuZGVyUmVjdChjdHgsIGJvdW5kcy5sZWZ0LCBNYXRoLmNlaWwoYm91bmRzLnRvcCArIG1ldHJpY3MubWlkZGxlICsgbWV0cmljcy5saW5lV2lkdGgpLCBib3VuZHMud2lkdGgsIDEsIGNvbG9yKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUZXh0Qm91bmRzKHN0YXRlLCB0ZXh0LCB0ZXh0RGVjb3JhdGlvbiwgaXNMYXN0LCB0cmFuc2Zvcm0pIHtcbiAgICAgIHZhciBib3VuZHM7XG4gICAgICBpZiAoc3VwcG9ydC5yYW5nZUJvdW5kcyAmJiAhdHJhbnNmb3JtKSB7XG4gICAgICAgIGlmICh0ZXh0RGVjb3JhdGlvbiAhPT0gXCJub25lXCIgfHwgVXRpbC50cmltVGV4dCh0ZXh0KS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICBib3VuZHMgPSB0ZXh0UmFuZ2VCb3VuZHModGV4dCwgc3RhdGUubm9kZSwgc3RhdGUudGV4dE9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUudGV4dE9mZnNldCArPSB0ZXh0Lmxlbmd0aDtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUubm9kZSAmJiB0eXBlb2Ygc3RhdGUubm9kZS5ub2RlVmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdmFyIG5ld1RleHROb2RlID0gKGlzTGFzdCkgPyBzdGF0ZS5ub2RlLnNwbGl0VGV4dCh0ZXh0Lmxlbmd0aCkgOiBudWxsO1xuICAgICAgICBib3VuZHMgPSB0ZXh0V3JhcHBlckJvdW5kcyhzdGF0ZS5ub2RlLCB0cmFuc2Zvcm0pO1xuICAgICAgICBzdGF0ZS5ub2RlID0gbmV3VGV4dE5vZGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYm91bmRzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRleHRSYW5nZUJvdW5kcyh0ZXh0LCB0ZXh0Tm9kZSwgdGV4dE9mZnNldCkge1xuICAgICAgdmFyIHJhbmdlID0gZG9jLmNyZWF0ZVJhbmdlKCk7XG4gICAgICByYW5nZS5zZXRTdGFydCh0ZXh0Tm9kZSwgdGV4dE9mZnNldCk7XG4gICAgICByYW5nZS5zZXRFbmQodGV4dE5vZGUsIHRleHRPZmZzZXQgKyB0ZXh0Lmxlbmd0aCk7XG4gICAgICByZXR1cm4gcmFuZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGV4dFdyYXBwZXJCb3VuZHMob2xkVGV4dE5vZGUsIHRyYW5zZm9ybSkge1xuICAgICAgdmFyIHBhcmVudCA9IG9sZFRleHROb2RlLnBhcmVudE5vZGUsXG4gICAgICAgIHdyYXBFbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3dyYXBwZXInKSxcbiAgICAgICAgYmFja3VwVGV4dCA9IG9sZFRleHROb2RlLmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgd3JhcEVsZW1lbnQuYXBwZW5kQ2hpbGQob2xkVGV4dE5vZGUuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQod3JhcEVsZW1lbnQsIG9sZFRleHROb2RlKTtcblxuICAgICAgdmFyIGJvdW5kcyA9IHRyYW5zZm9ybSA/IFV0aWwuT2Zmc2V0Qm91bmRzKHdyYXBFbGVtZW50KSA6IFV0aWwuQm91bmRzKHdyYXBFbGVtZW50KTtcbiAgICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQoYmFja3VwVGV4dCwgd3JhcEVsZW1lbnQpO1xuICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJUZXh0KGVsLCB0ZXh0Tm9kZSwgc3RhY2spIHtcbiAgICAgIHZhciBjdHggPSBzdGFjay5jdHgsXG4gICAgICAgIGNvbG9yID0gZ2V0Q1NTKGVsLCBcImNvbG9yXCIpLFxuICAgICAgICB0ZXh0RGVjb3JhdGlvbiA9IGdldENTUyhlbCwgXCJ0ZXh0RGVjb3JhdGlvblwiKSxcbiAgICAgICAgdGV4dEFsaWduID0gZ2V0Q1NTKGVsLCBcInRleHRBbGlnblwiKSxcbiAgICAgICAgbWV0cmljcyxcbiAgICAgICAgdGV4dExpc3QsXG4gICAgICAgIHN0YXRlID0ge1xuICAgICAgICAgIG5vZGU6IHRleHROb2RlLFxuICAgICAgICAgIHRleHRPZmZzZXQ6IDBcbiAgICAgICAgfTtcblxuICAgICAgaWYgKFV0aWwudHJpbVRleHQodGV4dE5vZGUubm9kZVZhbHVlKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRleHROb2RlLm5vZGVWYWx1ZSA9IHRleHRUcmFuc2Zvcm0odGV4dE5vZGUubm9kZVZhbHVlLCBnZXRDU1MoZWwsIFwidGV4dFRyYW5zZm9ybVwiKSk7XG4gICAgICAgIHRleHRBbGlnbiA9IHRleHRBbGlnbi5yZXBsYWNlKFtcIi13ZWJraXQtYXV0b1wiXSwgW1wiYXV0b1wiXSk7XG5cbiAgICAgICAgdGV4dExpc3QgPSAoIW9wdGlvbnMubGV0dGVyUmVuZGVyaW5nICYmIC9eKGxlZnR8cmlnaHR8anVzdGlmeXxhdXRvKSQvLnRlc3QodGV4dEFsaWduKSAmJiBub0xldHRlclNwYWNpbmcoZ2V0Q1NTKGVsLCBcImxldHRlclNwYWNpbmdcIikpKSA/XG4gICAgICAgICAgdGV4dE5vZGUubm9kZVZhbHVlLnNwbGl0KC8oXFxifCApLykgOlxuICAgICAgICAgIHRleHROb2RlLm5vZGVWYWx1ZS5zcGxpdChcIlwiKTtcblxuICAgICAgICBtZXRyaWNzID0gc2V0VGV4dFZhcmlhYmxlcyhjdHgsIGVsLCB0ZXh0RGVjb3JhdGlvbiwgY29sb3IpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmNoaW5lc2UpIHtcbiAgICAgICAgICB0ZXh0TGlzdC5mb3JFYWNoKGZ1bmN0aW9uICh3b3JkLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKC8uKltcXHU0RTAwLVxcdTlGQTVdLiokLy50ZXN0KHdvcmQpKSB7XG4gICAgICAgICAgICAgIHdvcmQgPSB3b3JkLnNwbGl0KFwiXCIpO1xuICAgICAgICAgICAgICB3b3JkLnVuc2hpZnQoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICB0ZXh0TGlzdC5zcGxpY2UuYXBwbHkodGV4dExpc3QsIHdvcmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dExpc3QuZm9yRWFjaChmdW5jdGlvbiAodGV4dCwgaW5kZXgpIHtcbiAgICAgICAgICB2YXIgYm91bmRzID0gZ2V0VGV4dEJvdW5kcyhzdGF0ZSwgdGV4dCwgdGV4dERlY29yYXRpb24sIChpbmRleCA8IHRleHRMaXN0Lmxlbmd0aCAtIDEpLCBzdGFjay50cmFuc2Zvcm0ubWF0cml4KTtcbiAgICAgICAgICBpZiAoYm91bmRzKSB7XG4gICAgICAgICAgICBkcmF3VGV4dCh0ZXh0LCBib3VuZHMubGVmdCwgYm91bmRzLmJvdHRvbSwgY3R4KTtcbiAgICAgICAgICAgIHJlbmRlclRleHREZWNvcmF0aW9uKGN0eCwgdGV4dERlY29yYXRpb24sIGJvdW5kcywgbWV0cmljcywgY29sb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdFBvc2l0aW9uKGVsZW1lbnQsIHZhbCkge1xuICAgICAgdmFyIGJvdW5kRWxlbWVudCA9IGRvYy5jcmVhdGVFbGVtZW50KFwiYm91bmRlbGVtZW50XCIpLFxuICAgICAgICBvcmlnaW5hbFR5cGUsXG4gICAgICAgIGJvdW5kcztcblxuICAgICAgYm91bmRFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcImlubGluZVwiO1xuXG4gICAgICBvcmlnaW5hbFR5cGUgPSBlbGVtZW50LnN0eWxlLmxpc3RTdHlsZVR5cGU7XG4gICAgICBlbGVtZW50LnN0eWxlLmxpc3RTdHlsZVR5cGUgPSBcIm5vbmVcIjtcblxuICAgICAgYm91bmRFbGVtZW50LmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZSh2YWwpKTtcblxuICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoYm91bmRFbGVtZW50LCBlbGVtZW50LmZpcnN0Q2hpbGQpO1xuXG4gICAgICBib3VuZHMgPSBVdGlsLkJvdW5kcyhib3VuZEVsZW1lbnQpO1xuICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChib3VuZEVsZW1lbnQpO1xuICAgICAgZWxlbWVudC5zdHlsZS5saXN0U3R5bGVUeXBlID0gb3JpZ2luYWxUeXBlO1xuICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbGVtZW50SW5kZXgoZWwpIHtcbiAgICAgIHZhciBpID0gLTEsXG4gICAgICAgIGNvdW50ID0gMSxcbiAgICAgICAgY2hpbGRzID0gZWwucGFyZW50Tm9kZS5jaGlsZE5vZGVzO1xuXG4gICAgICBpZiAoZWwucGFyZW50Tm9kZSkge1xuICAgICAgICB3aGlsZSAoY2hpbGRzWysraV0gIT09IGVsKSB7XG4gICAgICAgICAgaWYgKGNoaWxkc1tpXS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RJdGVtVGV4dChlbGVtZW50LCB0eXBlKSB7XG4gICAgICB2YXIgY3VycmVudEluZGV4ID0gZWxlbWVudEluZGV4KGVsZW1lbnQpLFxuICAgICAgICB0ZXh0O1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgXCJkZWNpbWFsXCI6XG4gICAgICAgICAgdGV4dCA9IGN1cnJlbnRJbmRleDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImRlY2ltYWwtbGVhZGluZy16ZXJvXCI6XG4gICAgICAgICAgdGV4dCA9IChjdXJyZW50SW5kZXgudG9TdHJpbmcoKS5sZW5ndGggPT09IDEpID8gY3VycmVudEluZGV4ID0gXCIwXCIgKyBjdXJyZW50SW5kZXgudG9TdHJpbmcoKSA6IGN1cnJlbnRJbmRleC50b1N0cmluZygpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwidXBwZXItcm9tYW5cIjpcbiAgICAgICAgICB0ZXh0ID0gX2h0bWwyY2FudmFzLkdlbmVyYXRlLkxpc3RSb21hbihjdXJyZW50SW5kZXgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibG93ZXItcm9tYW5cIjpcbiAgICAgICAgICB0ZXh0ID0gX2h0bWwyY2FudmFzLkdlbmVyYXRlLkxpc3RSb21hbihjdXJyZW50SW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJsb3dlci1hbHBoYVwiOlxuICAgICAgICAgIHRleHQgPSBfaHRtbDJjYW52YXMuR2VuZXJhdGUuTGlzdEFscGhhKGN1cnJlbnRJbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInVwcGVyLWFscGhhXCI6XG4gICAgICAgICAgdGV4dCA9IF9odG1sMmNhbnZhcy5HZW5lcmF0ZS5MaXN0QWxwaGEoY3VycmVudEluZGV4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRleHQgKyBcIi4gXCI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyTGlzdEl0ZW0oZWxlbWVudCwgc3RhY2ssIGVsQm91bmRzKSB7XG4gICAgICB2YXIgeCxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgY3R4ID0gc3RhY2suY3R4LFxuICAgICAgICB0eXBlID0gZ2V0Q1NTKGVsZW1lbnQsIFwibGlzdFN0eWxlVHlwZVwiKSxcbiAgICAgICAgbGlzdEJvdW5kcztcblxuICAgICAgaWYgKC9eKGRlY2ltYWx8ZGVjaW1hbC1sZWFkaW5nLXplcm98dXBwZXItYWxwaGF8dXBwZXItbGF0aW58dXBwZXItcm9tYW58bG93ZXItYWxwaGF8bG93ZXItZ3JlZWt8bG93ZXItbGF0aW58bG93ZXItcm9tYW4pJC9pLnRlc3QodHlwZSkpIHtcbiAgICAgICAgdGV4dCA9IGxpc3RJdGVtVGV4dChlbGVtZW50LCB0eXBlKTtcbiAgICAgICAgbGlzdEJvdW5kcyA9IGxpc3RQb3NpdGlvbihlbGVtZW50LCB0ZXh0KTtcbiAgICAgICAgc2V0VGV4dFZhcmlhYmxlcyhjdHgsIGVsZW1lbnQsIFwibm9uZVwiLCBnZXRDU1MoZWxlbWVudCwgXCJjb2xvclwiKSk7XG5cbiAgICAgICAgaWYgKGdldENTUyhlbGVtZW50LCBcImxpc3RTdHlsZVBvc2l0aW9uXCIpID09PSBcImluc2lkZVwiKSB7XG4gICAgICAgICAgY3R4LnNldFZhcmlhYmxlKFwidGV4dEFsaWduXCIsIFwibGVmdFwiKTtcbiAgICAgICAgICB4ID0gZWxCb3VuZHMubGVmdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkcmF3VGV4dCh0ZXh0LCB4LCBsaXN0Qm91bmRzLmJvdHRvbSwgY3R4KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkSW1hZ2Uoc3JjKSB7XG4gICAgICB2YXIgaW1nID0gaW1hZ2VzW3NyY107XG4gICAgICByZXR1cm4gKGltZyAmJiBpbWcuc3VjY2VlZGVkID09PSB0cnVlKSA/IGltZy5pbWcgOiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGlwQm91bmRzKHNyYywgZHN0KSB7XG4gICAgICB2YXIgeCA9IE1hdGgubWF4KHNyYy5sZWZ0LCBkc3QubGVmdCksXG4gICAgICAgIHkgPSBNYXRoLm1heChzcmMudG9wLCBkc3QudG9wKSxcbiAgICAgICAgeDIgPSBNYXRoLm1pbigoc3JjLmxlZnQgKyBzcmMud2lkdGgpLCAoZHN0LmxlZnQgKyBkc3Qud2lkdGgpKSxcbiAgICAgICAgeTIgPSBNYXRoLm1pbigoc3JjLnRvcCArIHNyYy5oZWlnaHQpLCAoZHN0LnRvcCArIGRzdC5oZWlnaHQpKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogeCxcbiAgICAgICAgdG9wOiB5LFxuICAgICAgICB3aWR0aDogeDIgLSB4LFxuICAgICAgICBoZWlnaHQ6IHkyIC0geVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRaKGVsZW1lbnQsIHN0YWNrLCBwYXJlbnRTdGFjaykge1xuICAgICAgdmFyIG5ld0NvbnRleHQsXG4gICAgICAgIGlzUG9zaXRpb25lZCA9IHN0YWNrLmNzc1Bvc2l0aW9uICE9PSAnc3RhdGljJyxcbiAgICAgICAgekluZGV4ID0gaXNQb3NpdGlvbmVkID8gZ2V0Q1NTKGVsZW1lbnQsICd6SW5kZXgnKSA6ICdhdXRvJyxcbiAgICAgICAgb3BhY2l0eSA9IGdldENTUyhlbGVtZW50LCAnb3BhY2l0eScpLFxuICAgICAgICBpc0Zsb2F0ZWQgPSBnZXRDU1MoZWxlbWVudCwgJ2Nzc0Zsb2F0JykgIT09ICdub25lJztcblxuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvR3VpZGUvQ1NTL1VuZGVyc3RhbmRpbmdfel9pbmRleC9UaGVfc3RhY2tpbmdfY29udGV4dFxuICAgICAgLy8gV2hlbiBhIG5ldyBzdGFja2luZyBjb250ZXh0IHNob3VsZCBiZSBjcmVhdGVkOlxuICAgICAgLy8gdGhlIHJvb3QgZWxlbWVudCAoSFRNTCksXG4gICAgICAvLyBwb3NpdGlvbmVkIChhYnNvbHV0ZWx5IG9yIHJlbGF0aXZlbHkpIHdpdGggYSB6LWluZGV4IHZhbHVlIG90aGVyIHRoYW4gXCJhdXRvXCIsXG4gICAgICAvLyBlbGVtZW50cyB3aXRoIGFuIG9wYWNpdHkgdmFsdWUgbGVzcyB0aGFuIDEuIChTZWUgdGhlIHNwZWNpZmljYXRpb24gZm9yIG9wYWNpdHkpLFxuICAgICAgLy8gb24gbW9iaWxlIFdlYktpdCBhbmQgQ2hyb21lIDIyKywgcG9zaXRpb246IGZpeGVkIGFsd2F5cyBjcmVhdGVzIGEgbmV3IHN0YWNraW5nIGNvbnRleHQsIGV2ZW4gd2hlbiB6LWluZGV4IGlzIFwiYXV0b1wiIChTZWUgdGhpcyBwb3N0KVxuXG4gICAgICBzdGFjay56SW5kZXggPSBuZXdDb250ZXh0ID0gaDJjekNvbnRleHQoekluZGV4KTtcbiAgICAgIG5ld0NvbnRleHQuaXNQb3NpdGlvbmVkID0gaXNQb3NpdGlvbmVkO1xuICAgICAgbmV3Q29udGV4dC5pc0Zsb2F0ZWQgPSBpc0Zsb2F0ZWQ7XG4gICAgICBuZXdDb250ZXh0Lm9wYWNpdHkgPSBvcGFjaXR5O1xuICAgICAgbmV3Q29udGV4dC5vd25TdGFja2luZyA9ICh6SW5kZXggIT09ICdhdXRvJyB8fCBvcGFjaXR5IDwgMSk7XG5cbiAgICAgIGlmIChwYXJlbnRTdGFjaykge1xuICAgICAgICBwYXJlbnRTdGFjay56SW5kZXguY2hpbGRyZW4ucHVzaChzdGFjayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVySW1hZ2UoY3R4LCBlbGVtZW50LCBpbWFnZSwgYm91bmRzLCBib3JkZXJzKSB7XG5cbiAgICAgIHZhciBwYWRkaW5nTGVmdCA9IGdldENTU0ludChlbGVtZW50LCAncGFkZGluZ0xlZnQnKSxcbiAgICAgICAgcGFkZGluZ1RvcCA9IGdldENTU0ludChlbGVtZW50LCAncGFkZGluZ1RvcCcpLFxuICAgICAgICBwYWRkaW5nUmlnaHQgPSBnZXRDU1NJbnQoZWxlbWVudCwgJ3BhZGRpbmdSaWdodCcpLFxuICAgICAgICBwYWRkaW5nQm90dG9tID0gZ2V0Q1NTSW50KGVsZW1lbnQsICdwYWRkaW5nQm90dG9tJyk7XG5cbiAgICAgIHZhciBvZmZzZXRUb3AgID0gb3B0aW9uc1tcInRvcFwiXSAgfHwgMDtcbiAgICAgIHZhciBvZmZzZXRMZWZ0ID0gb3B0aW9uc1tcImxlZnRcIl0gfHwgMDtcblxuICAgICAgLy8gUmVzaXplIGltYWdlIGJhc2VkIG9uIG9iamVjdEZpdFxuICAgICAgdmFyIG9iamVjdEZpdCA9ICQoZWxlbWVudCkuY3NzKFwib2JqZWN0Rml0XCIpO1xuICAgICAgaWYgKC9jb250YWlufGNvdmVyLy50ZXN0KG9iamVjdEZpdCkpIHtcbiAgICAgICAgdmFyIHJlc2l6ZWRCb3VuZHMgPSBfaHRtbDJjYW52YXMuVXRpbC5yZXNpemVCb3VuZHMoaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0LCBvYmplY3RGaXQpO1xuICAgICAgICBib3VuZHMud2lkdGggID0gcmVzaXplZEJvdW5kcy53aWR0aDtcbiAgICAgICAgYm91bmRzLmhlaWdodCA9IHJlc2l6ZWRCb3VuZHMuaGVpZ2h0O1xuICAgICAgICBvZmZzZXRMZWZ0ICs9IHJlc2l6ZWRCb3VuZHMubGVmdDtcbiAgICAgICAgb2Zmc2V0VG9wICArPSByZXNpemVkQm91bmRzLnRvcDtcbiAgICAgIH1cblxuICAgICAgdmFyIHN4ID0gMDtcbiAgICAgIHZhciBzeSA9IDA7XG4gICAgICB2YXIgc3cgPSBpbWFnZS53aWR0aDtcbiAgICAgIHZhciBzaCA9IGltYWdlLmhlaWdodDtcblxuICAgICAgdmFyIGR4ID0gYm91bmRzLmxlZnQgKyBwYWRkaW5nTGVmdCArIGJvcmRlcnNbM10ud2lkdGggKyBvZmZzZXRMZWZ0O1xuICAgICAgdmFyIGR5ID0gYm91bmRzLnRvcCArIHBhZGRpbmdUb3AgKyBib3JkZXJzWzBdLndpZHRoICsgb2Zmc2V0VG9wO1xuICAgICAgdmFyIGR3ID0gYm91bmRzLndpZHRoIC0gKGJvcmRlcnNbMV0ud2lkdGggKyBib3JkZXJzWzNdLndpZHRoICsgcGFkZGluZ0xlZnQgKyBwYWRkaW5nUmlnaHQpO1xuICAgICAgdmFyIGRoID0gYm91bmRzLmhlaWdodCAtIChib3JkZXJzWzBdLndpZHRoICsgYm9yZGVyc1syXS53aWR0aCArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tKTtcblxuICAgICAgZHJhd0ltYWdlKGN0eCwgaW1hZ2UsXG4gICAgICAgIHN4LCBzeSwgc3csIHNoLFxuICAgICAgICBkeCwgZHksIGR3LCBkaFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCb3JkZXJEYXRhKGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBbXCJUb3BcIiwgXCJSaWdodFwiLCBcIkJvdHRvbVwiLCBcIkxlZnRcIl0ubWFwKGZ1bmN0aW9uIChzaWRlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgd2lkdGg6IGdldENTU0ludChlbGVtZW50LCAnYm9yZGVyJyArIHNpZGUgKyAnV2lkdGgnKSxcbiAgICAgICAgICBjb2xvcjogZ2V0Q1NTKGVsZW1lbnQsICdib3JkZXInICsgc2lkZSArICdDb2xvcicpXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCb3JkZXJSYWRpdXNEYXRhKGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBbXCJUb3BMZWZ0XCIsIFwiVG9wUmlnaHRcIiwgXCJCb3R0b21SaWdodFwiLCBcIkJvdHRvbUxlZnRcIl0ubWFwKGZ1bmN0aW9uIChzaWRlKSB7XG4gICAgICAgIHJldHVybiBnZXRDU1MoZWxlbWVudCwgJ2JvcmRlcicgKyBzaWRlICsgJ1JhZGl1cycpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIGdldEN1cnZlUG9pbnRzID0gKGZ1bmN0aW9uIChrYXBwYSkge1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHksIHIxLCByMikge1xuICAgICAgICB2YXIgb3ggPSAocjEpICoga2FwcGEsIC8vIGNvbnRyb2wgcG9pbnQgb2Zmc2V0IGhvcml6b250YWxcbiAgICAgICAgICBveSA9IChyMikgKiBrYXBwYSwgLy8gY29udHJvbCBwb2ludCBvZmZzZXQgdmVydGljYWxcbiAgICAgICAgICB4bSA9IHggKyByMSwgLy8geC1taWRkbGVcbiAgICAgICAgICB5bSA9IHkgKyByMjsgLy8geS1taWRkbGVcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0b3BMZWZ0OiBiZXppZXJDdXJ2ZSh7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeW1cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeW0gLSBveVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHhtIC0gb3gsXG4gICAgICAgICAgICB5OiB5XG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeG0sXG4gICAgICAgICAgICB5OiB5XG4gICAgICAgICAgfSksXG4gICAgICAgICAgdG9wUmlnaHQ6IGJlemllckN1cnZlKHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5XG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeCArIG94LFxuICAgICAgICAgICAgeTogeVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHhtLFxuICAgICAgICAgICAgeTogeW0gLSBveVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHhtLFxuICAgICAgICAgICAgeTogeW1cbiAgICAgICAgICB9KSxcbiAgICAgICAgICBib3R0b21SaWdodDogYmV6aWVyQ3VydmUoe1xuICAgICAgICAgICAgeDogeG0sXG4gICAgICAgICAgICB5OiB5XG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeG0sXG4gICAgICAgICAgICB5OiB5ICsgb3lcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4ICsgb3gsXG4gICAgICAgICAgICB5OiB5bVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5bVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGJvdHRvbUxlZnQ6IGJlemllckN1cnZlKHtcbiAgICAgICAgICAgIHg6IHhtLFxuICAgICAgICAgICAgeTogeW1cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4bSAtIG94LFxuICAgICAgICAgICAgeTogeW1cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeSArIG95XG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgfTtcbiAgICB9KSg0ICogKChNYXRoLnNxcnQoMikgLSAxKSAvIDMpKTtcblxuICAgIGZ1bmN0aW9uIGJlemllckN1cnZlKHN0YXJ0LCBzdGFydENvbnRyb2wsIGVuZENvbnRyb2wsIGVuZCkge1xuXG4gICAgICB2YXIgbGVycCA9IGZ1bmN0aW9uIChhLCBiLCB0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogYS54ICsgKGIueCAtIGEueCkgKiB0LFxuICAgICAgICAgIHk6IGEueSArIChiLnkgLSBhLnkpICogdFxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICBzdGFydENvbnRyb2w6IHN0YXJ0Q29udHJvbCxcbiAgICAgICAgZW5kQ29udHJvbDogZW5kQ29udHJvbCxcbiAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgIHN1YmRpdmlkZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICB2YXIgYWIgPSBsZXJwKHN0YXJ0LCBzdGFydENvbnRyb2wsIHQpLFxuICAgICAgICAgICAgYmMgPSBsZXJwKHN0YXJ0Q29udHJvbCwgZW5kQ29udHJvbCwgdCksXG4gICAgICAgICAgICBjZCA9IGxlcnAoZW5kQ29udHJvbCwgZW5kLCB0KSxcbiAgICAgICAgICAgIGFiYmMgPSBsZXJwKGFiLCBiYywgdCksXG4gICAgICAgICAgICBiY2NkID0gbGVycChiYywgY2QsIHQpLFxuICAgICAgICAgICAgZGVzdCA9IGxlcnAoYWJiYywgYmNjZCwgdCk7XG4gICAgICAgICAgcmV0dXJuIFtiZXppZXJDdXJ2ZShzdGFydCwgYWIsIGFiYmMsIGRlc3QpLCBiZXppZXJDdXJ2ZShkZXN0LCBiY2NkLCBjZCwgZW5kKV07XG4gICAgICAgIH0sXG4gICAgICAgIGN1cnZlVG86IGZ1bmN0aW9uIChib3JkZXJBcmdzKSB7XG4gICAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImJlemllckN1cnZlXCIsIHN0YXJ0Q29udHJvbC54LCBzdGFydENvbnRyb2wueSwgZW5kQ29udHJvbC54LCBlbmRDb250cm9sLnksIGVuZC54LCBlbmQueV0pO1xuICAgICAgICB9LFxuICAgICAgICBjdXJ2ZVRvUmV2ZXJzZWQ6IGZ1bmN0aW9uIChib3JkZXJBcmdzKSB7XG4gICAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImJlemllckN1cnZlXCIsIGVuZENvbnRyb2wueCwgZW5kQ29udHJvbC55LCBzdGFydENvbnRyb2wueCwgc3RhcnRDb250cm9sLnksIHN0YXJ0LngsIHN0YXJ0LnldKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUNvcm5lcihib3JkZXJBcmdzLCByYWRpdXMxLCByYWRpdXMyLCBjb3JuZXIxLCBjb3JuZXIyLCB4LCB5KSB7XG4gICAgICBpZiAocmFkaXVzMVswXSA+IDAgfHwgcmFkaXVzMVsxXSA+IDApIHtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgY29ybmVyMVswXS5zdGFydC54LCBjb3JuZXIxWzBdLnN0YXJ0LnldKTtcbiAgICAgICAgY29ybmVyMVswXS5jdXJ2ZVRvKGJvcmRlckFyZ3MpO1xuICAgICAgICBjb3JuZXIxWzFdLmN1cnZlVG8oYm9yZGVyQXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCB4LCB5XSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyYWRpdXMyWzBdID4gMCB8fCByYWRpdXMyWzFdID4gMCkge1xuICAgICAgICBib3JkZXJBcmdzLnB1c2goW1wibGluZVwiLCBjb3JuZXIyWzBdLnN0YXJ0LngsIGNvcm5lcjJbMF0uc3RhcnQueV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdTaWRlKGJvcmRlckRhdGEsIHJhZGl1czEsIHJhZGl1czIsIG91dGVyMSwgaW5uZXIxLCBvdXRlcjIsIGlubmVyMikge1xuICAgICAgdmFyIGJvcmRlckFyZ3MgPSBbXTtcblxuICAgICAgaWYgKHJhZGl1czFbMF0gPiAwIHx8IHJhZGl1czFbMV0gPiAwKSB7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIG91dGVyMVsxXS5zdGFydC54LCBvdXRlcjFbMV0uc3RhcnQueV0pO1xuICAgICAgICBvdXRlcjFbMV0uY3VydmVUbyhib3JkZXJBcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIGJvcmRlckRhdGEuYzFbMF0sIGJvcmRlckRhdGEuYzFbMV1dKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJhZGl1czJbMF0gPiAwIHx8IHJhZGl1czJbMV0gPiAwKSB7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIG91dGVyMlswXS5zdGFydC54LCBvdXRlcjJbMF0uc3RhcnQueV0pO1xuICAgICAgICBvdXRlcjJbMF0uY3VydmVUbyhib3JkZXJBcmdzKTtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgaW5uZXIyWzBdLmVuZC54LCBpbm5lcjJbMF0uZW5kLnldKTtcbiAgICAgICAgaW5uZXIyWzBdLmN1cnZlVG9SZXZlcnNlZChib3JkZXJBcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIGJvcmRlckRhdGEuYzJbMF0sIGJvcmRlckRhdGEuYzJbMV1dKTtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgYm9yZGVyRGF0YS5jM1swXSwgYm9yZGVyRGF0YS5jM1sxXV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocmFkaXVzMVswXSA+IDAgfHwgcmFkaXVzMVsxXSA+IDApIHtcbiAgICAgICAgYm9yZGVyQXJncy5wdXNoKFtcImxpbmVcIiwgaW5uZXIxWzFdLmVuZC54LCBpbm5lcjFbMV0uZW5kLnldKTtcbiAgICAgICAgaW5uZXIxWzFdLmN1cnZlVG9SZXZlcnNlZChib3JkZXJBcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvcmRlckFyZ3MucHVzaChbXCJsaW5lXCIsIGJvcmRlckRhdGEuYzRbMF0sIGJvcmRlckRhdGEuYzRbMV1dKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJvcmRlckFyZ3M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlQ3VydmVQb2ludHMoYm91bmRzLCBib3JkZXJSYWRpdXMsIGJvcmRlcnMpIHtcblxuICAgICAgdmFyIHggPSBib3VuZHMubGVmdCxcbiAgICAgICAgeSA9IGJvdW5kcy50b3AsXG4gICAgICAgIHdpZHRoID0gYm91bmRzLndpZHRoLFxuICAgICAgICBoZWlnaHQgPSBib3VuZHMuaGVpZ2h0LFxuXG4gICAgICAgIHRsaCA9IGJvcmRlclJhZGl1c1swXVswXSxcbiAgICAgICAgdGx2ID0gYm9yZGVyUmFkaXVzWzBdWzFdLFxuICAgICAgICB0cmggPSBib3JkZXJSYWRpdXNbMV1bMF0sXG4gICAgICAgIHRydiA9IGJvcmRlclJhZGl1c1sxXVsxXSxcbiAgICAgICAgYnJoID0gYm9yZGVyUmFkaXVzWzJdWzBdLFxuICAgICAgICBicnYgPSBib3JkZXJSYWRpdXNbMl1bMV0sXG4gICAgICAgIGJsaCA9IGJvcmRlclJhZGl1c1szXVswXSxcbiAgICAgICAgYmx2ID0gYm9yZGVyUmFkaXVzWzNdWzFdO1xuXG4gICAgICB2YXIgaGFsZkhlaWdodCA9IE1hdGguZmxvb3IoaGVpZ2h0IC8gMik7XG4gICAgICB0bGggPSB0bGggPiBoYWxmSGVpZ2h0ID8gaGFsZkhlaWdodCA6IHRsaDtcbiAgICAgIHRsdiA9IHRsdiA+IGhhbGZIZWlnaHQgPyBoYWxmSGVpZ2h0IDogdGx2O1xuICAgICAgdHJoID0gdHJoID4gaGFsZkhlaWdodCA/IGhhbGZIZWlnaHQgOiB0cmg7XG4gICAgICB0cnYgPSB0cnYgPiBoYWxmSGVpZ2h0ID8gaGFsZkhlaWdodCA6IHRydjtcbiAgICAgIGJyaCA9IGJyaCA+IGhhbGZIZWlnaHQgPyBoYWxmSGVpZ2h0IDogYnJoO1xuICAgICAgYnJ2ID0gYnJ2ID4gaGFsZkhlaWdodCA/IGhhbGZIZWlnaHQgOiBicnY7XG4gICAgICBibGggPSBibGggPiBoYWxmSGVpZ2h0ID8gaGFsZkhlaWdodCA6IGJsaDtcbiAgICAgIGJsdiA9IGJsdiA+IGhhbGZIZWlnaHQgPyBoYWxmSGVpZ2h0IDogYmx2O1xuXG4gICAgICB2YXIgdG9wV2lkdGggPSB3aWR0aCAtIHRyaCxcbiAgICAgICAgcmlnaHRIZWlnaHQgPSBoZWlnaHQgLSBicnYsXG4gICAgICAgIGJvdHRvbVdpZHRoID0gd2lkdGggLSBicmgsXG4gICAgICAgIGxlZnRIZWlnaHQgPSBoZWlnaHQgLSBibHY7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvcExlZnRPdXRlcjogZ2V0Q3VydmVQb2ludHMoXG4gICAgICAgICAgeCxcbiAgICAgICAgICB5LFxuICAgICAgICAgIHRsaCxcbiAgICAgICAgICB0bHZcbiAgICAgICAgKS50b3BMZWZ0LnN1YmRpdmlkZSgwLjUpLFxuXG4gICAgICAgIHRvcExlZnRJbm5lcjogZ2V0Q3VydmVQb2ludHMoXG4gICAgICAgICAgeCArIGJvcmRlcnNbM10ud2lkdGgsXG4gICAgICAgICAgeSArIGJvcmRlcnNbMF0ud2lkdGgsXG4gICAgICAgICAgTWF0aC5tYXgoMCwgdGxoIC0gYm9yZGVyc1szXS53aWR0aCksXG4gICAgICAgICAgTWF0aC5tYXgoMCwgdGx2IC0gYm9yZGVyc1swXS53aWR0aClcbiAgICAgICAgKS50b3BMZWZ0LnN1YmRpdmlkZSgwLjUpLFxuXG4gICAgICAgIHRvcFJpZ2h0T3V0ZXI6IGdldEN1cnZlUG9pbnRzKFxuICAgICAgICAgIHggKyB0b3BXaWR0aCxcbiAgICAgICAgICB5LFxuICAgICAgICAgIHRyaCxcbiAgICAgICAgICB0cnZcbiAgICAgICAgKS50b3BSaWdodC5zdWJkaXZpZGUoMC41KSxcblxuICAgICAgICB0b3BSaWdodElubmVyOiBnZXRDdXJ2ZVBvaW50cyhcbiAgICAgICAgICB4ICsgTWF0aC5taW4odG9wV2lkdGgsIHdpZHRoICsgYm9yZGVyc1szXS53aWR0aCksXG4gICAgICAgICAgeSArIGJvcmRlcnNbMF0ud2lkdGgsXG4gICAgICAgICAgKHRvcFdpZHRoID4gd2lkdGggKyBib3JkZXJzWzNdLndpZHRoKSA/IDAgOiB0cmggLSBib3JkZXJzWzNdLndpZHRoLFxuICAgICAgICAgIHRydiAtIGJvcmRlcnNbMF0ud2lkdGhcbiAgICAgICAgKS50b3BSaWdodC5zdWJkaXZpZGUoMC41KSxcblxuICAgICAgICBib3R0b21SaWdodE91dGVyOiBnZXRDdXJ2ZVBvaW50cyhcbiAgICAgICAgICB4ICsgYm90dG9tV2lkdGgsXG4gICAgICAgICAgeSArIHJpZ2h0SGVpZ2h0LFxuICAgICAgICAgIGJyaCxcbiAgICAgICAgICBicnZcbiAgICAgICAgKS5ib3R0b21SaWdodC5zdWJkaXZpZGUoMC41KSxcblxuICAgICAgICBib3R0b21SaWdodElubmVyOiBnZXRDdXJ2ZVBvaW50cyhcbiAgICAgICAgICB4ICsgTWF0aC5taW4oYm90dG9tV2lkdGgsIHdpZHRoICsgYm9yZGVyc1szXS53aWR0aCksXG4gICAgICAgICAgeSArIE1hdGgubWluKHJpZ2h0SGVpZ2h0LCBoZWlnaHQgKyBib3JkZXJzWzBdLndpZHRoKSxcbiAgICAgICAgICBNYXRoLm1heCgwLCBicmggLSBib3JkZXJzWzFdLndpZHRoKSxcbiAgICAgICAgICBNYXRoLm1heCgwLCBicnYgLSBib3JkZXJzWzJdLndpZHRoKVxuICAgICAgICApLmJvdHRvbVJpZ2h0LnN1YmRpdmlkZSgwLjUpLFxuXG4gICAgICAgIGJvdHRvbUxlZnRPdXRlcjogZ2V0Q3VydmVQb2ludHMoXG4gICAgICAgICAgeCxcbiAgICAgICAgICB5ICsgbGVmdEhlaWdodCxcbiAgICAgICAgICBibGgsXG4gICAgICAgICAgYmx2XG4gICAgICAgICkuYm90dG9tTGVmdC5zdWJkaXZpZGUoMC41KSxcblxuICAgICAgICBib3R0b21MZWZ0SW5uZXI6IGdldEN1cnZlUG9pbnRzKFxuICAgICAgICAgIHggKyBib3JkZXJzWzNdLndpZHRoLFxuICAgICAgICAgIHkgKyBsZWZ0SGVpZ2h0LFxuICAgICAgICAgIE1hdGgubWF4KDAsIGJsaCAtIGJvcmRlcnNbM10ud2lkdGgpLFxuICAgICAgICAgIE1hdGgubWF4KDAsIGJsdiAtIGJvcmRlcnNbMl0ud2lkdGgpXG4gICAgICAgICkuYm90dG9tTGVmdC5zdWJkaXZpZGUoMC41KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCb3JkZXJDbGlwKGVsZW1lbnQsIGJvcmRlclBvaW50cywgYm9yZGVycywgcmFkaXVzLCBib3VuZHMpIHtcbiAgICAgIHZhciBiYWNrZ3JvdW5kQ2xpcCA9IGdldENTUyhlbGVtZW50LCAnYmFja2dyb3VuZENsaXAnKSxcbiAgICAgICAgYm9yZGVyQXJncyA9IFtdO1xuXG4gICAgICBzd2l0Y2ggKGJhY2tncm91bmRDbGlwKSB7XG4gICAgICAgIGNhc2UgXCJjb250ZW50LWJveFwiOlxuICAgICAgICBjYXNlIFwicGFkZGluZy1ib3hcIjpcbiAgICAgICAgICBwYXJzZUNvcm5lcihib3JkZXJBcmdzLCByYWRpdXNbMF0sIHJhZGl1c1sxXSwgYm9yZGVyUG9pbnRzLnRvcExlZnRJbm5lciwgYm9yZGVyUG9pbnRzLnRvcFJpZ2h0SW5uZXIsIGJvdW5kcy5sZWZ0ICsgYm9yZGVyc1szXS53aWR0aCwgYm91bmRzLnRvcCArIGJvcmRlcnNbMF0ud2lkdGgpO1xuICAgICAgICAgIHBhcnNlQ29ybmVyKGJvcmRlckFyZ3MsIHJhZGl1c1sxXSwgcmFkaXVzWzJdLCBib3JkZXJQb2ludHMudG9wUmlnaHRJbm5lciwgYm9yZGVyUG9pbnRzLmJvdHRvbVJpZ2h0SW5uZXIsIGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoIC0gYm9yZGVyc1sxXS53aWR0aCwgYm91bmRzLnRvcCArIGJvcmRlcnNbMF0ud2lkdGgpO1xuICAgICAgICAgIHBhcnNlQ29ybmVyKGJvcmRlckFyZ3MsIHJhZGl1c1syXSwgcmFkaXVzWzNdLCBib3JkZXJQb2ludHMuYm90dG9tUmlnaHRJbm5lciwgYm9yZGVyUG9pbnRzLmJvdHRvbUxlZnRJbm5lciwgYm91bmRzLmxlZnQgKyBib3VuZHMud2lkdGggLSBib3JkZXJzWzFdLndpZHRoLCBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodCAtIGJvcmRlcnNbMl0ud2lkdGgpO1xuICAgICAgICAgIHBhcnNlQ29ybmVyKGJvcmRlckFyZ3MsIHJhZGl1c1szXSwgcmFkaXVzWzBdLCBib3JkZXJQb2ludHMuYm90dG9tTGVmdElubmVyLCBib3JkZXJQb2ludHMudG9wTGVmdElubmVyLCBib3VuZHMubGVmdCArIGJvcmRlcnNbM10ud2lkdGgsIGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0IC0gYm9yZGVyc1syXS53aWR0aCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBwYXJzZUNvcm5lcihib3JkZXJBcmdzLCByYWRpdXNbMF0sIHJhZGl1c1sxXSwgYm9yZGVyUG9pbnRzLnRvcExlZnRPdXRlciwgYm9yZGVyUG9pbnRzLnRvcFJpZ2h0T3V0ZXIsIGJvdW5kcy5sZWZ0LCBib3VuZHMudG9wKTtcbiAgICAgICAgICBwYXJzZUNvcm5lcihib3JkZXJBcmdzLCByYWRpdXNbMV0sIHJhZGl1c1syXSwgYm9yZGVyUG9pbnRzLnRvcFJpZ2h0T3V0ZXIsIGJvcmRlclBvaW50cy5ib3R0b21SaWdodE91dGVyLCBib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCwgYm91bmRzLnRvcCk7XG4gICAgICAgICAgcGFyc2VDb3JuZXIoYm9yZGVyQXJncywgcmFkaXVzWzJdLCByYWRpdXNbM10sIGJvcmRlclBvaW50cy5ib3R0b21SaWdodE91dGVyLCBib3JkZXJQb2ludHMuYm90dG9tTGVmdE91dGVyLCBib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCwgYm91bmRzLnRvcCArIGJvdW5kcy5oZWlnaHQpO1xuICAgICAgICAgIHBhcnNlQ29ybmVyKGJvcmRlckFyZ3MsIHJhZGl1c1szXSwgcmFkaXVzWzBdLCBib3JkZXJQb2ludHMuYm90dG9tTGVmdE91dGVyLCBib3JkZXJQb2ludHMudG9wTGVmdE91dGVyLCBib3VuZHMubGVmdCwgYm91bmRzLnRvcCArIGJvdW5kcy5oZWlnaHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYm9yZGVyQXJncztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUJvcmRlcnMoZWxlbWVudCwgYm91bmRzLCBib3JkZXJzKSB7XG4gICAgICB2YXIgeCA9IGJvdW5kcy5sZWZ0LFxuICAgICAgICB5ID0gYm91bmRzLnRvcCxcbiAgICAgICAgd2lkdGggPSBib3VuZHMud2lkdGgsXG4gICAgICAgIGhlaWdodCA9IGJvdW5kcy5oZWlnaHQsXG4gICAgICAgIGJvcmRlclNpZGUsXG4gICAgICAgIGJ4LFxuICAgICAgICBieSxcbiAgICAgICAgYncsXG4gICAgICAgIGJoLFxuICAgICAgICBib3JkZXJBcmdzLFxuICAgICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLWJhY2tncm91bmQvI3RoZS1ib3JkZXItcmFkaXVzXG4gICAgICAgIGJvcmRlclJhZGl1cyA9IGdldEJvcmRlclJhZGl1c0RhdGEoZWxlbWVudCksXG4gICAgICAgIGJvcmRlclBvaW50cyA9IGNhbGN1bGF0ZUN1cnZlUG9pbnRzKGJvdW5kcywgYm9yZGVyUmFkaXVzLCBib3JkZXJzKSxcbiAgICAgICAgYm9yZGVyRGF0YSA9IHtcbiAgICAgICAgICBjbGlwOiBnZXRCb3JkZXJDbGlwKGVsZW1lbnQsIGJvcmRlclBvaW50cywgYm9yZGVycywgYm9yZGVyUmFkaXVzLCBib3VuZHMpLFxuICAgICAgICAgIGJvcmRlcnM6IFtdXG4gICAgICAgIH07XG5cbiAgICAgIGZvciAoYm9yZGVyU2lkZSA9IDA7IGJvcmRlclNpZGUgPCA0OyBib3JkZXJTaWRlKyspIHtcblxuICAgICAgICBpZiAoYm9yZGVyc1tib3JkZXJTaWRlXS53aWR0aCA+IDApIHtcbiAgICAgICAgICBieCA9IHg7XG4gICAgICAgICAgYnkgPSB5O1xuICAgICAgICAgIGJ3ID0gd2lkdGg7XG4gICAgICAgICAgYmggPSBoZWlnaHQgLSAoYm9yZGVyc1syXS53aWR0aCk7XG5cbiAgICAgICAgICBzd2l0Y2ggKGJvcmRlclNpZGUpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgLy8gdG9wIGJvcmRlclxuICAgICAgICAgICAgICBiaCA9IGJvcmRlcnNbMF0ud2lkdGg7XG5cbiAgICAgICAgICAgICAgYm9yZGVyQXJncyA9IGRyYXdTaWRlKHtcbiAgICAgICAgICAgICAgICAgIGMxOiBbYngsIGJ5XSxcbiAgICAgICAgICAgICAgICAgIGMyOiBbYnggKyBidywgYnldLFxuICAgICAgICAgICAgICAgICAgYzM6IFtieCArIGJ3IC0gYm9yZGVyc1sxXS53aWR0aCwgYnkgKyBiaF0sXG4gICAgICAgICAgICAgICAgICBjNDogW2J4ICsgYm9yZGVyc1szXS53aWR0aCwgYnkgKyBiaF1cbiAgICAgICAgICAgICAgICB9LCBib3JkZXJSYWRpdXNbMF0sIGJvcmRlclJhZGl1c1sxXSxcbiAgICAgICAgICAgICAgICBib3JkZXJQb2ludHMudG9wTGVmdE91dGVyLCBib3JkZXJQb2ludHMudG9wTGVmdElubmVyLCBib3JkZXJQb2ludHMudG9wUmlnaHRPdXRlciwgYm9yZGVyUG9pbnRzLnRvcFJpZ2h0SW5uZXIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgLy8gcmlnaHQgYm9yZGVyXG4gICAgICAgICAgICAgIGJ4ID0geCArIHdpZHRoIC0gKGJvcmRlcnNbMV0ud2lkdGgpO1xuICAgICAgICAgICAgICBidyA9IGJvcmRlcnNbMV0ud2lkdGg7XG5cbiAgICAgICAgICAgICAgYm9yZGVyQXJncyA9IGRyYXdTaWRlKHtcbiAgICAgICAgICAgICAgICAgIGMxOiBbYnggKyBidywgYnldLFxuICAgICAgICAgICAgICAgICAgYzI6IFtieCArIGJ3LCBieSArIGJoICsgYm9yZGVyc1syXS53aWR0aF0sXG4gICAgICAgICAgICAgICAgICBjMzogW2J4LCBieSArIGJoXSxcbiAgICAgICAgICAgICAgICAgIGM0OiBbYngsIGJ5ICsgYm9yZGVyc1swXS53aWR0aF1cbiAgICAgICAgICAgICAgICB9LCBib3JkZXJSYWRpdXNbMV0sIGJvcmRlclJhZGl1c1syXSxcbiAgICAgICAgICAgICAgICBib3JkZXJQb2ludHMudG9wUmlnaHRPdXRlciwgYm9yZGVyUG9pbnRzLnRvcFJpZ2h0SW5uZXIsIGJvcmRlclBvaW50cy5ib3R0b21SaWdodE91dGVyLCBib3JkZXJQb2ludHMuYm90dG9tUmlnaHRJbm5lcik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAvLyBib3R0b20gYm9yZGVyXG4gICAgICAgICAgICAgIGJ5ID0gKGJ5ICsgaGVpZ2h0KSAtIChib3JkZXJzWzJdLndpZHRoKTtcbiAgICAgICAgICAgICAgYmggPSBib3JkZXJzWzJdLndpZHRoO1xuXG4gICAgICAgICAgICAgIGJvcmRlckFyZ3MgPSBkcmF3U2lkZSh7XG4gICAgICAgICAgICAgICAgICBjMTogW2J4ICsgYncsIGJ5ICsgYmhdLFxuICAgICAgICAgICAgICAgICAgYzI6IFtieCwgYnkgKyBiaF0sXG4gICAgICAgICAgICAgICAgICBjMzogW2J4ICsgYm9yZGVyc1szXS53aWR0aCwgYnldLFxuICAgICAgICAgICAgICAgICAgYzQ6IFtieCArIGJ3IC0gYm9yZGVyc1szXS53aWR0aCwgYnldXG4gICAgICAgICAgICAgICAgfSwgYm9yZGVyUmFkaXVzWzJdLCBib3JkZXJSYWRpdXNbM10sXG4gICAgICAgICAgICAgICAgYm9yZGVyUG9pbnRzLmJvdHRvbVJpZ2h0T3V0ZXIsIGJvcmRlclBvaW50cy5ib3R0b21SaWdodElubmVyLCBib3JkZXJQb2ludHMuYm90dG9tTGVmdE91dGVyLCBib3JkZXJQb2ludHMuYm90dG9tTGVmdElubmVyKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgIC8vIGxlZnQgYm9yZGVyXG4gICAgICAgICAgICAgIGJ3ID0gYm9yZGVyc1szXS53aWR0aDtcblxuICAgICAgICAgICAgICBib3JkZXJBcmdzID0gZHJhd1NpZGUoe1xuICAgICAgICAgICAgICAgICAgYzE6IFtieCwgYnkgKyBiaCArIGJvcmRlcnNbMl0ud2lkdGhdLFxuICAgICAgICAgICAgICAgICAgYzI6IFtieCwgYnldLFxuICAgICAgICAgICAgICAgICAgYzM6IFtieCArIGJ3LCBieSArIGJvcmRlcnNbMF0ud2lkdGhdLFxuICAgICAgICAgICAgICAgICAgYzQ6IFtieCArIGJ3LCBieSArIGJoXVxuICAgICAgICAgICAgICAgIH0sIGJvcmRlclJhZGl1c1szXSwgYm9yZGVyUmFkaXVzWzBdLFxuICAgICAgICAgICAgICAgIGJvcmRlclBvaW50cy5ib3R0b21MZWZ0T3V0ZXIsIGJvcmRlclBvaW50cy5ib3R0b21MZWZ0SW5uZXIsIGJvcmRlclBvaW50cy50b3BMZWZ0T3V0ZXIsIGJvcmRlclBvaW50cy50b3BMZWZ0SW5uZXIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBib3JkZXJEYXRhLmJvcmRlcnMucHVzaCh7XG4gICAgICAgICAgICBhcmdzOiBib3JkZXJBcmdzLFxuICAgICAgICAgICAgY29sb3I6IGJvcmRlcnNbYm9yZGVyU2lkZV0uY29sb3JcbiAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBib3JkZXJEYXRhO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNoYXBlKGN0eCwgYXJncykge1xuICAgICAgdmFyIHNoYXBlID0gY3R4LmRyYXdTaGFwZSgpO1xuICAgICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChib3JkZXIsIGluZGV4KSB7XG4gICAgICAgIHNoYXBlWyhpbmRleCA9PT0gMCkgPyBcIm1vdmVUb1wiIDogYm9yZGVyWzBdICsgXCJUb1wiXS5hcHBseShudWxsLCBib3JkZXIuc2xpY2UoMSkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gc2hhcGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyQm9yZGVycyhjdHgsIGJvcmRlckFyZ3MsIGNvbG9yKSB7XG4gICAgICBpZiAoY29sb3IgIT09IFwidHJhbnNwYXJlbnRcIikge1xuICAgICAgICBjdHguc2V0VmFyaWFibGUoXCJmaWxsU3R5bGVcIiwgY29sb3IpO1xuICAgICAgICBjcmVhdGVTaGFwZShjdHgsIGJvcmRlckFyZ3MpO1xuICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICBudW1EcmF3cyArPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlckZvcm1WYWx1ZShlbCwgYm91bmRzLCBzdGFjaykge1xuXG4gICAgICB2YXIgdmFsdWVXcmFwID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3ZhbHVld3JhcCcpLFxuICAgICAgICBjc3NQcm9wZXJ0eUFycmF5ID0gWydsaW5lSGVpZ2h0JywgJ3RleHRBbGlnbicsICdmb250RmFtaWx5JywgJ2NvbG9yJywgJ2ZvbnRTaXplJywgJ3BhZGRpbmdMZWZ0JywgJ3BhZGRpbmdUb3AnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ2JvcmRlcicsICdib3JkZXJMZWZ0V2lkdGgnLCAnYm9yZGVyVG9wV2lkdGgnXSxcbiAgICAgICAgdGV4dFZhbHVlLFxuICAgICAgICB0ZXh0Tm9kZTtcblxuICAgICAgY3NzUHJvcGVydHlBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhbHVlV3JhcC5zdHlsZVtwcm9wZXJ0eV0gPSBnZXRDU1MoZWwsIHByb3BlcnR5KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIE9sZGVyIElFIGhhcyBpc3N1ZXMgd2l0aCBcImJvcmRlclwiXG4gICAgICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogUGFyc2U6IEV4Y2VwdGlvbiBjYXVnaHQgaW4gcmVuZGVyRm9ybVZhbHVlOiBcIiArIGUubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YWx1ZVdyYXAuc3R5bGUuYm9yZGVyQ29sb3IgPSBcImJsYWNrXCI7XG4gICAgICB2YWx1ZVdyYXAuc3R5bGUuYm9yZGVyU3R5bGUgPSBcInNvbGlkXCI7XG4gICAgICB2YWx1ZVdyYXAuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIHZhbHVlV3JhcC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcblxuICAgICAgaWYgKC9eKHN1Ym1pdHxyZXNldHxidXR0b258dGV4dHxwYXNzd29yZCkkLy50ZXN0KGVsLnR5cGUpIHx8IGVsLm5vZGVOYW1lID09PSBcIlNFTEVDVFwiKSB7XG4gICAgICAgIHZhbHVlV3JhcC5zdHlsZS5saW5lSGVpZ2h0ID0gZ2V0Q1NTKGVsLCBcImhlaWdodFwiKTtcbiAgICAgIH1cblxuICAgICAgdmFsdWVXcmFwLnN0eWxlLnRvcCA9IGJvdW5kcy50b3AgKyBcInB4XCI7XG4gICAgICB2YWx1ZVdyYXAuc3R5bGUubGVmdCA9IGJvdW5kcy5sZWZ0ICsgXCJweFwiO1xuXG4gICAgICB0ZXh0VmFsdWUgPSAoZWwubm9kZU5hbWUgPT09IFwiU0VMRUNUXCIpID8gKGVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0gfHwgMCkudGV4dCA6IGVsLnZhbHVlO1xuICAgICAgaWYgKCF0ZXh0VmFsdWUpIHtcbiAgICAgICAgdGV4dFZhbHVlID0gZWwucGxhY2Vob2xkZXI7XG4gICAgICB9XG5cbiAgICAgIHRleHROb2RlID0gZG9jLmNyZWF0ZVRleHROb2RlKHRleHRWYWx1ZSk7XG5cbiAgICAgIHZhbHVlV3JhcC5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICBib2R5LmFwcGVuZENoaWxkKHZhbHVlV3JhcCk7XG5cbiAgICAgIHJlbmRlclRleHQoZWwsIHRleHROb2RlLCBzdGFjayk7XG4gICAgICBib2R5LnJlbW92ZUNoaWxkKHZhbHVlV3JhcCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd0ltYWdlKGN0eCkge1xuICAgICAgY3R4LmRyYXdJbWFnZS5hcHBseShjdHgsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgbnVtRHJhd3MgKz0gMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRQc2V1ZG9FbGVtZW50KGVsLCB3aGljaCkge1xuICAgICAgdmFyIGVsU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgd2hpY2gpO1xuICAgICAgaWYgKCFlbFN0eWxlIHx8ICFlbFN0eWxlLmNvbnRlbnQgfHwgZWxTdHlsZS5jb250ZW50ID09PSBcIm5vbmVcIiB8fCBlbFN0eWxlLmNvbnRlbnQgPT09IFwiLW1vei1hbHQtY29udGVudFwiIHx8IGVsU3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGNvbnRlbnQgPSBlbFN0eWxlLmNvbnRlbnQgKyAnJyxcbiAgICAgICAgZmlyc3QgPSBjb250ZW50LnN1YnN0cigwLCAxKTtcbiAgICAgIC8vc3RyaXBzIHF1b3Rlc1xuICAgICAgaWYgKGZpcnN0ID09PSBjb250ZW50LnN1YnN0cihjb250ZW50Lmxlbmd0aCAtIDEpICYmIGZpcnN0Lm1hdGNoKC8nfFwiLykpIHtcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQuc3Vic3RyKDEsIGNvbnRlbnQubGVuZ3RoIC0gMik7XG4gICAgICB9XG5cbiAgICAgIHZhciBpc0ltYWdlID0gY29udGVudC5zdWJzdHIoMCwgMykgPT09ICd1cmwnLFxuICAgICAgICBlbHBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpc0ltYWdlID8gJ2ltZycgOiAnc3BhbicpO1xuXG4gICAgICBlbHBzLmNsYXNzTmFtZSA9IHBzZXVkb0hpZGUgKyBcIi1iZWZvcmUgXCIgKyBwc2V1ZG9IaWRlICsgXCItYWZ0ZXJcIjtcblxuICAgICAgT2JqZWN0LmtleXMoZWxTdHlsZSkuZmlsdGVyKGluZGV4ZWRQcm9wZXJ0eSkuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICAgICAgICAvLyBQcmV2ZW50IGFzc2lnbmluZyBvZiByZWFkIG9ubHkgQ1NTIFJ1bGVzLCBleC4gbGVuZ3RoLCBwYXJlbnRSdWxlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZWxwcy5zdHlsZVtwcm9wXSA9IGVsU3R5bGVbcHJvcF07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBVdGlsLmxvZyhbJ1RyaWVkIHRvIGFzc2lnbiByZWFkb25seSBwcm9wZXJ0eSAnLCBwcm9wLCAnRXJyb3I6JywgZV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZWxwcy5zdHlsZVsnZm9udEZhbWlseSddID0gZWxTdHlsZVsnZm9udEZhbWlseSddO1xuICAgICAgZWxwcy5zdHlsZVsnZm9udC1mYW1pbHknXSA9IGVsU3R5bGVbJ2ZvbnQtZmFtaWx5J107XG5cbiAgICAgIGlmIChpc0ltYWdlKSB7XG4gICAgICAgIGVscHMuc3JjID0gVXRpbC5wYXJzZUJhY2tncm91bmRJbWFnZShjb250ZW50KVswXS5hcmdzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxwcy5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVscHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5kZXhlZFByb3BlcnR5KHByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gKGlzTmFOKHdpbmRvdy5wYXJzZUludChwcm9wZXJ0eSwgMTApKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5qZWN0UHNldWRvRWxlbWVudHMoZWwsIHN0YWNrKSB7XG4gICAgICB2YXIgYmVmb3JlID0gZ2V0UHNldWRvRWxlbWVudChlbCwgJzpiZWZvcmUnKSxcbiAgICAgICAgYWZ0ZXIgPSBnZXRQc2V1ZG9FbGVtZW50KGVsLCAnOmFmdGVyJyk7XG4gICAgICBpZiAoIWJlZm9yZSAmJiAhYWZ0ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoYmVmb3JlKSB7XG4gICAgICAgIGVsLmNsYXNzTmFtZSArPSBcIiBcIiArIHBzZXVkb0hpZGUgKyBcIi1iZWZvcmVcIjtcbiAgICAgICAgZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYmVmb3JlLCBlbCk7XG4gICAgICAgIHBhcnNlRWxlbWVudChiZWZvcmUsIHN0YWNrLCB0cnVlKTtcbiAgICAgICAgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChiZWZvcmUpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShwc2V1ZG9IaWRlICsgXCItYmVmb3JlXCIsIFwiXCIpLnRyaW0oKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFmdGVyKSB7XG4gICAgICAgIGVsLmNsYXNzTmFtZSArPSBcIiBcIiArIHBzZXVkb0hpZGUgKyBcIi1hZnRlclwiO1xuICAgICAgICBlbC5hcHBlbmRDaGlsZChhZnRlcik7XG4gICAgICAgIHBhcnNlRWxlbWVudChhZnRlciwgc3RhY2ssIHRydWUpO1xuICAgICAgICBlbC5yZW1vdmVDaGlsZChhZnRlcik7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKHBzZXVkb0hpZGUgKyBcIi1hZnRlclwiLCBcIlwiKS50cmltKCk7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJCYWNrZ3JvdW5kUmVwZWF0KGN0eCwgaW1hZ2UsIGJhY2tncm91bmRQb3NpdGlvbiwgYm91bmRzKSB7XG4gICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoYm91bmRzLmxlZnQgKyBiYWNrZ3JvdW5kUG9zaXRpb24ubGVmdCksXG4gICAgICAgIG9mZnNldFkgPSBNYXRoLnJvdW5kKGJvdW5kcy50b3AgKyBiYWNrZ3JvdW5kUG9zaXRpb24udG9wKTtcblxuICAgICAgY3R4LmNyZWF0ZVBhdHRlcm4oaW1hZ2UpO1xuICAgICAgY3R4LnRyYW5zbGF0ZShvZmZzZXRYLCBvZmZzZXRZKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHgudHJhbnNsYXRlKC1vZmZzZXRYLCAtb2Zmc2V0WSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmFja2dyb3VuZFJlcGVhdFNoYXBlKGN0eCwgaW1hZ2UsIGJhY2tncm91bmRQb3NpdGlvbiwgYm91bmRzLCBsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgIHZhciBhcmdzID0gW107XG4gICAgICBhcmdzLnB1c2goW1wibGluZVwiLCBNYXRoLnJvdW5kKGxlZnQpLCBNYXRoLnJvdW5kKHRvcCldKTtcbiAgICAgIGFyZ3MucHVzaChbXCJsaW5lXCIsIE1hdGgucm91bmQobGVmdCArIHdpZHRoKSwgTWF0aC5yb3VuZCh0b3ApXSk7XG4gICAgICBhcmdzLnB1c2goW1wibGluZVwiLCBNYXRoLnJvdW5kKGxlZnQgKyB3aWR0aCksIE1hdGgucm91bmQoaGVpZ2h0ICsgdG9wKV0pO1xuICAgICAgYXJncy5wdXNoKFtcImxpbmVcIiwgTWF0aC5yb3VuZChsZWZ0KSwgTWF0aC5yb3VuZChoZWlnaHQgKyB0b3ApXSk7XG4gICAgICBjcmVhdGVTaGFwZShjdHgsIGFyZ3MpO1xuICAgICAgY3R4LnNhdmUoKTtcbiAgICAgIGN0eC5jbGlwKCk7XG4gICAgICByZW5kZXJCYWNrZ3JvdW5kUmVwZWF0KGN0eCwgaW1hZ2UsIGJhY2tncm91bmRQb3NpdGlvbiwgYm91bmRzKTtcbiAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyQmFja2dyb3VuZENvbG9yKGN0eCwgYmFja2dyb3VuZEJvdW5kcywgYmdjb2xvcikge1xuICAgICAgcmVuZGVyUmVjdChcbiAgICAgICAgY3R4LFxuICAgICAgICBiYWNrZ3JvdW5kQm91bmRzLmxlZnQsXG4gICAgICAgIGJhY2tncm91bmRCb3VuZHMudG9wLFxuICAgICAgICBiYWNrZ3JvdW5kQm91bmRzLndpZHRoLFxuICAgICAgICBiYWNrZ3JvdW5kQm91bmRzLmhlaWdodCxcbiAgICAgICAgYmdjb2xvclxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJCYWNrZ3JvdW5kUmVwZWF0aW5nKGVsLCBib3VuZHMsIGN0eCwgaW1hZ2UsIGltYWdlSW5kZXgpIHtcbiAgICAgIHZhciBiYWNrZ3JvdW5kU2l6ZSA9IFV0aWwuQmFja2dyb3VuZFNpemUoZWwsIGJvdW5kcywgaW1hZ2UsIGltYWdlSW5kZXgpLFxuICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb24gPSBVdGlsLkJhY2tncm91bmRQb3NpdGlvbihlbCwgYm91bmRzLCBpbWFnZSwgaW1hZ2VJbmRleCwgYmFja2dyb3VuZFNpemUpLFxuICAgICAgICBiYWNrZ3JvdW5kUmVwZWF0ID0gZ2V0Q1NTKGVsLCBcImJhY2tncm91bmRSZXBlYXRcIikuc3BsaXQoXCIsXCIpLm1hcChVdGlsLnRyaW1UZXh0KTtcblxuICAgICAgaW1hZ2UgPSByZXNpemVJbWFnZShpbWFnZSwgYmFja2dyb3VuZFNpemUpO1xuXG4gICAgICBiYWNrZ3JvdW5kUmVwZWF0ID0gYmFja2dyb3VuZFJlcGVhdFtpbWFnZUluZGV4XSB8fCBiYWNrZ3JvdW5kUmVwZWF0WzBdO1xuXG4gICAgICBzd2l0Y2ggKGJhY2tncm91bmRSZXBlYXQpIHtcbiAgICAgICAgY2FzZSBcInJlcGVhdC14XCI6XG4gICAgICAgICAgYmFja2dyb3VuZFJlcGVhdFNoYXBlKGN0eCwgaW1hZ2UsIGJhY2tncm91bmRQb3NpdGlvbiwgYm91bmRzLFxuICAgICAgICAgICAgYm91bmRzLmxlZnQsIGJvdW5kcy50b3AgKyBiYWNrZ3JvdW5kUG9zaXRpb24udG9wLCA5OTk5OSwgaW1hZ2UuaGVpZ2h0KTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwicmVwZWF0LXlcIjpcbiAgICAgICAgICBiYWNrZ3JvdW5kUmVwZWF0U2hhcGUoY3R4LCBpbWFnZSwgYmFja2dyb3VuZFBvc2l0aW9uLCBib3VuZHMsXG4gICAgICAgICAgICBib3VuZHMubGVmdCArIGJhY2tncm91bmRQb3NpdGlvbi5sZWZ0LCBib3VuZHMudG9wLCBpbWFnZS53aWR0aCwgOTk5OTkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJuby1yZXBlYXRcIjpcbiAgICAgICAgICBiYWNrZ3JvdW5kUmVwZWF0U2hhcGUoY3R4LCBpbWFnZSwgYmFja2dyb3VuZFBvc2l0aW9uLCBib3VuZHMsXG4gICAgICAgICAgICBib3VuZHMubGVmdCArIGJhY2tncm91bmRQb3NpdGlvbi5sZWZ0LCBib3VuZHMudG9wICsgYmFja2dyb3VuZFBvc2l0aW9uLnRvcCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZW5kZXJCYWNrZ3JvdW5kUmVwZWF0KGN0eCwgaW1hZ2UsIGJhY2tncm91bmRQb3NpdGlvbiwge1xuICAgICAgICAgICAgdG9wOiBib3VuZHMudG9wLFxuICAgICAgICAgICAgbGVmdDogYm91bmRzLmxlZnQsXG4gICAgICAgICAgICB3aWR0aDogaW1hZ2Uud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGltYWdlLmhlaWdodFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlckJhY2tncm91bmRJbWFnZShlbGVtZW50LCBib3VuZHMsIGN0eCkge1xuICAgICAgdmFyIGJhY2tncm91bmRJbWFnZSA9IGdldENTUyhlbGVtZW50LCBcImJhY2tncm91bmRJbWFnZVwiKSxcbiAgICAgICAgYmFja2dyb3VuZEltYWdlcyA9IFV0aWwucGFyc2VCYWNrZ3JvdW5kSW1hZ2UoYmFja2dyb3VuZEltYWdlKSxcbiAgICAgICAgaW1hZ2UsXG4gICAgICAgIGltYWdlSW5kZXggPSBiYWNrZ3JvdW5kSW1hZ2VzLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKGltYWdlSW5kZXgtLSkge1xuICAgICAgICBiYWNrZ3JvdW5kSW1hZ2UgPSBiYWNrZ3JvdW5kSW1hZ2VzW2ltYWdlSW5kZXhdO1xuXG4gICAgICAgIGlmICghYmFja2dyb3VuZEltYWdlLmFyZ3MgfHwgYmFja2dyb3VuZEltYWdlLmFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5ID0gYmFja2dyb3VuZEltYWdlLm1ldGhvZCA9PT0gJ3VybCcgP1xuICAgICAgICAgIGJhY2tncm91bmRJbWFnZS5hcmdzWzBdIDpcbiAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2UudmFsdWU7XG5cbiAgICAgICAgaW1hZ2UgPSBsb2FkSW1hZ2Uoa2V5KTtcblxuICAgICAgICAvLyBUT0RPIGFkZCBzdXBwb3J0IGZvciBiYWNrZ3JvdW5kLW9yaWdpblxuICAgICAgICBpZiAoaW1hZ2UpIHtcbiAgICAgICAgICByZW5kZXJCYWNrZ3JvdW5kUmVwZWF0aW5nKGVsZW1lbnQsIGJvdW5kcywgY3R4LCBpbWFnZSwgaW1hZ2VJbmRleCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogRXJyb3IgbG9hZGluZyBiYWNrZ3JvdW5kOlwiLCBiYWNrZ3JvdW5kSW1hZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzaXplSW1hZ2UoaW1hZ2UsIGJvdW5kcykge1xuXG4gICAgICBpZiAoaW1hZ2Uud2lkdGggPT09IGJvdW5kcy53aWR0aCAmJiBpbWFnZS5oZWlnaHQgPT09IGJvdW5kcy5oZWlnaHQpXG4gICAgICAgIHJldHVybiBpbWFnZTtcblxuICAgICAgdmFyIGN0eCwgY2FudmFzID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgY2FudmFzLndpZHRoID0gYm91bmRzLndpZHRoO1xuICAgICAgY2FudmFzLmhlaWdodCA9IGJvdW5kcy5oZWlnaHQ7XG5cbiAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICBkcmF3SW1hZ2UoY3R4LCBpbWFnZSwgMCwgMCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCwgMCwgMCwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0KTtcbiAgICAgIHJldHVybiBjYW52YXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0T3BhY2l0eShjdHgsIGVsZW1lbnQsIHBhcmVudFN0YWNrKSB7XG4gICAgICByZXR1cm4gY3R4LnNldFZhcmlhYmxlKFwiZ2xvYmFsQWxwaGFcIiwgZ2V0Q1NTKGVsZW1lbnQsIFwib3BhY2l0eVwiKSAqICgocGFyZW50U3RhY2spID8gcGFyZW50U3RhY2sub3BhY2l0eSA6IDEpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVQeChzdHIpIHtcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZShcInB4XCIsIFwiXCIpO1xuICAgIH1cblxuICAgIHZhciB0cmFuc2Zvcm1SZWdFeHAgPSAvKG1hdHJpeClcXCgoLispXFwpLztcblxuICAgIGZ1bmN0aW9uIGdldFRyYW5zZm9ybShlbGVtZW50LCBwYXJlbnRTdGFjaykge1xuICAgICAgdmFyIHRyYW5zZm9ybSA9IGdldENTUyhlbGVtZW50LCBcInRyYW5zZm9ybVwiKSB8fCBnZXRDU1MoZWxlbWVudCwgXCItd2Via2l0LXRyYW5zZm9ybVwiKSB8fCBnZXRDU1MoZWxlbWVudCwgXCItbW96LXRyYW5zZm9ybVwiKSB8fCBnZXRDU1MoZWxlbWVudCwgXCItbXMtdHJhbnNmb3JtXCIpIHx8IGdldENTUyhlbGVtZW50LCBcIi1vLXRyYW5zZm9ybVwiKTtcbiAgICAgIHZhciB0cmFuc2Zvcm1PcmlnaW4gPSBnZXRDU1MoZWxlbWVudCwgXCJ0cmFuc2Zvcm0tb3JpZ2luXCIpIHx8IGdldENTUyhlbGVtZW50LCBcIi13ZWJraXQtdHJhbnNmb3JtLW9yaWdpblwiKSB8fCBnZXRDU1MoZWxlbWVudCwgXCItbW96LXRyYW5zZm9ybS1vcmlnaW5cIikgfHwgZ2V0Q1NTKGVsZW1lbnQsIFwiLW1zLXRyYW5zZm9ybS1vcmlnaW5cIikgfHwgZ2V0Q1NTKGVsZW1lbnQsIFwiLW8tdHJhbnNmb3JtLW9yaWdpblwiKSB8fCBcIjBweCAwcHhcIjtcblxuICAgICAgdHJhbnNmb3JtT3JpZ2luID0gdHJhbnNmb3JtT3JpZ2luLnNwbGl0KFwiIFwiKS5tYXAocmVtb3ZlUHgpLm1hcChVdGlsLmFzRmxvYXQpO1xuXG4gICAgICB2YXIgbWF0cml4O1xuICAgICAgaWYgKHRyYW5zZm9ybSAmJiB0cmFuc2Zvcm0gIT09IFwibm9uZVwiKSB7XG4gICAgICAgIHZhciBtYXRjaCA9IHRyYW5zZm9ybS5tYXRjaCh0cmFuc2Zvcm1SZWdFeHApO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICBzd2l0Y2ggKG1hdGNoWzFdKSB7XG4gICAgICAgICAgICBjYXNlIFwibWF0cml4XCI6XG4gICAgICAgICAgICAgIG1hdHJpeCA9IG1hdGNoWzJdLnNwbGl0KFwiLFwiKS5tYXAoVXRpbC50cmltVGV4dCkubWFwKFV0aWwuYXNGbG9hdCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBvcmlnaW46IHRyYW5zZm9ybU9yaWdpbixcbiAgICAgICAgbWF0cml4OiBtYXRyaXhcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlU3RhY2soZWxlbWVudCwgcGFyZW50U3RhY2ssIGJvdW5kcywgdHJhbnNmb3JtKSB7XG4gICAgICB2YXIgY3R4ID0gaDJjUmVuZGVyQ29udGV4dCgoIXBhcmVudFN0YWNrKSA/IGRvY3VtZW50V2lkdGgoKSA6IGJvdW5kcy53aWR0aCwgKCFwYXJlbnRTdGFjaykgPyBkb2N1bWVudEhlaWdodCgpIDogYm91bmRzLmhlaWdodCksXG4gICAgICAgIHN0YWNrID0ge1xuICAgICAgICAgIGN0eDogY3R4LFxuICAgICAgICAgIG9wYWNpdHk6IHNldE9wYWNpdHkoY3R4LCBlbGVtZW50LCBwYXJlbnRTdGFjayksXG4gICAgICAgICAgY3NzUG9zaXRpb246IGdldENTUyhlbGVtZW50LCBcInBvc2l0aW9uXCIpLFxuICAgICAgICAgIGJvcmRlcnM6IGdldEJvcmRlckRhdGEoZWxlbWVudCksXG4gICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICAgICAgY2xpcDogKHBhcmVudFN0YWNrICYmIHBhcmVudFN0YWNrLmNsaXApID8gVXRpbC5FeHRlbmQoe30sIHBhcmVudFN0YWNrLmNsaXApIDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICBzZXRaKGVsZW1lbnQsIHN0YWNrLCBwYXJlbnRTdGFjayk7XG5cbiAgICAgIC8vIFRPRE8gY29ycmVjdCBvdmVyZmxvdyBmb3IgYWJzb2x1dGUgY29udGVudCByZXNpZGluZyB1bmRlciBhIHN0YXRpYyBwb3NpdGlvblxuICAgICAgaWYgKG9wdGlvbnMudXNlT3ZlcmZsb3cgPT09IHRydWUgJiYgLyhoaWRkZW58c2Nyb2xsfGF1dG8pLy50ZXN0KGdldENTUyhlbGVtZW50LCBcIm92ZXJmbG93XCIpKSA9PT0gdHJ1ZSAmJiAvKEJPRFkpL2kudGVzdChlbGVtZW50Lm5vZGVOYW1lKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgc3RhY2suY2xpcCA9IChzdGFjay5jbGlwKSA/IGNsaXBCb3VuZHMoc3RhY2suY2xpcCwgYm91bmRzKSA6IGJvdW5kcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YWNrO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJhY2tncm91bmRCb3VuZHMoYm9yZGVycywgYm91bmRzLCBjbGlwKSB7XG4gICAgICB2YXIgYmFja2dyb3VuZEJvdW5kcyA9IHtcbiAgICAgICAgbGVmdDogYm91bmRzLmxlZnQgKyBib3JkZXJzWzNdLndpZHRoLFxuICAgICAgICB0b3A6IGJvdW5kcy50b3AgKyBib3JkZXJzWzBdLndpZHRoLFxuICAgICAgICB3aWR0aDogYm91bmRzLndpZHRoIC0gKGJvcmRlcnNbMV0ud2lkdGggKyBib3JkZXJzWzNdLndpZHRoKSxcbiAgICAgICAgaGVpZ2h0OiBib3VuZHMuaGVpZ2h0IC0gKGJvcmRlcnNbMF0ud2lkdGggKyBib3JkZXJzWzJdLndpZHRoKVxuICAgICAgfTtcblxuICAgICAgaWYgKGNsaXApIHtcbiAgICAgICAgYmFja2dyb3VuZEJvdW5kcyA9IGNsaXBCb3VuZHMoYmFja2dyb3VuZEJvdW5kcywgY2xpcCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBiYWNrZ3JvdW5kQm91bmRzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJvdW5kcyhlbGVtZW50LCB0cmFuc2Zvcm0pIHtcbiAgICAgIHZhciBib3VuZHMgPSAodHJhbnNmb3JtLm1hdHJpeCkgPyBVdGlsLk9mZnNldEJvdW5kcyhlbGVtZW50KSA6IFV0aWwuQm91bmRzKGVsZW1lbnQpO1xuICAgICAgdHJhbnNmb3JtLm9yaWdpblswXSArPSBib3VuZHMubGVmdDtcbiAgICAgIHRyYW5zZm9ybS5vcmlnaW5bMV0gKz0gYm91bmRzLnRvcDtcbiAgICAgIHJldHVybiBib3VuZHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyRWxlbWVudChlbGVtZW50LCBwYXJlbnRTdGFjaywgcHNldWRvRWxlbWVudCwgaWdub3JlQmFja2dyb3VuZCkge1xuICAgICAgdmFyIHRyYW5zZm9ybSA9IGdldFRyYW5zZm9ybShlbGVtZW50LCBwYXJlbnRTdGFjayksXG4gICAgICAgIGJvdW5kcyA9IGdldEJvdW5kcyhlbGVtZW50LCB0cmFuc2Zvcm0pLFxuICAgICAgICBpbWFnZSxcbiAgICAgICAgc3RhY2sgPSBjcmVhdGVTdGFjayhlbGVtZW50LCBwYXJlbnRTdGFjaywgYm91bmRzLCB0cmFuc2Zvcm0pLFxuICAgICAgICBib3JkZXJzID0gc3RhY2suYm9yZGVycyxcbiAgICAgICAgY3R4ID0gc3RhY2suY3R4LFxuICAgICAgICBiYWNrZ3JvdW5kQm91bmRzID0gZ2V0QmFja2dyb3VuZEJvdW5kcyhib3JkZXJzLCBib3VuZHMsIHN0YWNrLmNsaXApLFxuICAgICAgICBib3JkZXJEYXRhID0gcGFyc2VCb3JkZXJzKGVsZW1lbnQsIGJvdW5kcywgYm9yZGVycyksXG4gICAgICAgIGJhY2tncm91bmRDb2xvciA9IChpZ25vcmVFbGVtZW50c1JlZ0V4cC50ZXN0KGVsZW1lbnQubm9kZU5hbWUpKSA/IFwiI2VmZWZlZlwiIDogZ2V0Q1NTKGVsZW1lbnQsIFwiYmFja2dyb3VuZENvbG9yXCIpO1xuXG5cbiAgICAgIGNyZWF0ZVNoYXBlKGN0eCwgYm9yZGVyRGF0YS5jbGlwKTtcblxuICAgICAgY3R4LnNhdmUoKTtcbiAgICAgIGN0eC5jbGlwKCk7XG5cbiAgICAgIGlmIChiYWNrZ3JvdW5kQm91bmRzLmhlaWdodCA+IDAgJiYgYmFja2dyb3VuZEJvdW5kcy53aWR0aCA+IDAgJiYgIWlnbm9yZUJhY2tncm91bmQpIHtcbiAgICAgICAgcmVuZGVyQmFja2dyb3VuZENvbG9yKGN0eCwgYm91bmRzLCBiYWNrZ3JvdW5kQ29sb3IpO1xuICAgICAgICByZW5kZXJCYWNrZ3JvdW5kSW1hZ2UoZWxlbWVudCwgYmFja2dyb3VuZEJvdW5kcywgY3R4KTtcbiAgICAgIH0gZWxzZSBpZiAoaWdub3JlQmFja2dyb3VuZCkge1xuICAgICAgICBzdGFjay5iYWNrZ3JvdW5kQ29sb3IgPSBiYWNrZ3JvdW5kQ29sb3I7XG4gICAgICB9XG5cbiAgICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICAgIGJvcmRlckRhdGEuYm9yZGVycy5mb3JFYWNoKGZ1bmN0aW9uIChib3JkZXIpIHtcbiAgICAgICAgcmVuZGVyQm9yZGVycyhjdHgsIGJvcmRlci5hcmdzLCBib3JkZXIuY29sb3IpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghcHNldWRvRWxlbWVudCkge1xuICAgICAgICBpbmplY3RQc2V1ZG9FbGVtZW50cyhlbGVtZW50LCBzdGFjayk7XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAoZWxlbWVudC5ub2RlTmFtZSkge1xuICAgICAgICBjYXNlIFwiSU1HXCI6XG4gICAgICAgICAgaWYgKChpbWFnZSA9IGxvYWRJbWFnZShlbGVtZW50LmdldEF0dHJpYnV0ZSgnc3JjJykpKSkge1xuICAgICAgICAgICAgcmVuZGVySW1hZ2UoY3R4LCBlbGVtZW50LCBpbWFnZSwgYm91bmRzLCBib3JkZXJzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogRXJyb3IgbG9hZGluZyA8aW1nPjpcIiArIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiSU5QVVRcIjpcbiAgICAgICAgICAvLyBUT0RPIGFkZCBhbGwgcmVsZXZhbnQgdHlwZSdzLCBpLmUuIEhUTUw1IG5ldyBzdHVmZlxuICAgICAgICAgIC8vIHRvZG8gYWRkIHN1cHBvcnQgZm9yIHBsYWNlaG9sZGVyIGF0dHJpYnV0ZSBmb3IgYnJvd3NlcnMgd2hpY2ggc3VwcG9ydCBpdFxuICAgICAgICAgIGlmICgvXih0ZXh0fHVybHxlbWFpbHxzdWJtaXR8YnV0dG9ufHJlc2V0KSQvLnRlc3QoZWxlbWVudC50eXBlKSAmJiAoZWxlbWVudC52YWx1ZSB8fCBlbGVtZW50LnBsYWNlaG9sZGVyIHx8IFwiXCIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlbmRlckZvcm1WYWx1ZShlbGVtZW50LCBib3VuZHMsIHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJURVhUQVJFQVwiOlxuICAgICAgICAgIGlmICgoZWxlbWVudC52YWx1ZSB8fCBlbGVtZW50LnBsYWNlaG9sZGVyIHx8IFwiXCIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlbmRlckZvcm1WYWx1ZShlbGVtZW50LCBib3VuZHMsIHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJTRUxFQ1RcIjpcbiAgICAgICAgICBpZiAoKGVsZW1lbnQub3B0aW9ucyB8fCBlbGVtZW50LnBsYWNlaG9sZGVyIHx8IFwiXCIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJlbmRlckZvcm1WYWx1ZShlbGVtZW50LCBib3VuZHMsIHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJMSVwiOlxuICAgICAgICAgIHJlbmRlckxpc3RJdGVtKGVsZW1lbnQsIHN0YWNrLCBiYWNrZ3JvdW5kQm91bmRzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkNBTlZBU1wiOlxuICAgICAgICAgIHJlbmRlckltYWdlKGN0eCwgZWxlbWVudCwgZWxlbWVudCwgYm91bmRzLCBib3JkZXJzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YWNrO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudFZpc2libGUoZWxlbWVudCkge1xuICAgICAgcmV0dXJuIChnZXRDU1MoZWxlbWVudCwgJ2Rpc3BsYXknKSAhPT0gXCJub25lXCIgJiYgZ2V0Q1NTKGVsZW1lbnQsICd2aXNpYmlsaXR5JykgIT09IFwiaGlkZGVuXCIgJiYgIWVsZW1lbnQuaGFzQXR0cmlidXRlKFwiZGF0YS1odG1sMmNhbnZhcy1pZ25vcmVcIikpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlRWxlbWVudChlbGVtZW50LCBzdGFjaywgcHNldWRvRWxlbWVudCkge1xuICAgICAgaWYgKGlzRWxlbWVudFZpc2libGUoZWxlbWVudCkpIHtcbiAgICAgICAgc3RhY2sgPSByZW5kZXJFbGVtZW50KGVsZW1lbnQsIHN0YWNrLCBwc2V1ZG9FbGVtZW50LCBmYWxzZSkgfHwgc3RhY2s7XG4gICAgICAgIGlmICghaWdub3JlRWxlbWVudHNSZWdFeHAudGVzdChlbGVtZW50Lm5vZGVOYW1lKSkge1xuICAgICAgICAgIHBhcnNlQ2hpbGRyZW4oZWxlbWVudCwgc3RhY2ssIHBzZXVkb0VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VDaGlsZHJlbihlbGVtZW50LCBzdGFjaywgcHNldWRvRWxlbWVudCkge1xuICAgICAgVXRpbC5DaGlsZHJlbihlbGVtZW50KS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBub2RlLkVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgIHBhcnNlRWxlbWVudChub2RlLCBzdGFjaywgcHNldWRvRWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gbm9kZS5URVhUX05PREUpIHtcbiAgICAgICAgICByZW5kZXJUZXh0KGVsZW1lbnQsIG5vZGUsIHN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcblxuICAgICAgdmFyIGJhY2tncm91bmQgPSBvcHRpb25zW1wiYmFja2dyb3VuZC1jb2xvclwiXTtcbiAgICAgIGlmKGJhY2tncm91bmQgPT0gXCJyZ2JhKDAsIDAsIDAsIDApXCIgfHzCoGJhY2tncm91bmQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgYmFja2dyb3VuZCA9IG9wdGlvbnNbXCJiYWNrZ3JvdW5kQ29sb3JcIl07XG4gICAgICBpZihiYWNrZ3JvdW5kID09IFwicmdiYSgwLCAwLCAwLCAwKVwiIHx8wqBiYWNrZ3JvdW5kID09PSB1bmRlZmluZWQpXG4gICAgICAgIGJhY2tncm91bmQgPSBvcHRpb25zW1wiYmFja2dyb3VuZFwiXTtcbiAgICAgIGlmKGJhY2tncm91bmQgPT0gXCJyZ2JhKDAsIDAsIDAsIDApXCIgfHzCoGJhY2tncm91bmQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgYmFja2dyb3VuZCA9IGdldENTUygkKG9wdGlvbnNbXCJjb250YWluZXJcIl0pWzBdLCBcImJhY2tncm91bmRDb2xvclwiKTtcbiAgICAgIGlmKGJhY2tncm91bmQgPT0gXCJyZ2JhKDAsIDAsIDAsIDApXCIgfHzCoGJhY2tncm91bmQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgYmFja2dyb3VuZCA9IGdldENTUyhkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIFwiYmFja2dyb3VuZENvbG9yXCIpO1xuICAgICAgaWYoYmFja2dyb3VuZCA9PSBcInJnYmEoMCwgMCwgMCwgMClcIiB8fMKgYmFja2dyb3VuZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBiYWNrZ3JvdW5kID0gZ2V0Q1NTKGRvY3VtZW50LmJvZHksIFwiYmFja2dyb3VuZENvbG9yXCIpO1xuXG4gICAgICB2YXIgdHJhbnNwYXJlbnRCYWNrZ3JvdW5kID0gKFV0aWwuaXNUcmFuc3BhcmVudChiYWNrZ3JvdW5kKSAmJiBlbGVtZW50ID09PSBkb2N1bWVudC5ib2R5KSxcbiAgICAgICAgICBzdGFjayA9IHJlbmRlckVsZW1lbnQoZWxlbWVudCwgbnVsbCwgZmFsc2UsIHRyYW5zcGFyZW50QmFja2dyb3VuZCk7XG5cbiAgICAgIHBhcnNlQ2hpbGRyZW4oZWxlbWVudCwgc3RhY2spO1xuXG4gICAgICBpZiAodHJhbnNwYXJlbnRCYWNrZ3JvdW5kKSB7XG4gICAgICAgIGJhY2tncm91bmQgPSBzdGFjay5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgICB9XG5cbiAgICAgIGJvZHkucmVtb3ZlQ2hpbGQoaGlkZVBzZXVkb0VsZW1lbnRzKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBiYWNrZ3JvdW5kLFxuICAgICAgICBzdGFjazogc3RhY2tcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGluaXQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBoMmN6Q29udGV4dCh6aW5kZXgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgemluZGV4OiB6aW5kZXgsXG4gICAgICBjaGlsZHJlbjogW11cbiAgICB9O1xuICB9XG5cbiAgX2h0bWwyY2FudmFzLlByZWxvYWQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXG4gICAgdmFyIGltYWdlcyA9IHtcbiAgICAgICAgbnVtTG9hZGVkOiAwLCAvLyBhbHNvIGZhaWxlZCBhcmUgY291bnRlZCBoZXJlXG4gICAgICAgIG51bUZhaWxlZDogMCxcbiAgICAgICAgbnVtVG90YWw6IDAsXG4gICAgICAgIGNsZWFudXBEb25lOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIHBhZ2VPcmlnaW4sXG4gICAgICBVdGlsID0gX2h0bWwyY2FudmFzLlV0aWwsXG4gICAgICBtZXRob2RzLFxuICAgICAgaSxcbiAgICAgIGNvdW50ID0gMCxcbiAgICAgIGVsZW1lbnQgPSBvcHRpb25zLmVsZW1lbnRzWzBdIHx8IGRvY3VtZW50LmJvZHksXG4gICAgICBkb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQsXG4gICAgICBkb21JbWFnZXMgPSBlbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKSwgLy8gRmV0Y2ggaW1hZ2VzIG9mIHRoZSBwcmVzZW50IGVsZW1lbnQgb25seVxuICAgICAgaW1nTGVuID0gZG9tSW1hZ2VzLmxlbmd0aCxcbiAgICAgIGxpbmsgPSBkb2MuY3JlYXRlRWxlbWVudChcImFcIiksXG4gICAgICBzdXBwb3J0Q09SUyA9IChmdW5jdGlvbiAoaW1nKSB7XG4gICAgICAgIHJldHVybiAoaW1nLmNyb3NzT3JpZ2luICE9PSB1bmRlZmluZWQpO1xuICAgICAgfSkobmV3IEltYWdlKCkpLFxuICAgICAgdGltZW91dFRpbWVyO1xuXG4gICAgbGluay5ocmVmID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgcGFnZU9yaWdpbiA9IGxpbmsucHJvdG9jb2wgKyBsaW5rLmhvc3Q7XG5cbiAgICBmdW5jdGlvbiBpc1NhbWVPcmlnaW4odXJsKSB7XG4gICAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgICBsaW5rLmhyZWYgPSBsaW5rLmhyZWY7IC8vIFlFUywgQkVMSUVWRSBJVCBPUiBOT1QsIHRoYXQgaXMgcmVxdWlyZWQgZm9yIElFOSAtIGh0dHA6Ly9qc2ZpZGRsZS5uZXQvbmlrbGFzdmgvMmU0OGIvXG4gICAgICB2YXIgb3JpZ2luID0gbGluay5wcm90b2NvbCArIGxpbmsuaG9zdDtcbiAgICAgIHJldHVybiAob3JpZ2luID09PSBwYWdlT3JpZ2luKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IHN0YXJ0OiBpbWFnZXM6IFwiICsgaW1hZ2VzLm51bUxvYWRlZCArIFwiIC8gXCIgKyBpbWFnZXMubnVtVG90YWwgKyBcIiAoZmFpbGVkOiBcIiArIGltYWdlcy5udW1GYWlsZWQgKyBcIilcIik7XG4gICAgICBpZiAoIWltYWdlcy5maXJzdFJ1biAmJiBpbWFnZXMubnVtTG9hZGVkID49IGltYWdlcy5udW1Ub3RhbCkge1xuICAgICAgICBVdGlsLmxvZyhcIkZpbmlzaGVkIGxvYWRpbmcgaW1hZ2VzOiAjIFwiICsgaW1hZ2VzLm51bVRvdGFsICsgXCIgKGZhaWxlZDogXCIgKyBpbWFnZXMubnVtRmFpbGVkICsgXCIpXCIpO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jb21wbGV0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgb3B0aW9ucy5jb21wbGV0ZShpbWFnZXMpO1xuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPIG1vZGlmeSBwcm94eSB0byBzZXJ2ZSBpbWFnZXMgd2l0aCBDT1JTIGVuYWJsZWQsIHdoZXJlIGF2YWlsYWJsZVxuICAgIGZ1bmN0aW9uIHByb3h5R2V0SW1hZ2UodXJsLCBpbWcsIGltYWdlT2JqKSB7XG4gICAgICB2YXIgY2FsbGJhY2tfbmFtZSxcbiAgICAgICAgc2NyaXB0VXJsID0gb3B0aW9ucy5wcm94eSxcbiAgICAgICAgc2NyaXB0O1xuXG4gICAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgICB1cmwgPSBsaW5rLmhyZWY7IC8vIHdvcmsgYXJvdW5kIGZvciBwYWdlcyB3aXRoIGJhc2UgaHJlZj1cIlwiIHNldCAtIFdBUk5JTkc6IHRoaXMgbWF5IGNoYW5nZSB0aGUgdXJsXG5cbiAgICAgIGNhbGxiYWNrX25hbWUgPSAnaHRtbDJjYW52YXNfJyArIChjb3VudCsrKTtcbiAgICAgIGltYWdlT2JqLmNhbGxiYWNrbmFtZSA9IGNhbGxiYWNrX25hbWU7XG5cbiAgICAgIGlmIChzY3JpcHRVcmwuaW5kZXhPZihcIj9cIikgPiAtMSkge1xuICAgICAgICBzY3JpcHRVcmwgKz0gXCImXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY3JpcHRVcmwgKz0gXCI/XCI7XG4gICAgICB9XG4gICAgICBzY3JpcHRVcmwgKz0gJ3VybD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHVybCkgKyAnJmNhbGxiYWNrPScgKyBjYWxsYmFja19uYW1lO1xuICAgICAgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG5cbiAgICAgIHdpbmRvd1tjYWxsYmFja19uYW1lXSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIGlmIChhLnN1YnN0cmluZygwLCA2KSA9PT0gXCJlcnJvcjpcIikge1xuICAgICAgICAgIGltYWdlT2JqLnN1Y2NlZWRlZCA9IGZhbHNlO1xuICAgICAgICAgIGltYWdlcy5udW1Mb2FkZWQrKztcbiAgICAgICAgICBpbWFnZXMubnVtRmFpbGVkKys7XG4gICAgICAgICAgc3RhcnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRJbWFnZUxvYWRIYW5kbGVycyhpbWcsIGltYWdlT2JqKTtcbiAgICAgICAgICBpbWcuc3JjID0gYTtcbiAgICAgICAgfVxuICAgICAgICB3aW5kb3dbY2FsbGJhY2tfbmFtZV0gPSB1bmRlZmluZWQ7IC8vIHRvIHdvcmsgd2l0aCBJRTw5ICAvLyBOT1RFOiB0aGF0IHRoZSB1bmRlZmluZWQgY2FsbGJhY2sgcHJvcGVydHktbmFtZSBzdGlsbCBleGlzdHMgb24gdGhlIHdpbmRvdyBvYmplY3QgKGZvciBJRTw5KVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGRlbGV0ZSB3aW5kb3dbY2FsbGJhY2tfbmFtZV07IC8vIGZvciBhbGwgYnJvd3NlciB0aGF0IHN1cHBvcnQgdGhpc1xuICAgICAgICB9IGNhdGNoIChleCkge31cbiAgICAgICAgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgc2NyaXB0ID0gbnVsbDtcbiAgICAgICAgZGVsZXRlIGltYWdlT2JqLnNjcmlwdDtcbiAgICAgICAgZGVsZXRlIGltYWdlT2JqLmNhbGxiYWNrbmFtZTtcbiAgICAgIH07XG5cbiAgICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwidGV4dC9qYXZhc2NyaXB0XCIpO1xuICAgICAgc2NyaXB0LnNldEF0dHJpYnV0ZShcInNyY1wiLCBzY3JpcHRVcmwpO1xuICAgICAgaW1hZ2VPYmouc2NyaXB0ID0gc2NyaXB0O1xuICAgICAgd2luZG93LmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRQc2V1ZG9FbGVtZW50KGVsZW1lbnQsIHR5cGUpIHtcbiAgICAgIHZhciBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQsIHR5cGUpLFxuICAgICAgICBjb250ZW50ID0gc3R5bGUuY29udGVudDtcbiAgICAgIGlmIChjb250ZW50LnN1YnN0cigwLCAzKSA9PT0gJ3VybCcpIHtcbiAgICAgICAgbWV0aG9kcy5sb2FkSW1hZ2UoX2h0bWwyY2FudmFzLlV0aWwucGFyc2VCYWNrZ3JvdW5kSW1hZ2UoY29udGVudClbMF0uYXJnc1swXSk7XG4gICAgICB9XG4gICAgICBsb2FkQmFja2dyb3VuZEltYWdlcyhzdHlsZS5iYWNrZ3JvdW5kSW1hZ2UsIGVsZW1lbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRQc2V1ZG9FbGVtZW50SW1hZ2VzKGVsZW1lbnQpIHtcbiAgICAgIGxvYWRQc2V1ZG9FbGVtZW50KGVsZW1lbnQsIFwiOmJlZm9yZVwiKTtcbiAgICAgIGxvYWRQc2V1ZG9FbGVtZW50KGVsZW1lbnQsIFwiOmFmdGVyXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRHcmFkaWVudEltYWdlKGJhY2tncm91bmRJbWFnZSwgYm91bmRzKSB7XG4gICAgICB2YXIgaW1nID0gX2h0bWwyY2FudmFzLkdlbmVyYXRlLkdyYWRpZW50KGJhY2tncm91bmRJbWFnZSwgYm91bmRzKTtcblxuICAgICAgaWYgKGltZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGltYWdlc1tiYWNrZ3JvdW5kSW1hZ2VdID0ge1xuICAgICAgICAgIGltZzogaW1nLFxuICAgICAgICAgIHN1Y2NlZWRlZDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICBpbWFnZXMubnVtVG90YWwrKztcbiAgICAgICAgaW1hZ2VzLm51bUxvYWRlZCsrO1xuICAgICAgICBzdGFydCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGludmFsaWRCYWNrZ3JvdW5kcyhiYWNrZ3JvdW5kX2ltYWdlKSB7XG4gICAgICByZXR1cm4gKGJhY2tncm91bmRfaW1hZ2UgJiYgYmFja2dyb3VuZF9pbWFnZS5tZXRob2QgJiYgYmFja2dyb3VuZF9pbWFnZS5hcmdzICYmIGJhY2tncm91bmRfaW1hZ2UuYXJncy5sZW5ndGggPiAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkQmFja2dyb3VuZEltYWdlcyhiYWNrZ3JvdW5kX2ltYWdlLCBlbCkge1xuICAgICAgdmFyIGJvdW5kcztcblxuICAgICAgX2h0bWwyY2FudmFzLlV0aWwucGFyc2VCYWNrZ3JvdW5kSW1hZ2UoYmFja2dyb3VuZF9pbWFnZSkuZmlsdGVyKGludmFsaWRCYWNrZ3JvdW5kcykuZm9yRWFjaChmdW5jdGlvbiAoYmFja2dyb3VuZF9pbWFnZSkge1xuICAgICAgICBpZiAoYmFja2dyb3VuZF9pbWFnZS5tZXRob2QgPT09ICd1cmwnKSB7XG4gICAgICAgICAgbWV0aG9kcy5sb2FkSW1hZ2UoYmFja2dyb3VuZF9pbWFnZS5hcmdzWzBdKTtcbiAgICAgICAgfSBlbHNlIGlmIChiYWNrZ3JvdW5kX2ltYWdlLm1ldGhvZC5tYXRjaCgvXFwtP2dyYWRpZW50JC8pKSB7XG4gICAgICAgICAgaWYgKGJvdW5kcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBib3VuZHMgPSBfaHRtbDJjYW52YXMuVXRpbC5Cb3VuZHMoZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsb2FkR3JhZGllbnRJbWFnZShiYWNrZ3JvdW5kX2ltYWdlLnZhbHVlLCBib3VuZHMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJbWFnZXMoZWwpIHtcbiAgICAgIHZhciBlbE5vZGVUeXBlID0gZmFsc2U7XG5cbiAgICAgIC8vIEZpcmVmb3ggZmFpbHMgd2l0aCBwZXJtaXNzaW9uIGRlbmllZCBvbiBwYWdlcyB3aXRoIGlmcmFtZXNcbiAgICAgIHRyeSB7XG4gICAgICAgIFV0aWwuQ2hpbGRyZW4oZWwpLmZvckVhY2goZ2V0SW1hZ2VzKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGVsTm9kZVR5cGUgPSBlbC5ub2RlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGVsTm9kZVR5cGUgPSBmYWxzZTtcbiAgICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogZmFpbGVkIHRvIGFjY2VzcyBzb21lIGVsZW1lbnQncyBub2RlVHlwZSAtIEV4Y2VwdGlvbjogXCIgKyBleC5tZXNzYWdlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVsTm9kZVR5cGUgPT09IDEgfHwgZWxOb2RlVHlwZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgbG9hZFBzZXVkb0VsZW1lbnRJbWFnZXMoZWwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxvYWRCYWNrZ3JvdW5kSW1hZ2VzKFV0aWwuZ2V0Q1NTKGVsLCAnYmFja2dyb3VuZEltYWdlJyksIGVsKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IGZhaWxlZCB0byBnZXQgYmFja2dyb3VuZC1pbWFnZSAtIEV4Y2VwdGlvbjogXCIgKyBlLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRCYWNrZ3JvdW5kSW1hZ2VzKGVsKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRJbWFnZUxvYWRIYW5kbGVycyhpbWcsIGltYWdlT2JqKSB7XG5cbiAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGltYWdlT2JqLnRpbWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBDT1JTIHN1Y2NlZWRlZFxuICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaW1hZ2VPYmoudGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW1hZ2VzLm51bUxvYWRlZCsrO1xuICAgICAgICBpbWFnZU9iai5zdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICBpbWcub25lcnJvciA9IGltZy5vbmxvYWQgPSBudWxsO1xuICAgICAgICBzdGFydCgpO1xuICAgICAgfTtcblxuICAgICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKGltZy5jcm9zc09yaWdpbiA9PT0gXCJhbm9ueW1vdXNcIikge1xuICAgICAgICAgIC8vIENPUlMgZmFpbGVkXG4gICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChpbWFnZU9iai50aW1lcik7XG5cbiAgICAgICAgICAvLyBsZXQncyB0cnkgd2l0aCBwcm94eSBpbnN0ZWFkXG4gICAgICAgICAgaWYgKG9wdGlvbnMucHJveHkpIHtcbiAgICAgICAgICAgIHZhciBzcmMgPSBpbWcuc3JjO1xuICAgICAgICAgICAgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBpbWFnZU9iai5pbWcgPSBpbWc7XG4gICAgICAgICAgICBpbWcuc3JjID0gc3JjO1xuXG4gICAgICAgICAgICBwcm94eUdldEltYWdlKGltZy5zcmMsIGltZywgaW1hZ2VPYmopO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGltYWdlcy5udW1Mb2FkZWQrKztcbiAgICAgICAgaW1hZ2VzLm51bUZhaWxlZCsrO1xuICAgICAgICBpbWFnZU9iai5zdWNjZWVkZWQgPSBmYWxzZTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSBpbWcub25sb2FkID0gbnVsbDtcblxuICAgICAgICBzdGFydCgpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBtZXRob2RzID0ge1xuICAgICAgbG9hZEltYWdlOiBmdW5jdGlvbiAoc3JjKSB7XG5cbiAgICAgICAgdmFyIGltZywgaW1hZ2VPYmo7XG4gICAgICAgIGlmIChzcmMgJiYgaW1hZ2VzW3NyY10gPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGlmIChzcmMubWF0Y2goL2RhdGE6aW1hZ2VcXC8uKjtiYXNlNjQsL2kpKSB7XG4gICAgICAgICAgICAgIGltZy5zcmMgPSBzcmMucmVwbGFjZSgvdXJsXFwoWydcIl17MCx9fFsnXCJdezAsfVxcKSQvaWcsICcnKTtcbiAgICAgICAgICAgICAgaW1hZ2VPYmogPSBpbWFnZXNbc3JjXSA9IHtcbiAgICAgICAgICAgICAgICBpbWc6IGltZ1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBpbWFnZXMubnVtVG90YWwrKztcbiAgICAgICAgICAgICAgc2V0SW1hZ2VMb2FkSGFuZGxlcnMoaW1nLCBpbWFnZU9iaik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzU2FtZU9yaWdpbihzcmMpIHx8IG9wdGlvbnMuYWxsb3dUYWludCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICBpbWFnZU9iaiA9IGltYWdlc1tzcmNdID0ge1xuICAgICAgICAgICAgICAgIGltZzogaW1nXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGltYWdlcy5udW1Ub3RhbCsrO1xuICAgICAgICAgICAgICBzZXRJbWFnZUxvYWRIYW5kbGVycyhpbWcsIGltYWdlT2JqKTtcbiAgICAgICAgICAgICAgaW1nLnNyYyA9IHNyYztcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0Q09SUyAmJiAhb3B0aW9ucy5hbGxvd1RhaW50ICYmIG9wdGlvbnMudXNlQ09SUykge1xuICAgICAgICAgICAgICAvLyBhdHRlbXB0IHRvIGxvYWQgd2l0aCBDT1JTXG5cbiAgICAgICAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gXCJhbm9ueW1vdXNcIjtcbiAgICAgICAgICAgICAgaW1hZ2VPYmogPSBpbWFnZXNbc3JjXSA9IHsgaW1nOiBpbWcgfTtcbiAgICAgICAgICAgICAgaW1hZ2VzLm51bVRvdGFsKys7XG5cbiAgICAgICAgICAgICAgc2V0SW1hZ2VMb2FkSGFuZGxlcnMoaW1nLCBpbWFnZU9iaik7XG4gICAgICAgICAgICAgIGltZy5zcmMgPSBzcmM7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5wcm94eSkge1xuICAgICAgICAgICAgICBpbWFnZU9iaiA9IGltYWdlc1tzcmNdID0ge1xuICAgICAgICAgICAgICAgIGltZzogaW1nXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGltYWdlcy5udW1Ub3RhbCsrO1xuICAgICAgICAgICAgICBwcm94eUdldEltYWdlKHNyYywgaW1nLCBpbWFnZU9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIGNsZWFudXBET006IGZ1bmN0aW9uIChjYXVzZSkge1xuXG4gICAgICAgIHZhciBpbWcsIHNyYztcbiAgICAgICAgaWYgKCFpbWFnZXMuY2xlYW51cERvbmUpIHtcbiAgICAgICAgICBpZiAoY2F1c2UgJiYgdHlwZW9mIGNhdXNlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBDbGVhbnVwIGJlY2F1c2U6IFwiICsgY2F1c2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBDbGVhbnVwIGFmdGVyIHRpbWVvdXQ6IFwiICsgb3B0aW9ucy50aW1lb3V0ICsgXCIgbXMuXCIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAoc3JjIGluIGltYWdlcykge1xuICAgICAgICAgICAgaWYgKGltYWdlcy5oYXNPd25Qcm9wZXJ0eShzcmMpKSB7XG4gICAgICAgICAgICAgIGltZyA9IGltYWdlc1tzcmNdO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGltZyA9PT0gXCJvYmplY3RcIiAmJiBpbWcuY2FsbGJhY2tuYW1lICYmIGltZy5zdWNjZWVkZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbmNlbCBwcm94eSBpbWFnZSByZXF1ZXN0XG4gICAgICAgICAgICAgICAgd2luZG93W2ltZy5jYWxsYmFja25hbWVdID0gdW5kZWZpbmVkOyAvLyB0byB3b3JrIHdpdGggSUU8OSAgLy8gTk9URTogdGhhdCB0aGUgdW5kZWZpbmVkIGNhbGxiYWNrIHByb3BlcnR5LW5hbWUgc3RpbGwgZXhpc3RzIG9uIHRoZSB3aW5kb3cgb2JqZWN0IChmb3IgSUU8OSlcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgZGVsZXRlIHdpbmRvd1tpbWcuY2FsbGJhY2tuYW1lXTsgLy8gZm9yIGFsbCBicm93c2VyIHRoYXQgc3VwcG9ydCB0aGlzXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHt9XG4gICAgICAgICAgICAgICAgaWYgKGltZy5zY3JpcHQgJiYgaW1nLnNjcmlwdC5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICBpbWcuc2NyaXB0LnNldEF0dHJpYnV0ZShcInNyY1wiLCBcImFib3V0OmJsYW5rXCIpOyAvLyB0cnkgdG8gY2FuY2VsIHJ1bm5pbmcgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgaW1nLnNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGltZy5zY3JpcHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbWFnZXMubnVtTG9hZGVkKys7XG4gICAgICAgICAgICAgICAgaW1hZ2VzLm51bUZhaWxlZCsrO1xuICAgICAgICAgICAgICAgIFV0aWwubG9nKFwiaHRtbDJjYW52YXM6IENsZWFuZWQgdXAgZmFpbGVkIGltZzogJ1wiICsgc3JjICsgXCInIFN0ZXBzOiBcIiArIGltYWdlcy5udW1Mb2FkZWQgKyBcIiAvIFwiICsgaW1hZ2VzLm51bVRvdGFsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNhbmNlbCBhbnkgcGVuZGluZyByZXF1ZXN0c1xuICAgICAgICAgIGlmICh3aW5kb3cuc3RvcCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3aW5kb3cuc3RvcCgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuZXhlY0NvbW1hbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJTdG9wXCIsIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGRvY3VtZW50LmNsb3NlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmNsb3NlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGltYWdlcy5jbGVhbnVwRG9uZSA9IHRydWU7XG4gICAgICAgICAgaWYgKCEoY2F1c2UgJiYgdHlwZW9mIGNhdXNlID09PSBcInN0cmluZ1wiKSkge1xuICAgICAgICAgICAgc3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIHJlbmRlcmluZ0RvbmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBpZiAodGltZW91dFRpbWVyKSB7XG4gICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0VGltZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zLnRpbWVvdXQgPiAwKSB7XG4gICAgICB0aW1lb3V0VGltZXIgPSB3aW5kb3cuc2V0VGltZW91dChtZXRob2RzLmNsZWFudXBET00sIG9wdGlvbnMudGltZW91dCk7XG4gICAgfVxuXG4gICAgVXRpbC5sb2coJ2h0bWwyY2FudmFzOiBQcmVsb2FkIHN0YXJ0czogZmluZGluZyBiYWNrZ3JvdW5kLWltYWdlcycpO1xuICAgIGltYWdlcy5maXJzdFJ1biA9IHRydWU7XG5cbiAgICBnZXRJbWFnZXMoZWxlbWVudCk7XG5cbiAgICBVdGlsLmxvZygnaHRtbDJjYW52YXM6IFByZWxvYWQ6IEZpbmRpbmcgaW1hZ2VzJyk7XG4gICAgLy8gbG9hZCA8aW1nPiBpbWFnZXNcbiAgICBmb3IgKGkgPSAwOyBpIDwgaW1nTGVuOyBpICs9IDEpIHtcbiAgICAgIG1ldGhvZHMubG9hZEltYWdlKGRvbUltYWdlc1tpXS5nZXRBdHRyaWJ1dGUoXCJzcmNcIikpO1xuICAgIH1cblxuICAgIGltYWdlcy5maXJzdFJ1biA9IGZhbHNlO1xuICAgIFV0aWwubG9nKCdodG1sMmNhbnZhczogUHJlbG9hZDogRG9uZS4nKTtcbiAgICBpZiAoaW1hZ2VzLm51bVRvdGFsID09PSBpbWFnZXMubnVtTG9hZGVkKVxuICAgICAgc3RhcnQoKTtcblxuICAgIHJldHVybiBtZXRob2RzO1xuICB9O1xuXG4gIF9odG1sMmNhbnZhcy5SZW5kZXJlciA9IGZ1bmN0aW9uIChwYXJzZVF1ZXVlLCBvcHRpb25zKSB7XG5cbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9DU1MyMS96aW5kZXguaHRtbFxuICAgIGZ1bmN0aW9uIGNyZWF0ZVJlbmRlclF1ZXVlKHBhcnNlUXVldWUpIHtcbiAgICAgIHZhciBxdWV1ZSA9IFtdLFxuICAgICAgICByb290Q29udGV4dDtcblxuICAgICAgcm9vdENvbnRleHQgPSAoZnVuY3Rpb24gYnVpbGRTdGFja2luZ0NvbnRleHQocm9vdE5vZGUpIHtcbiAgICAgICAgdmFyIHJvb3RDb250ZXh0ID0ge307XG5cbiAgICAgICAgZnVuY3Rpb24gaW5zZXJ0KGNvbnRleHQsIG5vZGUsIHNwZWNpYWxQYXJlbnQpIHtcbiAgICAgICAgICB2YXIgemkgPSAobm9kZS56SW5kZXguemluZGV4ID09PSAnYXV0bycpID8gMCA6IE51bWJlcihub2RlLnpJbmRleC56aW5kZXgpLFxuICAgICAgICAgICAgY29udGV4dEZvckNoaWxkcmVuID0gY29udGV4dCwgLy8gdGhlIHN0YWNraW5nIGNvbnRleHQgZm9yIGNoaWxkcmVuXG4gICAgICAgICAgICBpc1Bvc2l0aW9uZWQgPSBub2RlLnpJbmRleC5pc1Bvc2l0aW9uZWQsXG4gICAgICAgICAgICBpc0Zsb2F0ZWQgPSBub2RlLnpJbmRleC5pc0Zsb2F0ZWQsXG4gICAgICAgICAgICBzdHViID0ge1xuICAgICAgICAgICAgICBub2RlOiBub2RlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hpbGRyZW5EZXN0ID0gc3BlY2lhbFBhcmVudDsgLy8gd2hlcmUgY2hpbGRyZW4gd2l0aG91dCB6LWluZGV4IHNob3VsZCBiZSBwdXNoZWQgaW50b1xuXG4gICAgICAgICAgaWYgKG5vZGUuekluZGV4Lm93blN0YWNraW5nKSB7XG4gICAgICAgICAgICAvLyAnIScgY29tZXMgYmVmb3JlIG51bWJlcnMgaW4gc29ydGVkIGFycmF5XG4gICAgICAgICAgICBjb250ZXh0Rm9yQ2hpbGRyZW4gPSBzdHViLmNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICchJzogW3tcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNoaWxkcmVuRGVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGlzUG9zaXRpb25lZCB8fCBpc0Zsb2F0ZWQpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuRGVzdCA9IHN0dWIuY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoemkgPT09IDAgJiYgc3BlY2lhbFBhcmVudCkge1xuICAgICAgICAgICAgc3BlY2lhbFBhcmVudC5wdXNoKHN0dWIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWNvbnRleHRbemldKSB7XG4gICAgICAgICAgICAgIGNvbnRleHRbemldID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250ZXh0W3ppXS5wdXNoKHN0dWIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5vZGUuekluZGV4LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkTm9kZSkge1xuICAgICAgICAgICAgaW5zZXJ0KGNvbnRleHRGb3JDaGlsZHJlbiwgY2hpbGROb2RlLCBjaGlsZHJlbkRlc3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGluc2VydChyb290Q29udGV4dCwgcm9vdE5vZGUpO1xuICAgICAgICByZXR1cm4gcm9vdENvbnRleHQ7XG4gICAgICB9KShwYXJzZVF1ZXVlKTtcblxuICAgICAgZnVuY3Rpb24gc29ydFooY29udGV4dCkge1xuICAgICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5zb3J0KCkuZm9yRWFjaChmdW5jdGlvbiAoemkpIHtcbiAgICAgICAgICB2YXIgbm9uUG9zaXRpb25lZCA9IFtdLFxuICAgICAgICAgICAgZmxvYXRlZCA9IFtdLFxuICAgICAgICAgICAgcG9zaXRpb25lZCA9IFtdLFxuICAgICAgICAgICAgbGlzdCA9IFtdO1xuXG4gICAgICAgICAgLy8gcG9zaXRpb25lZCBhZnRlciBzdGF0aWNcbiAgICAgICAgICBjb250ZXh0W3ppXS5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICBpZiAodi5ub2RlLnpJbmRleC5pc1Bvc2l0aW9uZWQgfHwgdi5ub2RlLnpJbmRleC5vcGFjaXR5IDwgMSkge1xuICAgICAgICAgICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLWNvbG9yLyN0cmFuc3BhcmVuY3lcbiAgICAgICAgICAgICAgLy8gbm9uLXBvc2l0aW9uZWQgZWxlbWVudCB3aXRoIG9wYWN0aXkgPCAxIHNob3VsZCBiZSBzdGFja2VkIGFzIGlmIGl0IHdlcmUgYSBwb3NpdGlvbmVkIGVsZW1lbnQgd2l0aCDigJh6LWluZGV4OiAw4oCZIGFuZCDigJhvcGFjaXR5OiAx4oCZLlxuICAgICAgICAgICAgICBwb3NpdGlvbmVkLnB1c2godik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHYubm9kZS56SW5kZXguaXNGbG9hdGVkKSB7XG4gICAgICAgICAgICAgIGZsb2F0ZWQucHVzaCh2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5vblBvc2l0aW9uZWQucHVzaCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIChmdW5jdGlvbiB3YWxrKGFycikge1xuICAgICAgICAgICAgYXJyLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgbGlzdC5wdXNoKHYpO1xuICAgICAgICAgICAgICBpZiAodi5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIHdhbGsodi5jaGlsZHJlbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pKG5vblBvc2l0aW9uZWQuY29uY2F0KGZsb2F0ZWQsIHBvc2l0aW9uZWQpKTtcblxuICAgICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgaWYgKHYuY29udGV4dCkge1xuICAgICAgICAgICAgICBzb3J0Wih2LmNvbnRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcXVldWUucHVzaCh2Lm5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgc29ydFoocm9vdENvbnRleHQpO1xuXG4gICAgICByZXR1cm4gcXVldWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVuZGVyZXIocmVuZGVyZXJOYW1lKSB7XG4gICAgICB2YXIgcmVuZGVyZXI7XG5cbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5yZW5kZXJlciA9PT0gXCJzdHJpbmdcIiAmJiBfaHRtbDJjYW52YXMuUmVuZGVyZXJbcmVuZGVyZXJOYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlbmRlcmVyID0gX2h0bWwyY2FudmFzLlJlbmRlcmVyW3JlbmRlcmVyTmFtZV0ob3B0aW9ucyk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiByZW5kZXJlck5hbWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZW5kZXJlciA9IHJlbmRlcmVyTmFtZShvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcmVuZGVyZXJcIik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgcmVuZGVyZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJlbmRlcmVyIGRlZmluZWRcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVuZGVyZXI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldFJlbmRlcmVyKG9wdGlvbnMucmVuZGVyZXIpKHBhcnNlUXVldWUsIG9wdGlvbnMsIGRvY3VtZW50LCBjcmVhdGVSZW5kZXJRdWV1ZShwYXJzZVF1ZXVlLnN0YWNrKSwgX2h0bWwyY2FudmFzKTtcbiAgfTtcblxuICBfaHRtbDJjYW52YXMuVXRpbC5TdXBwb3J0ID0gZnVuY3Rpb24gKG9wdGlvbnMsIGRvYykge1xuXG4gICAgZnVuY3Rpb24gc3VwcG9ydFNWR1JlbmRlcmluZygpIHtcbiAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKSxcbiAgICAgICAgY2FudmFzID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksXG4gICAgICAgIGN0eCA9IChjYW52YXMuZ2V0Q29udGV4dCA9PT0gdW5kZWZpbmVkKSA/IGZhbHNlIDogY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgIGlmIChjdHggPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5oZWlnaHQgPSAxMDtcbiAgICAgIGltZy5zcmMgPSBbXG4gICAgICAgIFwiZGF0YTppbWFnZS9zdmcreG1sLFwiLFxuICAgICAgICBcIjxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nMTAnIGhlaWdodD0nMTAnPlwiLFxuICAgICAgICBcIjxmb3JlaWduT2JqZWN0IHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+XCIsXG4gICAgICAgIFwiPGRpdiB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcgc3R5bGU9J3dpZHRoOjEwO2hlaWdodDoxMDsnPlwiLFxuICAgICAgICBcInN1cFwiLFxuICAgICAgICBcIjwvZGl2PlwiLFxuICAgICAgICBcIjwvZm9yZWlnbk9iamVjdD5cIixcbiAgICAgICAgXCI8L3N2Zz5cIlxuICAgICAgXS5qb2luKFwiXCIpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICAgICAgICBjYW52YXMudG9EYXRhVVJMKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIF9odG1sMmNhbnZhcy5VdGlsLmxvZygnaHRtbDJjYW52YXM6IFBhcnNlOiBTVkcgcG93ZXJlZCByZW5kZXJpbmcgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBUZXN0IHdoZXRoZXIgd2UgY2FuIHVzZSByYW5nZXMgdG8gbWVhc3VyZSBib3VuZGluZyBib3hlc1xuICAgIC8vIE9wZXJhIGRvZXNuJ3QgcHJvdmlkZSB2YWxpZCBib3VuZHMuaGVpZ2h0L2JvdHRvbSBldmVuIHRob3VnaCBpdCBzdXBwb3J0cyB0aGUgbWV0aG9kLlxuXG4gICAgZnVuY3Rpb24gc3VwcG9ydFJhbmdlQm91bmRzKCkge1xuICAgICAgdmFyIHIsIHRlc3RFbGVtZW50LCByYW5nZUJvdW5kcywgcmFuZ2VIZWlnaHQsIHN1cHBvcnQgPSBmYWxzZTtcblxuICAgICAgaWYgKGRvYy5jcmVhdGVSYW5nZSkge1xuICAgICAgICByID0gZG9jLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIGlmIChyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCkge1xuICAgICAgICAgIHRlc3RFbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2JvdW5kdGVzdCcpO1xuICAgICAgICAgIHRlc3RFbGVtZW50LnN0eWxlLmhlaWdodCA9IFwiMTIzcHhcIjtcbiAgICAgICAgICB0ZXN0RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKHRlc3RFbGVtZW50KTtcblxuICAgICAgICAgIHIuc2VsZWN0Tm9kZSh0ZXN0RWxlbWVudCk7XG4gICAgICAgICAgcmFuZ2VCb3VuZHMgPSByLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgIHJhbmdlSGVpZ2h0ID0gcmFuZ2VCb3VuZHMuaGVpZ2h0O1xuXG4gICAgICAgICAgaWYgKHJhbmdlSGVpZ2h0ID09PSAxMjMpIHtcbiAgICAgICAgICAgIHN1cHBvcnQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkb2MuYm9keS5yZW1vdmVDaGlsZCh0ZXN0RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN1cHBvcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJhbmdlQm91bmRzOiBzdXBwb3J0UmFuZ2VCb3VuZHMoKSxcbiAgICAgIHN2Z1JlbmRlcmluZzogb3B0aW9ucy5zdmdSZW5kZXJpbmcgJiYgc3VwcG9ydFNWR1JlbmRlcmluZygpXG4gICAgfTtcbiAgfTtcbiAgd2luZG93Lmh0bWwyY2FudmFzID0gZnVuY3Rpb24gKGVsZW1lbnRzLCBvcHRzKSB7XG5cbiAgICBlbGVtZW50cyA9IChlbGVtZW50cy5sZW5ndGgpID8gZWxlbWVudHMgOiBbZWxlbWVudHNdO1xuICAgIHZhciBxdWV1ZSxcbiAgICAgIGNhbnZhcyxcbiAgICAgIG9wdGlvbnMgPSB7XG5cbiAgICAgICAgLy8gZ2VuZXJhbFxuICAgICAgICBsb2dnaW5nOiBmYWxzZSxcbiAgICAgICAgY29udGFpbmVyOiBudWxsLFxuICAgICAgICBlbGVtZW50czogZWxlbWVudHMsXG4gICAgICAgIGJhY2tncm91bmQ6IHVuZGVmaW5lZCxcblxuICAgICAgICAvLyBwcmVsb2FkIG9wdGlvbnNcbiAgICAgICAgcHJveHk6IG51bGwsXG4gICAgICAgIHRpbWVvdXQ6IDAsIC8vIG5vIHRpbWVvdXRcbiAgICAgICAgdXNlQ09SUzogZmFsc2UsIC8vIHRyeSB0byBsb2FkIGltYWdlcyBhcyBDT1JTICh3aGVyZSBhdmFpbGFibGUpLCBiZWZvcmUgZmFsbGluZyBiYWNrIHRvIHByb3h5XG4gICAgICAgIGFsbG93VGFpbnQ6IGZhbHNlLCAvLyB3aGV0aGVyIHRvIGFsbG93IGltYWdlcyB0byB0YWludCB0aGUgY2FudmFzLCB3b24ndCBuZWVkIHByb3h5IGlmIHNldCB0byB0cnVlXG5cbiAgICAgICAgLy8gcGFyc2Ugb3B0aW9uc1xuICAgICAgICBzdmdSZW5kZXJpbmc6IGZhbHNlLCAvLyB1c2Ugc3ZnIHBvd2VyZWQgcmVuZGVyaW5nIHdoZXJlIGF2YWlsYWJsZSAoRkYxMSspXG4gICAgICAgIGlnbm9yZUVsZW1lbnRzOiBcIklGUkFNRXxPQkpFQ1R8UEFSQU1cIixcbiAgICAgICAgdXNlT3ZlcmZsb3c6IHRydWUsXG4gICAgICAgIGxldHRlclJlbmRlcmluZzogZmFsc2UsXG4gICAgICAgIGNoaW5lc2U6IGZhbHNlLFxuXG4gICAgICAgIC8vIHJlbmRlciBvcHRpb25zXG4gICAgICAgIHdpZHRoOiBudWxsLFxuICAgICAgICBoZWlnaHQ6IG51bGwsXG4gICAgICAgIHNjYWxlOiAxLFxuICAgICAgICB0YWludFRlc3Q6IHRydWUsIC8vIGRvIGEgdGFpbnQgdGVzdCB3aXRoIGFsbCBpbWFnZXMgYmVmb3JlIGFwcGx5aW5nIHRvIGNhbnZhc1xuICAgICAgICByZW5kZXJlcjogXCJDYW52YXNcIlxuICAgICAgfTtcblxuICAgIG9wdGlvbnMgPSBfaHRtbDJjYW52YXMuVXRpbC5FeHRlbmQob3B0cywgb3B0aW9ucyk7XG4gICAgdmFyIGNvbnRhaW5lciA9IG9wdGlvbnMuY29udGFpbmVyIHx8wqBvcHRpb25zLmVsZW1lbnRzWzBdO1xuICAgIGlmKG9wdGlvbnNbXCJ3aWR0aFwiXSkgIG9wdGlvbnNbXCJ3aWR0aFwiXSAgPSAob3B0aW9uc1tcIndpZHRoXCJdLmluZGV4T2YoXCIlXCIpICE9PSAtMSkgPyBjb250YWluZXIud2lkdGgoKSAqIHBhcnNlRmxvYXQob3B0aW9uc1tcIndpZHRoXCJdKSAvIDEwMCA6IG9wdGlvbnNbXCJ3aWR0aFwiXTtcbiAgICBpZihvcHRpb25zW1wiaGVpZ2h0XCJdKSBvcHRpb25zW1wiaGVpZ2h0XCJdID0gKG9wdGlvbnNbXCJoZWlnaHRcIl0uaW5kZXhPZihcIiVcIikgIT09IC0xKSA/IGNvbnRhaW5lci5oZWlnaHQoKSAqIHBhcnNlRmxvYXQob3B0aW9uc1tcImhlaWdodFwiXSkgLyAxMDAgOiBvcHRpb25zW1wiaGVpZ2h0XCJdO1xuICAgIGlmKG9wdGlvbnNbXCJsZWZ0XCJdKSBvcHRpb25zW1wibGVmdFwiXSA9IChvcHRpb25zW1wibGVmdFwiXS5pbmRleE9mKFwiJVwiKSAhPT0gLTEpID8gJChlbGVtZW50c1swXSkud2lkdGgoKSAqIHBhcnNlRmxvYXQob3B0aW9uc1tcImxlZnRcIl0pIC8gMTAwIDogb3B0aW9uc1tcImxlZnRcIl07XG4gICAgaWYob3B0aW9uc1tcInRvcFwiXSkgb3B0aW9uc1tcInRvcFwiXSA9IChvcHRpb25zW1widG9wXCJdLmluZGV4T2YoXCIlXCIpICE9PSAtMSkgPyAkKGVsZW1lbnRzWzBdKS5oZWlnaHQoKSAqIHBhcnNlRmxvYXQob3B0aW9uc1tcInRvcFwiXSkgLyAxMDAgOiBvcHRpb25zW1widG9wXCJdO1xuICAgIF9odG1sMmNhbnZhcy5sb2dnaW5nID0gb3B0aW9ucy5sb2dnaW5nO1xuICAgIG9wdGlvbnMuY29tcGxldGUgPSBmdW5jdGlvbiAoaW1hZ2VzKSB7XG5cbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbnByZWxvYWRlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmIChvcHRpb25zLm9ucHJlbG9hZGVkKGltYWdlcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBxdWV1ZSA9IF9odG1sMmNhbnZhcy5QYXJzZShpbWFnZXMsIG9wdGlvbnMpO1xuXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25wYXJzZWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAob3B0aW9ucy5vbnBhcnNlZChxdWV1ZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbnZhcyA9IF9odG1sMmNhbnZhcy5SZW5kZXJlcihxdWV1ZSwgb3B0aW9ucyk7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25yZW5kZXJlZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG9wdGlvbnMub25yZW5kZXJlZChjYW52YXMpO1xuICAgICAgfVxuXG5cbiAgICB9O1xuXG4gICAgLy8gZm9yIHBhZ2VzIHdpdGhvdXQgaW1hZ2VzLCB3ZSBzdGlsbCB3YW50IHRoaXMgdG8gYmUgYXN5bmMsIGkuZS4gcmV0dXJuIG1ldGhvZHMgYmVmb3JlIGV4ZWN1dGluZ1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIF9odG1sMmNhbnZhcy5QcmVsb2FkKG9wdGlvbnMpO1xuICAgIH0sIDApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlbmRlcjogZnVuY3Rpb24gKHF1ZXVlLCBvcHRzKSB7XG4gICAgICAgIHJldHVybiBfaHRtbDJjYW52YXMuUmVuZGVyZXIocXVldWUsIF9odG1sMmNhbnZhcy5VdGlsLkV4dGVuZChvcHRzLCBvcHRpb25zKSk7XG4gICAgICB9LFxuICAgICAgcGFyc2U6IGZ1bmN0aW9uIChpbWFnZXMsIG9wdHMpIHtcbiAgICAgICAgcmV0dXJuIF9odG1sMmNhbnZhcy5QYXJzZShpbWFnZXMsIF9odG1sMmNhbnZhcy5VdGlsLkV4dGVuZChvcHRzLCBvcHRpb25zKSk7XG4gICAgICB9LFxuICAgICAgcHJlbG9hZDogZnVuY3Rpb24gKG9wdHMpIHtcbiAgICAgICAgcmV0dXJuIF9odG1sMmNhbnZhcy5QcmVsb2FkKF9odG1sMmNhbnZhcy5VdGlsLkV4dGVuZChvcHRzLCBvcHRpb25zKSk7XG4gICAgICB9LFxuICAgICAgbG9nOiBfaHRtbDJjYW52YXMuVXRpbC5sb2dcbiAgICB9O1xuICB9O1xuXG4gIHdpbmRvdy5odG1sMmNhbnZhcy5sb2cgPSBfaHRtbDJjYW52YXMuVXRpbC5sb2c7IC8vIGZvciByZW5kZXJlcnNcbiAgd2luZG93Lmh0bWwyY2FudmFzLlJlbmRlcmVyID0ge1xuICAgIENhbnZhczogdW5kZWZpbmVkIC8vIFdlIGFyZSBhc3N1bWluZyB0aGlzIHdpbGwgYmUgdXNlZFxuICB9O1xuICBfaHRtbDJjYW52YXMuUmVuZGVyZXIuQ2FudmFzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdmFyIGRvYyA9IGRvY3VtZW50LFxuICAgICAgc2FmZUltYWdlcyA9IFtdLFxuICAgICAgdGVzdENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksXG4gICAgICB0ZXN0Y3R4ID0gdGVzdENhbnZhcy5nZXRDb250ZXh0KFwiMmRcIiksXG4gICAgICBVdGlsID0gX2h0bWwyY2FudmFzLlV0aWwsXG4gICAgICBjYW52YXMgPSBvcHRpb25zLmNhbnZhcyB8fCBkb2MuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTaGFwZShjdHgsIGFyZ3MpIHtcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIGN0eFthcmcubmFtZV0uYXBwbHkoY3R4LCBhcmdbJ2FyZ3VtZW50cyddKTtcbiAgICAgIH0pO1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhZmVJbWFnZShpdGVtKSB7XG4gICAgICBpZiAoc2FmZUltYWdlcy5pbmRleE9mKGl0ZW1bJ2FyZ3VtZW50cyddWzBdLnNyYykgPT09IC0xKSB7XG4gICAgICAgIHRlc3RjdHguZHJhd0ltYWdlKGl0ZW1bJ2FyZ3VtZW50cyddWzBdLCAwLCAwKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0ZXN0Y3R4LmdldEltYWdlRGF0YSgwLCAwLCAxLCAxKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHRlc3RDYW52YXMgPSBkb2MuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgICB0ZXN0Y3R4ID0gdGVzdENhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHNhZmVJbWFnZXMucHVzaChpdGVtWydhcmd1bWVudHMnXVswXS5zcmMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVySXRlbShjdHgsIGl0ZW0pIHtcbiAgICAgIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJ2YXJpYWJsZVwiOlxuICAgICAgICAgIGN0eFtpdGVtLm5hbWVdID0gaXRlbVsnYXJndW1lbnRzJ107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgICAgIHN3aXRjaCAoaXRlbS5uYW1lKSB7XG4gICAgICAgICAgICBjYXNlIFwiY3JlYXRlUGF0dGVyblwiOlxuICAgICAgICAgICAgICBpZiAoaXRlbVsnYXJndW1lbnRzJ11bMF0ud2lkdGggPiAwICYmIGl0ZW1bJ2FyZ3VtZW50cyddWzBdLmhlaWdodCA+IDApIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGN0eC5jcmVhdGVQYXR0ZXJuKGl0ZW1bJ2FyZ3VtZW50cyddWzBdLCBcInJlcGVhdFwiKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICBVdGlsLmxvZyhcImh0bWwyY2FudmFzOiBSZW5kZXJlcjogRXJyb3IgY3JlYXRpbmcgcGF0dGVyblwiLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJkcmF3U2hhcGVcIjpcbiAgICAgICAgICAgICAgY3JlYXRlU2hhcGUoY3R4LCBpdGVtWydhcmd1bWVudHMnXSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImRyYXdJbWFnZVwiOlxuICAgICAgICAgICAgICBpZiAoaXRlbVsnYXJndW1lbnRzJ11bOF0gPiAwICYmIGl0ZW1bJ2FyZ3VtZW50cyddWzddID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy50YWludFRlc3QgfHwgKG9wdGlvbnMudGFpbnRUZXN0ICYmIHNhZmVJbWFnZShpdGVtKSkpIHtcbiAgICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UuYXBwbHkoY3R4LCBpdGVtWydhcmd1bWVudHMnXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgY3R4W2l0ZW0ubmFtZV0uYXBwbHkoY3R4LCBpdGVtWydhcmd1bWVudHMnXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJyb3dzZXJJbmZvKCkge1xuICAgICAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgdGVtLFxuICAgICAgICBNID0gdWEubWF0Y2goLyhvcGVyYXxjaHJvbWV8c2FmYXJpfGZpcmVmb3h8bXNpZXx0cmlkZW50KD89XFwvKSlcXC8/XFxzKihcXGQrKS9pKSB8fCBbXTtcbiAgICAgIGlmICgvdHJpZGVudC9pLnRlc3QoTVsxXSkpIHtcbiAgICAgICAgdGVtID0gL1xcYnJ2WyA6XSsoXFxkKykvZy5leGVjKHVhKSB8fCBbXTtcbiAgICAgICAgcmV0dXJuIFsnSUUnLCAodGVtWzFdIHx8ICcnKV07XG4gICAgICB9XG4gICAgICBpZiAoTVsxXSA9PT0gJ0Nocm9tZScpIHtcbiAgICAgICAgdGVtID0gdWEubWF0Y2goL1xcYihPUFJ8RWRnZT8pXFwvKFxcZCspLyk7XG4gICAgICAgIGlmICh0ZW0gIT0gbnVsbCkge1xuICAgICAgICAgIHZhciBzdGVtID0gdGVtLnNsaWNlKDEpO1xuICAgICAgICAgIHN0ZW1bMF0ucmVwbGFjZSgnT1BSJywgJ09wZXJhJykucmVwbGFjZSgnRWRnICcsICdFZGdlICcpO1xuICAgICAgICAgIHJldHVybiBzdGVtO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBNID0gTVsyXSA/IFtNWzFdLCBNWzJdXSA6IFtuYXZpZ2F0b3IuYXBwTmFtZSwgbmF2aWdhdG9yLmFwcFZlcnNpb24sICctPyddO1xuICAgICAgaWYgKCh0ZW0gPSB1YS5tYXRjaCgvdmVyc2lvblxcLyhcXGQrKS9pKSkgIT0gbnVsbCkgTS5zcGxpY2UoMSwgMSwgdGVtWzFdKTtcbiAgICAgIHJldHVybiBNO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJyb3dzZXJDYW52YXNMaW1pdChzY2FsZSkge1xuICAgICAgdmFyIGJyb3dzZXIgPSBnZXRCcm93c2VySW5mbygpWzBdO1xuICAgICAgdmFyIHJlc3RyaWN0aW9ucyA9IHtcbiAgICAgICAgREVGQVVMVDoge1xuICAgICAgICAgIHdpZHRoOiA4MTkyLFxuICAgICAgICAgIGhlaWdodDogODE5MlxuICAgICAgICB9LFxuICAgICAgICBFZGdlOiB7XG4gICAgICAgICAgd2lkdGg6IDgxOTIsXG4gICAgICAgICAgaGVpZ2h0OiA4MTkyXG4gICAgICAgIH0sXG4gICAgICAgIEZpcmVmb3g6IHtcbiAgICAgICAgICB3aWR0aDogMzI3NjcsXG4gICAgICAgICAgaGVpZ2h0OiAzMjc2N1xuICAgICAgICB9LFxuICAgICAgICBTYWZhcmk6IHtcbiAgICAgICAgICB3aWR0aDogMzI3NjcsXG4gICAgICAgICAgaGVpZ2h0OiAzMjc2N1xuICAgICAgICB9LFxuICAgICAgICBDaHJvbWU6IHtcbiAgICAgICAgICB3aWR0aDogMzI3NjcsXG4gICAgICAgICAgaGVpZ2h0OiAzMjc2N1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbcmVzdHJpY3Rpb25zW2Jyb3dzZXJdIHx8IHJlc3RyaWN0aW9uc1snREVGQVVMVCddLCBicm93c2VyXVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAocGFyc2VkRGF0YSwgb3B0aW9ucywgZG9jdW1lbnQsIHF1ZXVlLCBfaHRtbDJjYW52YXMpIHtcbiAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLFxuICAgICAgICBuZXdDYW52YXMsXG4gICAgICAgIGJvdW5kcyxcbiAgICAgICAgYm91bmRTY2FsZUtleXMsXG4gICAgICAgIGZzdHlsZSxcbiAgICAgICAgelN0YWNrID0gcGFyc2VkRGF0YS5zdGFjaztcblxuICAgICAgaWYgKG9wdGlvbnMuZHBpKVxuICAgICAgICBvcHRpb25zLnNjYWxlID0gb3B0aW9ucy5kcGkgLyA5NjtcblxuICAgICAgdmFyIGJyb3dzZXJDYW52YXNMaW1pdCA9IGdldEJyb3dzZXJDYW52YXNMaW1pdChvcHRpb25zLnNjYWxlKTtcbiAgICAgIHZhciBjYW52YXNMaW1pdCA9IGJyb3dzZXJDYW52YXNMaW1pdFswXTtcblxuICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLnN0eWxlLndpZHRoID0gTWF0aC5taW4oKG9wdGlvbnMud2lkdGggfHwgelN0YWNrLmN0eC53aWR0aCkgKiBvcHRpb25zLnNjYWxlLCBjYW52YXNMaW1pdC53aWR0aCk7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLnN0eWxlLmhlaWdodCA9IE1hdGgubWluKChvcHRpb25zLmhlaWdodCB8fCB6U3RhY2suY3R4LmhlaWdodCkgKiBvcHRpb25zLnNjYWxlLCBjYW52YXNMaW1pdC5oZWlnaHQpO1xuXG4gICAgICBmc3R5bGUgPSBjdHguZmlsbFN0eWxlO1xuICAgICAgY3R4LnNjYWxlKG9wdGlvbnMuc2NhbGUsIG9wdGlvbnMuc2NhbGUpO1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IChVdGlsLmlzVHJhbnNwYXJlbnQocGFyc2VkRGF0YS5iYWNrZ3JvdW5kQ29sb3IpICYmIG9wdGlvbnMuYmFja2dyb3VuZCAhPT0gdW5kZWZpbmVkKSA/IG9wdGlvbnMuYmFja2dyb3VuZCA6IHBhcnNlZERhdGEuYmFja2dyb3VuZENvbG9yO1xuICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICBjdHguZmlsbFN0eWxlID0gZnN0eWxlO1xuXG4gICAgICBxdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChzdG9yYWdlQ29udGV4dCkge1xuICAgICAgICAvLyBzZXQgY29tbW9uIHNldHRpbmdzIGZvciBjYW52YXNcbiAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IFwiYm90dG9tXCI7XG4gICAgICAgIGN0eC5zYXZlKCk7XG5cbiAgICAgICAgaWYgKHN0b3JhZ2VDb250ZXh0LnRyYW5zZm9ybS5tYXRyaXgpIHtcbiAgICAgICAgICBjdHgudHJhbnNsYXRlKHN0b3JhZ2VDb250ZXh0LnRyYW5zZm9ybS5vcmlnaW5bMF0sIHN0b3JhZ2VDb250ZXh0LnRyYW5zZm9ybS5vcmlnaW5bMV0pO1xuICAgICAgICAgIGN0eC50cmFuc2Zvcm0uYXBwbHkoY3R4LCBzdG9yYWdlQ29udGV4dC50cmFuc2Zvcm0ubWF0cml4KTtcbiAgICAgICAgICBjdHgudHJhbnNsYXRlKC1zdG9yYWdlQ29udGV4dC50cmFuc2Zvcm0ub3JpZ2luWzBdLCAtc3RvcmFnZUNvbnRleHQudHJhbnNmb3JtLm9yaWdpblsxXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RvcmFnZUNvbnRleHQuY2xpcCkge1xuICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICBjdHgucmVjdChzdG9yYWdlQ29udGV4dC5jbGlwLmxlZnQsIHN0b3JhZ2VDb250ZXh0LmNsaXAudG9wLCBzdG9yYWdlQ29udGV4dC5jbGlwLndpZHRoLCBzdG9yYWdlQ29udGV4dC5jbGlwLmhlaWdodCk7XG4gICAgICAgICAgY3R4LmNsaXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdG9yYWdlQ29udGV4dC5jdHguc3RvcmFnZSkge1xuICAgICAgICAgIHN0b3JhZ2VDb250ZXh0LmN0eC5zdG9yYWdlLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJlbmRlckl0ZW0oY3R4LCBpdGVtKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICB9KTtcblxuICAgICAgVXRpbC5sb2coXCJodG1sMmNhbnZhczogUmVuZGVyZXI6IENhbnZhcyByZW5kZXJlciBkb25lLCBzY2FsZWQgYXQgXCIgKyBvcHRpb25zLnNjYWxlICsgXCIgLSByZXR1cm5pbmcgY2FudmFzIG9ialwiKTtcblxuICAgICAgaWYgKG9wdGlvbnMuZWxlbWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5lbGVtZW50c1swXSA9PT0gXCJvYmplY3RcIiAmJiBvcHRpb25zLmVsZW1lbnRzWzBdLm5vZGVOYW1lICE9PSBcIkJPRFlcIikge1xuICAgICAgICAgIC8vIGNyb3AgaW1hZ2UgdG8gdGhlIGJvdW5kcyBvZiBzZWxlY3RlZCAoc2luZ2xlKSBlbGVtZW50XG5cbiAgICAgICAgICB2YXIgY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXIgfHwgb3B0aW9ucy5lbGVtZW50cztcblxuICAgICAgICAgIGJvdW5kcyA9IF9odG1sMmNhbnZhcy5VdGlsLkJvdW5kcyhjb250YWluZXJbMF0pO1xuICAgICAgICAgIGJvdW5kcy53aWR0aCAgPSBvcHRpb25zW1wid2lkdGhcIl0gIHx8IGJvdW5kcy53aWR0aDtcbiAgICAgICAgICBib3VuZHMuaGVpZ2h0ID0gb3B0aW9uc1tcImhlaWdodFwiXSB8fCBib3VuZHMuaGVpZ2h0O1xuXG4gICAgICAgICAgYm91bmRTY2FsZUtleXMgPSBbJ3dpZHRoJywgJ2hlaWdodCcsICd0b3AnLCAnbGVmdCddO1xuXG4gICAgICAgICAgYm91bmRTY2FsZUtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgbGltaXRLZXkgPSBbJ3dpZHRoJywgJ2xlZnQnXS5pbmRleE9mKGtleSkgPT09IC0xID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xuICAgICAgICAgICAgYm91bmRzW2tleV0gPSBNYXRoLm1pbihib3VuZHNba2V5XSAqIG9wdGlvbnMuc2NhbGUsIGNhbnZhc0xpbWl0W2xpbWl0S2V5XSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBuZXdDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICBuZXdDYW52YXMud2lkdGggPSBNYXRoLm1pbihib3VuZHMud2lkdGgsIGNhbnZhc0xpbWl0LndpZHRoKTtcbiAgICAgICAgICBuZXdDYW52YXMuaGVpZ2h0ID0gTWF0aC5taW4oYm91bmRzLmhlaWdodCwgY2FudmFzTGltaXQuaGVpZ2h0KTtcbiAgICAgICAgICBuZXdDYW52YXMuc3R5bGUud2lkdGggPSBuZXdDYW52YXMud2lkdGggKyAncHgnO1xuICAgICAgICAgIG5ld0NhbnZhcy5zdHlsZS5oZWlnaHQgPSBuZXdDYW52YXMuaGVpZ2h0ICsgJ3B4JztcblxuICAgICAgICAgIGN0eCA9IG5ld0NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgICAgY3R4LmRyYXdJbWFnZShjYW52YXMsIGJvdW5kcy5sZWZ0LCBib3VuZHMudG9wLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIDAsIDAsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCk7XG4gICAgICAgICAgY2FudmFzID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gbmV3Q2FudmFzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjYW52YXM7XG4gICAgfTtcbiAgfTtcbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuXG4vKipcbiAqIEpRdWVyeSBXcmFwcGVyOlxuICogLSBpbmNsdWRlcyBzb21lIGFkZGl0aW9uYWwgcGFyYW1ldGVycyAoZHBpLCB3aWR0aC9oZWlnaHQsIG9iamVjdC1maXQpXG4gKiAtIHBvc3QtcHJvY2VzcyBmZWF0dXJlc1xuICovXG4oZnVuY3Rpb24gKCQpIHtcbiAgJC5mbi5odG1sMmNhbnZhcyA9IGZ1bmN0aW9uIChjb250YWluZXIgPSBcIiNodG1sMmNhbnZhc1wiLCBvcHRzID0ge30sIG9ucmVuZGVyZWRDYWxsYmFjayA9IG51bGwpIHtcblxuICAgIGlmKE9iamVjdC5rZXlzKHRoaXMpLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIGlmKCQoY29udGFpbmVyKS5sZW5ndGggPCAxKSByZXR1cm47XG5cbiAgICAvLyBSZXBlYXQgZnVuY3Rpb24gdG8gcHJldmVudCBsb2FkaW5nIGlzc3Vlc1xuICAgIGZ1bmN0aW9uIHNldEludGVydmFsTihjYWxsYmFjaywgZGVsYXksIG5yZXBlYXQpIHtcblxuICAgICAgdmFyIHggPSAwO1xuXG4gICAgICBpZiAobnJlcGVhdCA8IDEpIHJldHVybjtcbiAgICAgIGNhbGxiYWNrKCk7XG5cbiAgICAgIG5yZXBlYXQgPSBucmVwZWF0IC0gMTtcbiAgICAgIGlmIChucmVwZWF0IDwgMSkgcmV0dXJuO1xuXG4gICAgICB2YXIgaW50ZXJ2YWxJRCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIGlmICgrK3ggPT09IG5yZXBlYXQpXG4gICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJRCk7XG4gICAgICB9LCBkZWxheSk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lICNyZXBldGl0aW9uICsgZGVsYXlcbiAgICB2YXIgbnJlcGVhdCA9IG9wdHNbXCJyZXBlYXRcIl0gfHwgb3B0c1tcIk5cIl0gfHwgMTtcbiAgICB2YXIgZGVsYXkgPSBvcHRzW1wiZGVsYXlcIl0gfHwgb3B0c1tcInRcIl0gfHwgMTAwO1xuICAgIHNldEludGVydmFsTihmdW5jdGlvbiAoKSB7XG5cbiAgICAgIG9wdHNbXCJ1c2VDT1JTXCJdID0gb3B0c1tcInVzZUNPUlNcIl0gfHwgdHJ1ZTtcbiAgICAgIG9wdHNbXCJibHVyXCJdID0gb3B0c1tcImJsdXJcIl0gfHwgMDtcbiAgICAgIG9wdHNbXCJkcGlcIl0gPSBvcHRzW1wiZHBpXCJdIHx8IDk2ICogMjtcbiAgICAgIG9wdHNbXCJpbnNlcnRcIl0gPSBvcHRzW1wiaW5zZXJ0XCJdIHx8IFwiYXBwZW5kXCI7XG5cbiAgICAgIG9wdHNbXCJjb250YWluZXJcIl0gPSAkKGNvbnRhaW5lcik7XG4gICAgICBvcHRzW1wib25yZW5kZXJlZFwiXSA9IG9ucmVuZGVyZWRDYWxsYmFjayB8fFxuICAgICAgICBmdW5jdGlvbiAoY2FudmFzKSB7XG5cbiAgICAgICAgICAkKGNvbnRhaW5lciArIFwiID4gY2FudmFzXCIpLnJlbW92ZSgpO1xuICAgICAgICAgIGlmIChvcHRzW1wiaW5zZXJ0XCJdID09IFwicHJlcGVuZFwiKSAkKGNvbnRhaW5lcikucHJlcGVuZChjYW52YXMpO1xuICAgICAgICAgIGVsc2UgJChjb250YWluZXIpLmFwcGVuZChjYW52YXMpO1xuXG4gICAgICAgICAgJChjb250YWluZXIgKyBcIiA+IGNhbnZhc1wiKS5lYWNoKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIGZpbHRlclZhbCA9ICdibHVyKCcgKyBvcHRzW1wiYmx1clwiXSArICdweCknO1xuICAgICAgICAgICAgdmFyIHNjYWxlID0gb3B0c1tcImRwaVwiXSAvIDk2IHx8IDE7XG5cbiAgICAgICAgICAgICQodGhpcylcbiAgICAgICAgICAgICAgLmNzcygnZmlsdGVyJywgZmlsdGVyVmFsKVxuICAgICAgICAgICAgICAuY3NzKCd3ZWJraXRGaWx0ZXInLCBmaWx0ZXJWYWwpXG4gICAgICAgICAgICAgIC5jc3MoJ21vekZpbHRlcicsIGZpbHRlclZhbClcbiAgICAgICAgICAgICAgLmNzcygnb0ZpbHRlcicsIGZpbHRlclZhbClcbiAgICAgICAgICAgICAgLmNzcygnbXNGaWx0ZXInLCBmaWx0ZXJWYWwpXG4gICAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgJCh0aGlzKS53aWR0aCgpIC8gc2NhbGUpXG4gICAgICAgICAgICAgIC5jc3MoJ2hlaWdodCcsICQodGhpcykuaGVpZ2h0KCkgLyBzY2FsZSk7XG5cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgLy8gQ2FsbCBodG1sMmNhbnZhc1xuICAgICAgaHRtbDJjYW52YXModGhpcywgb3B0cyk7XG5cbiAgICB9LmJpbmQodGhpcyksIGRlbGF5LCBucmVwZWF0KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG59KShqUXVlcnkpO1xuXG53aW5kb3cuaHRtbDJjYW52YXNfdGlsZW1hcCA9IGZ1bmN0aW9uIChlbCkge1xuXG4gIGlmKE9iamVjdC5rZXlzKGVsKS5sZW5ndGggPT09IDApIHJldHVybjtcbiAgaWYoZWwubGVuZ3RoID09IDAgfHwgZWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gIHZhciBjYW52YXMgPSAkKGVsKVswXTtcbiAgaWYoY2FudmFzLnRhZ05hbWUgIT0gXCJDQU5WQVNcIilcbiAgICB0aHJvdyBcIkVsZW1lbnQgcGFzc2VkIHRocm91Z2ggaHRtbDJjYW52YXNfdGlsZW1hcCgpIG11c3QgYmUgYSBjYW52YXNcIjtcblxuICAkKGVsKS5jc3MoXCJvYmplY3QtZml0XCIsIFwiY292ZXJcIik7XG4gICQoZWwpLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XG4gICQoZWwpLmNzcyhcInRvcFwiLCBcIjUwJVwiKTtcbiAgJChlbCkuY3NzKFwibGVmdFwiLCBcIjUwJVwiKTtcbiAgJChlbCkuY3NzKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKC01MCUsIC01MCUpXCIpO1xuICAkKGVsKS5jc3MoXCJ3aWR0aFwiLCBcIjEwMCVcIik7XG4gICQoZWwpLmNzcyhcImhlaWdodFwiLCBcIjEwMCVcIik7XG5cbiAgdmFyIHNyYyA9IGNhbnZhcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNyY1wiKTtcbiAgdmFyIHdpZHRoID0gcGFyc2VJbnQoY2FudmFzLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpKTtcbiAgdmFyIGhlaWdodCA9IHBhcnNlSW50KGNhbnZhcy5nZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIikpO1xuICB2YXIgc2NhbGUgPSBwYXJzZUZsb2F0KHBhcnNlSW50KCQoY2FudmFzKS5jc3MoXCJ3aWR0aFwiKSkvd2lkdGgpIHx8wqAxO1xuXG4gIHZhciBzaWduYXR1cmUgPSBjYW52YXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zaWduYXR1cmVcIik7XG4gIHZhciB0aWxlc2l6ZSAgPSBwYXJzZUludChjYW52YXMuZ2V0QXR0cmlidXRlKFwiZGF0YS10aWxlc2l6ZVwiKSkgfHwgbnVsbDtcblxuICB2YXIgeHRpbGVzICAgID0gcGFyc2VJbnQoY2FudmFzLmdldEF0dHJpYnV0ZShcImRhdGEteHRpbGVzXCIpKTtcbiAgdmFyIHl0aWxlcyAgICA9IHBhcnNlSW50KGNhbnZhcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXl0aWxlc1wiKSk7XG4gIHZhciBtaXNzaW5nICAgPSBjYW52YXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1taXNzaW5nXCIpO1xuXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICB2YXIgdGlsZUxpc3QgPSBbXTtcblxuICAvLyBUT0RPOiBPcHRpbWl6ZSByZXNvdXJjZSBsb2FkaW5nLi5cbiAgLy8gZnVuY3Rpb24gYm91bmRzT3ZlcmxhcChyMSwgcjIpIHtcbiAgLy8gICBjb25zb2xlLmxvZyhyMSk7XG4gIC8vICAgY29uc29sZS5sb2cocjIpO1xuXG4gIC8vICAgcmV0dXJuICEocjIubGVmdCA+IHIxLnJpZ2h0IHx8XG4gIC8vICAgICAgICAgIHIyLnJpZ2h0IDwgcjEubGVmdCB8fFxuICAvLyAgICAgICAgICByMi50b3AgPiByMS5ib3R0b20gfHxcbiAgLy8gICAgICAgICAgcjIuYm90dG9tIDwgcjEudG9wKTtcbiAgLy8gfVxuXG4gIGZ1bmN0aW9uIHRpbGVzTGF6eWxvYWQoKSB7XG5cbiAgICAvLyB2YXIgbGF6eXdpZHRoICA9IHBhcnNlSW50KE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fCAwLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKS9zY2FsZSk7XG4gICAgLy8gdmFyIGxhenloZWlnaHQgPSBwYXJzZUludChNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8IDAsIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwKS9zY2FsZSk7XG4gICAgLy8gdmFyIGxhenlib3VuZHMgPSB7XG4gICAgLy8gICBsZWZ0OndpZHRoLzItbGF6eXdpZHRoLzIsICB0b3A6MCxcbiAgICAvLyAgIHJpZ2h0OndpZHRoLzIrbGF6eXdpZHRoLzIsIGJvdHRvbTpsYXp5aGVpZ2h0XG4gICAgLy8gfTtcblxuICAgIGZvcihpeCA9IDA7IGl4IDwgeHRpbGVzOyBpeCsrKSB7XG4gICAgICBmb3IoaXkgPSAwOyBpeSA8IHl0aWxlczsgaXkrKynCoHtcblxuICAgICAgICB2YXIgaW5kZXggPSBpeSp4dGlsZXMgKyBpeDtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImluZGV4OlwiLCBpbmRleCk7XG5cbiAgICAgICAgaWYodGlsZUxpc3RbaW5kZXhdID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aWxlTGlzdFtpbmRleF0gPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgICB0aWxlTGlzdFtpbmRleF0ub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5vbmVycm9yID0gXCJcIjtcbiAgICAgICAgICAgIHRoaXMuc3JjID0gbWlzc2luZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhciBkeCA9IGl4KnRpbGVzaXplLCBkeSA9IGl5KnRpbGVzaXplO1xuICAgICAgICAvLyB2YXIgZHcgPSAodGlsZXNpemUgfHwgd2lkdGgpLCBkaCA9ICh0aWxlc2l6ZSB8fCBoZWlnaHQpO1xuICAgICAgICAvLyB2YXIgdGlsZWJvdW5kcyA9IHtsZWZ0OmR4LCB0b3A6ZHksIHJpZ2h0OmR4K2R3LCBib3R0b206ZHkrZGh9O1xuXG4gICAgICAgIC8vIHZhciBsYXp5bG9hZCA9IGJvdW5kc092ZXJsYXAodGlsZWJvdW5kcywgbGF6eWJvdW5kcyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibGF6eWxvYWQ6XCIsIGxhenlsb2FkKTtcbiAgICAgICAgLy8gaWYobGF6eWxvYWQgJiYgdGlsZUxpc3RbaW5kZXhdLnNyYyA9PSBcIlwiKSB7XG4gICAgICAgIC8vICAgdGlsZUxpc3RbaW5kZXhdLnNyYyA9IHNyYyArIFwiL1wiICsgc2lnbmF0dXJlICsgXCIvXCIgKyBpbmRleDtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhcIkNhbGwuLiBcIiwgdGlsZUxpc3RbaW5kZXhdLnNyYywgbGF6eWxvYWQpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgdmFyIHRtcF9zcmMgPSBzcmM7XG4gICAgICAgIGlmKHRtcF9zcmMuaW5kZXhPZihcIntzaWduYXR1cmV9XCIpKSB0bXBfc3JjID0gdG1wX3NyYy5yZXBsYWNlQWxsKFwie3NpZ25hdHVyZX1cIiwgc2lnbmF0dXJlKTtcbiAgICAgICAgZWxzZSB0bXBfc3JjICs9IFwiL1wiICsgc2lnbmF0dXJlO1xuICAgICAgICBpZih0bXBfc3JjLmluZGV4T2YoXCJ7aWR9XCIpKSB0bXBfc3JjID0gdG1wX3NyYy5yZXBsYWNlQWxsKFwie2lkfVwiLCBpbmRleCk7XG4gICAgICAgIGVsc2UgdG1wX3NyYyArPSBcIi9cIiArIGluZGV4O1xuXG4gICAgICAgIHRpbGVMaXN0W2luZGV4XS5zcmMgPSB0bXBfc3JjO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB3aW5kb3cub25yZXNpemUgPSB0aWxlc0xhenlsb2FkO1xuICB0aWxlc0xhenlsb2FkKCk7XG5cbiAgdmFyIGR1cmF0aW9uID0gMjUwO1xuICB2YXIgdGlsZU9wYWNpdHkgPSBbXTtcbiAgdmFyIHRpbGVQYXN0ID0gW107XG4gIHZhciB0b3RhbE9wYWNpdHlNYXggPSB0aWxlTGlzdC5sZW5ndGg7XG5cbiAgaWYodG90YWxPcGFjaXR5TWF4ID09IDApIHJldHVybjtcblxuICBmdW5jdGlvbiBhbmltYXRlKHByZXNlbnQpIHtcblxuICAgIHZhciB0b3RhbE9wYWNpdHkgICAgPSAwO1xuICAgIGZvcih2YXIgaW5kZXggPSAwOyBpbmRleCA8IHh0aWxlcyp5dGlsZXM7IGluZGV4KyspIHtcblxuICAgICAgICB2YXIgdGlsZSA9IHRpbGVMaXN0W2luZGV4XTtcbiAgICAgICAgaWYodGlsZSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgIGlmKHRpbGUuY29tcGxldGUgPT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYodGlsZU9wYWNpdHlbaW5kZXhdID09IDEpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBpZih0aWxlT3BhY2l0eVtpbmRleF0gPT09IHVuZGVmaW5lZCkgdGlsZU9wYWNpdHlbaW5kZXhdID0gMDtcbiAgICAgICAgICAgIGlmKHRpbGVQYXN0W2luZGV4XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpZGxlJykpO1xuICAgICAgICAgICAgICAgIHRpbGVQYXN0W2luZGV4XSA9IHByZXNlbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkT3BhY2l0eSA9IChwcmVzZW50IC0gdGlsZVBhc3RbaW5kZXhdKSAvIGR1cmF0aW9uO1xuICAgICAgICAgICAgaWYoIXRpbGVzaXplKSBkT3BhY2l0eSA9IDE7XG5cbiAgICAgICAgICAgIHRpbGVPcGFjaXR5W2luZGV4XSArPSBkT3BhY2l0eTtcbiAgICAgICAgICAgIGlmKHRpbGVPcGFjaXR5W2luZGV4XSA+IDEpIHRpbGVPcGFjaXR5W2luZGV4XSA9IDE7XG5cbiAgICAgICAgICAgIHRvdGFsT3BhY2l0eSArPSB0aWxlT3BhY2l0eVtpbmRleF07XG4gICAgICAgICAgICB0aWxlUGFzdFtpbmRleF0gPSBwcmVzZW50O1xuXG4gICAgICAgICAgICB2YXIgaXggPSBpbmRleCAlIHh0aWxlcztcbiAgICAgICAgICAgIHZhciBpeSA9IE1hdGguZmxvb3IoaW5kZXggLyB4dGlsZXMpO1xuICAgICAgICAgICAgdmFyIGR4ID0gaXgqdGlsZXNpemUsIGR5ID0gaXkqdGlsZXNpemU7XG4gICAgICAgICAgICB2YXIgc3cgPSB0aWxlTGlzdFtpbmRleF0ud2lkdGgsIHNoID0gdGlsZUxpc3RbaW5kZXhdLmhlaWdodDtcbiAgICAgICAgICAgIHZhciBkdyA9IHRpbGVzaXplIHx8IHdpZHRoLCBkaCA9IHRpbGVzaXplIHx8IGhlaWdodDtcblxuICAgICAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gdGlsZU9wYWNpdHlbaW5kZXhdO1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSh0aWxlLCAwLDAsIHN3LHNoLCBkeCxkeSwgZHcsZGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRvdGFsT3BhY2l0eSA8IHRvdGFsT3BhY2l0eU1heCkgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICBlbHNlIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgndGlsZXNsb2FkZWQnKSk7XG4gIH1cblxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuXG5cbn1cbiIsIndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuXG4gIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdvb2dsZS10aWxlbWFwXCIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnRhaW5lci5sZW5ndGg7IGkrKykge1xuXG4gICAgdmFyIGVsID0gY29udGFpbmVyW2ldO1xuXG4gICAgaWYoZWwudGFnTmFtZSAhPSBcIkRJVlwiKVxuICAgICAgdGhyb3cgXCJFbGVtZW50IHBhc3NlZCB0aHJvdWdoIGdtX3RpbGVtYXAoKSBtdXN0IGJlIGEgZGl2XCI7XG5cbiAgICBpZiAoZWwgPT0gZG9jdW1lbnQpIGVsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgIGlmIChlbCA9PSB3aW5kb3cpIGVsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgIFxuICAgICQoZWwpLmNzcyhcIm9iamVjdC1maXRcIiwgXCJjb3ZlclwiKTtcbiAgICAkKGVsKS5jc3MoXCJwb3NpdGlvblwiLCBcInJlbGF0aXZlXCIpO1xuICAgICQoZWwpLmNzcyhcInRvcFwiLCBcIjUwJVwiKTtcbiAgICAkKGVsKS5jc3MoXCJsZWZ0XCIsIFwiNTAlXCIpO1xuICAgICQoZWwpLmNzcyhcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgtNTAlLCAtNTAlKVwiKTtcbiAgICAkKGVsKS5jc3MoXCJ3aWR0aFwiLCBcIjEwNSVcIik7XG4gICAgJChlbCkuY3NzKFwiaGVpZ2h0XCIsIFwiMTA1JVwiKTtcblxuICAgIHZhciBzcmMgPSBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNyY1wiKTtcbiAgICB2YXIgc2lnbmF0dXJlID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1zaWduYXR1cmVcIik7XG4gICAgdmFyIHRpbGVzaXplICA9IHBhcnNlSW50KGVsLmdldEF0dHJpYnV0ZShcImRhdGEtdGlsZXNpemVcIikpIHx8IG51bGw7XG4gICAgdmFyIHJlc29sdXRpb24gPSAyO1xuICAgIHZhciB4dGlsZXMgICAgPSBwYXJzZUludChlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXh0aWxlc1wiKSk7XG4gICAgdmFyIHl0aWxlcyAgICA9IHBhcnNlSW50KGVsLmdldEF0dHJpYnV0ZShcImRhdGEteXRpbGVzXCIpKTtcbiAgICB2YXIgbWlzc2luZyAgID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1taXNzaW5nXCIpO1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImxhenlsb2FkLmdtX3RpbGVtYXBcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBsYXp5QmFja2dyb3VuZHMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtYmFja2dyb3VuZC1pbWFnZV1cIik7XG5cbiAgICAgIGlmIChcIkludGVyc2VjdGlvbk9ic2VydmVyXCIgaW4gd2luZG93ICYmIFwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeVwiIGluIHdpbmRvdyAmJiBcImludGVyc2VjdGlvblJhdGlvXCIgaW4gd2luZG93LkludGVyc2VjdGlvbk9ic2VydmVyRW50cnkucHJvdG90eXBlKSB7XG4gICAgICAgIGxldCBsYXp5QmFja2dyb3VuZE9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKGZ1bmN0aW9uKGVudHJpZXMsIG9ic2VydmVyKSB7XG4gICAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcblxuICAgICAgICAgICAgICBpZihlbnRyeS50YXJnZXQuZGF0YXNldC5iYWNrZ3JvdW5kSW1hZ2UpIHtcblxuICAgICAgICAgICAgICAgIGxldCBwcmVsb2FkZXJJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZXJJbWcuc3JjID0gZW50cnkudGFyZ2V0LmRhdGFzZXQuYmFja2dyb3VuZEltYWdlO1xuICAgICAgICAgICAgICAgICAgICBwcmVsb2FkZXJJbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIChldmVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgZW50cnkudGFyZ2V0LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKCdcIitldmVudC50YXJnZXQuc3JjK1wiJylcIjtcbiAgICAgICAgICAgICAgICAgICAgICBlbnRyeS50YXJnZXQuc3R5bGUub3BhY2l0eSAgID0gXCIxXCI7XG4gICAgICAgICAgICAgICAgICAgICAgcHJlbG9hZGVySW1nID0gbnVsbDsgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBlbnRyeS50YXJnZXQucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1iYWNrZ3JvdW5kLWltYWdlXCIpOyAgICBcbiAgICAgICAgICAgICAgbGF6eUJhY2tncm91bmRPYnNlcnZlci51bm9ic2VydmUoZW50cnkudGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF6eUJhY2tncm91bmRzLmZvckVhY2goZnVuY3Rpb24obGF6eUJhY2tncm91bmQpIHtcbiAgICAgICAgICBsYXp5QmFja2dyb3VuZE9ic2VydmVyLm9ic2VydmUobGF6eUJhY2tncm91bmQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIG9iamVjdEZpdChjb250YWlucyAvKiB0cnVlID0gY29udGFpbiwgZmFsc2UgPSBjb3ZlciAqLywgY29udGFpbmVyV2lkdGgsIGNvbnRhaW5lckhlaWdodCwgd2lkdGgsIGhlaWdodCl7XG5cbiAgICAgIHZhciBkb1JhdGlvID0gd2lkdGggLyBoZWlnaHQ7XG4gICAgICB2YXIgY1JhdGlvID0gY29udGFpbmVyV2lkdGggLyBjb250YWluZXJIZWlnaHQ7XG4gICAgICB2YXIgdGFyZ2V0V2lkdGggPSAwO1xuICAgICAgdmFyIHRhcmdldEhlaWdodCA9IDA7XG4gICAgICB2YXIgdGVzdCA9IGNvbnRhaW5zID8gKGRvUmF0aW8gPiBjUmF0aW8pIDogKGRvUmF0aW8gPCBjUmF0aW8pO1xuXG4gICAgICBpZiAodGVzdCkge1xuICAgICAgICAgIHRhcmdldFdpZHRoID0gY29udGFpbmVyV2lkdGg7XG4gICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gdGFyZ2V0V2lkdGggLyBkb1JhdGlvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRIZWlnaHQgPSBjb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgdGFyZ2V0V2lkdGggPSB0YXJnZXRIZWlnaHQgKiBkb1JhdGlvO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAgIHdpZHRoOiB0YXJnZXRXaWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHRhcmdldEhlaWdodCxcbiAgICAgICAgICBsZWZ0OiAoY29udGFpbnMgPyAtMSA6IDEpICogKGNvbnRhaW5lcldpZHRoIC0gdGFyZ2V0V2lkdGgpIC8gMixcbiAgICAgICAgICB0b3A6IChjb250YWlucyA/IC0xIDogMSkgKiAoY29udGFpbmVySGVpZ2h0IC0gdGFyZ2V0SGVpZ2h0KSAvIDJcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGlsZXNMYXp5bG9hZCgpIHtcblxuICAgICAgdmFyIHdpZHRoICA9IHh0aWxlcyp0aWxlc2l6ZS9yZXNvbHV0aW9uO1xuICAgICAgdmFyIGhlaWdodCA9IHl0aWxlcyp0aWxlc2l6ZS9yZXNvbHV0aW9uO1xuXG4gICAgICB2YXIgdGlsZSA9IG9iamVjdEZpdCh0cnVlLCB3aWR0aCwgaGVpZ2h0LCBlbC5jbGllbnRXaWR0aCwgZWwuY2xpZW50SGVpZ2h0KTtcbiAgICAgIGlmKHRpbGUud2lkdGggPT0gd2lkdGgpIHRpbGUgPSBvYmplY3RGaXQoZmFsc2UsIHdpZHRoLCBoZWlnaHQsIGVsLmNsaWVudFdpZHRoLCBlbC5jbGllbnRIZWlnaHQpO1xuICAgICAgXG4gICAgICB2YXIgZWxUaWxlID0gJChlbCkuZmluZChcInNwYW5cIilcbiAgICAgIGZvcihpeSA9IDA7IGl5IDwgeXRpbGVzOyBpeSsrKSB7XG4gICAgICBcbiAgICAgICAgZm9yKGl4ID0gMDsgaXggPCB4dGlsZXM7IGl4KyspIHtcblxuICAgICAgICAgIHZhciBfdGlsZXNpemUgPSBNYXRoLm1heCh0aWxlLmhlaWdodC95dGlsZXMsIHRpbGUud2lkdGgveHRpbGVzKTtcbiAgICAgICAgICB2YXIgaW5kZXggPSBpeSp4dGlsZXMgKyBpeDtcblxuICAgICAgICAgIGlmIChlbFRpbGVbaW5kZXhdID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgICBlbFRpbGVbaW5kZXhdID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG5cbiAgICAgICAgICAgICAgdmFyIHRtcF9zcmMgPSBzcmM7XG4gICAgICAgICAgICAgIGlmKHRtcF9zcmMuaW5kZXhPZihcIntzaWduYXR1cmV9XCIpKSB0bXBfc3JjID0gdG1wX3NyYy5yZXBsYWNlQWxsKFwie3NpZ25hdHVyZX1cIiwgc2lnbmF0dXJlKTtcbiAgICAgICAgICAgICAgZWxzZSB0bXBfc3JjICs9IFwiL1wiICsgc2lnbmF0dXJlO1xuICAgICAgICAgICAgICBpZih0bXBfc3JjLmluZGV4T2YoXCJ7aWR9XCIpKSB0bXBfc3JjID0gdG1wX3NyYy5yZXBsYWNlQWxsKFwie2lkfVwiLCBpbmRleCk7XG4gICAgICAgICAgICAgIGVsc2UgdG1wX3NyYyArPSBcIi9cIiArIGluZGV4O1xuXG4gICAgICAgICAgICAgIGVsVGlsZVtpbmRleF0uc2V0QXR0cmlidXRlKFwiaWRcIiwgZWwuZ2V0QXR0cmlidXRlKFwiaWRcIikrXCJfXCIraW5kZXgpO1xuICAgICAgICAgICAgICBlbFRpbGVbaW5kZXhdLnNldEF0dHJpYnV0ZShcImRhdGEtYmFja2dyb3VuZC1pbWFnZVwiLCB0bXBfc3JjKTsgLy91cmwoJ1wiK21pc3NpbmcrXCInKVxuICAgICAgICAgICAgICBlbFRpbGVbaW5kZXhdLnN0eWxlLm9wYWNpdHkgICA9IFwiMFwiO1xuICAgICAgICAgICAgICBlbFRpbGVbaW5kZXhdLnN0eWxlLnRyYW5zaXRpb24gICA9IFwib3BhY2l0eSAwLjVzIGVhc2VcIjtcbiAgICAgICAgICAgICAgZWwuYXBwZW5kKGVsVGlsZVtpbmRleF0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVsVGlsZVtpbmRleF0uc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICAgICAgZWxUaWxlW2luZGV4XS5zdHlsZS5sZWZ0ICAgICA9IHRpbGUubGVmdCArIChfdGlsZXNpemUqaXgpICsgXCJweFwiO1xuICAgICAgICAgIGVsVGlsZVtpbmRleF0uc3R5bGUudG9wICAgICAgPSB0aWxlLnRvcCAgKyAoX3RpbGVzaXplKml5KSArIFwicHhcIjsgICAgXG4gICAgICAgICAgZWxUaWxlW2luZGV4XS5zdHlsZS53aWR0aCAgICA9IF90aWxlc2l6ZSArIFwicHhcIjtcbiAgICAgICAgICBlbFRpbGVbaW5kZXhdLnN0eWxlLmhlaWdodCAgID0gX3RpbGVzaXplICsgXCJweFwiO1xuICAgICAgICAgIGVsVGlsZVtpbmRleF0uc3R5bGUuYmFja2dyb3VuZFNpemUgICA9IF90aWxlc2l6ZSArIFwicHhcIjtcblxuICAgICAgICAgIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwibGF6eWxvYWQuZ21fdGlsZW1hcFwiKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aWxlc0xhenlsb2FkKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9yaWVudGF0aW9uQ2hhbmdlXCIsIHRpbGVzTGF6eWxvYWQpO1xuICAgIHRpbGVzTGF6eWxvYWQoKTtcbiAgfVxufSk7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBcIkBnbGl0Y2hyL2h0bWwyY2FudmFzXCI7XG5pbXBvcnQgXCIuL3N0eWxlcy9qcy90aWxlbWFwLmpzXCI7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBcbn0pO1xuIl0sIm5hbWVzIjpbIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJjb250YWluZXIiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJlbCIsImkiLCJ0YWdOYW1lIiwiZG9jdW1lbnRFbGVtZW50IiwiJCIsImNzcyIsInNyYyIsImdldEF0dHJpYnV0ZSIsInNpZ25hdHVyZSIsInRpbGVzaXplIiwicGFyc2VJbnQiLCJyZXNvbHV0aW9uIiwieHRpbGVzIiwieXRpbGVzIiwibWlzc2luZyIsImxhenlCYWNrZ3JvdW5kcyIsIkludGVyc2VjdGlvbk9ic2VydmVyRW50cnkiLCJwcm90b3R5cGUiLCJsYXp5QmFja2dyb3VuZE9ic2VydmVyIiwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXIiLCJlbnRyaWVzIiwib2JzZXJ2ZXIiLCJmb3JFYWNoIiwiZW50cnkiLCJpc0ludGVyc2VjdGluZyIsInRhcmdldCIsImRhdGFzZXQiLCJiYWNrZ3JvdW5kSW1hZ2UiLCJwcmVsb2FkZXJJbWciLCJjcmVhdGVFbGVtZW50IiwiZXZlbnQiLCJzdHlsZSIsIm9wYWNpdHkiLCJyZW1vdmVBdHRyaWJ1dGUiLCJ1bm9ic2VydmUiLCJsYXp5QmFja2dyb3VuZCIsIm9ic2VydmUiLCJvYmplY3RGaXQiLCJjb250YWlucyIsImNvbnRhaW5lcldpZHRoIiwiY29udGFpbmVySGVpZ2h0Iiwid2lkdGgiLCJoZWlnaHQiLCJkb1JhdGlvIiwiY1JhdGlvIiwidGFyZ2V0V2lkdGgiLCJ0YXJnZXRIZWlnaHQiLCJ0ZXN0IiwibGVmdCIsInRvcCIsInRpbGVzTGF6eWxvYWQiLCJ0aWxlIiwiY2xpZW50V2lkdGgiLCJjbGllbnRIZWlnaHQiLCJlbFRpbGUiLCJmaW5kIiwiaXkiLCJpeCIsIl90aWxlc2l6ZSIsIk1hdGgiLCJtYXgiLCJpbmRleCIsInVuZGVmaW5lZCIsInRtcF9zcmMiLCJpbmRleE9mIiwicmVwbGFjZUFsbCIsInNldEF0dHJpYnV0ZSIsInRyYW5zaXRpb24iLCJhcHBlbmQiLCJwb3NpdGlvbiIsImJhY2tncm91bmRTaXplIiwiZGlzcGF0Y2hFdmVudCIsIkV2ZW50IiwibGVuZ3RoIl0sInNvdXJjZVJvb3QiOiIifQ==