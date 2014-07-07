
dojo.provide('geonef.ploomap.box.AbstractBox');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in code
dojo.require('geonef.ploomap.strategy.Hide');
dojo.require('geonef.ploomap.tool.SubMap');

/**
 *
 */
dojo.declare('geonef.ploomap.box.AbstractBox', [ dijit._Widget, dijit._Templated ],
{
  /**
   * @type {OpenLayers.Feature.Vector}
   */

  feature: null,
  /**
   * @type {geonef.ploomap.layer.Boxes}
   */
  boxLayer: null,

  persistanceEnabled: false,

  widgetsInTemplate: true,

  buildOpacity: true,

  // colorHue1: 120, // green
  // colorHue2: 0, // red
  // colorSaturation: 100, // pct
  // colorValue: 80, // pct

  buildRendering: function() {
    this.inherited(arguments);
    if (this.buildOpacity) {
      this.opacityNode = dojo.create('div', {'class':'opacity'}, this.domNode, 'first');
    }
  },

  postCreate: function() {
    this.inherited(arguments);
    this.setColor();
    this.feature.box = this;
    this.connect(this, 'onMouseEnter', this.enableHoverState);
    this.connect(this, 'onMouseLeave', this.disableHoverState);
    this.connect(this, 'onClick', this.onMouseClick);
    this.connect(this.domNode, dojo.isSafari || dojo.isOpera || dojo.isIE ?
                 'onmousewheel' : 'DOMMouseScroll', this.onMouseScroll);
  },

  uninitialize: function() {
    this.deactivate(true);
    if (this.feature) {
      delete this.feature.box;
    }
    delete this.feature;
    this.inherited(arguments);
  },

  setColor: function() {
    var color = this.getColorCssExpr();
    if (color) {
      // if (prop !== null && prop >= 0 && prop <= 1 && this.gradient) {
      //   var hsl = this.gradient.getCssHslColor(prop);
      // var s = this.colorHue2 - this.colorHue1;
      // var hue = this.colorHue1 + s * prop;
      // var color = 'hsl('+hue+','+this.colorSaturation+'%,'+
      //   this.colorValue+'%)';
      (this.opacityNode || this.domNode).style.backgroundColor = color;
    }
  },

  /**
   * @return {float} between 0 and 1
   */
  getColorCssExpr: function() {
    return null;
  },

  show: function() {
    dojo.style(this.domNode, 'display', '');
    if (this.shadow) {
      dojo.style(this.shadow, 'display', '');
    }
  },

  hide: function() {
    this.hidden = true;
    dojo.style(this.domNode, 'display', 'none');
    if (this.shadow) {
      dojo.style(this.shadow, 'display', 'none');
    }
    this.deactivate();
  },

  enableHoverState: function() {
    if (!this._hover) {
      this._hover = true;
      this.activate();
    }
  },

  disableHoverState: function() {
    if (this._hover) {
      this._hover = false;
      if (this.boxLayer.persistantBox !== this) {
        this.deactivate();
      }
    }
  },

  activate: function() {
    if (!this._activated) {
      this._activated = true;
      this.createMagnifier();
      this.createHighlight();
      dojo.addClass(this.domNode, 'hover');
      if (this.shadow) {
        dojo.addClass(this.shadow, 'hover');
      }
      if (!this.boxLayer.persistantBox) {
        this.setFeaturesStyleName('hoverStyleName');
      }
    }
  },

  deactivate: function() {
    //console.log('deactivate', this, arguments, this._persistant);
    if (this._activated) {
      this._activated = false;
      if (this.boxLayer.persistantBox === this) {
        delete this.boxLayer.persistantBox;
      }
      this.destroyMagnifier();
      this.destroyHighlight();
      dojo.removeClass(this.domNode, 'hover');
      if (this.shadow) {
        dojo.removeClass(this.shadow, 'hover');
      }
      if (!this.boxLayer.persistantBox && !this._beingDestroyed) {
        this.setFeaturesStyleName('defaultStyleName');
      }
    }
  },

  setFeaturesStyleName: function(name) {
    var layer = this.feature.layer;
    layer.drawFeature(this.feature, layer[name]);
    if (this.pointerFeature) {
      layer.drawFeature(this.pointerFeature, layer[name]);
    }
  },

  onMouseClick: function(event) {
    dojo.stopEvent(event);
    this.togglePersistant();
  },

  togglePersistant: function() {
    if (!this.persistanceEnabled) { return; }
    if (this.boxLayer.persistantBox === this) {
      this.deactivate();
    } else {
      this.setPersistant();
    }
  },

  setPersistant: function(zoomTo) {
    if (this.boxLayer.persistantBox) {
      this.boxLayer.persistantBox.deactivate();
    }
    this.activate();
    this.boxLayer.persistantBox = this;
    this.onPersist(zoomTo);
  },

  // hook
  onPersist: function(zoomTo) {},

  getHighlightPixelExtent: function(bp) {
    var buffer = 30;
    var pBuffer = 20;
    var pe = this.pixelExtent.slice(0);
    if (bp.x < pe[0]) {
      pe[0] = bp.x - pBuffer;
    } else if (bp.x > pe[2]) {
      pe[2] = bp.x + pBuffer;
    }
    if (bp.y < pe[1]) {
      pe[1] = bp.y - pBuffer;
    } else if (bp.y > pe[3]) {
      pe[3] = bp.y + pBuffer;
    }
    pe[0] -= buffer;
    pe[1] -= buffer;
    pe[2] += buffer;
    pe[3] += buffer;

    return pe;
  },

  createHighlight: function() {
    var map = this.feature.layer.map;
    dojo.addClass(map.layerContainerDiv, 'highlighting');
    var layer = this.feature.layer;
    if (!this.boxLayer.persistantBox) {
      var self = this;
      this.hideStrategy =
        new geonef.ploomap.strategy.Hide(
          { layer: layer,
            filter: new OpenLayers.Filter(
              { evaluate: dojo.hitch(this, this.hiddenFeaturesFilter) }) });
      this.hideStrategy.activate();
      this.boxLayer.boxes.forEach(function(box) {
          if (box !== this) { box.hide(); } }, this);
    }
    // if (this.highlight) { return; }
    // var bp = this.basePixel;
    // var pe = this.getHighlightPixelExtent(bp);
    // this.highlight = dojo.create('div', {'class': 'boxHighlight' });
    // var s;
    // dojo.style(this.highlight,
    //           s={ position: 'absolute',
    //             left: pe[0]+'px', top: pe[1]+'px',
    //             width: (pe[2]-pe[0])+'px', height: (pe[3]-pe[1])+'px' });
    // if (this.shadow) {
    //   dojo.style(this.shadow, 'display', 'block');
    // }
    // dojo.style(this.domNode, 'display',  'block');
    // dojo.style(this.highlight, 'opacity', 0 );
    // map.layerContainerDiv.appendChild(this.highlight);
    // if (!this.highlightFx) {
    //   var node = this.highlight;
    //   this.highlightFx = dojo.animateProperty({
    //     node: node, duration: 300,
    //     properties: { opacity: { start: 0, end: 0.4/*1*/ }},
    //     onEnd: function() { dojo.style(node, 'opacity', ''); },
    //     easing: dojo.fx.easing.quadIn }).play();
    // }
  },

  destroyHighlight: function() {
    if (this._beingDestroyed) { return; }
    var map = this.feature.layer.map;
    dojo.removeClass(map.layerContainerDiv, 'highlighting');
    if (!this.boxLayer.persistantBox) {
      if (this.hideStrategy) {
        this.hideStrategy.destroy();
        delete this.hideStrategy;
      }
      if (this.boxLayer.getVisibility()) {
        this.boxLayer.boxes.forEach(function(box) { box.show(); });
      }
    }
    // if (this.highlight) {
    //   if (this.highlightFx) {
    //     this.highlightFx.stop();
    //     delete this.highlightFx;
    //   }
    //   if (this.shadow) {
    //     dojo.style(this.shadow, 'display', '');
    //   }
    //   if (dojo.style(this.domNode, 'display') !== 'none') {
    //     dojo.style(this.domNode, 'display', '');
    //   }
    //   this.highlight.parentNode.removeChild(this.highlight);
    //   delete this.highlight;
    // }
  },

  createMagnifier: function() {
    this.destroyMagnifier();
    var map = this.feature.layer.map;
    // var mapRes = map.getResolution();
    // var res = Math.max(76.43702827453613, mapRes / 4);
    this.magnifier = new geonef.ploomap.tool.SubMap(
        { cloneBaseLayerFrom: map, cssClass: 'step', /*resolution: res*/ });
    this.magnifier.startup();
    var geom = this.feature.geometry;
    var lonLat = new OpenLayers.LonLat(geom.x, geom.y);
    this.magnifier.placeOnMap(map, lonLat, true,
        function(res) {
          var subRes = Math.max(76.43702827453613, res / 4);
          if (subRes >= res) { return null; }
          return subRes;
        });
  },

  destroyMagnifier: function() {
    if (this.magnifier) {
      this.magnifier.destroy();
      delete this.magnifier;
    }
  },

  onMouseScroll: function(event) {
    if (this.magnifier) {
      var map = this.magnifier.map;
      var out = (event.detail || event.wheelDelta) > 0;
      out ? map.zoomOut() : map.zoomIn();
    }
  },

  hiddenFeaturesFilter: function(feature) {
    if (feature === this.feature || feature.targetFeature === this.feature) {
      return false;
    }

    return true;
  }

});
