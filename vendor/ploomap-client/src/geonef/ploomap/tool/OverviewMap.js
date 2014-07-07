

dojo.provide('geonef.ploomap.tool.OverviewMap');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
dojo.require('geonef.jig.widget._AutoState');
dojo.require('geonef.jig.input._Container');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.form.Select');
dojo.require('geonef.ploomap.input.Layer');

// in code
dojo.require('geonef.ploomap.OpenLayers.Control.OverviewMap');
dojo.require('geonef.ploomap.util');

dojo.declare('geonef.ploomap.tool.OverviewMap',
             [ geonef.jig.layout._Anchor, dijit._Templated, geonef.ploomap.MapBinding,
               geonef.jig.widget._AutoState, geonef.jig.input._Container ],
{
  // summary:
  //    Simple tool to present an overview map synced with bound map
  //
  // todo:
  //    - récupère (et sync ?) les layers de la carte
  //      (plus malin : détecte la couche à afficher : baseLayer
  //
  //    - choix de la couche (geonef.ploomap.input.Layer)
  //

  name: "Vue d'aigle",
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/tool_overviewmap.png'),

  panAware: true,
  autoPan: true,
  delta: 5,

  /**
   * If not null, name of the layer to copy from map
   * Or magic "__base__" to copy the current base layer
   *
   * @type <string>
   */
  copyLayer: '',

  /**
   * Options to merge to the copied layer's
   */
  layerOptions: {},

  maxResolution: 'auto',

  mapOptions: {},

  showOptionButton: true,

  templateString: dojo.cache("geonef.ploomap.tool", "templates/OverviewMap.html"),
  widgetsInTemplate: true,

  getInputRootNodes: function() {
    return [ this.formNode ].concat(this.inherited(arguments));
  },

  postCreate: function() {
    this.inherited(arguments);
    this.div = this.domNode;
  },

  onMapBound: function() {
    this.createControl();
    this.inherited(arguments);
  },

  getControlOptions: function() {
    var options = {
      displayClass: 'olControlOverviewMap',
      //size: new OpenLayers.Size(278, 180),
      minRatio: Math.pow(2, this.delta),
      maxRatio: Math.pow(2, this.delta),
      autoPan: this.autoPan,
      //fallThrough: true,
      mapOptions: dojo.mixin({
        projection: this.mapWidget.map.getProjectionObject(),
        units: this.mapWidget.map.units,
        maxExtent: this.mapWidget.map.maxExtent,
        numZoomLevels: this.mapWidget.map.numZoomLevels,
        theme: null
      }, this.mapOptions),
      layers: []
    };
    var layer;
    if (this.copyLayer) {
      if (this.copyLayer === '__base__') {
        layer = this.mapWidget.map.baseLayer;
        this.mapWidget.map.events.on({
            changebaselayer: this.setBaseLayer,
            scope: this
        });
      } else if (this.copyLayer === '__auto__')  {

      } else {
        layer = this.mapWidget.map.getLayersBy('layerId', this.copyLayer)[0];
      }
      if (!layer) {
        throw new Error('layer not found: '+this.copyLayer);
      }
      if (!layer.isBaseLayer) {
        //console.log('copying base layer');
        options.layers.push(this.mapWidget.map.baseLayer.clone());
      }
      var newLayer = this.cloneLayer(layer);
      if (newLayer.restrictedExtent) {
        options.mapOptions.restrictedExtent = newLayer.restrictedExtent.clone();
      }
      //console.log('adding clone', this, arguments, newLayer, 'from', layer);
      options.layers.push(newLayer);
    } else {
      var googleLayer = dojo.getObject('google.maps.MapTypeId.HYBRID') || G_HYBRID_MAP;
      options.layers.push(new OpenLayers.Layer.Google('minimap', { sphericalMercator: true,
                                                                   type: googleLayer }));
    }
    return options;
  },

  createControl: function() {
    //console.log('createControl', this.id, this, arguments, this.mapWidget, this.mapWidget.map);
    var options = this.getControlOptions();
    //console.log('options', options);
    this.control = new geonef.ploomap.OpenLayers.Control.OverviewMap( //OpenLayers.Control.OverviewMap(
      dojo.mixin({ div: this.domNode }, options));
    this.mapWidget.map.addControl(this.control);
    dojo.query('> div > .olMap', this.domNode)
      .style({ width: '100%', height: '100%' });
    dojo.addClass(this.control.element, 'olControlOverviewMapElement');
    dojo.addClass(this.control.extentRectangle, 'olControlOverviewMapExtentRectangle');
    //this.control.update();
    geonef.jig.connectOnce(this.control, 'createMap', this,
      function() {
        //console.log('ovmap', this, arguments, this.control, this.control.ovmap);
        this.connect(this.control.ovmap, 'updateSize',
                     function() { this.control.update(); });
        this.connect(this, 'resize',
                     function() { this.control.ovmap.updateSize(); });
        this.resize();
      });
  },

  destroy: function() {
    if (this.control) {
      this.mapWidget.map.removeControl(this.control);
      this.control.destroy();
      this.control = null;
    }
    this.mapWidget.map.events.on({
      changebaselayer: this.setBaseLayer,
      scope: this
    });
    dojo.removeClass(this.mapWidget.domNode, 'overviewMapMinimized');
    this.inherited(arguments);
  },

  _setPanAwareAttr: function(state) {
    if (state === 'false') { state = false; }
    state = !!state;
    this.afterMapBound(
      function() {
        this.panAware = state;
        this.control.setPanAware(state);
        this.setSubValue('panAware', state);
      });
  },

  _setDeltaAttr: function(delta) {
    this.afterMapBound(
      function() {
        var ratio = Math.pow(2, delta);
        this.delta = delta;
        this.control.minRatio = ratio;
        this.control.maxRatio = ratio;
        this.control.update();
        this.setSubValue('delta', delta);
      });
  },

  _setLayerAttr: function(layer) {
    //console.log('_setLayerAttr', this, arguments);
    this.afterMapBound(
      function() {
        var newLayer = this.cloneLayer(layer);
        var oldBaseLayer = this.control.ovmap.baseLayer;
        this.control.ovmap.addLayer(newLayer);
        this.control.ovmap.setBaseLayer(newLayer);
        if (newLayer.maxExtent) {
          this.control.ovmap.restrictedExtent = newLayer.maxExtent.clone();
        }
        this.control.updateOverview();
        if (oldBaseLayer) {
          this.control.ovmap.removeLayer(oldBaseLayer);
          try {
            oldBaseLayer.destroy();
          } catch (x) {
            //console.warn("exception at destroy: ", x, oldBaseLayer);
          }
        }
      });
  },

  cloneLayer: function(layer) {
    //console.log('cloneLayer', this, arguments);
    var newLayer;
    if (layer.overviewFactory) {
      newLayer = geonef.ploomap.util.factoryCreateLayer(layer.overviewFactory);
    } else {
      newLayer = layer.clone();
      //console.log('cloned layer', this, layer, newLayer, newLayer.options);
    }
    // newLayer.transitionEffect = 'resize';
    // if (this.maxResolution && this.maxResolution != 'auto') {
    //   var r = { maxResolution: this.maxResolution,
    //             minScale:null, maxScale:null,
    //             minResolution:null, resolutions:null, scales:null };
    //   dojo.mixin(newLayer, r);
    //   newLayer.options = dojo.mixin({}, newLayer.options, r);
    //   //newLayer.initResolutions();
    // }
    return newLayer;
  },


  setBaseLayer: function() {
    //console.log('setBaseLayer', this, arguments, this.mapWidget.map.baseLayer);
    this.attr('layer', this.mapWidget.map.baseLayer);
  },

  onChange: function(widget) {
    //console.log('onChange', widget.name, widget);
    this.attr(widget.name, widget.attr('value'));
  },

  layerFilter: function(layer) {
    return layer.displayInLayerSwitcher && layer.isBaseLayer;
  },

  _setShowOptionButtonAttr: function(state) {
    this.showOptionButton = state;
    dojo.style(this.optionButton.domNode, 'display',
              state ? '': 'none');
  },

  /**
   * Compat with OpenLayers.Control
   */
  // setMap: function(map) {
  // },  // already managed by MapBinding
  // draw: function() {
  // },
  // activate: function() {},
  // deactivate: function() {}

  minimize: function() {
    dojo.addClass(this.domNode, 'minimized');
    dojo.addClass(this.mapWidget.domNode, 'overviewMapMinimized');
  },

  maximize: function() {
    dojo.removeClass(this.domNode, 'minimized');
    dojo.removeClass(this.mapWidget.domNode, 'overviewMapMinimized');
  }

});
