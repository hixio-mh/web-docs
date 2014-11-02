var NAV = {
  data: {
    api: null,
    exceptions: null,
    guide: null
  },

  openClass: function(id,callback){
    var doc = document.getElementById('doc.'+id);
    location.hash = '#'+id;
    if (doc === null){
      // Retreive the JSON representation of the document
      AJAX.json(document.getElementById(id).getAttribute('url'),function(data){
        doc = document.createElement('doc-class');
        doc.setAttribute('name',data.class.name);
        doc.setAttribute('id','doc.'+data.class.name);
        SVG.update(doc);
        document.getElementById('documents').appendChild(doc);
        Object.keys(data).filter(function(key){
          if (typeof data[key] === 'object'){
            return Object.keys(data[key]).length > 0;
          }
          return true;
        }).forEach(function(key){
          doc[key==='configuration'?'config':key] = data[key];
        });
        doc.parentNode.selected = [].indexOf.call(doc.parentNode.children, doc);
        callback && callback(doc);
      });
    } else {
      doc.parentNode.selected = [].indexOf.call(doc.parentNode.children, doc);
      callback && callback(doc);
    }
  },

  openExceptions: function(callback){
    var doc = document.getElementById('exceptions');
    location.hash = '#exceptions';
    if (doc === null){
      AJAX.json(NAV.data.exceptions.url, function(data){
        doc = document.createElement('doc-exceptions');
        doc.setAttribute('id','EXCEPTIONS');
        // Add data to the exceptions web component
        doc.exceptions = data;
        var p = document.getElementById('documents');
        p.appendChild(doc);
        p.selected = [].indexOf.call(p.children,doc);
        SVG.update();
        callback && callback(doc);
      });
    } else {
      doc.parentNode.selected = [].indexOf.call(doc.parentNode.children, doc);
      callback && callback(doc);
    }
  },

  clickHandler: function(e){
    var t = e.currentTarget;
    if (t.attributes.doctype){
      switch(t.getAttribute('doctype')){
        case 'exceptions':
          location.hash = 'EXCEPTIONS';
          break;
        case 'class':
          t.attributes.url && (location.hash=t.getAttribute('id'));
          break;
      }
    }
  },

  historyCloseItem: function(e){
    e.preventDefault && e.preventDefault();
    document.getElementById('history').removeChild(e.target.parentNode);
  },

  updateHistory: function(cls){
    var hist = document.getElementById('history');
    var el = document.getElementById('class_'+cls.replace('.','_'));
    if (el === null){
      var li = document.createElement('li');
      li.setAttribute('id','class_'+cls.replace('.','_'));
      li.setAttribute('href',cls);
      var img = document.createElement('img'), txt = cls;
      switch(cls.toLowerCase()){
        case 'exceptions':
          img.setAttribute('src','./assets/icons/flag.svg');
          txt = 'EXCEPTIONS';
          li.classList.add('error');
          break;
        default:
          img.setAttribute('src','./assets/icons/class.svg');
          li.classList.add('class');
      }
      li.appendChild(img);
      var txtel = document.createTextNode(txt);
      li.appendChild(txtel);
      var c = document.createElement('a');
      c.innerHTML = '&times;';
      c.addEventListener('click',NAV.historyCloseItem);
      c.setAttribute('href','#'+cls);

      li.addEventListener('click',function(e){
        if(e.target.nodeName !== 'A'){
          var el = e.target;
          while(!el.attributes.href){
            el = el.parentNode;
          }
          location.hash = el.getAttribute('href');
        }
      });

      li.appendChild(c);
      setTimeout(function(){
        SVG.update(li);
        if (hist.children.length === 0){
          hist.appendChild(li);
        } else {
          hist.insertBefore(li,hist.firstChild);
        }
      },500);
    } else if (hist.children.length > 1) {
      hist.insertBefore(el,hist.firstChild);
    }
  },

  lastHash: null,

  loadPage: function(){
    if ((NAV.lastHash||'').split('?')[0] === location.hash.split('?')[0]){
      return;
    }
    var lastpage = NAV.lastHash;
    NAV.lastHash = location.hash;
    var parms = getQueryParams();
    var cls = location.hash.split('?')[0].trim().replace('#','') || null;
    if (cls !== null){
      setTimeout(function(){
        if (cls.toLowerCase() === 'exceptions'){
          NAV.openExceptions(function(){
            var p = document.getElementById('EXCEPTIONS').parentNode;
            p.opened = true;
            p.selected = 0;
          });
        } else {
          NAV.openClass(cls,function(page){
            // page is the DOM element present on screen.
            var p = document.getElementById(cls).parentNode;
            p.selected = [].indexOf.call(p.childNodes, document.getElementById(cls));
            while(['CORE-MENU','CORE-SUBMENU'].indexOf(p.nodeName) >= 0){
              p.opened = true;
              p = p.parentNode;
            }
            if (parms.hasOwnProperty('show')){
              page.scrollTo(parms.show);
              location.hash = location.hash+'?show='+parms.show;
            }
          });
        }
        // Update history
        if ((lastpage||'__null__').trim().toLowerCase() !== (NAV.lastHash||'__null__').trim().toLowerCase() && lastpage !== null){
          NAV.updateHistory(lastpage.substr(1,lastpage.length));
        }
      },1);
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
    i.setAttribute('id','EXCEPTIONS');
    i.setAttribute('doctype','exceptions');
    i.innerHTML = "<img src='./assets/icons/flag.svg'>EXCEPTIONS";
    i.removeEventListener('click',NAV.clickHandler);
    i.addEventListener('click',NAV.clickHandler);
    var parent = document.getElementById('NGN');
    parent.insertBefore(i,parent.firstChild);
  },

  create: function(callback){
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

      // Listen for clicks on the
      var pages = document.querySelector('#navigation > core-pages');
      var tabs = document.querySelector('paper-tabs');
      tabs.addEventListener('core-select', function () {
        pages.selected = tabs.selected;
      });

      NAV.loadPage();
      callback && callback();
    });
  }
};
