/**
 * @requires OpenLayers/Control.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.CreateLayerPlan');

// used in code
dojo.require('geonef.ploomap.OpenLayers.Layer.LegacyTMS');

/**
 * @class Control for creating a layer "plan" when plan vector is selected
 *
 * This is pure management. No UI.
 */
dojo.declare('geonef.ploomap.OpenLayers.Control.CreateLayerPlan', OpenLayers.Control,
{

  /**
   * Layer to operate on
   *
   * @type {OpenLayers.Layer.Vector}
   */
  layer: null,


  /////////////////////////////////////////////////////////////
  // OpenLayers Control interface

  activate: function () {
    this.inherited(arguments);
    this.layer.events.on({
      featureselected: this.onFeatureSelected,
      featureunselected: this.onFeatureUnselected,
      //visibilitychanged: this.onVisibilityChanged,
      scope: this
    });
  },

  deactivate: function () {
    //console.log('deactivate', this, arguments);
    this.layer.events.un({
      featureselected: this.onFeatureSelected,
      featureunselected: this.onFeatureUnselected,
      //visibilitychanged: this.onVisibilityChanged,
      scope: this
    });
    this.inherited(arguments);
  },

  /**
   * For calling deactivate(), which OpenLayers.Control doesn't do!
   */
  destroy: function() {
    //console.log('destroy', this, arguments);
    this.deactivate();
    this.inherited(arguments);
  },



  /////////////////////////////////////////////////////////////
  // Events

  onFeatureSelected: function(event) {
    var feature = event.feature;
    this.createLayerPlan(feature);
  },

  onFeatureUnselected: function(event) {
    var feature = event.feature;
    this.destroyLayerPlan(feature);
  },


  /////////////////////////////////////////////////////////////
  // Management

  createLayerPlan: function(feature) {
    //console.log('createLayerPlan', this, arguments);
    if (this.layer.optWidget.findLayerPlan(feature)) {
      return;
    }
    var layer = new geonef.ploomap.OpenLayers.Layer.LegacyTMS(
      feature.attributes.title, feature.attributes.name,
      {
        type: feature.attributes.tile_format,
        alwaysInRange: false,
        minResolution: this.map.getResolutionForZoom(feature.attributes.maxzoom),
        maxResolution: this.map.getResolutionForZoom(feature.attributes.minzoom),
        layerExtent: feature.geometry.bounds.clone(),
        icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_plan.png'),
        metadata: {
          description: 'Plan : '+feature.attributes.title,
          collection: 'Plans de Catapatate',
          source: 'Catapatate - encyclopédie des souterrainns',
          copyright: 'Communauté Catapatate, tous droits réservés',
          url: 'http://wiki.catapatate.net/wiki/' + feature.attributes.wiki
        }
      });
    this.map.addLayer(layer);
  },

  destroyLayerPlan: function(feature) {
    var layer = this.layer.optWidget.findLayerPlan(feature);
    if (layer) {
      this.map.mapWidget.destroyLayerWithEffect(layer);
      //this.map.removeLayer(layer);
      //layer.destroy();
    }
  }

});
