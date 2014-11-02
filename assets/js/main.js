var navWidth = (screen.width / 3) > 350 ? 350 : screen.width / 3;
document.getElementsByTagName('core-drawer-panel')[0].drawerWidth = navWidth + "px";

// Global functions
window.clone = function(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    obj.hasOwnProperty(attr) && (copy[attr] = obj[attr]);
  }
  return copy;
}
window.findEl = function(node,id){
  if (node.id === id){
    return node;
  }
  for(var i=0; i<node.children.length; i++){
    if (node.children[i].nodeName !== 'TEMPLATE'){
      var el = findEl(node.children[i],id);
      if (el !== null){
        return el;
      }
    }
  }
  return null;
};
window.getQueryParams = function(){
  var params = {};
  location.hash.split('?').pop().split('&').forEach(function(str){
    var a = str.split('=');
    params[a[0]] = a.length > 1 ? a.pop() : null;
  });
  return params;
};

// Create the navigation menu & load the appropriate page
NAV.create();

// Listen for changes and load the page accordingly.
window.addEventListener("hashchange", NAV.loadPage, false);

// Embed all SVG images
setTimeout(SVG.update, 2000);
