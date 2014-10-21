var SVG = {
  cache: {},

  swapImagesForSvg: function(imgs){
    for (var x = 0; x < imgs.length; x++) {
      var img = imgs[x];
      if (SVG.cache[img.src] !== null){
        var svg = SVG.cache[img.src].cloneNode(true);
        var attr = img.attributes;
        for (var y=0;y<attr.length;y++){
          if (img.hasAttribute(attr[y].name) && attr[y].name.toLowerCase() !== 'src' ){
            svg.setAttributeNode(attr[y].cloneNode(true));
          }
        }
        for (var i=0; i< img.classList.length; i++){
          svg.classList.add(img.classList[i]);
        }
        img.parentNode.replaceChild(svg, img);
      }
    }
  },

  update: function () {
    var imgs = document.querySelectorAll('img[src$=".svg"]');

    // Loop through images, prime the cache.
    for (var i = 0; i < imgs.length; i++) {
      SVG.cache[imgs[i].src] = SVG.cache[imgs[i].src] || null;
    }

    // Get all of the unrecognized svg files
    var processed = 0;
    Object.keys(SVG.cache).forEach(function(url){
      AJAX.get(url,function(res){
        if (res.status !== 200){
          processed++;
        } else {
          var tag = document.createElement('div');
          tag.innerHTML = res.responseText;
          SVG.cache[url] = tag.querySelector('svg');
          SVG.cache[url].removeAttribute('id');
          SVG.cache[url].removeAttribute('xmlns:a');
          processed++;
        }
      });
    });

    // Monitor for download completion
    var monitor = setInterval(function(){
      if (processed === Object.keys(SVG.cache).length){
        clearInterval(monitor);
        SVG.swapImagesForSvg(imgs);
      }
    },5);
  }
};
