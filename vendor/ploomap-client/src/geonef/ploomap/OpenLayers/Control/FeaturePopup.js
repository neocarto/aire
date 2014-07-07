/**
 * @requires OpenLayers/Control.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.FeaturePopup');


/**
 * @class Control for showing up and managing popups
 *
 * This is pure management. No UI.
 */
dojo.declare('geonef.ploomap.OpenLayers.Control.FeaturePopup', OpenLayers.Control,
{

  /**
   * Layer to operate on
   *
   * @type {OpenLayers.Layer.Vector}
   */
  layer: null,

  defaultPopupWidth: 330,

  defaultPopupHeight: 200,

  defaultPopupClass: 'geonef.ploomap.layer.featureDetails.StackContainerBase',

  /////////////////////////////////////////////////////////////
  // OpenLayers Control interface

  activate: function () {
    //console.log('activate popup', this, arguments);
    this.inherited(arguments);
    this.layer.events.on({
      featureselected: this.onFeatureSelected,
      featureunselected: this.onFeatureUnselected,
      visibilitychanged: this.onVisibilityChanged,
      scope: this
    });
  },

  deactivate: function () {
    //console.log('deactivate', this, arguments);
    this.layer.events.un({
      featureselected: this.onFeatureSelected,
      featureunselected: this.onFeatureUnselected,
      visibilitychanged: this.onVisibilityChanged,
      scope: this
    });
    this.layer.features.forEach(
      function(f) { if (f.popup) { this.closePopup(f); } }, this);
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
    //console.log('onFeatureSelected popup', this, arguments);
    var feature = event.feature;
    this.openPopup(feature);
  },

  onFeatureUnselected: function(event) {
    //console.log('onFeatureUnselected', this, arguments);
    var feature = event.feature;
    if (feature.state !== OpenLayers.State.INSERT) {
      this.closePopup(feature);
    }
  },

  /**
   * When the layer is hidden, popups are just hid, not destroyed
   */
  onVisibilityChanged: function(event) {
    var state = this.layer.getVisibility();
    this.layer.features.filter(function(f) { return !!f.popup; })
      .forEach(function(f) { f.popup[state ? 'show' : 'hide'](); });
    return true;
  },


  /////////////////////////////////////////////////////////////
  // Management

  /**
   * Open the popup for the given feature
   *
   * @param {OpenLayers.Feature.Vector}
   */
  openPopup: function(feature) {
    //console.log('openPopup', feature, feature.attributes);
    var self = this;
    if (feature.popup) {
      feature.popup.show();
    } else {
      var width = this.layer.popupWidth || this.defaultPopupWidth;
      var height = this.layer.popupHeight || this.defaultPopupHeight;
      feature.popupClass = OpenLayers.Popup.FramedCloud;
      feature.data.popupContentHTML = '<div style="width:'+width +
                                        'px;height:'+height+'px;"></div>';
      feature.data.popupSize = null;
      //feature.data.popupSize = new OpenLayers.Size(400, 600);
      if (!feature.lonlat) {
        feature.lonlat = feature.geometry.getBounds().getCenterLonLat();
      }
      feature.popup = new feature.popupClass(
                        feature.id+'_popup',    // div ID
                        feature.lonlat,         // geo location
                        feature.data.popupSize, // popup size
                        feature.data.popupContentHTML,
                        null, false, //true,
                        function() { console.log('gni?', this, arguments); self.closePopup(feature); });
      feature.popup.panMapIfOutOfView = true;
      //console.log('popup', this, feature.popup);
      this.map.addPopup(feature.popup);
      this.createPopupWidget(feature);
      var dc = dojo.connect;
      feature.popup._cnt = [
        dc(feature.popup.widget, 'destroy', function() { self.closePopup(feature, true); })
      ];
      feature.destroyPopup = function() { console.log('destroyPopup', feature); self.closePopup(feature); };
    }
    //console.log('end openPopup', this, arguments);
  },

  /**
   * Create popup widget in the exxisting popup, for feature
   *
   * @param {OpenLayers.Feature.Vector}
   */
  createPopupWidget: function(feature) {
    var node = dojo.query('> div', feature.popup.contentDiv)[0]
    , Class = geonef.jig.util.getClass(this.layer.popupClass || this.defaultPopupClass)
    ;
    feature.popup.widget = new Class({ feature: feature }, node);
    feature.popup.widget.startup();
  },

  /**
   * Close popup of the given feature
   *
   * @param {OpenLayers.Feature.Vector}
   * @param {boolean=} if true, do not destroy the contained widget
   * @param {boolean=} if not true, this will unselect the feature
   */
  closePopup: function(feature, widgetAlreadyDestroyed, noUnselect) {
    //console.log('closePopup', this, arguments);
    if (!feature.popup) {
      return;
    }
    var self = this;
    if (feature.popup._cnt) {
      feature.popup._cnt.forEach(dojo.disconnect);
      feature.popup._cnt = null;
    }
    if (feature.popup.widget && !widgetAlreadyDestroyed) {
      feature.popup.widget.destroy();
      feature.popup.widget = null;
    }
    OpenLayers.Feature.prototype.destroyPopup.call(feature);
    feature.popup = null;
    if (!noUnselect && this.layer.selectedFeatures.indexOf(feature) !== -1) {
      feature.layer.map.selectControl.unselect(feature);
    }
    if (feature.state === OpenLayers.State.INSERT) {
      feature.destroy();
    }
  }

});

OpenLayers.Popup.AnchoredBubble.CORNER_SIZE = 0;
(function() {
   var x1 = 2; // 8
   var y1 = 34; // 40
   var x2 = 2; // 8
   var y2 = 3; // 9
   OpenLayers.Popup.FramedCloud.prototype.positionBlocks.tl.padding =
     new OpenLayers.Bounds(x1, y1, x2, y2);
   OpenLayers.Popup.FramedCloud.prototype.positionBlocks.tr.padding =
     new OpenLayers.Bounds(x1, y1, x2, y2);
   OpenLayers.Popup.FramedCloud.prototype.positionBlocks.bl.padding =
     new OpenLayers.Bounds(x2, y2, x1, y1);
   OpenLayers.Popup.FramedCloud.prototype.positionBlocks.br.padding =
     new OpenLayers.Bounds(x2, y2, x1, y1);
 })();
