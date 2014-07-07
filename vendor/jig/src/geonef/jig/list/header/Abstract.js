dojo.provide('geonef.jig.list.header.Abstract');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');
dojo.require('geonef.jig.widget._AsyncInit');

// used in code
dojo.require('geonef.jig.api');

dojo.declare('geonef.jig.list.header.Abstract',
		[dijit._Widget, dijit._Templated, geonef.jig.input._Container,
                 geonef.jig.widget._AsyncInit],
{

  templateString: '',	// to overload

  baseMsgKey: 'list.header',

  // widgetsInTemplate: Boolean
  //    Whether we have widgets (attr dojoType="...")
  widgetsInTemplate: true,

  queryApiModule: '',			// usually provided by list widget
  queryApiAction: 'query',
  saveApiAction: 'save',

  listWidget: '',

  // sort: Object
  //    Default sort
  sort: { name: 'id', desc: true },

  postMixInProperties: function() {
    //console.log('new abstract header', this);
    this.inherited(arguments);
    this.listWidget = dijit.byId(this.listWidget);
    this.listWidget.metaReady.addCallback(dojo.hitch(this, this.onMetaReady));
  },

  onMetaReady: function() {
    var self = this;
    this.updateVisibility();
    if (this.sort && this.sort.name)
      dijit.findWidgets(this.domNode).some(
        function(w) {
	  if (w.name !== self.sort.name) {
            return false;
          }
	  w.setSorting(self.sort.desc);
	  return true;
	});
    dojo.forEach(dijit.findWidgets(this.domNode),
                 function(widget) {
                   dojo.connect(widget, 'setSorting', self,
                                function(desc) {
		                  self.setSorting(widget, widget.name, desc);
			        });
		 });
    this.setupDeps();
  },

  setupDeps: function() {
    this.getDescendants()
        .filter(function(w) { return !!w.asyncInit; })
        .forEach(function(w)
                 { this.asyncInit.dependsOn(w.asyncInit); }, this);
  },

  updateVisibility: function() {
    // about fields
    if (this.listWidget.visibleColumns.length > 0) {
      var tds = dojo.query('> td', this.domNode);
      var length = this.listWidget.columns.length;
      if (tds.length !== length) {
        console.warn('<td> count does not match the list column count. '
                     + 'Ignoring.', tds.length, length, this);
        return;
      }
      for (var i = 0; i < length; i++) {
        var col = this.listWidget.columns[i];
        if (this.listWidget.visibleColumns.indexOf(col) === -1) {
          dojo.style(tds[i], 'display', 'none');
        }
      }
    }
    // for readonly
    if (this.listWidget.readOnly) {
      this.getNoReadOnlyWidgets().forEach(
        function(w) { dojo.style(w.domNode, 'display', 'none'); });
    }
  },

  getNoReadOnlyWidgets: function() {
    return [
      /*this.actionsField.duplicateButton,
      this.actionsField.deleteButton,*/
    ];
  },

  setSorting: function setSorting(widget, name, desc) {
    if (desc !== null) {
      dijit.findWidgets(this.domNode).forEach(
        function(w) {
	  if (w !== widget) {
	    w.setSorting(null);
	  }
	});
      this.sort = { name: widget.sortName || name, desc: desc };
      this.onChange();
    }
  },

  /**
   * Perform query to server API
   *
   * @return {geonef.jig.Deferred}
   */
  fetch: function(request) {
    return this.listWidget.request(dojo.mixin({
      module: this.queryApiModule,
      action: this.queryApiAction,
      sort: this.sort,
      filters: this.attr('value')
    }, request));
  },

  onChange: function() {
    //var v = this.attr('value');
    //console.log('onChange header', this, arguments);
  },

  onSelectAll: function(state) {
    dojo.query('> tbody > tr', this.domNode.parentNode.parentNode)
      .map(function(n) { return dijit.byNode(n); })
      .forEach(function(w) { w.attr('selected', state); });
  }

});
