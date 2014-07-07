
dojo.provide('geonef.ploomap.strategy.Hide');

/**
 * @requires OpenLayers/Strategy.js
 */

geonef.ploomap.strategy.Hide = OpenLayers.Class(OpenLayers.Strategy, {

    /**
     * APIProperty: filter
     * {<OpenLayers.Filter>}  Filter for limiting features shown
     *     Use the <setFilter> method to update this filter after construction.
     */
    filter: null,

    hidden: null,

    /**
     * APIMethod: activate
     * Activate the strategy.  Register any listeners, do appropriate setup.
     *     By default, this strategy automatically activates itself when a layer
     *     is added to a map.
     *
     * Returns:
     * {Boolean} True if the strategy was successfully activated or false if
     *      the strategy was already active.
     */
    activate: function() {
        var activated = OpenLayers.Strategy.prototype.activate.apply(this, arguments);
        if (activated) {
            this.hidden = [];
            this.layer.events.on({
                "featuresadded": this.handleAdd,
                "beforefeaturesremoved": this.handleRemove,
                scope: this
            });
          this.setFilter(this.filter);
        }
        return activated;
    },

    /**
     * APIMethod: deactivate
     * Deactivate the strategy.  Clear the feature cache.
     *
     * Returns:
     * {Boolean} True if the strategy was successfully deactivated or false if
     *      the strategy was already inactive.
     */
    deactivate: function() {
      if (this.layer) {
        this.hidden.forEach(function(f) { this.layer.drawFeature(f); }, this);
        if (this.layer.events) {
          this.layer.events.un({
              "featuresadded": this.handleAdd,
              "beforefeaturesremoved": this.handleRemove,
              scope: this
          });
        }
      }
      return OpenLayers.Strategy.prototype.deactivate.apply(this, arguments);
    },

    /**
     * Method: handleAdd
     */
    handleAdd: function(event) {
        if (this.filter) {
            //var features = event.features;
            //event.features = [];
            var features = event.features.filter(this.filter.evaluate, this.filter);
            this.layer.eraseFeatures(features);
            this.hidden = this.hidden.concat(features);
        }
    },

    /**
     * Method: handleRemove
     */
    handleRemove: function(event) {
      if (event.features) {
        event.features.forEach(
          function(f) {
            var idx = this.hidden.indexOf(f);
            if (idx !== -1) {
              this.hidden.splice(idx, 1);
            }
          }, this);
      }
    },

    /**
     * APIMethod: setFilter
     * Update the filter for this strategy.  This will re-evaluate
     *     any features on the layer and in the cache.
     *
     * Parameters:
     * filter - <OpenLayers.Filter> A filter for evaluating features.
     */
    setFilter: function(filter) {
      this.hidden.forEach(function(f) { this.layer.drawFeature(f); }, this);
      this.hidden = [];
      this.handleAdd({ features: this.layer.features });
      //this.layer.eraseFeatures(features);
      this.filter = filter;
    },

    CLASS_NAME: "OpenLayers.Strategy.Filter"

});
