Polymer({

  __doc__: {
    element: 'div-sidebar',
    description: 'Sidebar element. Set side by adding class .left or .right.',
    status: 'alpha',
    url: 'https://github.com/arodic/div-sidebar/',
    demo: 'http://arodic.github.com/div-sidebar/',
    attributes: [
      { name: 'expanded', type: 'boolean' },
      { name: 'width', type: 'number' },
      { name: 'uuid', type: 'string' }
    ],
    properties: [],
    methods: [],
    events: [
      { name: 'div-expanded', description: 'Fires when sidebar is expanded.'},
      { name: 'div-collapsed', description: 'Fires when sidebar is collapsed.'}
    ]
  },

  expanded: true,
  width: 300,
  uuid:'',
  ready: function() {
    this.style.width = this.width+'px';
    if (this.uuid) {
      if (localStorage[this.uuid+'expanded'] == 'true') this.expanded = true;
      if (localStorage[this.uuid+'expanded'] == 'false') this.expanded = false;
    }
    window.addEventListener('resize', this.resize.bind(this));
  },
  domReady: function() {
    this.expandedChanged();
    this.resize();
  },
  toggle: function() {
    this.expanded = !this.expanded;
    this.classList.toggle('expanded', this.expanded);
  },
  resize: function() {
    this.rect = this.getBoundingClientRect();
    this.footerRect = this.$.footer.getBoundingClientRect();
    this.$.content.style.height = this.rect.height - this.footerRect.height  + 'px';
  },
  expandedChanged: function() {
    this.classList.toggle('expanded', this.expanded);
    if (this.expanded) {
      this.style.width = this.width+'px';
      this.fire('div-expanded', this);
    } else {
      // this.style.width = '32px';
      this.style.width = 'auto';
      this.fire('div-collapsed', this);
    }
    if (this.uuid) localStorage[this.uuid+'expanded'] = this.expanded;
  }
});