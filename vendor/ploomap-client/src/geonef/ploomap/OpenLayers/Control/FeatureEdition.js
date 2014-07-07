
dojo.provide('geonef.ploomap.OpenLayers.Control.FeatureEdition');

// parents
dojo.require('geonef.ploomap.OpenLayers.Control.Widget');
dojo.require('geonef.jig.widget.ButtonContainerMixin');

// template
dojo.require('geonef.jig.button.Action');

/**
 * @class Base class for feature edition controls
 *
 * This takes care of a history of the changes and the possibility
 * to revert them, as well as saving them.
 */
dojo.declare('geonef.ploomap.OpenLayers.Control.FeatureEdition',
             [ geonef.ploomap.OpenLayers.Control.Widget, geonef.jig.widget.ButtonContainerMixin ],
{

  /**
   * Layer to operate on
   *
   * @type {OpenLayers.Layer.Vector}
   */
  layer: null,

  /**
   * Strategy to communicate with for save operation
   *
   * @type {OpenLayers.Strategy.Save}
   */
  saveStrategy: null,

  /**
   * @type {string}
   */
  operationLabel: 'édition',

  /**
   * Tip appearing when an edition is in progress, telling the user how to continue
   *
   * @type {string}
   */
  editTip: "",

  /**
   * Tip appearing when no edition is in progress, telling the user how to start
   *
   * @type {string}
   */
  startTip: "",

  templateString: dojo.cache('geonef.ploomap.OpenLayers.Control',
                             'templates/FeatureEdition.html'),

  layoutSwitcherPosition: 'right',

  /**
   * @type {integer}
   */
  count: 0,

  /**
   * @type {Array.<OpenLayers.Feature.Vector>}
   */
  dirtyFeatures: null,

  /**
   * @type {Array.<HTMLTableRowElement>}
   */
  dirtyRows: null,


  /////////////////////////////////////////////////////////////
  // LIFECYCLE & OpenLayers Control interface

  postMixInProperties: function() {
    this.inherited(arguments);
    this.dirtyFeatures = [];
    this.dirtyRows = [];
    if (this.layer.strategies) {
      this.saveStrategy = this.layer.strategies.filter(
        function(s) { return s.CLASS_NAME === 'OpenLayers.Strategy.Save'; })[0];
      // used if we need to monitor save XHR (ex: change button visib, auto-destroy..)
      // if (this.saveStrategy) {
      //   this.saveStrategy.events.on(
      //     {
      //       "start": this.saveStart,
      //       "success": this.saveSuccess,
      //       "fail": this.saveFailure,
      //       scope: this
      //     });
      // }
    }
    if (!this.saveStrategy) {
      console.error('saveStrategy not found on layer', this.layer, this);
      throw new Error('saveStrategy not found on layer '+this.layer.name);
    }
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.saveButton = this.buildButton('actions', 'save', 'Enregistrer');
    this.revertAllButton = this.buildButton('actions', 'revertAll', 'Tout rétablir');
    this.quitButton = this.buildButton('actions', 'close', 'Fermer');
  },

  postCreate: function() {
    this.inherited(arguments);
    this.createControl();
    this.attr('count', this.count);
  },

  destroy: function() {
    //console.log('destroy', this, arguments);
    this.inherited(arguments);
    this.control.destroy();
    this.control = null;
    /*while (this.dirtyFeatures.length) {
      this.unsetDirty(this.dirtyFeatures[0]);
    }*/
  },

  setMap: function(map) {
    this.inherited(arguments);
    this.control.setMap(map);
  },

  activate: function () {
    this.inherited(arguments);
    this.control.activate();
  },

  deactivate: function () {
    this.inherited(arguments);
    this.revertAll();
    this.control.deactivate();
  },


  /////////////////////////////////////////////////////////////
  // Getters & setters

  _setCountAttr: function(count) {
    //console.log('_setCountAttr', this, arguments);
    this.count = count;
    if (this.countNode) {
      this.countNode.innerHTML = count;
    }
    dojo.style(this.saveButton.domNode, 'display', count ? '' : 'none');
    dojo.style(this.revertAllButton.domNode, 'display', count ? '' : 'none');
    //dojo.style(this.quitButton.domNode, 'display', count ? 'none' : '');
    dojo.style(this.countDivNode, 'display', count ? '' : 'none');
  },

  /**
   * @param {?OpenLayers.Feature.Vector}
   */
  _setEditingFeatureAttr: function(feature) {
    //console.log('_setEditingFeatureAttr', this, arguments);
    this.editingFeature = feature;
    if (feature) {
      this.featureLabelNode.innerHTML = this.getFeatureLabel(feature);
    }
    dojo.style(this.editInfoNode, 'display', feature ? '' : 'none');
    dojo.style(this.startTipNode, 'display', feature ? 'none' : '');
  },

  /**
   * @param {OpenLayers.Feature.Vector}
   */
  getFeatureLabel: function(feature) {
    //console.log('getFeatureLabel', this, arguments);
    return this.layer.getFeatureTitle ?
      this.layer.getFeatureTitle(feature) :
      (feature.attributes.name || feature.fid);
  },


  /////////////////////////////////////////////////////////////
  // Operating

  createControl: function() {
    throw new Error('"createControl" must be overloaded');
  },

  /**
   * @param {OpenLayers.Feature.Vector}
   */
  unsetDirty: function(feature) {
    var k = this.dirtyFeatures.indexOf(feature);
    if (k !== -1) {
      feature.state = null;
      if (feature.copyGeometry) {
        feature.copyGeometry.destroy();
        feature.copyGeometry = null;
      }
      this.dirtyFeatures.splice(k, 1);
      this.dirtyListNode.removeChild(this.dirtyRows[k]);
      this.dirtyRows.splice(k, 1);
      this.attr('count', this.count - 1);
    }
  },

  setDirty: function(feature) {
    //console.log('setDirty', this, arguments);
    if (this.dirtyFeatures.indexOf(feature) === -1) {
      feature.state = OpenLayers.State.UPDATE;
      this.dirtyFeatures.push(feature);
      this.attr('count', this.count + 1);
      var tr = geonef.jig.makeDOM(
        ['tr', {}, [
         ['td', {'class':'n'}, this.getFeatureLabel(feature)],
         ['td', {},
          ['span', {'class':'link',
                    onclick:dojo.hitch(this, 'revertFeature', feature)},
             "Rétablir"]]]
        ]);
      this.dirtyListNode.appendChild(tr);
      this.dirtyRows.push(tr);
    }
  },

  stopEdition: function() {
    if (!this.editingFeature) { return false; }
    this.attr('editingFeature', null);
    return true;
  },


  /////////////////////////////////////////////////////////////
  // Actions

  save: function() {
    this.stopEdition();
    var features = this.dirtyFeatures.slice(0);
    //console.log('save', this, features);
    //features.forEach(function(f) { f.state = OpenLayers.State.UPDATE; });
    // slice again, as strategies can modify the array (ie. JsonAttribute)
    this.saveStrategy.save(features.slice(0));
    features.forEach(this.unsetDirty, this);
  },

  close: function() {
    //console.log('cancel', this, arguments);
    if (this.canBeClosed()) {
      this.destroy();
    }
  },

  /**
   * @param {OpenLayer.Feature.Vector}
   */
  revertFeature: function(feature) {
    //console.log('revertFeature', this, arguments);
    if (!feature.copyGeometry) {
      console.error('cannot revert feature: no geometry copy', feature, this);
      return;
    }
    this.layer.eraseFeatures([feature]);
    feature.geometry.destroy();
    feature.geometry = feature.copyGeometry;
    feature.copyGeometry = null;
    this.layer.drawFeature(feature);
    this.unsetDirty(feature);
  },

  revertAll: function() {
    //console.log('revertAll', this, arguments);
    this.stopEdition();
    this.dirtyFeatures.slice(0).forEach(this.revertFeature, this);
  },


  /////////////////////////////////////////////////////////////
  // Events

  /**
   * @param {OpenLayer.Feature.Vector}
   */
  onModificationStart: function(feature) {
    //console.log('onModificationStart', this, arguments);
    if (!feature.copyGeometry) {
      feature.copyGeometry = feature.geometry.clone();
    }
    this.attr('editingFeature', feature);
  },

  /**
   * @param {OpenLayer.Feature.Vector}
   */
  onModification: function(feature) {
    //console.log('onModification', this, arguments);
  },

  /**
   * @param {OpenLayer.Feature.Vector}
   */
  onModificationEnd: function(feature) {
    //console.log('onModificationEnd', this, arguments);
    this.setDirty(feature);
    this.attr('editingFeature', null);
  },

  canBeClosed: function() {
    if (!this.count) { return true; }
    if (!window.confirm(
          'Fermer le mode '+this.operationLabel+' et annuler les changements'+
          ' sur les '+this.count+' géométrie(s) ?')) {
      return false;
    }
    this.revertAll();
    return true;
  },


});

/**
 * List of geometry types compatible with this widget.
 *
 * If null, the widget is considered compatible with all types.
 * Otherwise, this must be an array of strings such as
 * OpenLayers.Geometry.Polygon.
 *
 * @type {?Array.<OpenLayers.Geometry>}
 */
geonef.ploomap.OpenLayers.Control.FeatureEdition.prototype.supportedGeometryTypes =
  null;

/**
 * Fallback class for layers with not suuported geometry type
 *
 * @type {?OpenLayers.Control|geonef.ploomap.OpenLayers.Control.Widget}
 */
geonef.ploomap.OpenLayers.Control.FeatureEdition.prototype.fallbackClass =
  null;
