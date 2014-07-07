
dojo.provide('geonef.ploomap.list.edition.map.Cartogram');

// parents
dojo.require('geonef.ploomap.list.edition.map.Ratio');

// used in code
dojo.require('geonef.ploomap.input.document.OgrLayer');

/**
 * Module for building ratio cartogram maps
 *
 * Actually, cartogram maps are no different from ratio maps.
 * Just specify a cartogram geographic layer for the "polygonOgr" property.
 *
 */
dojo.declare('geonef.ploomap.list.edition.map.Cartogram',
             [ geonef.ploomap.list.edition.map.Ratio ],
{

  module: 'Cartogram',

  propertyMap: {
    // The property "polygonOgrLayer" is renamed to "cartogramOgrLayer"
    // for the purpose of efficient param commonization
    cartogramOgrLayer: 'polygonOgrLayer'
  },

  getPropertiesOrder: function() {
    var props = this.inherited(arguments);
    props.splice(props.indexOf(this.propertyMap.cartogramOgrLayer), 1);
    return props.concat(['cartogramOgrLayer', 'cartogramLegendText']);
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        cartogramOgrLayer: this.propertyTypes.polygonOgrLayer,
        cartogramLegendText: { 'class': 'dijit.form.SimpleTextarea' },
      }, this.propertyTypes);
    delete this.propertyTypes.polygonOgrLayer;
  }

});
