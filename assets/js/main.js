var navWidth = (screen.width / 3) > 350 ? 350 : screen.width / 3;
document.getElementsByTagName('core-drawer-panel')[0].drawerWidth = navWidth + "px";

window.clone = function(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

NAV.create();

var pages = document.querySelector('#navigation > core-pages');
var tabs = document.querySelector('paper-tabs');
tabs.addEventListener('core-select', function () {
  pages.selected = tabs.selected;
});

setTimeout(SVG.update, 2000);

setTimeout(function () {
  console.log("Update data");
  //  console.dir(document.getElementsByTagName('doc-class')[0]);
//  document.getElementsByTagName('doc-class')[0].code = "console.log();";
}, 2000)
