window.addEventListener('DOMContentLoaded', function () {

  var container = document.querySelectorAll(".google-tilemap");
  for (var i = 0; i < container.length; i++) {

    var el = container[i];

    if(el.tagName != "DIV")
      throw "Element passed through gm_tilemap() must be a div";

    if (el == document) el = document.documentElement;
    if (el == window) el = document.documentElement;
    
    $(el).css("object-fit", "cover");
    $(el).css("position", "relative");
    $(el).css("top", "50%");
    $(el).css("left", "50%");
    $(el).css("transform", "translate(-50%, -50%)");
    $(el).css("width", "105%");
    $(el).css("height", "105%");

    var src = el.getAttribute("data-src");
    var signature = el.getAttribute("data-signature");
    var tilesize  = parseInt(el.getAttribute("data-tilesize")) || null;
    var resolution = 2;
    var xtiles    = parseInt(el.getAttribute("data-xtiles"));
    var ytiles    = parseInt(el.getAttribute("data-ytiles"));
    var missing   = el.getAttribute("data-missing");

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

    function tilesLazyload() {

      var width  = xtiles*tilesize/resolution;
      var height = ytiles*tilesize/resolution;

      var tile = objectFit(true, width, height, el.clientWidth, el.clientHeight);
      if(tile.width == width) tile = objectFit(false, width, height, el.clientWidth, el.clientHeight);
      
      var elTile = $(el).find("span")
      for(iy = 0; iy < ytiles; iy++) {
      
        for(ix = 0; ix < xtiles; ix++) {

          var _tilesize = Math.max(tile.height/ytiles, tile.width/xtiles);
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
              elTile[index].style.transition   = "opacity 0.4s ease";
              el.append(elTile[index]);
          }

          elTile[index].style.position = "absolute";
          elTile[index].style.left     = tile.left + (_tilesize*ix) + "px";
          elTile[index].style.top      = tile.top  + (_tilesize*iy) + "px";    
          elTile[index].style.width    = _tilesize + "px";
          elTile[index].style.height   = _tilesize + "px";
          elTile[index].style.backgroundSize   = _tilesize + "px";

          el.dispatchEvent(new Event("lazyload.gm_tilemap"));
        }
      }
    }

    window.addEventListener("resize", tilesLazyload);
    window.addEventListener("orientationChange", tilesLazyload);
    tilesLazyload();
  }
});