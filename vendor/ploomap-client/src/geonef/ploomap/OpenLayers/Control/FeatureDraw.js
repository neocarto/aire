/**
 * @requires OpenLayers/Control/FeatureDraw.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.FeatureDraw');

// parents
dojo.require('geonef.ploomap.OpenLayers.Control.FeatureEdition');

// used in code
dojo.require('geonef.ploomap.OpenLayers.Control.FeaturePopup');

/**
 * Control for drawing new features
 *
 * @class
 */
dojo.declare('geonef.ploomap.OpenLayers.Control.FeatureDraw',
             geonef.ploomap.OpenLayers.Control.FeatureEdition,
{

  operationLabel: 'création',
  startTip: "Cliquer pour poser le (premier) point...",
  editTip: "Cliquer pour poser le point suivant, ou double-cliquer " +
           "pour qu'il soit le dernier... ",

  /**
   * Draw handler
   *
   * @type {OpenLayers.Handler}
   */
  handler: null,


  /////////////////////////////////////////////////////////////
  // Workflow

  postMixInProperties: function() {
    this.inherited(arguments);
    //console.log('this.layer.geometryType', this.layer.geometryType);
    if (!this.layer.geometryType) {
      console.error('no geometryType for layer', this.layer, this);
      throw new Error('no geometryType for layer '+this.layer.name);
    }
    this.handler = {
      'OpenLayers.Geometry.Point': OpenLayers.Handler.Point,
      'OpenLayers.Geometry.Line': OpenLayers.Handler.Path,
      'OpenLayers.Geometry.Polygon': OpenLayers.Handler.Polygon
    }[this.layer.geometryType.prototype.CLASS_NAME];
    if (!this.handler) {
      throw new Error('invalid layer geometryType: '+this.layer.geometryType.prototyp.CLASS_NAME);
    }
  },

  activate: function () {
    this.inherited(arguments);
    this.control.events.on({
      featureadded: this.onFeatureAdded,
      scope: this
    });
  },

  deactivate: function () {
    this.control.events.un({
      featureadded: this.onFeatureAdded,
      scope: this
    });
    this.inherited(arguments);
  },

  // destroy: function() {
  //   this.control.handler.callbacks = null;
  //   this.inherited(arguments);
  // },


  /////////////////////////////////////////////////////////////
  // Operations

  createControl: function() {
    this.control = new OpenLayers.Control.DrawFeature(this.layer, this.handler,
        {
          callbacks: {
            create: dojo.hitch(this, 'onGeometryCreate'),
            modify: dojo.hitch(this, 'onGeometryModify'),
            point: dojo.hitch(this, 'onGeometryPoint'),
            //done: dojo.hitch(this, 'onGeometryDone'),
            cancel: dojo.hitch(this, 'onGeometryCancel')
          },
        });
  },

  setDragControl: function() {
    this.layer.setClickControl(
      geonef.ploomap.OpenLayers.Control.FeatureDrag);
  },

  stopEdition: function() {
    //console.log('stopEdition', this, this.editingFeature);
    if (!this.editingFeature) { return false; }
    this.control.handler.deactivate();
    this.control.handler.activate();
    return this.inherited(arguments);
  },


  /////////////////////////////////////////////////////////////
  // Events

  onGeometryCreate: function(point, feature) {
    //console.log('onGeometryCreate', this, arguments);
    this.attr('editingFeature', feature);
  },

  onGeometryModify: function(point, feature) {
    //console.log('onGeometryModify', this, arguments);
  },
  onGeometryPoint: function(point, polygon) {
    //console.log('onGeometryPoint', this, arguments);
    //this.onModification(this.editingFeature); // useless
  },
  onGeometryDone: function(polygon) {
    var feature = this.editingFeature;
    //console.log('onGeometryDone', this, arguments, feature);
  },
  onGeometryCancel: function() {
    console.log('onGeometryCancel', this, arguments);
    this.attr('editingFeature', null);
  },

  onFeatureAdded: function(event) {
    //console.log('onFeatureAdded', this, arguments);
    var feature = event.feature;
    this.attr('editingFeature', null);
    this.setupNewFeature(feature);
    this.layer.setClickControl(
      geonef.ploomap.OpenLayers.Control.FeaturePopup);
    this.layer.map.selectControl.select(feature);
  },

  setupNewFeature: function(feature) {
    if (feature.layer.defaultAttributes) {
      dojo.mixin(feature.attributes, feature.layer.defaultAttributes);
    }
  }

});
