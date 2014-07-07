
/**
 * @requires OpenLayers/Strategy.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Strategy.ComplexAttribute');

dojo.require('geonef.jig.util');

geonef.ploomap.OpenLayers.Strategy.ComplexAttribute = OpenLayers.Class(OpenLayers.Strategy,
{
  attribute: 'config',

  /**
   * APIMethod: activate
   * Activate the strategy.  Register any listeners, do appropriate setup.
   *
   * Returns:
   * {Boolean} The strategy was successfully activated.
   */
  activate: function() {
    var activated = OpenLayers.Strategy.prototype.activate.call(this);
    if(activated) {
      this.layer.events.on({
                             "beforefeaturesadded": this.processFeatures,
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
      this.clearCache();
      this.layer.events.un({
                             "beforefeaturesadded": this.processFeatures,
                             scope: this
                           });
    }
    return deactivated;
  },

  processFeatures: function(event) {
    //event.features.forEach(dojo.hitch(this, 'processOneFeature'));
  },

  processOneFeature: function(feature) {
    var value = feature.attributes[this.attribute];
    if (value) {
      console.log('try unserialize', value);
      var result = geonef.jig.util.unserializePhp(value);
      console.log('unserialize!', value, result);
    }
  }


});



