
dojo.provide('geonef.ploomap.list.tool.map.Legend');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// in template
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.ploomap.legend.Container');

dojo.declare('geonef.ploomap.list.tool.map.Legend',
             [ dijit._Widget, dijit._Templated ],
{
  uuid: '',

  templateString: dojo.cache('geonef.ploomap.list.tool.map',
                             'templates/Legend.html'),
  widgetsInTemplate: true,

  postCreate: function() {
    this.inherited(arguments);
    this.onResolutionChange();
  },

  _setUuidAttr: function(uuid) {
    this.uuid = uuid;
    this.legendContainer.attr('uuid', uuid);
  },

  refreshMap: function() {
    this.legendContainer.refresh();
  },

  onResolutionChange: function() {
    this.legendContainer.attr('resolution', this.resolutionInput.attr('value'));
  },

  onResize: function() {
    // hook
  }

});
