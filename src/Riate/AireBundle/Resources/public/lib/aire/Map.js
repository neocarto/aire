
dojo.provide('aire.Map');

// parents
dojo.require('geonef.ploomap.map.Classical');

// used in code
dojo.require('geonef.ploomap.OpenLayers.Control.Panel');
dojo.require('geonef.ploomap.OpenLayers.Control.Navigation');
dojo.require('geonef.ploomap.legend.Container');

dojo.declare('aire.Map', [ geonef.ploomap.map.Classical ],
{
  layersDefsClass: 'aire.layerDef.Collection',

  map: {},

  mapOptions: {
    projection: null,
    maxExtent: null,
    numZoomLevels: 5,
    maxResolution: 'auto'//8855
  },

  buildOverViewMap: false,

  controls: [
    'geonef.ploomap.OpenLayers.Control.Navigation',
    'OpenLayers.Control.KeyboardDefaults',
    'geonef.ploomap.OpenLayers.Control.PanZoomBar',
    //'geonef.ploomap.OpenLayers.Control.TileLoadSpinner',
    // { 'class': 'OpenLayers.Control.ZoomPanel',
    //   options: { div: 'toolbar' }}
    { 'class': 'aire.OpenLayers.Control.AireToolbar',
      options: { div: 'toolbar' }},
      // options: {
      //   div: 'toolbar',
      //   defaultControlIdx: 1,
      //   controlsClasses: [
      //     { 'class': 'OpenLayers.Control.NavigationHistory',
      //       options: { type: OpenLayers.Control.TYPE_BUTTON }},
      //     { 'class': 'OpenLayers.Control.Button',
      //       options: {
      //         displayClass: 'aiControlHome',
      //         title: "Home page",
      //       trigger: function() { alert('hehe'); }}},
      //     { 'class': 'OpenLayers.Control.Navigation',
      //       options: { zoomWheelEnabled: false, zoomBoxEnabled: true }},
      //     { 'class': 'OpenLayers.Control.NavigationHistory',
      //       getterProp: 'previous' },
      //     { 'class': 'OpenLayers.Control.NavigationHistory',
      //       getterProp: 'next' },
      //     'OpenLayers.Control.ZoomToMaxExtent',
      //     'OpenLayers.Control.ZoomBox',
      //     { 'class': 'OpenLayers.Control.Button',
      //       options: {
      //         displayClass: 'aiControlSave',
      //         title: "Exporter en SVG",
      //       trigger: function() { alert('SVG'); }}},
      //     { 'class': 'OpenLayers.Control.Button',
      //       options: {
      //         displayClass: 'aiControlPrint',
      //         title: "Mode impression",
      //       trigger: function() { alert('hehe'); }}},
      //     { 'class': 'OpenLayers.Control.Button',
      //       options: {
      //         displayClass: 'aiControlHelp',
      //         title: "Aide",
      //       trigger: function() { alert('hehe'); }}},
      //   ] }},
    { 'class': 'OpenLayers.Control.ScaleLine',
      options: { maxWidth: 150, div: 'scale' }}
  ],

  postMixInProperties: function() {
    this.inherited(arguments);
    if (window.aireCollection.zoomBarX > -499) {
      OpenLayers.Control.PanZoom.X = window.aireCollection.zoomBarX;
    }
    if (window.aireCollection.zoomBarY > -499) {
      OpenLayers.Control.PanZoom.Y = window.aireCollection.zoomBarY;
    }
    this.asyncInit.deferCall(this, ['_setMapAttr']);
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.buildLegendContainer();
    this.buildSourceContainer();
  },

  buildLegendContainer: function() {
    this.legendContainer = new geonef.ploomap.legend.Container();
    this.legendContainer.placeAt(this.domNode).startup();
    this.subscribe('ploomap/map/changebaselayer', this.updateLegend);
  },

  updateLegend: function() {
    //console.log('updateLegend', this, arguments,
    //            this.map.baseLayer, this.map.baseLayer.legendData);
    this.legendContainer.setupMap(this.map.baseLayer.legendData);
  },

  buildSourceContainer: function() {
    geonef.jig.makeDOM(
      [['div', { 'class':'sourcecop', _insert: this.domNode },
        [['div',{ 'class':'opacity' }],
         ['div',{ 'class':'source', attachPoint:'sourceNode'},'Z1'],
         ['div',{ 'class': 'copyright', attachPoint:'copyrightNode'},'Z2']]]], this);
    console.log('sourceNode', this, this.sourceNode, this.copyrightNode);
  },

  onZoomChange: function(newZoom) {
    this.inherited(arguments);
    //console.log('resolution', this, arguments, this.map.getResolution());
    this.legendContainer.attr('resolution', this.map.getResolution());
  },

  // showMap: function(map) {
  //   this.attr('map', map);
  // },

  // _setMapAttr: function(map) {
  //   //console.log('_setMapAttr', this, arguments);
  //   if (!map || !map.id) { return; }
  //   var layer = new OpenLayers.Layer.WMS(map.id,
  //     '/ows/'+map.id,
  //     {
  //       layers: map.layers,
  //       format: 'image/png'
  //     }, {
  //       maxExtent: new OpenLayers.Bounds.fromArray(map.extent),
  //       maxResolution: this.mapOptions.maxResolution,
  //       projection: new OpenLayers.Projection(map.projection),
  //       isBaseLayer: true,
  //       visible: true,
  //       units: 'm',
  //       numZoomLevels: this.mapOptions.numZoomLevels,
  //       transitionEffect: 'resize',
  //     });
  //   if (this.map.baseLayer) {
  //     this.map.removeLayer(this.map.baseLayer);
  //   }
  //   this.map.restrictedExtent = new OpenLayers.Bounds.fromArray(map.extent);

  //   this.map.addLayer(layer);
  //   this.map.setBaseLayer(layer);
  //   this.map.zoomToMaxExtent();
  //   //console.log('added layer', layer, this.map);
  // }

});
