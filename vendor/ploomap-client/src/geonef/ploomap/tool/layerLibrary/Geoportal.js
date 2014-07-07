
dojo.provide('geonef.ploomap.tool.layerLibrary.Geoportal');

// parents
dojo.require('geonef.ploomap.tool.layerLibrary._Base');

// used in code
dojo.require('geonef.ploomap.tool.layer.Simple');

dojo.declare('geonef.ploomap.tool.layerLibrary.Geoportal',
             geonef.ploomap.tool.layerLibrary._Base,
{
  // summary:
  //   A library of Geoportal layers (from the French Institute of Geography)
  //

  templateString: dojo.cache("geonef.ploomap.tool.layerLibrary",
                             "templates/Geoportal.html"),

  autoBuildGrid: false,

  gridNbColumns: 1,

  startup: function() {
    //console.log('startup GEOP', this, arguments);
    this.inherited(arguments);
  },

  onMapBound: function() {
    this.inherited(arguments);
    //console.log('onMapzzzz GEOP', this, arguments);
    this.buildGrid(this.getGridParentNode(), this.getGridMembers());
  },

  getGridMembers: function() {
    //console.log('ggm', this, arguments);
    if (!this.mapWidget.map.allowedGeoportalLayers) {
      throw new Error('allowedGeoportalLayers property missing on map obj');
    }
    return this.mapWidget.map.allowedGeoportalLayers;
  },

  processGridMember: function(member, tr) {
    //console.log('pgmbutt', this, arguments);
    var dc = dojo.create
    //, td = dc('td', {}, tr)
    , buttonNode = dc('button', {}, tr)
    //, img = dc('img', { src: member.icon }, buttonNode)
    //, br = dc('br', {}, buttonNode)
    , code = member.replace(/\:.*/, '')
    , name = geonef.ploomap.tool.layer.Simple.prototype.translateLayerName(code)
    , span = dc('span', { innerHTML: name }, buttonNode)
    , self = this
    , button = new dijit.form.Button(
                 { onClick: function() {
                     self.addGeoportalLayer(member); }
                 }, buttonNode)
    ;
  },

  addGeoportalLayer: function(code) {
    //console.log('adding geoportal layer!', this, arguments);
    this.mapWidget.visu.addGeoportalLayer(code);
    // find added layer and enable visibility
    // (Geoportal layers are initially hidden)
    var _t = code.split(':');
    var layer = this.mapWidget.map.getLayersByName(_t[0])[0];
    if (layer) {
      this.postAddLayer(layer);
    } else {
      console.warn('did not find geoportal layer named', _t[0], 'after adding');
    }
  },

  postAddLayer: function(layer) {
    layer.title = geonef.ploomap.tool.layer.Simple.prototype.translateLayerName(layer.name);
    layer.setVisibility(true);
  }

});
