

dojo.provide('geonef.ploomap.OpenLayers.Layer.TMS');

/** @requires OpenLayers/Layer/TMS.js */

/**
 * Inherits from:
 *  - <OpenLayers.Layer.TMS>
 */
geonef.ploomap.OpenLayers.Layer.TMS = OpenLayers.Class(OpenLayers.Layer.TMS,
{

  transitionEffect: 'resize',

  initialize: function(options) {
    //console.log('initialize TMS', this, arguments);
    var newArgs = [options.name, options.url, options];
    OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArgs);
  }

});
