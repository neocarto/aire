
dojo.provide('geonef.ploomap.layerDef.Google');

// parents
dojo.require('geonef.ploomap.layerDef.Base');

dojo.declare('geonef.ploomap.layerDef.Google', geonef.ploomap.layerDef.Base,
{
  // summary:
  //    available Google layers (from GMap API 2)
  //

  registerLayers: function() {
    this.inherited(arguments);
    this.registerGoogleLayers();
  },

  registerGoogleLayers: function() {
    //console.log('registerGeoportalLayers', this, arguments);
    if (!window.GBrowserIsCompatible) {
      throw new Error('the Google layerDef class needs the GMap api');
    }
    this.addLayers(this.googleLayersDefs.map(
        function(def) {
          return {
            name: 'google_'+def.name,
            title: def.title,
            icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_gmap.png'),
            provider: 'google',
            collection: 'google-baseMap',
            layers: [
              {
                creator: function(mapWidget) {
                  var layer = new OpenLayers.Layer.Google(def.title,
                    {
                      icon: dojo.moduleUrl('geonef.ploomap',
                                           'style/icon/layer_gmap.png'),
	              type: def.gmap,
                      sphericalMercator: true,
                      baseLayer: true,
	              layerId: 'google_'+def.name,
                      metadata: {
                        description: def.description,
                        url: 'http://maps.google.com/',
                        region: 'Monde'
                      }
                    });
                  // geonef.jig.connectOnce(layer, 'loadMapObject', {},
                  //                 function() {
                  //                   console.log('enable!', this, arguments);
                  //                   layer.mapObject.enableContinuousZoom();
                  //                 });
                  return layer;
                }
              }
            ]
          };
        }, this));
  },

  googleLayersDefs: [
    {
      name: 'hybrid',
      title: "rues & satellite",
      gmap: G_HYBRID_MAP,
      description: "Google Maps - Vue mixte rues & satellite"
    },
    {
      name: 'normal',
      title: "rues",
      gmap: G_NORMAL_MAP,
      description: ""
    },
    {
      name: 'satellite',
      title: "vue satellite",
      gmap: G_SATELLITE_MAP,
      description: "Google Maps - Vue satellite"
    },
    {
      name: 'physical',
      title: "relief",
      gmap: G_PHYSICAL_MAP,
      description: "Google Maps - vue des reliefs"
    },
    {
      name: 'aerial',
      title: "vue aérienne",
      gmap: G_AERIAL_MAP,
      description: "Google Maps - vue aérienne"
    },
    {
      name: 'aerial_hybrid',
      title: "rues & vue aérienne",
      gmap: G_AERIAL_HYBRID_MAP,
      description: "Google Maps - vue aérienne mixte"
    },
    {
      name: 'sky_visible',
      title: "Ciel",
      gmap: G_SKY_VISIBLE_MAP,
      description: "",
      test: true
    },
    {
      name: 'moon_elevation',
      title: "Lune - altitude",
      gmap: G_MOON_ELEVATION_MAP,
      description: ""
    },
    {
      name: 'moon_visible',
      title: "Lune - photo",
      gmap: G_MOON_VISIBLE_MAP,
      description: ""
    },
    {
      name: 'mars_elevation',
      title: "Mars - altitude",
      gmap: G_MARS_ELEVATION_MAP,
      description: ""
    },
    {
      name: 'mars_visible',
      title: "Mars - photo",
      gmap: G_MARS_VISIBLE_MAP,
      description: ""
    },
    {
      name: 'mars_infrared',
      title: "Mars - infrarouge",
      gmap: G_MARS_INFRARED_MAP,
      description: ""
    }
  ]

});
