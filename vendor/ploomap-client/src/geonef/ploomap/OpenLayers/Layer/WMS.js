

dojo.provide('geonef.ploomap.OpenLayers.Layer.WMS');

/** @requires OpenLayers/Layer/TMS.js */

/**
 * Inherits from:
 *  - <OpenLayers.Layer.TMS>
 */
geonef.ploomap.OpenLayers.Layer.WMS = OpenLayers.Class(OpenLayers.Layer.WMS,
{

  transitionEffect: 'resize',

  singleTile: true,

  initialize: function(options) {
    //console.log('initialize TMS', this, arguments);
    var params = { layers: options.layers };
    delete options.layers;
    if (options.format) {
      params.format = options.format;
      delete options.format;
    }
    var name = options.name;
    delete options.name;
    var url = options.url;
    delete options.url;
    var newArgs = [name, url, params, options];
    OpenLayers.Layer.WMS.prototype.initialize.apply(this, newArgs);
  }

});
