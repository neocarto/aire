
/**
 * @requires OpenLayers/Layer/TMS.js
 */

/**
 * Class: OpenLayers.Layer.pmTMS
 *
 * Inherits from:
 *  - <OpenLayers.Layer.TMS>
 */
OpenLayers.Layer.pmTMS = OpenLayers.Class(OpenLayers.Layer.TMS,
{

  isBaseLayer: false,

  tileOrigin: new OpenLayers.LonLat(0, 0),

  type: 'png',

  initialize: function(name, mapName, options) {
    this.mapName = mapName;
    this.pmExportMap = mapName;
    var newArguments = [];
    newArguments.push(name, '/tiles/', options);
    OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
  },

  /**
   * APIMethod:destroy
   */
  destroy: function() {
    // for now, nothing special to do here.
    OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);
  },

  /**
   * APIMethod: clone
   *
   * Parameters:
   * obj - {Object}
   *
   * Returns:
   * {<OpenLayers.Layer.pmTMS>} An exact clone of this <OpenLayers.Layer.pmTMS>
   */
  clone: function (obj) {
    if (obj == null) {
      obj = new OpenLayers.Layer.TMS(this.name, this.layername, this.options);
    }
    //get all additions from superclasses
    obj = OpenLayers.Layer.TMS.prototype.clone.apply(this, [obj]);
    // copy/set any non-init, non-simple values here
    return obj;
  },

  /**
   * Method: getURL
   *
   * Parameters:
   * bounds - {<OpenLayers.Bounds>}
   *
   * Returns:
   * {String} A string with the layer's url and parameters and also the
   *          passed-in bounds and appropriate tile size specified as
   *          parameters
   */
  getURL : function (bounds) {
    bounds = this.adjustBounds(bounds);
    var res = this.map.getResolution();
    var x = Math.round((bounds.left - this.tileOrigin.lon) / (res * this.tileSize.w));
    var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
    var z = this.map.getZoom();
    /*  if (!w1) { w1 = true;
     alert('res: '+res+' bounds.L: '+bounds.left+'x: '+x);
     }*/
    var path = this.mapName + "/" + z + "-" + x + "-" + y + "." + this.type + "?res=" + res;
    var url = this.url;
    if (url instanceof Array) {
      url = this.selectUrl(path, url);
    }
    return url + path;
  },

  CLASS_NAME: "OpenLayers.Layer.pmTMS"

});
