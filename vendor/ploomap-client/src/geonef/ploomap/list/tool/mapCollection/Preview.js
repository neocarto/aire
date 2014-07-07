
dojo.provide('geonef.ploomap.list.tool.mapCollection.Preview');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._AsyncInit');

// used in template
dojo.require('geonef.jig.layout.BorderContainer');

// used in code
dojo.require('geonef.jig.api');
dojo.require('dojox.lang.functional');
dojo.require('geonef.jig.layout.anchor.Border');
dojo.require('aire.Map');

/**
 * Detailed view for map collections
 *
 * @class
 */
dojo.declare('geonef.ploomap.list.tool.mapCollection.Preview',
             [ geonef.jig.layout._Anchor, dijit._Templated, geonef.jig.widget._AsyncInit ],
{
  uuid: '',

  title: 'Prévisu collection',

  apiModule: 'listQuery.mapCollection.multiRepr',

  templateString: dojo.cache('geonef.ploomap.list.tool.mapCollection',
                             'templates/Preview.html'),
  widgetsInTemplate: true,

  /**
   * @type {Array.<geonef.ploomap.map.Classical>}
   */
  maps: [],

  postCreate: function() {
    this.inherited(arguments);
    this.loadInfo();
  },

  loadInfo: function() {
    this.asyncInit.dependsOn(
      geonef.jig.api.request({
        module: this.apiModule,
        action: 'getMapsInfo',
        uuid: this.uuid,
        callback: function(data) {
          this.data = data;
        },
        scope: this
      }));
  },

  onAsyncInitEnd: function() {
    this.setupAll();
  },

  setupAll: function() {
    //console.log('setupAll', this, arguments);
    this._d = 0;
    this.box = dojo.contentBox(this.domNode);
    this.sSize = 5;
    this.reprCount = dojox.lang.functional.keys(this.data.maps).length;
    this.bh = Math.floor((this.box.h - ((this.reprCount - 1) * this.sSize)) /
                         this.reprCount);
    //console.log('bh', this.bh);
    this._idx = 0;
    this.maps = [];
    geonef.jig.forEach(this.data.maps, this.setupRepresentation, this);
    //this.maps.forEach(function(map) { map.startup(); });
  },

  setupRepresentation: function(data, name) {
    //console.log('setupRepresentation', this, arguments);
    var count = dojox.lang.functional.keys(data).length;
    var title = "Représentation \""+name+"\"";
    var reprCont = new geonef.jig.layout.BorderContainer(
      { design:'sidebar', title: title });
    var vpSize = this.bh * (this.reprCount - this._idx) +
      this.sSize * (this.reprCount - this._idx - 1);
    this.mainContainer.smartAddChild(reprCont, false, vpSize);
    var idx = 0;
    var bw = Math.floor((this.box.w - ((count - 1) * this.sSize)) / count);
    //console.log('bw', bw);
    geonef.jig.forEach(data,
      function(mapInfo, level) {
        //console.log('func', arguments);
        // var map = new dijit.layout.ContentPane(
        //   {content: "héhé! "+(++this._d)});
        var map = this.createMap(mapInfo);
        var pSize = bw * (count - idx) + this.sSize * (count - idx - 1);
        reprCont.smartAddChild(map, false, pSize);
        ++idx;
      }, this);
    ++this._idx;
  },

  createMap: function(mapInfo) {
    var isFirst = !this.firstMap;
    var controls = ['geonef.ploomap.OpenLayers.Control.Navigation'];
    if (isFirst) {
      this.firstMap = map;
      controls.push('OpenLayers.Control.KeyboardDefaults');
      controls.push('geonef.ploomap.OpenLayers.Control.Zoom');
    }
    var map = new aire.Map(
      {
        map: mapInfo,
        controls: controls,
        mapOptions: dojo.mixin({}, aire.Map.prototype.mapOptions,
                               { numZoomLevels: 7, maxResolution: 35420 })
      });
    map.addOnStartup(
      function() { map.map.zoomToMaxExtent(); });
    if (isFirst) {
      this.firstMap = map;
    } else {
      var firstMap = this.firstMap;
      map.connect(firstMap, 'onMapMove',
        function() {
          var c = firstMap.map.getCenter();
          var z = firstMap.map.getZoom();
          map.asyncInit.addCallback(
            function() { map.map.setCenter(c, z); });
        });
    }
    this.maps.push(map);
    return map;
  },

  resize: function() {
    //console.log('resize', this, arguments, this.mainContainer);
    this.inherited(arguments);
    this.mainContainer.resize();
  }

});
