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
    var resolution = 2;
    var xtiles    = parseInt(el.getAttribute("data-xtiles"));
    var ytiles    = parseInt(el.getAttribute("data-ytiles"));
    // var missing   = el.getAttribute("data-missing");

    el.addEventListener("lazyload.gm_tilemap", function() {

      var lazyBackgrounds = el.querySelectorAll("[data-background-image]");

      if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
        let lazyBackgroundObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {

              if(entry.target.dataset.backgroundImage) {

                let preloaderImg = document.createElement("img");
                    preloaderImg.src = entry.target.dataset.backgroundImage;
                    preloaderImg.addEventListener('load', (event) => {

                      entry.target.style.backgroundImage = "url('"+event.target.src+"')";
                      entry.target.style.opacity   = "1";
                      preloaderImg = null;      
                    });
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

    var width  = xtiles*tilesize/resolution;
    var height = ytiles*tilesize/resolution;

    var tile = objectFit(true, width, height, el.clientWidth, el.clientHeight);
    if(tile.width == width) tile = objectFit(false, width, height, el.clientWidth, el.clientHeight);
    
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

            var rnd = (Math.random()*0.5).toFixed(2);
            elTile[index].style.transition   = "opacity 0.5s ease "+rnd+"s";
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
window.addEventListener('resize', initTileMap);
// Transparent swaps content via AJAX without firing window 'load', so re-init tiles afterward.
window.addEventListener('transparent:ready', initTileMap);
window.addEventListener('transparent:postactive', initTileMap);
