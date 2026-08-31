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
    var containerObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        if (!_gmTilemapShouldInit(entry.target)) return;
        if (entry.target.dataset.gmTilemapInitialized === '1') return;
        entry.target.dataset.gmTilemapInitialized = '1';
        containerObserver.unobserve(entry.target);
        _initTileMapContainer(entry.target, $);
      });
    }, { rootMargin: '200px' });
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

    if(el.tagName != "DIV")
      throw "Element passed through gm_tilemap() must be a div";

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
    var tilesize  = parseInt(el.getAttribute("data-tilesize")) || null;
    var xtiles    = parseInt(el.getAttribute("data-xtiles"));
    var ytiles    = parseInt(el.getAttribute("data-ytiles"));
    // var missing   = el.getAttribute("data-missing");

    // Bound once per container, never per call: this function re-runs on
    // every resize to re-fit the tiles, and the handler is an anonymous
    // closure, so an unguarded addEventListener would stack another copy of
    // it each time - one more lazy-load pass over the tiles per resize, for
    // the lifetime of the page.
    if(el.dataset.gmTilemapBound !== '1') {

    el.dataset.gmTilemapBound = '1';
    el.addEventListener("lazyload.gm_tilemap", function() {

      var lazyBackgrounds = el.querySelectorAll("[data-background-image]");

      if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
        let lazyBackgroundObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {

              if(entry.target.dataset.backgroundImage) {

                let preloaderImg = document.createElement("img");
                    preloaderImg.src = entry.target.dataset.backgroundImage;

                    var reveal = function(src) {
                      entry.target.style.backgroundImage = "url('"+src+"')";
                      entry.target.style.opacity   = "1";
                    };

                    // Cache fast-path: a tile already in the HTTP cache is
                    // decodable synchronously, so `complete` is true the moment
                    // src is assigned and 'load' may never fire again. Paint it
                    // immediately with the fade suppressed - on a revisit the
                    // whole map is simply there, instead of dissolving in for
                    // half a second over an empty background.
                    if (preloaderImg.complete && preloaderImg.naturalWidth > 0) {

                      entry.target.style.transition = "none";
                      reveal(preloaderImg.src);
                      // Drop back to the stylesheet's transition once painted,
                      // so a later re-init (resize / transparent swap) can fade.
                      requestAnimationFrame(function() { entry.target.style.transition = ""; });
                      preloaderImg = null;

                    } else {

                      preloaderImg.addEventListener('load', (event) => {

                        reveal(event.target.src);
                        preloaderImg = null;
                      });
                    }
              }

              entry.target.removeAttribute("data-background-image");    
              lazyBackgroundObserver.unobserve(entry.target);
            }
          });
        });

        lazyBackgrounds.forEach(function(lazyBackground) {
          lazyBackgroundObserver.observe(lazyBackground);
        });
      }
    });
    }


    function objectFit(contains /* true = contain, false = cover */, containerWidth, containerHeight, width, height){

      var doRatio = width / height;
      var cRatio = containerWidth / containerHeight;
      var targetWidth = 0;
      var targetHeight = 0;
      var test = contains ? (doRatio > cRatio) : (doRatio < cRatio);

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

    // The tiles span the whole tile GRID (xtiles*ytiles cells), but the
    // capture only fills the top-left of it: the exporter pads the last
    // row/column out to a full cell, so the grid is always >= the capture
    // and the difference is blank. GmObject.php emits the capture's real
    // pixel size as the width/height attributes, next to the grid's own
    // data-xtiles/data-ytiles/data-tilesize.
    //
    // Fitting the GRID (what this used to do) therefore fits the blank
    // padding too, and the map proper stops short of the container by
    // whatever fraction of the last row/column is padding - for a 3024x1875
    // capture on a 6x4 grid of 512s that is 2048 vs 1875, i.e. 8.5% of the
    // height left over, showing the page's own background through the
    // bottom of a map that is supposed to cover it. Fit the CAPTURE, then
    // scale that fit up to the grid the tiles actually span, so the padding
    // lands outside the container instead of inside it.
    //
    // Both are needed: the fit decides what covers the container, the
    // scale-up decides where the tiles go.
    var gridWidth  = xtiles*tilesize;
    var gridHeight = ytiles*tilesize;

    // Fall back to the grid when the capture size is absent - the metadata
    // keys behind these attributes default to 0 in GmObject.php, and 0 here
    // would divide the whole layout to Infinity.
    var captureWidth  = parseFloat(el.getAttribute("width"))  || 0;
    var captureHeight = parseFloat(el.getAttribute("height")) || 0;
    if(captureWidth <= 0 || captureHeight <= 0) {

      captureWidth  = gridWidth;
      captureHeight = gridHeight;
    }

    // objectFit()'s own parameter order is (contains, containerWidth,
    // containerHeight, width, height) - containerWidth/Height is the real
    // on-screen box (el.clientWidth/Height), width/height is the captured
    // image's native pixel size. The previous call here had them swapped:
    // the image's own dimensions were passed as the "container" and the
    // actual container size was passed as the "image", inverting both
    // aspect-ratio terms inside objectFit() (doRatio/cRatio) and
    // corrupting the fit-size math - a smaller crop of the source ended up
    // stretched to fill more of the screen, rendering as "zoomed in too
    // close" even though the captured tiles themselves are correct.
    //
    // Separately, this is the ONLY consumer of .google-tilemap in the
    // whole package (GmObject.php's markup is the single source of it),
    // and _initTileMapContainer already forces object-fit:cover on the
    // container unconditionally above - "contain" was never actually
    // wanted here. The old two-step "try contain, fall back to cover if
    // tile.width == width" never worked as a real fallback either (that
    // compared the fit result against the raw captured-image pixel width,
    // which is not what deciding contain-vs-cover needs) - contain mode's
    // letterboxing was silently left in place whenever the container's
    // aspect ratio didn't exactly match the capture's, showing the site's
    // decorative background through the gap instead of the map covering
    // the full page. Always fitting with cover matches the CSS intent and
    // fixes both symptoms with one call.
    var fit = objectFit(false, el.clientWidth, el.clientHeight, captureWidth, captureHeight);

    // The capture sits at the grid's top-left, so the fit's own origin is
    // the grid's origin too - only the size has to grow to the grid.
    var tile = {
      left:   fit.left,
      top:    fit.top,
      width:  fit.width  * (gridWidth  / captureWidth),
      height: fit.height * (gridHeight / captureHeight)
    };

    // Google's map attribution/copyright text is baked into the bottom
    // edge of the captured screenshot (required by Maps' ToS - Map's own
    // setDefaultUI(false)/disableDefaultUI doesn't remove it, only the
    // optional controls). Cover's crop is centered, so whenever height
    // ends up the exact-match dimension (no vertical crop at all - the
    // common case for a background map, whose container is usually
    // proportionally wider than the capture), that strip renders fully
    // visible right at the container's bottom edge. Growing the fit
    // uniformly (both dimensions, so the image doesn't distort) while
    // leaving `top` untouched pushes ALL of the added height downward
    // past the bottom edge - reserving a consistent margin there for the
    // container's own overflow:hidden to crop away - instead of splitting
    // it evenly top/bottom the way changing `top` too would.
    //
    // This only has to clear the strip itself now. It used to be 0.06 and
    // still left the copyright on screen, because it was also the only
    // thing absorbing the grid padding above - and it could never win that
    // way: the padding fraction depends on how evenly the capture divides
    // into tiles, so no fixed constant covers every capture. With the fit
    // corrected, the strip measures ~1.8% of the capture height on a 6x4
    // grid; 4% clears it with room to spare without cropping much more of
    // the map away.
    var COPYRIGHT_MARGIN = 0.04;
    var grownWidth  = tile.width  * (1 + COPYRIGHT_MARGIN);
    var grownHeight = tile.height * (1 + COPYRIGHT_MARGIN);
    tile.left -= (grownWidth - tile.width) / 2;
    tile.width  = grownWidth;
    tile.height = grownHeight;

    var elTile = $(el).find("span")
    for(iy = 0; iy < ytiles; iy++) {
    
      for(ix = 0; ix < xtiles; ix++) {

        const tileW = Math.floor(tile.width  / xtiles);
        const tileH = Math.floor(tile.height / ytiles);
        const tileSize = Math.max(tileW, tileH);
        var index = iy*xtiles + ix;

        if (elTile[index] === undefined) {

            elTile[index] = document.createElement("span");

            var tmp_src = decodeURI(src);
            
            if(tmp_src.indexOf("{signature}")) tmp_src = tmp_src.replaceAll("{signature}", signature);
            else tmp_src += "/" + signature;
            if(tmp_src.indexOf("{id}")) tmp_src = tmp_src.replaceAll("{id}", index);
            else tmp_src += "/" + index;

            elTile[index].setAttribute("id", el.getAttribute("id")+"_"+index);
            elTile[index].setAttribute("data-background-image", tmp_src); //url('"+missing+"')
            elTile[index].style.opacity   = "0";

            // No per-tile random delay. Staggering each tile by 0-0.5s meant
            // neighbouring tiles revealed at visibly different moments, and a
            // row still sitting at opacity 0 let the container's own
            // background-color show through as a full-width light bar that
            // flashed across the map and vanished. One uniform, short fade
            // keeps the reveal calm without banding.
            elTile[index].style.transition   = "opacity 0.25s ease";
            el.append(elTile[index]);
        }

        const left = tile.left + ix * tileSize;
        const top  = tile.top  + iy * tileSize;
        const width  = (ix === xtiles - 1) ? tile.width  - tileSize * ix: tileSize;
        const height = (iy === ytiles - 1) ? tile.height - tileSize * iy: tileSize;

        elTile[index].style.position = "absolute";
        elTile[index].style.left   = left + "px";
        elTile[index].style.top    = top  + "px";
        elTile[index].style.width  = (width  + 0.1) + "px";
        elTile[index].style.height = (height + 0.1) + "px";
        elTile[index].style.backgroundSize = (width  + 0.1) + "px " + (height + 0.1) + "px";
        
        el.dispatchEvent(new Event("lazyload.gm_tilemap"));
      }
    }
}

