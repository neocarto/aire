/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

dojo.provide('geonef.ploomap.OpenLayers.Layer.Bing');

/**
 * @requires OpenLayers/Layer/Bing.js
 */

/**
 * Class: geonef.ploomapOpenLayers.Layer.Bing
 *
 * Doc on: http://msdn.microsoft.com/en-us/library/ff701724.aspx
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Bing>
 */
geonef.ploomap.OpenLayers.Layer.Bing = OpenLayers.Class(OpenLayers.Layer.Bing,
{

  ////////////////////////////////////////////////////////////////////
  // Layer lifecycle

  initLayer: function() {
    // fix OpenLayers.Layer.Bing to set the {culture} parameter
    this.metadata.resourceSets[0].resources[0].imageUrl =
      this.metadata.resourceSets[0].resources[0].imageUrl
          .replace('{culture}', 'FR-fr');
    OpenLayers.Layer.Bing.prototype.initLayer.apply(this, arguments);
  },


  ////////////////////////////////////////////////////////////////////
  // Export functionality

  getExportFormats: function() {
    return {
      auto: "Automatique"
    };
  },

  getExportMaxSize: function() {
    return 900; /* max width is 900, max height is 834 */
  },

  getExportNotice: function() {
    return "Attention : l'étendue de export sera ajusté au zoom le "
      + "plus proche pour la couche";
  },

  /**
   * params has the member: format, width, height, extent
   */
  getExportUrl: function(params, callback) {
    var proj4326 = new OpenLayers.Projection('EPSG:4326');
    var extent4326 = params.extent.clone()
      .transform(this.map.getProjectionObject(), proj4326);
    var url = 'http://dev.virtualearth.net/REST/v1/Imagery/Map/'+this.type
        + '?mapArea=' + extent4326.toBBOX(undefined, true)
        + '&mapSize=' + params.width + ',' + params.height
        + '&key=' + this.key;
    console.log('bing export url', this, arguments, url);
    callback(url);
  }

});
