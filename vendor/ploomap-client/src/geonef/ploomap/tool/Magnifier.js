
dojo.provide('geonef.ploomap.tool.Magnifier');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
dojo.require('geonef.jig.input._Container');

// used in template
dojo.require('geonef.jig.input.BooleanToggleButton');
dojo.require('geonef.ploomap.input.Layer');
dojo.require('dijit.form.HorizontalSlider');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.form.Select');

// used in code
dojo.require('geonef.ploomap.presentation.magnifier');

/**
 * Tool to display a magnify glass for map display
 */
dojo.declare('geonef.ploomap.tool.Magnifier',
             [ geonef.jig.layout._Anchor, dijit._Templated,
               geonef.ploomap.MapBinding, geonef.jig.input._Container ],
{
  ////////////////////////////////////////////////////////////////////
  // State

  active: true,
  size: 150,
  factor: 1,
  opacity: 100,
  layer: null,

  ////////////////////////////////////////////////////////////////////
  // Options

  name: "Loupe",
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/tool_magnifier.png'),
  helpPresentation: 'geonef.ploomap.presentation.magnifier',

  /** interval for the drag handler (milliseconds) */
  interval: 100,

  /** set buffer to 2: best fits the user experience for the magnifier */
  layerGridBuffer: 3,

  templateString: dojo.cache("geonef.ploomap.tool", "templates/Magnifier.html"),
  widgetsInTemplate: true,
  syncThisAttrs: true,

  layerFilter: function(layer) {
    return layer.displayInLayerSwitcher &&
      !(layer instanceof OpenLayers.Layer.Vector);
  },


  ////////////////////////////////////////////////////////////////////
  // Lifecycle

  destroy: function() {
    this.destroyMagnifier();
    this.inherited(arguments);
  },

  startup: function() {
    this.inherited(arguments);
    this.attr('value', {
                size: this.size,
                opacity: this.opacity,
                factor: this.factor,
                layer: this.layer,
                active: this.active
    });
  },


  ////////////////////////////////////////////////////////////////////
  // Setters / getters

  _setSizeAttr: function(size, _fromUI) {
    if (this.size === size) { return; }
    this.size = size;
    if (!_fromUI) {
      this.setSubValue('size', size);
    }
    this.updateProps();
  },

  _setOpacityAttr: function(opacity, _fromUI) {
    if (this.opacity === opacity) { return; }
    this.opacity = opacity;
    if (!_fromUI) {
      this.setSubValue('opacity', opacity);
    }
    this.updateProps();
  },

  _setFactorAttr: function(factor, _fromUI) {
    factor = parseInt(factor, 10);
    if (this.factor === factor) { return; }
    this.factor = factor;
    if (!_fromUI) {
      this.setSubValue('factor', factor);
    }
    this.updateProps();
  },

  _setLayerAttr: function(layer, _fromUI) {
    if (this.layer === layer) { return; }
    this.layer = layer;
    if (!_fromUI) {
      this.setSubValue('layer', layer);
    }
    this.updateProps();
  },


  _setActiveAttr: function(state, _fromUI) {
    if (this.active === state) { return; }
    this.active = state;
    if (!_fromUI) {
      this.setSubValue('active', state);
    }
    this.updateProps();
  },


  ////////////////////////////////////////////////////////////////////
  // Management

  updateProps: function() {
    this.afterMapBound(
      function() {
        if (!this.layer) {
          console.warn('no layer', this);
          return;
        }
        this.destroyMagnifier();
        if (this.active) {
          this.createMagnifier();
        }
      });
  },


  createMagnifier: function() {
    //if (this.map) { return; }
    var masterMap = this.mapWidget.map;
    var savedOptions = {
      isBaseLayer: this.layer.options.isBaseLayer,
      buffer: this.layer.options.buffer
    };
    dojo.mixin(this.layer.options,
               { buffer: this.layerGridBuffer/*,
                 isBaseLayer: true*/ });
    this.ownedLayer = this.layer.clone();
    // console.log('owned', this, this.ownedLayer, 'original', this.layer,
    //             this.ownedLayer.isBaseLayer, this.layer.isBaseLayer);
    dojo.mixin(this.layer.options, savedOptions);
    //console.log('made layer list', this.layers, masterMap.baseLayer, selectedLayer);
    var options = {
      controls: []
    };
    this.mapDiv = dojo.create(
      'div', { 'class': 'magnifyMap', style: 'display: none' },
      this.mapWidget.map.layerContainerDiv
      //this.mapWidget.domNode
    );
    dojo.style(this.mapDiv, { top: '0px', left: '0px' });
    this.map = new OpenLayers.Map(this.mapDiv, options);
    //var self = this;
    /*this.layers.forEach(function(layer) {
                          self.map.addLayer(layer);
                          layer.setVisibility(true);
                          layer.setOpacity(self.opacity / 100);
                          });*/
    this.handler = new OpenLayers.Handler.Drag
                     (this, {
                        down: this.move,
                        move: this.move,
                        done: this.moveDone
                      }, {
                        interval: this.interval,
                        documentDrag: false,
                        map: masterMap
                      });
    this.handler.activate();
  },

  destroyMagnifier: function() {
    if (this.map) {
      this.handler.destroy();
      this.handler = null;
      this.map.destroy();
      this.map = null;
      this.mapDiv.parentNode.removeChild(this.mapDiv);
      this.mapDiv = null;
      //console.log('cleaned objects', this, arguments);
    }
    this.dragging = false;
  },


  ////////////////////////////////////////////////////////////////////
  // Events

  move: function(xy) {
    if (!this.map) { return; }
    var lonlat = this.mapWidget.map.getLonLatFromViewPortPx(xy);
    if (!this.dragging) {
      dojo.style(this.mapDiv, { width: ''+this.size+'px',
                                height: ''+this.size+'px',
                                display: '',
                                position: 'absolute' });
      this.mapDivBox = dojo.coords(this.mapDiv);
      this.offset = dojo.marginBox(this.mapWidget.map.layerContainerDiv);
      dojo.style(this.mapDiv, {
                   top: ''+(xy.y - this.offset.t - (this.mapDivBox.h / 2))+'px',
                   left: ''+(xy.x - this.offset.l - (this.mapDivBox.w / 2))+'px'
                 });
      if (this.ownedLayer) {
        //this.ownedLayer.visibility = true;
        //console.log('this.ownedLayer', this, arguments, this.ownedLayer, this.ownedLayer.isBaseLayer);
        if (!this.ownedLayer.isBaseLayer) {
          var baseLayer = this.mapWidget.map.baseLayer.clone();
          this.map.addLayer(baseLayer);
          baseLayer.setVisibility(false); // needed just to set the projection & resolutions
        }
        //this.ownedLayer.isBaseLayer = true;
        this.map.addLayer(this.ownedLayer);
        this.ownedLayer.setOpacity(this.opacity / 100);
        this.ownedLayer = null;
      }
      this.map.updateSize();
      // console.log('map res', this.mapWidget.map.getResolution(), 'factor pow', Math.pow(2, this.factor),
      //            'map zoom', this.mapWidget.map.getZoom());
      var resolution = this.mapWidget.map.getResolution() / Math.pow(2, this.factor);
      this.zoom = this.map.getZoomForResolution(resolution);
      // console.log('new zoom', this.zoom, 'new res', resolution);
      this.map.setCenter(lonlat, this.zoom);
      this.dragging = true;
    } else {
      this.map.setCenter(lonlat, this.zoom);
      dojo.style(this.mapDiv, {
                   top: ''+(xy.y - this.offset.t - (this.mapDivBox.h / 2))+'px',
                   left: ''+(xy.x - this.offset.l - (this.mapDivBox.w / 2))+'px'
                 });
    }
  },

  moveDone: function() {
    dojo.style(this.mapDiv, 'display', 'none');
    this.dragging = false;
  },

  onDisappear: function() {
    this.attr('active', false);
  },

  /**
   * Something was changed (UI) in settings.
   */
  onChange: function(widget, value) {
    if (widget) {
      // make the change to state property
      this.attr(widget.name, value, true);
    } else {
      //console.warn("onChange: don't know what changed", arguments, this);
    }
  }

});
