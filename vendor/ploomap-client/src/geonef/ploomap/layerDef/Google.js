
dojo.provide('geonef.ploomap.layerDef.Google');

// parents
dojo.require('geonef.ploomap.layerDef.Base');

// used in code
dojo.require('geonef.ploomap.OpenLayers.Layer.Bing');
//dojo.require('geonef.ploomap.OpenLayers.Layer.GoogleNG');

/**
 * Provide official Google Maps layers through Google Maps v3 API
 *
 * @class
 */
dojo.declare('geonef.ploomap.layerDef.Google', geonef.ploomap.layerDef.Base,
{

  registerLayers: function() {
    this.inherited(arguments);
    this.registerGoogleLayers();
    this.registerBingLayer();
  },

  registerBingLayer: function() {
    var key = geonef.jig.workspace.data.settings.bingKey;
    this.addLayers([/*this.bingLayersDefs.map(
        function(def) {
          return*/ {
            name: 'bing',
            title: "Bing",
            icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_bing.png'),
            provider: 'microsoft',
            collection: 'bing-baseMap',
            //featured: 'home',
            layers: this.bingLayersDefs.map(
              function(def) {
                return {
                name: 'bing_'+def.name,
                creator: function(mapWidget) {
                  var layer = new geonef.ploomap.OpenLayers.Layer.Bing(
                    {
                      group: 'bing',
                      key: key,
                      name: def.title,
	              type: def.type,
                      icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_bing.png'),
	              layerId: 'bing_'+def.name,
                      transitionEffect: 'resize',
                      wrapDateLine: true,
                      buffer: 1,
                      // metadata: {
                      //   description: def.description,
                      //   url: 'http://maps.google.com/',
                      //   region: 'Monde'
                      // },
                    });
                  return layer;
                }
              };
              })
          }/*;
        }, this)*/]);
  },


  registerGoogleLayers: function() {
    //console.log('registerGeoportalLayers', this, arguments);
    if (!dojo.isFunction(dojo.getObject('google.maps.Map'))) {
      throw new Error('the Google layerDef class needs the GMap v3 api');
    }
    // this.addLayers([
    //     {
    //       name: 'google',
    //       title: "Google",
    //       icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_gmap.png'),
    //       provider: 'google',
    //       collection: 'google-baseMap',
    //       featured: 'home',
    //       layers: this.googleLayersDefs.map(
    //         function(def) {
    //           return {
    //             name: 'google_'+def.name,
    //             creator: function(mapWidget, callback) {
    //               var layer = new geonef.ploomap.OpenLayers.Layer.GoogleNG(
    //                 {
    //                   group: 'google',
    //                   type: def.type,
    //                   styles: def.styles,
    //                   name: def.title,
    //                   //alwaysInRange: true, inRange: true,
    //                   icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_gmap.png'),
    //                   layerId: 'google_'+def.name,
    //                   //disableAppearFx: true,
    //                   metadata: {
    //                     description: def.description,
    //                     url: 'http://maps.google.com/',
    //                     region: 'Monde'
    //                   },
    //                   postInitCallback: callback
    //                 });
    //               return true;
    //             }
    //           };
    //         }, this)
    //       }]);
    this.addLayers([
        {
          name: 'google',
          title: "Google",
          icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_gmap.png'),
          provider: 'google',
          //collection: 'google-baseMap',
          featured: 'home',
          layers: this.googleLayersDefs.map(
            function(def) {
              return {
                name: 'google_'+def.name,
                creator: function(mapWidget) {
                  var layer = new OpenLayers.Layer.Google(def.title,
                    {
                      group: 'google',
	              type: def.type,
                      styles: def.styles,
                      name: def.title,
                      noFx: true,
                      // animationEnabled: true,
                      //alwaysInRange: true, inRange: true,
                      icon: dojo.moduleUrl('geonef.ploomap',
                                           'style/icon/layer_gmap.png'),
	              layerId: 'google_'+def.name,
                      // metadata: {
                      //   description: def.description,
                      //   url: 'http://maps.google.com/',
                      //   region: 'Monde'
                      // },
                    });
                  return layer;
                }
              };
            }, this)
          }]);
  },

  bingLayersDefs: [
    {
      name: 'road',
      title: "Bing Rues",
      type: 'Road',
      description: "Bing Maps - Vue mixte rues"
    },
    {
      name: 'aerialWithLabels',
      title: "Bing Vue aérienne + rues",
      type: 'AerialWithLabels',
      description: "Bing Maps - Vue aérienne et rues"
    },
    {
      name: 'aerial',
      title: "Bing Vue aérienne",
      type: 'Aerial',
      description: "Bing Maps - Vue aérienne"
    }
  ],

  googleLayersDefs: [
    {
      name: 'hybrid',
      title: "Google rues+satellite",
      type: google.maps.MapTypeId.HYBRID,
      description: "Google Maps - Vue mixte rues & satellite"
    },
    {
      name: 'normal',
      title: "Google rues",
      type: google.maps.MapTypeId.ROADMAP,
      description: ""
    },
    {
      name: 'satellite',
      title: "Google satellite",
      type: google.maps.MapTypeId.SATELLITE,
      description: "Google Maps - Vue satellite"
    },
    {
      name: 'physical',
      title: "Google relief",
      type: google.maps.MapTypeId.TERRAIN,
      description: "Google Maps - vue des reliefs"
    }
  ]

});

// OpenLayers.Layer.Google.v3.DEFAULTS.maxZoomLevel = 15;

OpenLayers.Layer.Google.v3.loadMapObject =
  function() {
    if (!this.type) {
      this.type = google.maps.MapTypeId.ROADMAP;
    }
    if (this.type === google.maps.MapTypeId.TERRAIN) {
      this.addOptions({ units: 'm' /*to force initResolutions()*/,
                        maxZoomLevel: 15 });
    }
    var mapObject;
    var cache = OpenLayers.Layer.Google.cache[this.map.id];
    if (cache) {
      // there are already Google layers added to this map
      mapObject = cache.mapObject;
      // increment the layer count
      ++cache.count;
    } else {
      // this is the first Google layer for this map

      var container = this.map.viewPortDiv;
      var div = document.createElement("div");
      div.id = this.map.id + "_GMapContainer";
      div.style.position = "absolute";
      div.style.width = "100%";
      div.style.height = "100%";
      container.appendChild(div);

      // create GMap and shuffle elements
      var center = this.map.getCenter();
      var options = {
        center: center ?
          new google.maps.LatLng(center.lat, center.lon) :
          new google.maps.LatLng(0, 0),
        zoom: this.map.getZoom() || 0,
        mapTypeId: this.type,
        disableDefaultUI: true,
        keyboardShortcuts: false,
        draggable: false,
        disableDoubleClickZoom: true,
        scrollwheel: false,
        streetViewControl: false
      };
      // BEGIN added code by Geonef
      if (this.styles) {
        options.styles = this.styles;
      }
      // END
      mapObject = new google.maps.Map(div, options);

      // cache elements for use by any other google layers added to
      // this same map
      cache = {
        mapObject: mapObject,
        count: 1
      };
      OpenLayers.Layer.Google.cache[this.map.id] = cache;
      this.repositionListener = google.maps.event.addListenerOnce(
        mapObject,
        "center_changed",
        OpenLayers.Function.bind(this.repositionMapElements, this)
      );
    }
    this.mapObject = mapObject;
    this.setGMapVisibility(this.visibility);
  };

