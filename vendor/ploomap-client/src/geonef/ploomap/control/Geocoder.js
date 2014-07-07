
dojo.provide('geonef.ploomap.control.Geocoder');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._LayoutSwitch');

// used in template
dojo.require('geonef.jig.input.TextBox');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.ploomap.panel.Search');


dojo.declare('geonef.ploomap.control.Geocoder',
             [ dijit._Widget, dijit._Templated, geonef.jig.widget._LayoutSwitch ],
{
  templateString: dojo.cache('geonef.ploomap.control', 'templates/Geocoder.html'),
  widgetsInTemplate: true,

  destory: function() {
    this.destroySearchPane();
    this.inherited(arguments);
  },

  search: function() {
    this.destroySearchPane();
    var value = this.searchBox.attr('value');
    if (!dojo.trim(value)) { return; }
    this.searchPane = new geonef.ploomap.panel.Search();
    this.searchPane.placeAt(this.paneNode).startup();
    this.searchPane.attr('search', value);
  },

  destroySearchPane: function() {
    if (this.searchPane) {
      this.searchPane.destroy();
      delete this.searchPane;
    }
  },

  onAppear: function() {
    if (this.searchPane) {
      this.searchPane.onAppear();
    }
  },

  onDisappear: function() {
    if (this.searchPane) {
      this.searchPane.onDisappear();
    }
  }

});
