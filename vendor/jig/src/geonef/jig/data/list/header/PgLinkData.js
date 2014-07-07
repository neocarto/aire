
dojo.provide('geonef.jig.data.list.header.PgLinkData');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.data.list.header.pgLinkData.Actions');

// used in code
dojo.require('geonef.jig.list.header.generic.StringField');

dojo.declare('geonef.jig.data.list.header.PgLinkData', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache('geonef.jig.data.list.header', 'templates/PgLinkData.html'),

  /**
   * Set in "buildViewColumns" function
   *
   * @type {Object.<string, dijit._Widget>}
   */
  columnWidgets: {},

  onMetaReady: function() {
    //console.log('onMetaReady', this, arguments);
    this.buildViewColumns();
    this.inherited(arguments);
  },

  buildViewColumns: function() {
    //console.log('buildViewColumns', this, arguments);
    this.columnWidgets = {};
    geonef.jig.forEach(this.listWidget.columnsDefs, this.buildColumn, this);
  },

  buildColumn: function(def) {
    var widget =
      new geonef.jig.list.header.generic.StringField(
        { name: def.name, title: def.title });
    widget.placeAt(this.actionsField.domNode, 'before');
    this.columnWidgets[def.name] = widget;
    widget.startup();
  },


});
