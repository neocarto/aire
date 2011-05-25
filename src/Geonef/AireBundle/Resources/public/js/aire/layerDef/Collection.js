

dojo.provide('aire.layerDef.Collection');

// parents
dojo.require('geonef.ploomap.layerDef.Base');

/**
 * Register collections maps as layers
 */
dojo.declare('aire.layerDef.Collection', [ geonef.ploomap.layerDef.Base ],
{

  registerLayers: function() {
    this.inherited(arguments);
    this.registerAireCollectionLayers();
  },

  registerAireCollectionLayers: function() {
    var layersDefs = [];
    geonef.jig.forEach(window.aireCollection.maps,
      function(levels, repr) {
        geonef.jig.forEach(levels,
          function(def, level) {
            var code = repr+'/'+level;
            layersDefs.push(
              {
                name: def.id,
                title: code,
                code: code,
                provider: 'riate-aire',
                collection: 'collection-maps',
                layers: [
                  {
                    name: def.id,
                    creator: function(mapWidget) {
                      return new OpenLayers.Layer.WMS(def.id,
                        '/ows/'+def.id,
                        {
                          layers: def.layers,
                          format: 'image/png'
                        }, {
                          maxExtent: new OpenLayers.Bounds.fromArray(def.extent),
                          maxResolution: mapWidget.mapOptions.maxResolution,
                          projection: new OpenLayers.Projection(def.projection),
                          isBaseLayer: true,
                          visible: true,
                          units: 'm',
                          numZoomLevels: mapWidget.mapOptions.numZoomLevels,
                          transitionEffect: 'resize',
                          legendData: def.legend
                        });
                    }
                  }
                ]
              });
          });
      });
    this.addLayers(layersDefs);
  }

});
