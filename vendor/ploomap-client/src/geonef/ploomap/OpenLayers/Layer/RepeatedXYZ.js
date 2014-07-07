
/**
 * @requires OpenLayers/Layer/XYZ.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Layer.RepeatedXYZ');


/**
 * Class: OpenLayers.Layer.pmTMS
 *
 * Inherits from:
 *  - <OpenLayers.Layer.TMS>
 */
geonef.ploomap.OpenLayers.Layer.RepeatedXYZ = OpenLayers.Class(OpenLayers.Layer.XYZ,
{
  displayOutsideMaxExtent: true,

  /**
   * @inheritsDoc
   */
  sphericalMercator: true,
  marsUrl: false,

  /**
   * @inheritsDoc
   */
  getURL: function(bounds) {
    var res = this.map.getResolution();
    var x = Math.round((bounds.left - this.maxExtent.left)
                       / (res * this.tileSize.w));
    var i = this.marsUrl ? -1 : 1;
    var y = Math.round((bounds.bottom * i - this.maxExtent.bottom)
                       / (res * this.tileSize.h));
    var z = this.map.getZoom() + this.zoomOffset;
    var coord = {x: x, y: y, z: z};
    this.processCoordRepeat(coord);
    return this.marsUrl ? this.getMarsUrl(this.url, coord) :
      OpenLayers.String.format(this.url, coord);
  },

  processCoordRepeat: function(coord) {
    var y = coord.y;
    var x = coord.x;
    //tile range in one direction range is dependent on zoom level
    //0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
    var tileRange = 1 << coord.z;

    //don't repeat across y-axis (vertically)
    if (y < 0 || y >= tileRange) {
      return;
    }

    //repeat across x-axis
    if (x < 0 || x >= tileRange) {
      x = (x % tileRange + tileRange) % tileRange;
    }
    coord.x = x;
    coord.y = y;
  },

  getMarsUrl: function(baseUrl, coord) {
    var bound = Math.pow(2, coord.z);
    var x = coord.x;
    var y = coord.y;
    var quads = ['t'];

    for (var z = 0; z < coord.z; z++) {
      bound = bound / 2;
      if (y < bound) {
        if (x < bound) {
          quads.push('q');
        } else {
          quads.push('r');
          x -= bound;
        }
      } else {
        if (x < bound) {
          quads.push('t');
          y -= bound;
        } else {
          quads.push('s');
          x -= bound;
          y -= bound;
        }
      }
    }
    return baseUrl + quads.join('') + ".jpg";
  }

});
