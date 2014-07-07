
dojo.provide('geonef.ploomap.map.Classical');

// parent classes
dojo.require("geonef.jig.layout._Anchor");
dojo.require('geonef.jig.widget._AutoState');
dojo.require('geonef.jig.widget._AsyncInit');

// used in code
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.ploomap.tool.OverviewMap');
dojo.require('geonef.jig.util');
dojo.require('dojo.fx.easing');
//dojo.require('geonef.ploomap.OpenLayers.Map');

/**
 * Default OpenLayers map widget
 *
 * Stages (as jig.Deferred):
 *      - asyncInit
 *      - isReady
 *
 * @class
 */
dojo.declare("geonef.ploomap.map.Classical",
	     [ geonef.jig.layout._Anchor, geonef.jig.widget._AutoState,
               geonef.jig.widget._AsyncInit ],
{
  title: 'Carte',

  map: null,

  layersDefsClass: 'geonef.ploomap.layerDef.Default',

  mapOptions: {
    numZoomLevels: 23,
    projection: new OpenLayers.Projection('EPSG:900913'),
    units: 'm',
    maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,
                                     20037508.34, 20037508.34),
  },

  zoomAnimationFx: true,

  buildOverViewMap: true,

  // zoomLevelGroups: [
  //   { min: 0, max: 2, name: 'world', label: 'Monde', lineHeight: 30 },
  //   { min: 3, max: 5, name: 'continent', label: 'Continent', lineHeight: 30 },
  //   { min: 6, max: 7, name: 'country', label: 'Pays', lineHeight: 18 },
  //   { min: 8, max: 10, name: 'region', label: 'Région', lineHeight: 30 },
  //   { min: 11, max: 12, name: 'department', label: 'Département', lineHeight: 18 },
  //   { min: 13, max: 14, name: 'city', label: 'Commune', lineHeight: 18 },
  //   { min: 15, max: 17, name: 'district', label: 'Quartier', lineHeight: 30 },
  //   { min: 18, max: 21, name: 'street', label: 'Rue', lineHeight: 42 }
  // ],

  /**
   * Event: widget is initialised, map ready to be built
   *
   * @type {!geonef.jig.Deferred}
   */
  asyncInit: null,

  /**
   * Event: map is initialised, built and ready to use
   *
   * Depends on asyncInit
   *
   * @type {!geonef.jig.Deferred}
   */
  isReady: null,

  /**
   * Event: map ready for navigation (a valid base layer exists)
   *
   * Set by adding layers
   *
   * @type {!geonef.jig.Deferred}
   */
  isGeoReady: null,

  // Effects (FX) are at the end of the file


  /////////////////////////////////////////////////////////////
  // WIDGET LIFECYCLE

  destroy: function() {
    if (this.overview) {
      this.overview.destroy();
      this.overview = null;
    }
    if (this.map) {
      this.map.events.un({
        moveend: function() { this.onMapMove(); },
        addlayer: this.onAddLayer,
        changebaselayer: this.onChangeBaseLayer,
        scope: this
      });
      this.map.destroy();
      delete this.map;
    }
    this.inherited(arguments);
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.isReady = new geonef.jig.Deferred();
    this.isGeoReady = new geonef.jig.Deferred();
  },

  buildRendering: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'jigCacoin ploomapMap');
    dojo.style(this.domNode, 'overflow', 'hidden');
  },


  onAsyncInitEnd: function() {
    this.build();
  },

  /**
   * Triggered by this.asyncInit
   * Triggers this.isReady
   */
  build: function() {
    this._activeControls = {};
    OpenLayers.ImgPath = '/images/openlayers/';
    this.createMap();
    this.setupEvents();
    this.createLayersDefs();
    this.createCustomControls();
    //this.createButtons();
    this.inherited(arguments);
    window.setTimeout(dojo.hitch(this,
      function() {
        this.isReady.callback();
        dojo.publish('ploomap/map/start', [ this ]);
      }), 50);
  },

  resize: function(changedSize) {
    //console.log('resize map', this, arguments);
    // The map center must be re-adjusted
    // (not automatically done by OL since Firefox doesn't allow it to
    // capture the resize event)
    //
    if (changedSize && (changedSize.w || changedSize.h)) {
      dojo.marginBox(this.domNode, changedSize);
    }
    if (this.map) {
      //console.log('before update size', this, arguments);
      var map = this.map;
      map.updateSize();
    }
  },

  _setReducedAttr: function(state) {
    this.reduced = state;
  },



  /////////////////////////////////////////////////////////////
  // INFORMATION

  getLayerNames: function() {
    return this.map.layers.map(function(l) { return l.name; });
  },


  /////////////////////////////////////////////////////////////
  // CONSTRUCTION

  createMap: function() {
    this.map = new OpenLayers.Map(this.domNode.id,
      dojo.mixin({
                   mapWidget: this,
                   controls: [],
                   theme: null
                   //allOverlays: true
                   //fractionalZoom: true,
                   //panMethod: OpenLayers.Easing.Expo.easeOut
                 }, this.mapOptions));
  },

  setupEvents: function() {
    var self = this;
    this.map.events.on({
      moveend: function() { this.onMapMove(); },
      addlayer: this.onAddLayer,
      changebaselayer: this.onChangeBaseLayer,
      scope: this
    });
  },

  onChangeBaseLayer: function() {
    dojo.publish('ploomap/map/changebaselayer', [this]);
  },

  onAddLayer: function(event) {
    //console.log('onAddLayer', this, arguments);
    if (/*!layer.disableAppearFx && layer.displayInLayerSwitcher &&
        !layer.controllerWidget && */event.layer.appearFx) {
      this.makeAppearFx(event.layer);
    }
    if (!this.isGeoReady.hasFired() && this.map.baseLayer) {
      this.map.zoomToExtent(this.map.baseLayer.maxExtent);
      this.isGeoReady.callback();
    }
  },

  makeAppearFx: function(layer) {
    //console.log('FX appear', this, arguments);
    //console.log('opacity layer4', layer.id, dojo.style(layer.div, 'opacity'));
    layer.setOpacity(1);
    dojo.style(layer.div, 'opacity', 0);
    //layer.setOpacity(0);
    //layer.setVisibility(true);
    if (dojo.isArray(layer.grid)) {
      layer.grid.forEach(
        function(row) {
          row.forEach(function(tile) {
                        if (tile.imgDiv) {
                          dojo.style(tile.imgDiv, 'opacity', 1);
                        }
                      });
        });
    }
    //console.log('opacity layer5', layer.id, dojo.style(layer.div, 'opacity'));
    window.setTimeout(
      function() {
        dojo.animateProperty(
          {
            node: layer.div, duration: 800,
	    properties: {
              opacity: { start: 0, end: 1 }
            },
	    easing: dojo.fx.easing.sineIn //quartIn
            // onEnd: function() {
            //   console.log('opacity layer6', layer.id, dojo.style(layer.div, 'opacity'));
            //   //console.log('layer opacity', layer); layer.setOpacity(1.0);
            // }
          }).play();
      }, 800);
  },

  createLayersDefs: function() {
    var _class = geonef.jig.util.getClass(this.layersDefsClass);
    this.layersDefs = new _class({ mapWidget: this });
    this.layersDefs.initialize();
  },

  createCustomControls: function() {
    if (this.buildOverViewMap) {
      this.overview = new geonef.ploomap.tool.OverviewMap(
        { mapWidget: this, copyLayer: '__base__' });
      this.overview.placeAt(this.domNode);
      this.overview.startup();
    }
  },


  /////////////////////////////////////////////////////////////
  // EVENTS

  onMapMove: function() {
    //console.log('map onMapMove!', this);
    var newZoom = this.map.getZoom();
    if (newZoom !== this._oldZoom) {
      this.onZoomChange(newZoom);
    }
    this._oldZoom = newZoom;
  },

  onZoomChange: function(newZoom) {
    // overload this and/or dojo.connect it
  },


  /////////////////////////////////////////////////////////////
  // ACTIONS

  /**
   * Set map location based on navigator geolocation
   *
   * Warning: errors not reported to deferred.
   *
   * @return {geonef.jig.Deferred}
   */
  geoLocalizeNavigator: function() {
    dojo.publish('jig/workspace/flash',
                 ["Géolocalisation du navigateur..."]);
    var deferred = new geonef.jig.Deferred();
    if (!navigator.geolocation) {
        dojo.publish('jig/workspace/flash',
                     ["Échec de géolocalisation automatique : " + str]);
      deferred.errback(-1);
      return deferred;
    }
    var self = this;
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var lonLat2 = new OpenLayers.LonLat(
          position.coords.longitude, position.coords.latitude);
        dojo.publish('jig/workspace/flash',
                     ["Géolocalisation à : "+lonLat2.toShortString()]);
        lonLat2.transform(new OpenLayers.Projection('EPSG:4326'),
                          self.map.getProjectionObject());
        //self.map.setCenter(lonLat2);
        self.map.panTo(lonLat2);
        window._pos = lonLat2;
        deferred.callback(lonLat2);
      },
      function(error) {
        //console.warn('Geolocation failure', error);
        var str = "erreur non répertoriée";
        var msgs = {
          PERMISSION_DENIED: "permission refusée",
          POSITION_UNAVAILABLE: "position non disponible",
          TIMEOUT: "temps d'attente écoulé"
        };
        var errors = error.prototype || error.__proto__;
        for (var k in msgs) {
          //console.log('k', this, k, msgs, error.code, errors, error, error.prototype, error.__proto__);
          if (msgs.hasOwnProperty(k) && errors.hasOwnProperty(k) &&
              error.code === errors[k]) {
            str = msgs[k];
            break;
          }
        }
        dojo.publish('jig/workspace/flash',
                     ["Échec de géolocalisation automatique : " + str]);
        //deferred.errback(error.code);
      },
      { enableHighAccuracy: true }
    );
    return deferred;
  },

  /**
   * Remove & layer with a nice fading effect
   *
   * @param {OpenLayers.Layer} layer
   */
  destroyLayerWithEffect: function(layer) {
    var doIt = dojo.hitch(this,
      function() {
        //console.log('destroyLayerWithEffect doIt', this, arguments);
        if (layer.group) {
          //console.log('doIt', this, arguments, this.map);
          this.map.getLayersBy('group', layer.group)
            .forEach(function(subLayer) {
                       //console.log('sublayer', this, arguments);
                       subLayer.map.removeLayer(subLayer);
                       try {
                         subLayer.destroy();
                       } catch (e) {
                         console.warn('got exception at subLayer destroy:', e, subLayer);
                       }
                     });
        } else {
          //console.log('remove layer', this, arguments);
          // we have to remove the layer from map before destroying
          // for vector layers (geonef.ploomap.layer.Vector and its controls)
          //console.log('doIt else', this, arguments, this.map);
          this.map.removeLayer(layer);
          try {
            // in try{}catch{} because OpenLayers.Layer.Grid.prototype.destroy
            // yields an error when trying to get map resolution...
            layer.destroy();
          } catch (e) {
            console.warn('got exception at layer destroy (known OL bug):', e, layer);
          }
        }
      });
    //console.log('destroyLayerWithEffect', layer, layer.div);
    if (layer instanceof OpenLayers.Layer.Vector) {
      doIt();
      return;
    }
    var opacity = dojo.style(layer.div, 'opacity');
    dojo.animateProperty(
      {
        node: layer.div, duration: 800,
	properties: {
          opacity: { start: opacity, end: 0 }
        },
	easing: dojo.fx.easing.sinIn,
        onEnd: doIt
      }).play();
  },

  changeMaxResolution: function(maxResolution) {
    var oldMaxResolution = this.map.baseLayer.maxResolution;
    var resolution = this.map.getResolution();
    //console.log('changeMaxResolution', this, arguments, resolution);
    var center = this.map.getCenter();
    this.map.baseLayer.addOptions(
        { maxResolution: maxResolution });
    var zoom = this.map.getZoomForResolution(resolution);
    this.map.setCenter(center, zoom, false, true);
    return oldMaxResolution;
  },


  /////////////////////////////////////////////////////////////
  // Getters + Setters

  _getStateAttr: function() {
    //console.log('map _getStateAttr', this);
    // TODO: completer...
    console.warn('ploomap map state getter not fully implemented', this);
    var data = {};
    if (this.map) {
      data.center = {
	zoom: this.map.getZoom(),
	x: parseInt(this.map.getCenter().lon),
	y: parseInt(this.map.getCenter().lat)
      };
    }
    return data;
  },

  _setLayersAttr: function(layers) {
    var self = this;
    this.isReady.addCallback(
      function() {
        layers.forEach(
          function(props) {
            if (!dojo.isObject(props)) {
              props = { name: props };
            }
            /*var layer =*/
            self.layersDefs.addLayerToMap(props.name);
            //console.log('added layer', layer, props);
            // if (layer) {
            //   if (props.visibility === true || props.visibility === false) {
            //     layer.setVisibility(props.visibility);
            //   }
            //   if (typeof props.opacity == 'number') {
            //     layer.setOpacity(props.opacity);
            //   }
            // }
          });
        //console.log('after add layers', this, arguments);
        //self.map.updateSize(); // grrr: why?
      });
  },

  _setCenterAttr: function(center) {
    var self = this;
    this.isGeoReady.addCallback(
      function() {
        var lonLat = new OpenLayers.LonLat(center.x, center.y);
        self.map.setCenter(lonLat, center.zoom);
        if (center.geoloc && navigator.geolocation) {
          self.geoLocalizeNavigator();
        }
      });
  },

  _setButtonsAttr: function(buttons) {
    var self = this;
    this.addOnStartup(
      function() {
        for (var i in buttons) {
          if (buttons.hasOwnProperty(i) && self.buttons.hasOwnProperty(i)) {
            dojo.style(self.buttons[i].domNode, 'display', buttons[i] ? '' : 'none');
          }
        }
      });
  },

  _setControlsAttr: function(controls) {
    if (!dojo.isArray(controls)) {
      return;
    }
    var self = this;
    this.isReady.addCallback(
      function() {
        controls.forEach(
          function(def) {
            var _class, options = {};
            if (dojo.isString(def)) {
              _class = def;
            } else {
              _class = def['class'],
              options = def['options'];
              if (dojo.isString(options.div)) {
                options.div = dojo.byId(options.div);
              }
            }
            var Class = geonef.jig.util.getClass(_class/*, false*/);
            var control = new Class(options);;
            self.map.addControl(control);
            if (0 && control.handlers && control.handlers.wheel)  {
              self.connect(self.map.div, !dojo.isMozilla ? 'onmousewheel' : 'DOMMouseScroll',
                           //control.handlers.wheel.wheelListener);
                           function() {
                             console.log('event!', self, arguments);
                             control.handlers.wheel.wheelListener.apply(this/*sic*/, arguments);
                           });
            }
          });
      });
  },

  _setTitleAttr: function(title) {
    this.title = title;
  },

  _setReducedAttr: function(state) {
    this.reduced = state;
    (state ? dojo.addClass : dojo.removeClass)(this.domNode, 'reduced');
  },


  getFx: function(name, options) {
    if (!this.fx[name]) {
      throw new Error("fx not found on map: "+name);
    }
    return this.fx[name](this, options);
  },

  fx: {
    fadeIn: function(mapWidget, options) {
      return dojo.animateProperty(dojo.mixin(
          {
            node: mapWidget.map.viewPortDiv,
            properties: { opacity: { start: 0, end: 1 }},
            easing: dojo.fx.easing.quadIn, duration: 600
          }, options));
    },
    fadeOut: function(mapWidget, options) {
      return dojo.animateProperty(dojo.mixin(
          {
            node: mapWidget.map.viewPortDiv,
            properties: { opacity: { start: 1, end: 0 }},
            easing: dojo.fx.easing.quadIn, duration: 400
          }, options));
    },
    goUp: function(mapWidget, options) {
      var height = dojo.contentBox(mapWidget.domNode).h;
      return dojo.animateProperty(dojo.mixin(
          {
            node: mapWidget.map.viewPortDiv,
            properties: { top: { height: 0, end: -height }},
            easing: dojo.fx.easing.quadIn, duration: 2000
          }, options));
    },
    scaleTiles: function(mapWidget, options) {
      options = dojo.mixin({ out: true }, options);
      var styles = dojo.query('> div', self.mapWidget.map.baseLayer.div)
          .map(function(node) { return node.style; });
      return new dojo.Animation(
         {
           curve: options.out ? [1, 0] : [0, 1],
           duration: 2000,
           easing: dojo.fx.easing.quadIn,
           onEnd: function() {
             styles.forEach(function(style) { style.MozTransform = ''; });
           },
           onAnimate: function(r) {
             styles.forEach(function(style) { style.MozTransform = 'scale('+r+')'; });
           }
        });
    },
    rotate: function(mapWidget, options) {
      options = dojo.mixin({ angle: 180 }, options);
      return new dojo.Animation(
         {
           curve: options.out ? [0, options.angle] : [options.angle, 0],
           duration: 2000,
           easing: dojo.fx.easing.quadIn,
           onEnd: function() {
             styles.forEach(function(style) { style.MozTransform = ''; });
           },
           onAnimate: function(r) {
             styles.forEach(function(style) { style.MozTransform = 'rotate('+r+'deg)'; });
           }
        });
    }
  }

});
