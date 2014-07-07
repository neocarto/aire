

dojo.provide('geonef.ploomap.tool.SubMap');

dojo.require('dijit._Widget');


/**
 *
 */
dojo.declare('geonef.ploomap.tool.SubMap', dijit._Widget,
{
  mapOptions: {},

  cloneBaseLayerFrom: null,

  cssClass: '',

  resolution: 156543.03390625,

  size: null,


  postMixInProperties: function() {
    this.inherited(arguments);
    if (!this.size) {
      this.size = { w: 90, h: 90 };
    }
  },

  buildRendering: function() {
    this.domNode = dojo.create('div',
        { 'class': 'ploomapSubMap '+this.cssClass });
    var size = this.size;
    dojo.style(this.domNode, { width: size.w+'px', height: size.h+'px' });
  },

  // startup: function() {
  //   this.inherited(arguments);
  //   this.createMap();
  // },

  destroy: function() {
    var self = this;
    var map = self.map;
    var _doDestroy = function() {
      this.removeFromMap();
      if (map) {
        map.destroy();
        delete self.map;
      }
      delete this.cloneBaseLayerFrom;
      dijit._Widget.prototype.destroy.call(this);
    };
    if (this.anim) {
      this.anim.stop();
      delete this.anim;
    }
    if (map && this.animated) {
      var opacity = dojo.style(this.domNode, 'opacity');
      dojo.animateProperty({
        node: this.domNode,
        properties: { opacity: { start: opacity, end: 0 }},
        easing: dojo.fx.easing.quadIn, duration: 300,
        onEnd: function() { _doDestroy.call(self); } }).play();
    } else {
      _doDestroy.call(self);
    }
  },

  createMap: function(options) {
    options = dojo.mixin(
      { theme: null, controls: []}, this.mapOptions, options);
    if (!options.layers && this.cloneBaseLayerFrom) {
      options.layers = [this.cloneBaseLayerFrom.baseLayer.clone()];
    }
    this.map = new OpenLayers.Map(this.domNode, options);
  },

  /**
   * @param {OpenLayers.Map} map
   * @param {OpenLayers.LonLat} lonLat
   * @param {boolean} anim_
   * @param {Function} resTranslator to translate from base map's resolution to sub map resolution
   */
  placeOnMap: function(map, lonLat, anim_, resTranslator) {
    this.removeFromMap();
    this.baseMap = map;
    var self = this;
    this.resolutionTranslator = resTranslator || function() { return self.resolution; };
    this.lonLat = lonLat.clone();
    this.positionReady = new geonef.jig.Deferred();
    this.positionReady.addCallback(dojo.hitch(this,
        function() {
          if (anim_) {
            dojo.style(this.domNode, 'opacity', 0);
          }
          this.placeAt(this.baseMap.layerContainerDiv);
          this.createMap({ center: lonLat, zoom: map.getZoomForResolution(this.resolution) });
          //this.onZoom();
          this.reposition();
          if (anim_) {
            this.animated = true;
            this.anim = dojo.animateProperty({
                          node: this.domNode,
                          properties: { opacity: { start: 0, end: 1 }},
                          easing: dojo.fx.easing.quadIn, duration: 500 }).play();
          }
        }));
    var res = this.resolutionTranslator(map.getResolution());
    if (res) {
      this.resolution = res;
      this.positionReady.callback();
    }
    this.baseMap.events.on({ zoomend: this.onZoom, scope: this });

  },

  removeFromMap: function() {
    if (this.baseMap) {
      this.baseMap.events.un({ zoomend: this.onZoom, scope: this });
      delete this.baseMap;
    }
  },

  onZoom: function() {
    this.reposition();
    var res = this.resolutionTranslator(this.baseMap.getResolution());
    dojo.style(this.domNode, 'display', !!res ? '' : 'none');
    if (res) {
      if (!this.positionReady.hasFired()) {
        this.resolution = res;
        this.positionReady.callback();
      }
      this.map.zoomTo(this.map.getZoomForResolution(res));
    }
  },

  reposition: function() {
    var pixel = this.baseMap.getLayerPxFromLonLat(this.lonLat);
    var size = this.size;
    dojo.style(this.domNode,
        { position: 'absolute',
          left: parseInt(pixel.x - size.w / 2) + 'px',
          top: parseInt(pixel.y - size.h / 2) + 'px' });
  },


});
