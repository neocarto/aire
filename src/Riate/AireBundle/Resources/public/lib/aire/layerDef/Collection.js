

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
            var getMaxRes = function(mapWidget) {
              //mapWidget.mapOptions.maxResolution;
              var box = dojo.contentBox(mapWidget.map.div);
              var resX = (def.extent[2] - def.extent[0]) / box.w;
              var resY = (def.extent[3] - def.extent[1]) / box.h;
              var res = Math.max(resX, resY);
              //console.log('w', box.w, 'h', box.h, 'resX', resX, 'resY', resY, 'res', res);
              return 'auto';
            };
            var extent =  new OpenLayers.Bounds.fromArray(def.extent);
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
                          maxExtent: extent,
                          restrictedExtent: extent,
                          maxResolution: getMaxRes(mapWidget),
                          projection: new OpenLayers.Projection(def.projection),
                          isBaseLayer: true,
                          visible: true,
                          units: 'm',
                          numZoomLevels: mapWidget.mapOptions.numZoomLevels,
                          transitionEffect: 'resize',
                          singleTile: true,
                          legendData: def.legend,
                          hasSvg: def.hasSvg
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
