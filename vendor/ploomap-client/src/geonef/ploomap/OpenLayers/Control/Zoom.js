
/**
 * @requires OpenLayers/Control/PanZoom.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.Zoom');

geonef.ploomap.OpenLayers.Control.Zoom =
  OpenLayers.Class(OpenLayers.Control.PanZoom,
{
    /**
     * @inheritsDoc
     */
    draw: function(px) {
      // initialize our internal div
      OpenLayers.Control.prototype.draw.apply(this, arguments);
      px = new OpenLayers.Pixel(1, 1);

      // place the controls
      this.buttons = [];

      var sz = new OpenLayers.Size(18,18);
      var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);

      this._addButton("zoomin", "zoom-plus-mini.png",
                      centered.add(0, sz.h*0+0), sz);
      this._addButton("zoomout", "zoom-minus-mini.png",
                      centered.add(0, sz.h*1+0), sz);
      return this.div;
    },

    CLASS_NAME: "geonef.ploomap.OpenLayers.Control.Zoom"
});
