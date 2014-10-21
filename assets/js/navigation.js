var NAV = {
  data: {
    api: null,
    exceptions: null,
    guide: null
  },

  clickHandler: function(e){
    var t = e.currentTarget;
    if (t.attributes.doctype){
      switch(t.getAttribute('doctype')){
        case 'exceptions':
          var doc = document.getElementById('exceptions');
          if (doc === null){
            AJAX.json(NAV.data.exceptions.url, function(data){
              console.dir(data);
              doc = document.createElement('doc-exceptions');
              doc.setAttribute('id','exceptions');
              // Add data to the exceptions web component
              doc.exceptions = data;
              var p = document.getElementById('documents');
              p.appendChild(doc);
              p.selected = [].indexOf.call(p.children,doc);
            });
          } else {
            doc.parentNode.selected = [].indexOf.call(doc.parentNode.children, doc);
          }
          break;
        case 'class':
          if (t.attributes.url){
            var doc = document.getElementById('doc.'+t.getAttribute('docid'));

            if (doc === null){
              // Retreive the JSON representation of the document
              AJAX.json(t.getAttribute('url'),function(data){
                doc = document.createElement('doc-class');
                doc.setAttribute('name',data.class.name);
                doc.setAttribute('id','doc.'+data.class.name);
                document.getElementById('documents').appendChild(doc);
                doc.parentNode.selected = [].indexOf.call(doc.parentNode.children, doc);
              });
            } else {
              doc.parentNode.selected = [].indexOf.call(doc.parentNode.children, doc);
            }
          }
          break;
      }
    }
  },

  generateApiMenu: function (target, data, root) {
    data = data || NAV.generateApiNamespace();
    root = root || [];
    Object.keys(data).forEach(function (key) {
      var node;
      var path = clone(root);
      path.push(key);
      if (Object.keys(data[key]).length > 0) {
        node = document.createElement('core-submenu');
        node.setAttribute('label', key);

        var obj = NAV.data.api[path.join('.')];
        obj = typeof obj === 'string' ? obj = {url:obj} : obj;

//        var n = node.$.submenuItem || node;
//
//        if (n){
//          n.removeEventListener('click',NAV.clickHandler);
//          n.addEventListener('click',NAV.clickHandler);
//
//          if (obj !== undefined){
//            Object.keys(obj).forEach(function(a){
//              n.setAttribute(a,obj[a]);
//            });
//          }
//
//          n.setAttribute('doctype','class');
//          n.setAttribute('docid',path.join('.'));
//        }

        NAV.generateApiMenu(node, data[key], path);
      } else {
        node = document.createElement('core-item');
        node.innerHTML = "<img src='./assets/icons/class.svg'>" + key;
        node.removeEventListener('click',NAV.clickHandler);
        node.addEventListener('click',NAV.clickHandler);
        node.classList.add('class');
      }
      var obj = NAV.data.api[path.join('.')];
      obj = typeof obj === 'string' ? obj = {url:obj} : obj;

      if (obj !== undefined){
        Object.keys(obj).forEach(function(a){
          node.setAttribute(a,obj[a]);
        });
      }
      node.setAttribute('doctype','class');
      node.setAttribute('id',path.join('.'));
      target.appendChild(node);
    });
  },

  sortNamespace: function(ns){
    var n = {};
    Object.keys(ns).filter(function(key){
      return Object.keys(ns[key]).length > 0;
    }).sort().forEach(function(key){
      n[key] = NAV.sortNamespace(ns[key]);
    });
    Object.keys(ns).filter(function(key){
      return Object.keys(ns[key]).length === 0;
    }).sort().forEach(function(key){
      n[key] = {};
    });
    return n;
  },

  generateApiNamespace: function () {
    var namespace = {};
    Object.keys(NAV.data.api).forEach(function (key) {
      if (key.trim().toLowerCase() !== 'exceptions'){
        var s = namespace;
        key.split('.').forEach(function (k, i, a) {
          s[k] = s[k] || {};
          s = s[k];
        });
      } else {
        NAV.data.exceptions = NAV.data.api[key];
      }
    });
    return NAV.sortNamespace(namespace);
  },

  generateGuideMenu: function(target) {
    data = NAV.data.guide;
    Object.keys(data).forEach(function(ctg){
      var cm = document.createElement('core-submenu');
      cm.setAttribute('label',ctg);
      Object.keys(data[ctg].docs).forEach(function(doc){
        var i = document.createElement('core-item');
        Object.keys(data[ctg].docs[doc]).forEach(function(a){
          i.setAttribute(a,data[ctg].docs[doc][a]);
        });
        i.setAttribute('doctype','guide');
        i.classList.add("guide");
        i.innerHTML = "<img src='./assets/icons/book.svg'>" + doc;
        i.removeEventListener('click',NAV.clickHandler);
        i.addEventListener('click',NAV.clickHandler);
        cm.appendChild(i);
      });
      cm.removeEventListener('click',NAV.clickHandler);
      cm.addEventListener('click',NAV.clickHandler);
      target.appendChild(cm);
    });
  },

  addNgnExceptions: function(){
    // Add to menu
    var i = document.createElement('core-item');
    i.classList.add('exception');
    i.setAttribute('id','doc.Exceptions');
    i.setAttribute('doctype','exceptions');
    i.innerHTML = "<img src='./assets/icons/flag.svg'>EXCEPTIONS";
    i.removeEventListener('click',NAV.clickHandler);
    i.addEventListener('click',NAV.clickHandler);
    var parent = document.getElementById('NGN');
    parent.insertBefore(i,parent.firstChild);
  },

  create: function(){
    AJAX.json("./data/navigation.json", function (data) {

      // Populate data
      NAV.data.api = data.api;
      NAV.data.guide = data.guides;

      // Configure the API navigation tree
      var cm = document.createElement('core-menu');
      NAV.generateApiMenu(cm);
      document.getElementById('menu-api').appendChild(cm);
      if (NAV.data.exceptions !== null){ // Add global errors if they're defined
        NAV.addNgnExceptions();
      }

      // Configure the Guide navigation tree
      var cm = document.createElement('core-menu');
      cm.setAttribute('selected',0);
      NAV.generateGuideMenu(cm);
      document.getElementById('menu-guide').appendChild(cm);
    });
  }
};
