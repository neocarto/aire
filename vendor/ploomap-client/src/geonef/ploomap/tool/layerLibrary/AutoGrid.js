
dojo.provide('geonef.ploomap.tool.layerLibrary.AutoGrid');

// parents
dojo.require('geonef.ploomap.tool.layerLibrary._Base');

dojo.declare('geonef.ploomap.tool.layerLibrary.AutoGrid', [ geonef.ploomap.tool.layerLibrary._Base ],
{
  // summary:
  //   Widget laying out a grid automatically for buttons to add layers
  //

  autoBuildGrid: false,

  filterProp: '',
  filterValue: '',

  onMapBound: function() {
    this.inherited(arguments);
    var node = this.getGridParentNode();
    this.buildGrid(node, this.getGridMembers());
  },

  getGridMembers: function() {
    //console.log('grid member', this.mapWidget.layersDefs.layers);
    var layers = this.mapWidget.layersDefs.layers;
    //console.log('getGridMembers layers', layers);
    var _z = layers.filter(dojo.hitch(this, 'filter'));
    //console.log('getGridMembers', this, _z);
    return _z;
  },

  clickForLayer: function(def) {
    var layer = this.mapWidget.layersDefs.addLayerToMap(def.name);
    //console.log('added layer', this, layer, layer.inRange);
    //layer.inRange
  },

  filter: function(layer) {
    return !this.filterProp || layer[this.filterProp] === this.filterValue;
  }

});
