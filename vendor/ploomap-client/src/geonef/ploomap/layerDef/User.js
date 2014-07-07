
dojo.provide('geonef.ploomap.layerDef.User');

// parents
dojo.require('geonef.ploomap.layerDef.Base');

// used in code
dojo.require('geonef.ploomap.layer.Vector'); // may be implicitly used

dojo.declare('geonef.ploomap.layerDef.User', [ geonef.ploomap.layerDef.Base ],
{

  registerLayers: function() {
    this.inherited(arguments);
    this.registerUserLayers();
  },

  registerUserLayers: function() {
    //this.addLayers(this.userLayers);
  },

  userLayers: [
    {
      name: 'plans',
      title: 'Plans',
      icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_plans.png'),
      provider: 'cartapatate-catapatate',
      collection: 'underground-vector',
      layers: [
        {
          creator: function() {
            return new OpenLayers.Layer.Vector('Plans',
              {
                maxResolution: 76.43702827148438, // 11
                projection: 'EPSG:4326',
                strategies: [new OpenLayers.Strategy.BBOX()],
                protocol: new OpenLayers.Protocol.WFS(
                  {
                    url: "/wfs?",
                    featureType: "plans",
                    featureNS: "http://cartapatate.net/",
                    geometryName: "wkb_geometry",
                    srsName: "EPSG:4326"
                  }),
                optClass: 'cartapatate.layer.Plans',
                getFeatureTitle: function(feature) {
                  return feature.attributes.title;
                },
                sldUrl: '/sld/plans.xml',
                icon: '/images/icons/layer_plans.png'
              });
          }
        }
      ]
    }



  ]

});
