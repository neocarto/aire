
/**
 * @requires OpenLayers/Control/PanZoom.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.PanZoomBar');

geonef.ploomap.OpenLayers.Control.PanZoomBar =
  OpenLayers.Class(OpenLayers.Control.PanZoomBar,
{
  showPanButtons: false,

    /**
    * Method: draw
    *
    * Parameters:
    * px - {<OpenLayers.Pixel>}
    */
    draw: function(px) {
        // initialize our internal div
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        px = this.position.clone();

        // place the controls
        this.buttons = [];

        var sz = new OpenLayers.Size(18,18);
        var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);
        var wposition = sz.w;

        if (this.zoomWorldIcon) {
            centered = new OpenLayers.Pixel(px.x+sz.w, px.y);
        }

        if (this.showPanButtons) {
          this._addButton("panup", "north-mini.png", centered, sz);
          px.y = centered.y+sz.h;
          this._addButton("panleft", "west-mini.png", px, sz);
        }
        if (this.zoomWorldIcon) {
            this._addButton("zoomworld", "zoom-world-mini.png", px.add(sz.w, 0), sz);

            wposition *= 2;
        }
        if (this.showPanButtons) {
          this._addButton("panright", "east-mini.png", px.add(wposition, 0), sz);
          this._addButton("pandown", "south-mini.png", centered.add(0, sz.h*2), sz);
        }
        this._addButton("zoomin", "zoom-plus-mini.png", centered.add(0, sz.h*1+0), sz);
        //this._addButton("zoomin", "zoom-plus-mini.png", centered.add(0, sz.h*3+5), sz);
        centered = this._addZoomBar(centered.add(0, sz.h*2 + 0));
        //centered = this._addZoomBar(centered.add(0, sz.h*4 + 5));
        this._addButton("zoomout", "zoom-minus-mini.png", centered, sz);
        return this.div;
    },

    // /**
    //  * @inheritsDoc
    //  */
    // draw: function(px) {
    //   // initialize our internal div
    //   OpenLayers.Control.prototype.draw.apply(this, arguments);
    //   px = new OpenLayers.Pixel(1, 1);

    //   // place the controls
    //   this.buttons = [];

    //   var sz = new OpenLayers.Size(18,18);
    //   var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);

    //   this._addButton("zoomin", "zoom-plus-mini.png",
    //                   centered.add(0, sz.h*0+0), sz);
    //   this._addButton("zoomout", "zoom-minus-mini.png",
    //                   centered.add(0, sz.h*1+0), sz);
    //   return this.div;
    // },

    CLASS_NAME: "geonef.ploomap.OpenLayers.Control.PanZoomBar"
});
