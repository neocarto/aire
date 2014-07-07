
dojo.provide('geonef.ploomap.layer.featureDetails.StackContainerBase');

// parents
dojo.require('dijit.layout.StackContainer');

// used in code
dojo.require('geonef.jig.util');

/**
 * @class Base class for children-based featureDetails
 */
dojo.declare('geonef.ploomap.layer.featureDetails.StackContainerBase',
             dijit.layout.StackContainer,
{
  /**
   * Attributes schema
   *
   * @type {Object}
   */
  attrSchema: {},

  /**
   * Related feature
   *
   * @type {Geonef.Ploomap.Feature.Vector}
   */
  feature: null,

  /**
   * Widget managing the layer
   *
   * @type {geonef.ploomap.layer.Vector}
   */
  //layer: null,

  /**
   * Widget class name to show first
   *
   * @type {string}
   */
  initialChild: 'geonef.ploomap.layer.featureDetails.Auto',

  /**
   * Widget class name for property edition
   *
   * @type {string}
   */
  propertyWidgetClass: 'geonef.ploomap.layer.featureDetails.PropertyForm',

  doLayout: true,

  /**
   * Strategy to communicate with for save operation
   *
   * @type {OpenLayers.Strategy.Save}
   */
  saveStrategy: null,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.saveStrategy = (this.feature.layer.strategies || []).filter(
        function(s) { return s.CLASS_NAME === 'OpenLayers.Strategy.Save'; })[0];
  },

  buildRendering: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'jigCacoin padding');
  },

  startup: function() {
    this.inherited(arguments);
    this.initialChild = this.openWidget(this.initialChild);
    if (this.feature.state === OpenLayers.State.INSERT) {
      this.openWidget(this.propertyWidgetClass);
    }
  },

  destroy: function() {
    this.feature = null;
    this.initialChild = null;
    this.inherited(arguments);
  },

  getAttrSchema: function() {
    return this.attrSchema;
  },

  openWidget: function(widget) {
    if (dojo.isString(widget) || dojo.isFunction(widget)) {
      widget = this.makeWidget(widget);
    }
    this.addChild(widget);
    widget._scCnt = widget.connect(widget, 'uninitialize', dojo.hitch(this,
      function() {
        this.removeChild(widget);
      }));
    if (this._started) {
      this.selectChild(widget);
    }
    return widget;
  },

  makeWidget: function(className) {
    var Class = geonef.jig.util.getClass(className);
    var widget = new Class({ feature: this.feature, container: this });
    return widget;
  },

  removeChild: function(widget) {
    this.inherited(arguments);
    if (widget._scCnt) {
      widget.disconnect(widget._scCnt);
      widget._scCnt = null;
    }
  },

  deleteFeature: function(noConfirm) {
    //console.log('deleteFeature', this, arguments);
    if (this.isReadOnly) {
      console.warn('cannot delete feature: layer is readonly', this);
    }
    if (!noConfirm &&
        !confirm('Voulez-vous vraiment supprimer ce vecteur ?')) {
      return;
    }
    if (this.feature.state !== OpenLayers.State.INSERT) {
      //this.destroy();
      var feature = this.feature;
      feature.state = OpenLayers.State.DELETE;
      //dojo.publish('jig/workspace/flash', [ "Suppression de l'élément..." ]);
      this.saveStrategy.save([feature]);
      feature.layer.removeFeatures([feature]);
      feature.destroy();
    }
  },

  // moveFeatureGeometry: function() {
  //   this.destroy();
  //   this.layer.moveFeatureGeometry(this.feature);
  // },

  // editFeatureGeometry: function() {
  //   this.destroy();
  //   this.layer.editFeatureGeometry(this.feature);
  // }

});
