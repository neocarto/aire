
dojo.provide('geonef.ploomap.OpenLayers.Format.SLD');

dojo.require('geonef.ploomap.OpenLayers.Format.sld.v1_0_0_ploomap');

/**
 * @requires OpenLayers/Format/SLD.js
 */

/**
 * Class: OpenLayers.Format.SLD
 * Read/Wite SLD. Create a new instance with the <OpenLayers.Format.SLD>
 *     constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Format.XML>
 */
geonef.ploomap.OpenLayers.Format.SLD = OpenLayers.Class(OpenLayers.Format.SLD,
{

    /**
     * APIProperty: version
     * {String} Specify a version string if one is known.
     */
    version: "1.0.0-ploomap",

    /**
     * Constructor: OpenLayers.Format.SLD
     * Create a new parser for SLD.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
      OpenLayers.Format.SLD.prototype.initialize.apply(this, [options]);
      this.createParser();
    },

    createParser: function() {
      var Format = geonef.ploomap.OpenLayers.Format.sld.v1_0_0_ploomap;
      this.parser = new Format(this.options);
    },


    CLASS_NAME: "geonef.ploomap.OpenLayers.Format.SLD"
});
