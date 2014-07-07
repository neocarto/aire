
/**
 * @requires OpenLayers/Strategy.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Strategy.SaveAttrOrder');

/**
 * Allow to force the ordering of attributes before saving
 *
 * @class
 */
geonef.ploomap.OpenLayers.Strategy.SaveAttrOrder =
  OpenLayers.Class(OpenLayers.Strategy,
{

  /**
   * Order of attributes to save.
   *
   * Only the attributes listed here will be saved!
   *
   * @type {Array.<string>}
   */
  order: [],

  /**
   * Strategy to communicate with for save operation
   *
   * @type {OpenLayers.Strategy.Save}
   */
  saveStrategy: null,

  /**
   * APIMethod: activate
   * Activate the strategy.  Register any listeners, do appropriate setup.
   *
   * Returns:
   * {Boolean} The strategy was successfully activated.
   */
  activate: function() {
    var activated = OpenLayers.Strategy.prototype.activate.call(this);
    if (activated) {
      this.saveStrategy.events.on({
          start: this.beforeSave,
          scope: this
      });
    }
    return activated;
  },

  /**
   * APIMethod: deactivate
   * Deactivate the strategy.  Unregister any listeners, do appropriate
   *     tear-down.
   *
   * Returns:
   * {Boolean} The strategy was successfully deactivated.
   */
  deactivate: function() {
    var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
    if(deactivated) {
      this.saveStrategy.events.un({
          start: this.beforeSave,
          scope: this
      });
    }
    return deactivated;
  },

  beforeSave: function(event) {
    var features = event.features;
    features.forEach(dojo.hitch(this, 'reorderFeature'));
  },

  reorderFeature: function(feature) {
    var obj = {};
    this.order.forEach(
        function(attr) {
          if (feature.attributes.hasOwnProperty(attr)) {
            obj[attr] = feature.attributes[attr];
          }
        });
    feature.attributes = obj;
  }


});



