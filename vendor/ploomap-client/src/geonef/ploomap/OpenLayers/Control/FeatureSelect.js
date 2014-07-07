

dojo.provide('geonef.ploomap.OpenLayers.Control.FeatureSelect');

/**
 * Overload supporting per-layer "multipleSelect" parameter
 */
geonef.ploomap.OpenLayers.Control.FeatureSelect = OpenLayers.Class(OpenLayers.Control.SelectFeature,
{
    toggle: true,

    clickFeature: function(feature) {
        if(!this.hover) {
            var selected = (OpenLayers.Util.indexOf(
                feature.layer.selectedFeatures, feature) > -1);
            if(selected) {
                if(this.toggleSelect()) {
                    this.unselect(feature);
                } else if(!this.multipleSelect(feature.layer)) {
                    this.unselectAll({except: feature});
                }
            } else {
                if(!this.multipleSelect(feature.layer)) {
                    this.unselectAll({except: feature});
                }
                this.select(feature);
            }
        }
    },

    multipleSelect: function(layer) {
        return (layer.optWidget && layer.optWidget.multipleSelect) ||
            (this.handlers.feature.evt &&
             this.handlers.feature.evt[this.multipleKey]);
    },

    /**
     * Overrides OL's for per-layer unselection
     *
     * options:
     *  - except: feature not to unselect
     *  - layer: only unselect features from that layer
     */
    unselectAll: function(options) {
        // we'll want an option to supress notification here
        var layers = (options && options.layer) ? [options.layer] :
                       (this.layers || [this.layer]);
        var layer, feature;
        for(var l=0; l<layers.length; ++l) {
            layer = layers[l];
            //if (!layer.multipleSelect) {
              for(var i=layer.selectedFeatures.length-1; i>=0; --i) {
                  feature = layer.selectedFeatures[i];
                  if(!options || options.except != feature) {
                    this.unselect(feature);
                  }
              }
            //}
        }
    }

});
