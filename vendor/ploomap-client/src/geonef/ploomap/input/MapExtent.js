
dojo.provide('geonef.ploomap.input.MapExtent');

dojo.require('geonef.ploomap.input.Extent');

dojo.declare('geonef.ploomap.input.MapExtent', geonef.ploomap.input.Extent,
{

  hideSelectMapExtentButton: true,
  autoPanMap: false,

  buildRendering: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'ploomapInputMapExtent');
  },

  onMapBound: function() {
    this.inherited(arguments);
    var self = this;
    this.connect(this.mapWidget, 'onMapMove', 'onMapMove');
  },

  onMapMove: function() {
    this._inMapMove = true;
    this.attr('value', this.mapWidget.map.getExtent());
    this._inMapMove = false;
  },

  _doSetValue: function(bounds) {
    // Overloaded, to handle our specific logic:
    // if our value is set not from the map move event,
    // we just interpret the wish to move the map.
    //
    // OL will adjust the effective map extent to match the div geometry
    // & map zoom level. We'll catch the onMapMove event then,
    // and will update this input finally.
    //
    if (this._inMapMove) {
      // ok, we adjust our value from new map position
      this.isMapExtent = true;
      if (this.inherited(arguments)) {
        this.destroyVectorLayer();
        var map = this.mapWidget.map;
        this.goZoomButton.attr('disabled', map.getZoom() === map.getNumZoomLevels() - 1);
        this.goUnZoomButton.attr('disabled', map.getZoom() === 0);
        return true;
      }
      return false;

    } else {
      // value is set from outside: we just update the map position,
      // then wait for the onMapMove event to update our value
      this.mapWidget.map.zoomToExtent(bounds, true);
      return false;
    }
  }

});
