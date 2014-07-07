
dojo.provide('geonef.ploomap.geometry.GeodesicSegment');

dojo.require('geonef.ploomap.vendor.GreatCircle');

/**
 * From 'start' and 'end 'points, build a geodesic (curved) lineString
 *
 * After construction, this geometry should not be changed
 */
geonef.ploomap.geometry.GeodesicSegment =
  OpenLayers.Class(OpenLayers.Geometry.LineString,
{
  /**
   * 'start' and 'end' must be EPSG:4326, projection is the final geometry projection
   */
  initialize: function(startX, startY, endX, endY, projection) {
    var points = this.getGCPoints(startX, startY, endX, endY, projection);
    OpenLayers.Geometry.LineString.prototype.initialize.apply(this, [points]);
  },

  getGCPoints: function(startX, startY, endX, endY, projection) {
    this.pOrigin = new geo.Point(startX, startY);
    this.pDest = new geo.Point(endX, endY);
    var gc = new geo.GreatCircle(this.pOrigin, this.pDest);
    var points = gc.toPoints(Math.min(startX, endX),
                             Math.max(startX, endX), projection);
    return points;
  },

  /**
   * Overloaded - use GreatCircle instead (more accurate)
   */
  getGeodesicLength: function(projection) {
    // var length = OpenLayers.Geometry.LineString.prototype.getGeodesicLength.apply(this, arguments);

    var drad = this.pOrigin.geoDistanceTo(this.pDest);
    var earth_radius = 6371.11;
    var length = drad*earth_radius*1000;
    //console.log('length', length, km);

    return length;
  }

});
