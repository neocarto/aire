
dojo.provide('geonef.ploomap.layerDef.Default');

// parents
dojo.require('geonef.ploomap.layerDef.Base');

/**
 * Default layerDef class for geonef.ploomap.map.Classical
 */
dojo.declare('geonef.ploomap.layerDef.Default', geonef.ploomap.layerDef.Base,
{

  registerLayers: function() {
    this.inherited(arguments);
    this.addLayers(this.defaultLayers);
  },

  registerDefaultLayers: function() {
    //console.log('registerDefaultLayers', this, arguments);
    this.addLayers(this.defaultLayers);
  },


  // defaultLayer: array
  //    local array of layers
  defaultLayers: [
    // {
    //   name: 'test',
    //   title: 'Test',
    //   icon: '/images/icons/layer_test.png',
    //   layers: [
    //     {
    //       creator: function() {
    //         return new OpenLayers.Layer.WMS('Test',
    //                                         'http://remblais.cavadore.net:8080/geoserver/wms',
    //                                         { format: 'image/png' }, { isBaseLayer: false });
    //       }
    //     }
    //   ]
    // }
  ]


});