window.addEventListener('load', initTileMap);

// Re-fit already-initialized containers, then let initTileMap() pick up any
// that still haven't passed their visibility gate.
//
// `resize` used to be bound to initTileMap directly, which did nothing at
// all after the first run: data-gm-tilemap-initialized is a ONE-SHOT gate
// (it stops the lazy IntersectionObserver re-triggering per-tile network
// requests) and initTileMap skips every container carrying it. So the fit
// was computed once, against whatever the viewport happened to be then, and
// never again - resize the window or rotate a phone and the tiles kept the
// old geometry, leaving the map either cropped or short of an edge with the
// page background showing through. Re-laying out is cheap: the spans
// already exist and are reused, so this only repositions them and refetches
// nothing.
function relayoutTileMap() {

  var $ = window.jQuery || window.$;
  if (!$) return; // jQuery not yet attached to window; safe no-op

  var container = document.querySelectorAll(".google-tilemap");
  for (var i = 0; i < container.length; i++) {

    if (container[i].dataset.gmTilemapInitialized !== '1') continue;
    if (!_gmTilemapShouldInit(container[i])) continue;

    _initTileMapContainer(container[i], $);
  }

  initTileMap();
}

window.addEventListener('resize', relayoutTileMap);
// Transparent swaps content via AJAX without firing window 'load', so re-init tiles afterward.
window.addEventListener('transparent:ready', initTileMap);
window.addEventListener('transparent:postactive', initTileMap);
