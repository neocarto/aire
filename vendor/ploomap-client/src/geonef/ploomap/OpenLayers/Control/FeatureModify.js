/**
 * @requires OpenLayers/Control/ModifyFeature.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.FeatureModify');

// parents
dojo.require('geonef.ploomap.OpenLayers.Control.FeatureEdition');

// used in code
dojo.require('geonef.ploomap.OpenLayers.Control.FeatureDrag');

/**
 * Control for modifying feature geometries
 *
 * @class
 */
dojo.declare('geonef.ploomap.OpenLayers.Control.FeatureModify',
             geonef.ploomap.OpenLayers.Control.FeatureEdition,
{

  operationLabel: 'édition',
  startTip: "Cliquer sur une géométrie pour modifier son tracé...",
  editTip: "Modifier la géométrie en cliquant et déplaçant ses " +
           "points. Cliquer ensuite ailleurs pour terminer la " +
           "modification.",

  /////////////////////////////////////////////////////////////
  // Lifecycle

  postMixInProperties: function() {
    this.inherited(arguments);

  },

  activate: function () {
    this._geometryType = this.layer.geometryType;
    this.layer.geometryType = null;
    this.inherited(arguments);
    this.layer.events.on({
      featureselected: this.onFeatureSelected,
      featureunselected: this.onFeatureUnselected,
      scope: this
    });
  },

  deactivate: function () {
    // if (this.layerGeometryType) {
    //   this.layer.geometryType = this.layerGeometryType;
    //   this.layerGeometryType = null;
    // }
    this.layer.events.un({
      featureselected: this.onFeatureSelected,
      featureunselected: this.onFeatureUnselected,
      scope: this
    });
    this.inherited(arguments);
    this.layer.geometryType = this._geometryType;
    this._geometryType = null;
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.buildButton('actions', 'setDragControl', 'Mode déplacement');
  },


  /////////////////////////////////////////////////////////////
  // Operations

  createControl: function() {
    this.control = new OpenLayers.Control.ModifyFeature(this.layer,
        { standalone: true });
    //console.log('create control', this, this.control, this.layer);
    this.connect(this.control, 'onModificationStart', 'onModificationStart');
    this.connect(this.control, 'onModification', 'onModification');
    this.connect(this.control, 'onModificationEnd', 'onModificationEnd');
  },

  setDragControl: function() {
    this.layer.optWidget.setClickControl(
      geonef.ploomap.OpenLayers.Control.FeatureDrag);
  },

  stopEdition: function() {
    //console.log('stopEdition', this, this.editingFeature);
    if (!this.editingFeature) { return false; }
    this.control.unselectFeature(this.editingFeature);
    return this.inherited(arguments);
  },


  /////////////////////////////////////////////////////////////
  // Events

  onFeatureSelected: function(event) {
    //console.log('onFeatureSelected', this, arguments);
    var feature = event.feature;
    // to avoid exception
    // "addFeatures : component should be an OpenLayers.Geometry.[...]"
    // this.layerGeometryType = this.layer.geometryType;
    // this.layer.geometryType = null;
    this.control.selectFeature(feature);
  },

  onFeatureUnselected: function(event) {
    //console.log('onFeatureUnselected', this, arguments);
    var feature = event.feature;
    this.control.unselectFeature(feature);
    // if (this.layerGeometryType) {
    //   this.layer.geometryType = this.layerGeometryType;
    //   this.layerGeometryType = null;
    // }
  }

});

/**
 * All types supported except POINT
 *
 * @inheritsDoc
 */
geonef.ploomap.OpenLayers.Control.FeatureModify.prototype.supportedGeometryTypes =
  [OpenLayers.Geometry.Polygon,
   OpenLayers.Geometry.LineString,
   OpenLayers.Geometry.Curve];

/**
 * Fall back is feature dragging control
 *
 * @inheritsDoc
 */
geonef.ploomap.OpenLayers.Control.FeatureModify.prototype.fallbackClass =
  geonef.ploomap.OpenLayers.Control.FeatureDrag;
