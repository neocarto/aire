

dojo.provide('geonef.ploomap.layerDef.Base');

dojo.require('geonef.jig.util');

dojo.declare('geonef.ploomap.layerDef.Base', null,
{
  // summary:
  //    Base class for layers definitions classes
  //
  // description:
  //    Usually, an application defines its own layer def class inheriting
  //    from other layers def classes which it wants the layers of.
  //    The app layer def class is then registered
  //    on the map widgets' "layersDefinitionsClass" property.
  //

  // mapWidget: object
  //    associated map widget
  mapWidget: null,

  // layers: array
  //    Array of layers, filled at registration time - registerLayers()
  //
  //    It is an array of :
  //        {
  //            name: 'internal_name_of_layer',
  //            title: "human title",
  //            icon: 'path/to/icon.png',
  //            layers: [
  //                {
  //                    creator: function() {}
  //                }
  //            ]
  //        }
  //
  layers: null,

  postscript: function(options) {
    dojo.mixin(this, options);
    this.layers = [];
  },

  registerLayers: function() {
    // overload this
  },

  addLayers: function(layers) {
    this.layers = this.layers.concat(layers.filter(dojo.hitch(this, 'filterOnAdd')));
  },

  filterOnAdd: function(layer) {
    var def = dojo.getObject('workspaceData.settings.layers');
    //console.log('filterOnAdd', this, arguments, !def || def.indexOf(layer.name) !== -1, def);
    return !def || def.indexOf(layer.name) !== -1;
  },

  initialize: function() {
    this.registerLayers();
  },

  addLayerToMap: function(name, callback) {
    //console.log('addLayerToMap', this, arguments);
    var ls = this.layers.filter(function(l) { return l.name === name; });
    if (!ls.length) {
      console.error('did not find named layer from layersDefs:', name, this);
      throw new Error('did not find named layer from layersDefs: '+ name);
    }
    return this.addLayerFromData(ls[0].layers, callback);
  },

  addLayerFromData: function(l, callback, idx) {
    if (dojo.isArray(l)) {
      var ret;
      l.forEach(dojo.hitch(this,
        function(sl, idx) {
          ret = this.addLayerFromData(
            dojo.mixin({icon: l.icon}, sl), callback, idx); }));
      return ret;
    }
    if (l.name) {
      var lst = this.mapWidget.map.layers.filter(
	  function(z) {
            return z.name === l.name || z.mapName === l.name || z.layerId === l.name; });
      //console.log('same name list:', this, arguments, lst);
      if (lst.length > 0) {
        if (lst.length === 1 && lst[0].isBaseLayer) {
          if (idx === 0 || idx === undefined) {
            this.mapWidget.map.setBaseLayer(lst[0]);
          }
        } else {
          if (lst[0].onReAddAttempt) {
            lst[0].onReAddAttempt();
          }
        }
        return null;
      }
    }

    var mapWidget = this.mapWidget;

    /** move to appropriate extent, if outside of layers' restricted extent, or !inRange */
    var zoomToExtent = function(layer) {
      //console.log('zoomToExtent', this, arguments);
      // TODO: manage different projections for baseLayer and this.layer
      mapWidget.isGeoReady.addCallback(
        function() {
          var mapExtent = mapWidget.map.getExtent();
          if (layer.restrictedExtent) {
            mapWidget.map.setOptions({ restrictedExtent: layer.restrictedExtent });
          } else if (layer.layerExtent &&
              (!mapExtent ||
               !layer.layerExtent.intersectsBounds(mapExtent, false))) {
            //console.log('zooming layerExtent', layer.layerExtent);
            mapWidget.map.setOptions({ restrictedExtent: layer.layerExtent });
            mapWidget.map.zoomToExtent(layer.layerExtent, true);
          } else if (layer.maxExtent &&
                     (!mapExtent ||
                      !layer.maxExtent.intersectsBounds(mapExtent, false))) {
            //console.log('zooming layerMaxExtent', layer.maxExtent);
            mapWidget.map.setOptions({ restrictedExtent: layer.maxExtent });
            mapWidget.map.zoomToExtent(layer.maxExtent, true);
          }
        });
    };

    /** add layer to map + various actions */
    var process = function(layer) {
      if (!layer.isBaseLayer) {
        zoomToExtent(layer);
      }
      if (!layer.map) {
        if (idx !== 0 && idx !== undefined && !layer.isBaseLayer) {
          layer.setVisibility(false);
        } else if (!layer.noFx) {
          try {
            layer.setOpacity(0); // grr: OL.Tile.Image would apply it to all tiles
            //layer.setVisibility(false);
            //dojo.style(layer.div, 'opacity', 0);
            layer.appearFx = true;
          } catch (x) {

          }
        }
        mapWidget.map.addLayer(layer);
      }
      if (layer.isBaseLayer && (idx === 0 || idx === undefined)) {
        zoomToExtent(layer);
        mapWidget.map.setBaseLayer(layer);
        if (!mapWidget.map.projection) {
          mapWidget.map.setOptions({ projection: layer.projection });
        }
      } else {
        dojo.publish('jig/workspace/flash',
                     [ "Couche ajoutée : "+(layer.title || layer.name) ]);
      }
      if (callback) {
        callback(layer);
      }
    };

    var layer;
    if (l.creator) {
      layer = l.creator(this.mapWidget, process);
      if (dojo.isObject(layer)) {
        // legacy interface: layer return synchronously, 'process' was ignored
        process(layer);
      }
    } else {
      var Class = geonef.jig.util.getClass(l.layerClass);
      if (l.name) {
        layer = new Class(l.title, l.name,
                          dojo.mixin({ icon: l.icon }, l.layerParams));
      } else {
        layer = new Class(l.title, dojo.mixin({ icon: l.icon }, l.layerParams));
      }
      process(layer);
    }

    return layer;
  }

});
