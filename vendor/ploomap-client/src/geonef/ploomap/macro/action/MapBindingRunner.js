dojo.provide('geonef.ploomap.macro.action.MapBindingRunner');

// parents
dojo.require('geonef.jig.macro.action.Runner');

// used in code
dojo.require('geonef.ploomap.map.Classical');

dojo.declare('geonef.ploomap.macro.action.MapBindingRunner', [ geonef.jig.macro.action.Runner ],
{
  // summary:
  //   Base class for map-based actions
  //

  mapWidget: null,

  postscript: function() {
    this.inherited(arguments);
    this.bindMap();
  },

  bindMap: function() {
    var ws = dijit.registry.filter(
      function(w) { return w.isInstanceOf(geonef.ploomap.map.Classical); });
    if (!ws.length) {
      console.error('did not found any map widget (for map-bound action runner)', this);
    }
    //console.log('found widgets:', ws);
    this.mapWidget = (ws.toArray())[0];
  },

  findLayer: function(name) {
    var layers = this.mapWidget.map.getLayersByName(name)
      .filter(function(layer) { return layer.displayInLayerSwitcher; });
    if (!layers.length) {
      console.warn('did not found on map a layer with given name',
                   name, this.mapWidget.map);
    }
    if (layers.length > 1) {
      console.warn('found on map more than one layer with name',
                   name, layers, this.mapWidget.map);
    }
    return layers[0];
  }

});
