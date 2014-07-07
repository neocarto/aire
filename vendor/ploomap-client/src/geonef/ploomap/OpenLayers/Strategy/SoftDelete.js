
/**
 * @requires OpenLayers/Strategy.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Strategy.SoftDelete');

/**
 * Allow to force the ordering of attributes before saving
 *
 * @class
 */
geonef.ploomap.OpenLayers.Strategy.SoftDelete =
  OpenLayers.Class(OpenLayers.Strategy,
{

  /**
   * Name of attribute to set to {deletedValue} when deleted (otherwise {notDeletedValue})
   *
   * @type {string}
   */
  deletedAttribute: 'deleted',

  /**
   * Value to set when deleted
   *
   * @type {string}
   */
  deletedValue: '1',

  /**
   * Value to set when not deleted
   *
   * @type {string}
   */
  notDeletedValue: '0',

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
          success: this.onCommitSuccess,
          fail: this.onCommitFailure,
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
          success: this.onCommitSuccess,
          fail: this.onCommitFailure,
          scope: this
      });
    }
    return deactivated;
  },

  beforeSave: function(event) {
    var features = event.features;
    features.forEach(dojo.hitch(this, 'inspectFeature'));
  },

  onCommitSuccess: function(event) {
    var features = event.features;
    if (features) {
      features.forEach(dojo.hitch(this, 'featureCommited'));
    }
  },

  onCommitFailure: function(event) {
    var features = event.features;
    features.forEach(dojo.hitch(this, 'revertFeature'));
  },

  inspectFeature: function(feature) {
    if (feature.state === OpenLayers.State.DELETE) {
      feature.state = OpenLayers.State.UPDATE;
      feature.attributes[this.deletedAttribute] = this.deletedValue;
    }
  },

  featureCommited: function(feature) {
    if (feature.attributes[this.deletedAttribute] === this.deletedValue) {
      feature.attributes[this.deletedAttribute] = this.notDeletedValue;
    }
  },

  revertFeature: function(feature) {
    if (feature.attributes[this.deletedAttribute] === this.deletedValue) {
      feature.attributes[this.deletedAttribute] = this.notDeletedValue;
      feature.state = OpenLayers.State.DELETE;
    }
  }

});



