
dojo.provide('geonef.ploomap.Panel');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._LayoutSwitch');

// used in template
dojo.require('geonef.jig.input.TextBox');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.layout.StackContainer');
dojo.require('geonef.ploomap.panel.Search');

dojo.declare('geonef.ploomap.Panel',
             [ dijit._Widget, dijit._Templated, geonef.jig.widget._LayoutSwitch ],
{
  homePaneClass: 'geonef.ploomap.panel.Home',
  buildOpacity: false,
  returnHome: true,
  autoBackLinks: true,
  additionalCss: '',

  templateString: dojo.cache('geonef.ploomap', 'templates/Panel.html'),
  widgetsInTemplate: true,


  buildRendering: function() {
    dojo['require'](this.homePaneClass);
    this.inherited(arguments);
    if (this.buildOpacity) {
      dojo.create('div', {'class': 'opacity'}, this.domNode, 'first');
    }
    dojo.addClass(this.domNode, this.additionalCss);
  },

  postCreate: function() {
    this.inherited(arguments);
    this.setupContainer();
    this.subscribe('pane/goHome', this.goHome);
  },

  setupContainer: function() {
    this.container.appearTarget = 'add';
    this.subscribe(this.container.id+'-selectChild', this.onChildChange);
    this.subscribe(this.container.id+'-addChild', this.onAddChild);
  },

  startup: function() {
    this.inherited(arguments);
    this.onChildChange(this.container.selectedChildWidget);
    this.searchBox.focus();
  },

  goHome: function() {
    this.container.selectChild(this.homePane);
  },

  search: function() {
    var value = this.searchBox.attr('value');
    if (!dojo.trim(value)) { return; }
    var search = geonef.jig.workspace.autoAnchorInstanciate(
      'geonef.ploomap.panel.Search');
    search.attr('search', value);
  },

  onChildChange: function(child) {
    //console.log('onChildChange', this, arguments, this.previousSelectedChild);
    var prev = this.previousSelectedChild;
    if (prev !== child && prev) {
      if (this.childConnects) {
        this.childConnects.forEach(this.disconnect, this);
        delete this.childConnects;
      }
      if (prev.onDisappear) {
        prev.onDisappear();
      }
      if (prev.autoDestroyOnDisappear) {
        this.container.removeChild(prev);
        prev.destroy();
      }
    }
    this.updateTitle(child);
    this.addHistory(child);
    this.previousSelectedChild = child;
    if (child.onPanelPathChange) {
      this.childConnects =
        [this.connect(child, 'onPanelPathChange',
                      dojo.hitch(this, this.updateTitle, child))];
    }
    if (child.onAppear) {
      child.onAppear();
    }
  },

  updateTitle: function(child) {
    var show;
    if (child === this.homePane) {
      show = false;
    } else {
      show = true;
      if (this.pathWidgets) {
        this.pathWidgets.forEach(
          function(w) { w.destroy(); });
      }
      var pathWidgets = this.pathWidgets = [];
      var titleNode = this.titleNode;
      titleNode.innerHTML = '';
      var container = this.container;
      var first = true;
      var func = function(obj) {
        if (dojo.isArray(obj)) {
          obj.forEach(func);
        } else if (dojo.isString(obj)) {
          if (!first) {
            dojo.create('span', {'class':'sep', innerHTML: " &rarr;&nbsp;"}, titleNode);
          }
          dojo.create('span', {innerHTML: obj}, titleNode);
        } else if (dojo.isObject(obj)) {
          if (dojo.isArray(obj.panelPath)) {
            obj.panelPath.forEach(func);
            return;
          }
          var label = obj.panelPath || obj.name || obj.id;
          if (dojo.isArray(label)) {
            label.forEach(func);
            return;
          }
          if (!first) {
            dojo.create('span', {'class':'sep', innerHTML: " &rarr;&nbsp;"}, titleNode);
          }
          if (obj === child) {
            dojo.create('span', {innerHTML: label}, titleNode);
          } else {
            var w = new geonef.jig.button.Link(
              { label: label,
                onClick: function() { container.selectChild(obj); } });
            w.placeAt(titleNode);
            w.startup();
            pathWidgets.push(w);
          }
        }
        first = false;
      };
      func(this.homePane);
      var path = func(child);
      //this.path2Node.innerHTML = path;
    }
    (show ? dojo.removeClass : dojo.addClass)(this.domNode, 'notitle');
  },

  addHistory: function(child) {
    if (!this._fromHistory) {
      var self = this;
      dojo.back.addToHistory({
        handle: function(dir) {
          self._fromHistory = true;
          if (child && child.domNode) {
            //console.log('history?', this, arguments);
            self.container.selectChild(child);
          } else {
            console.warn("cannot move to history: child was destroyed", child);
          }
          self._fromHistory = false;
        },
      });
    }
  },

  onAddChild: function(child) {
    if (!child.panel) {
      child.panel = this;
      child.connect(child, 'uninitialize', function() { delete child.panel; });
    }
    var container = this.container;
    // if (this.returnHome) {
    //   this.connect(child, 'onClose', this.goHome);
    // } else {
    //   console.log('no onClose connect', this, arguments);
    // }
    // console.log('this.returnHome', this, arguments, this.returnHome);
    this.connect(child, 'onClose', this.returnHome ? this.goHome :
                 function() {
                   var children = container.getChildren();
                   var widget = children[children.length - 1] === child ?
                     children[children.length - 2] : children[children.length - 1];
                   console.log('in onClose', this, children, widget);
                   container.selectChild(widget);
                 });

    if (!child.noPanelBrowse && this.autoBackLinks) {
      var w = new geonef.jig.button.Link(
        { label: "&larr;&nbsp;Retour à l'accueil",
          onClick: dojo.hitch(this, this.goHome) });
      dojo.addClass(w.domNode, 'backlink');
      w.placeAt(child.domNode);
      w.startup();
    }
  },

  changeState: function() {
    (this.mState ? dojo.removeClass : dojo.addClass)
      (dojo.body(), 'minimized');
    (this.mState ? dojo.removeClass : dojo.addClass)
      (this.stateButton.domNode, 'jigBorderLeft');
    (this.mState ? dojo.addClass : dojo.removeClass)
      (this.stateButton.domNode, 'jigBorderRight');
    this.stateButton.attr('label', this.mState ? '&lt;' : '&gt;');
    dijit.byId('display').resize();
    this.mState = !this.mState;
  },


});
