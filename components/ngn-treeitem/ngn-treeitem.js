var _el; // Reference to this element
Polymer('ngn-treeitem', {
  /**
   * @attribute {boolean} drag
   */
  drag: {
    value: true,
    reflect: true
  },
  drop: {
    value: true,
    reflect: true
  },
  expandOnDrop: false,
  collapsed: true,
  label: null,
  dragsource: null,
  /**
   * @attribute treeroot
   * A reference to the NGN Tree root element.
   */
  treeroot: null,
  ready: function () {
    var me = this,
      cols = [],
      childItems = [];

    // Identify the tree root (bubble to top)
    this.treeroot = this;
    do {
      me.treeroot = me.treeroot.parentNode;
    } while (this.treeroot.nodeName !== 'NGN-TREE');

    // Hide any collapsed nodes
    this.collapsed && this.$.children.classList.add('hide');

    // Identify the child tree items & make non-treeitems columns
    var l = null;
    for (var i = 0; i < this.children.length; i++) {
      switch (this.children[i].nodeName) {
      case 'NGN-TREEITEM':
        childItems.push(this.children[i]);
        break;
      case 'LABEL':
        l = this.children[i]
        break;
      default:
        cols.push(this.children[i]);
        break;
      }
    }
    if (l !== null) {
      this.$.label.remove(this.$.label);
      l.setAttribute('id', 'label');
      this.$.row.insertBefore(l, this.$.spacer);
      delete l;
    }

    // Loop through all non-treeitem elements and make them columns
    cols.forEach(function (node) {
      node.classList.add('ngn-treecolumn');
      me.$.row.appendChild(node);
    });

    // If there are no children, identify the node as a leaf
    if (childItems.length > 0) {
      if (this.collapsed) {
        this.$.treenode.classList.add('collapsed');
      } else {
        this.$.treenode.classList.add('expanded');
      }
    }

    this.enableDragDrop();
    this.$.icon.addEventListener('mouseup', this.rowClick, false);

    // Cleanup
    delete cols;

    // Add the top level class if relevant
    this.parentNode.nodeName === 'NGN-TREE' && this.$.treenode.classList.add('top');

    _el = this;

    /**
     * @event ready
     * Fired when the web component is ready.
     */
    this.fire('ready');

  },
  getTreeItem: function (element) {
    var el = element;
    do {
      el = el.parentNode;
    } while (el !== undefined && el !== null && !el.hasOwnProperty('host'));
    return el === null ? null : (el.hasOwnProperty('host') ? el.host : el || null);
  },
  rowClick: function (e) {
    if (this.parentNode.parentNode.classList.contains('expanded') || this.parentNode.parentNode.classList.contains('collapsed')) {
      var item = _el.getTreeItem(e.target);
      _el.fire('itemclick',item);
      if (this.parentNode.parentNode.classList.contains('expanded')) {
        item.collapse();
      } else {
        item.expand();
      }
    }
  },
  /**
   * Basic desc
   *
   * @method enableDragDrop
   * This enables the drag 'n' drop capabilities of the tree item.
   * @param {String} [test=blah]
   * This is a test
   */
  enableDragDrop: function () {
    var me = this;
    setTimeout(function () {
      if (me.treeroot.modify) {
        // Initialize drag/drop support
        me.drag && me.$.treenode.setAttribute('draggable', 'true');
        me.drag && me.$.row.addEventListener('dragstart', me.handleDragStart, false);
        me.$.row.addEventListener('drop', me.handleDrop, false);
        me.$.row.addEventListener('mousedown', me.handleDragStart, false);
      }
      me.$.row.addEventListener('dragenter', me.handleDragEnter, false);
      me.$.row.addEventListener('dragover', me.handleDragOver, false);
      me.$.row.addEventListener('dragleave', me.handleDragLeave, false);
    }, 20);
  },
  collapse: function () {
    this.$.treenode.classList.remove('expanded');
    this.$.treenode.classList.add('collapsed');
    this.childHeight = this.$.children.getBoundingClientRect().height;
    var me = this;
    setTimeout(function () {
      me.$.children.style.display = 'none';
      me.fire('collapse',me);
    }, 200);
  },
  expand: function () {
    this.$.treenode.classList.remove('collapsed');
    this.$.treenode.classList.add('expanded');
    var me = this;
    setTimeout(function () {
      me.$.children.style.display = 'block';
      me.fire('expand',me);
    }, 200);
  },
  handleDragStart: function (e) {
    if (!this.drag) {
      return e.preventDefault();
    }
    e.target.style.opacity = '0.4';
  },
  handleDragEnter: function (e) {
    var item = _el.getTreeItem(e.target);
    if (item !== _el.treeroot.dragsource) {
      if (item !== _el.treeroot.dragsource.parentNode) {
        if (!item.isChildOf(_el.treeroot.dragsource)) {
          item.drop && item.$.row.classList.add('dragover');
          !item.drop && item.$.row.classList.add('preventdrop');
        } else {
          item.$.row.classList.add('preventdrop');
        }
      }
    } else {
      item.$.row.classList.add('preventdrop');
    }
  },
  handleDragOver: function (e) {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    var item = _el.getTreeItem(e.target);

    // If the mouse is over the upper portion of the node, ID the northern drop zone
    var nondroppable = item.$.row.classList.contains('preventdrop');
    if (e.clientY > item.getBoundingClientRect().top && e.clientY < item.getBoundingClientRect().top+(item.getBoundingClientRect().height*.2)){
      item.$.treenode.classList.add('targetnorth');
      item.$.row.classList.remove('preventdrop');
    } else if (e.clientY > item.getBoundingClientRect().top+(item.getBoundingClientRect().height*.8)) {
      item.$.treenode.classList.add('targetsouth');
      item.$.row.classList.remove('preventdrop');
    } else {
      !item.drop && item.$.row.classList.add('preventdrop');
      item.$.treenode.classList.remove('targetnorth');
      item.$.treenode.classList.remove('targetsouth');
    }
  },
  handleDragLeave: function (e) {
    _el.getTreeItem(e.target).$.row.classList.remove('dragover');
    _el.getTreeItem(e.target).$.row.classList.remove('preventdrop');
    _el.getTreeItem(e.target).$.treenode.classList.remove('targetnorth');
    _el.getTreeItem(e.target).$.treenode.classList.remove('targetsouth');
  },
  handleDrop: function (e) {
    var item = _el.getTreeItem(e.target);
    item.$.row.classList.remove('dragover');
    item.$.row.classList.remove('preventdrop');
    item.$.treenode.classList.remove('targetnorth');
    item.$.treenode.classList.remove('targetsouth');

    // If the dropzone is above/below the item, autocorrect the target item
    if (e.clientY > item.getBoundingClientRect().top && e.clientY < item.getBoundingClientRect().top+(item.getBoundingClientRect().height*.2)){
      item.parentNode !== _el.treeroot && _el.treeroot.dragsource.$.treenode.classList.remove('top');
      item.parentNode === _el.treeroot && _el.treeroot.dragsource.$.treenode.classList.add('top');
      item.parentNode.insertBefore(_el.treeroot.dragsource,item);
      return;
    } else if (e.clientY > item.getBoundingClientRect().top+(item.getBoundingClientRect().height*.8)) {
      item.parentNode !== _el.treeroot && _el.treeroot.dragsource.$.treenode.classList.remove('top');
      item.parentNode === _el.treeroot && _el.treeroot.dragsource.$.treenode.classList.add('top');
      item.parentNode.insertBefore(_el.treeroot.dragsource,item.nextSibling);
      return;
    }

    if (!item.drop) {
      return e.preventDefault();
    }

    if (item.drop && item !== _el.treeroot.dragsource && !item.isChildOf(_el.treeroot.dragsource) && item !== _el.treeroot.dragsource.parentNode) {
      var srcParent = _el.treeroot.dragsource.parentNode;
      item !== _el.treeroot && _el.treeroot.dragsource.$.treenode.classList.remove('top');
      item === _el.treeroot && _el.treeroot.dragsource.$.treenode.classList.add('top');
      item.enableDragDrop();
      item.appendChild(_el.treeroot.dragsource);
      if (item.expandOnDrop) {
        item.expand();
      } else {
        item.collapse();
      }

      // If the source no longer has children, remove the CSS classes
      if (srcParent !== _el.treeroot && srcParent.children.length === 0) {
        srcParent.$.treenode.classList.remove('collapsed');
        srcParent.$.treenode.classList.remove('expanded');
      }

      _el.treeroot.dragsource = null;
    }
  },
  handleDragStart: function (e) {
    _el.treeroot.dragsource = _el.getTreeItem(e.target);
  },
  isChildOf: function (src) {
    var dest = this;
    do {
      if (dest === _el.treeroot) {
        return false;
      }
      dest = dest.parentNode;
    } while (src !== dest)

    return true;
  }
});
