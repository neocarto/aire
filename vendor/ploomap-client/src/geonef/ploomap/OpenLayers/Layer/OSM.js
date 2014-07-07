
dojo.provide('geonef.ploomap.OpenLayers.Layer.OSM');

/**
 * Class: geonef.ploomap.OpenLayers.Layer.OSM
 *
 * Inspired from OpenLayers.Layer.OSM.
 *
 * Inherits from:
 *  - <OpenLayers.Layer.XYZ>
 */
geonef.ploomap.OpenLayers.Layer.OSM = OpenLayers.Class(OpenLayers.Layer.XYZ,
{
  name: "OpenStreetMap",

  attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",

  sphericalMercator: true,

  wrapDateLine: true,

  isBaseLayer: false,

  transitionEffect: 'resize',

  /**
   * One of: 'mapnik', 'osmarender'
   */
  type: 'mapnik',

  urls: {
    mapnik: 'http://tile.openstreetmap.org/${z}/${x}/${y}.png',
    osmarender: 'http://c.tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png'
  },

  serverResolutions: [
    156543.03390625, 78271.516953125, 39135.7584765625,
    19567.87923828125, 9783.939619140625, 4891.9698095703125,
    2445.9849047851562, 1222.9924523925781, 611.4962261962891,
    305.74811309814453, 152.87405654907226, 76.43702827453613,
    38.218514137268066, 19.109257068634033, 9.554628534317017,
    4.777314267158508, 2.388657133579254, 1.194328566789627,
    0.5971642833948135
  ],


  ////////////////////////////////////////////////////////////////////
  // Layer lifecycle

  /**
   * Constructor: OpenLayers.Layer.XYZ
   *
   * Parameters:
   * name - {String}
   * url - {String}
   * options - {Object} Hashtable of extra options to tag onto the layer
   */
  initialize: function(options) {
    options = OpenLayers.Util.extend({
      numZoomLevels: null,
      minResolution: 0.5971642833948135,
      url: this.urls[options.type || this.type]
    }, options);
    var name = options.name || this.name;
    var newArguments = [name, options.url, options];
    OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArguments);
  },

  clone: function(obj) {
    if (obj == null) {
      obj = new geonef.ploomap.OpenLayers.Layer.OSM(this.getOptions());
    }
    obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
    return obj;
  },


  ////////////////////////////////////////////////////////////////////
  // Export functionality

  getExportFormats: function() {
    if (this.type === 'mapnik') {
      return {
        png: "PNG",
        jpeg: "JPEG",
        svg: "SVG",
        pdf: "PDF",
        ps: "Postscript"
      };
    } else {
      return {
        png: "PNG",
        jpeg: "JPEG"
      };
    }
  },

  getExportMaxSize: function() {
    return 2564;
  },

  getExportNotice: function() {
    if (this.type === 'osmarender') {
      return "Attention : l'étendue de export sera ajusté au zoom le "
             + "plus proche";
    }
    return '';
  },

  /**
   * params has the member: format, width, height, extent
   */
  getExportUrl: function(params, callback) {
    var url;
    var proj4326 = new OpenLayers.Projection('EPSG:4326');
    var proj900913 = new OpenLayers.Projection('EPSG:900913');
    if (this.type === 'osmarender') {
      var lonlat = params.extent.getCenterLonLat();
      lonlat.transform(this.map.getProjectionObject(), proj4326);
      var resolution = params.extent.getWidth() / params.width;
      var zoom = this.getZoomForResolution(resolution, true) - 2;
      url = 'http://tah.openstreetmap.org/MapOf/index.php'
            + '?long=' + lonlat.lon
            + '&lat=' + lonlat.lat
            + '&z=' + zoom
            + '&w=' + params.width
            + '&h=' + params.height
            + '&format=' + params.format;
    } else {
      var extent4326 = params.extent.clone()
        .transform(this.map.getProjectionObject(), proj4326);
      var extent = params.extent.clone()
        .transform(this.map.getProjectionObject(), proj900913);
      var scaleW = extent.getWidth() / params.width / 0.00028;
      var scaleH = extent.getHeight() / params.height / 0.00028;
      var scale = Math.round(Math.min(scaleW, scaleH));
      console.log('scale', extent, scaleW, scaleH, params);
      url = 'http://tile.openstreetmap.org/cgi-bin/export'
        + '?bbox=' + extent4326.toBBOX()
        + '&scale=' + scale
        + '&format='+params.format;
    }
    //console.log('export url', this, arguments, url);
    callback(url);
  },

  CLASS_NAME: "OpenLayers.Layer.OSM"
});
