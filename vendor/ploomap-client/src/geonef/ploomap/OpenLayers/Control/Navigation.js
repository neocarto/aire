
/**
 * @requires OpenLayers/Control/Navigation.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.Navigation');
dojo.require('dojo.fx.easing');

geonef.ploomap.OpenLayers.Control.Navigation =
  OpenLayers.Class(OpenLayers.Control.Navigation,
{
  zoomAnimationFx: true,

  draw: function() {
    OpenLayers.Control.Navigation.prototype.draw.apply(this, arguments);
    this.interceptZoomBoxEvents();
  },

  interceptZoomBoxEvents: function() {
    var navig = this;
    ['down', 'up', 'out'].forEach(
      function(name) {
        var orig = this.zoomBox.handler.dragHandler.callbacks[name];
        this.zoomBox.handler.dragHandler.callbacks[name] =
          function() {
            if (navig.map.selectControl) {
              if (name == 'down') {
                navig.map.selectControl.deactivate();
              } else {
                navig.map.selectControl.activate();
              }
            }
            if (orig) {
              orig.apply(this, arguments);
            }
          };
      }, this);

  },

  wheelChange: function(evt, deltaZ) {
    //console.log('wheelChange', this, arguments);
    //OpenLayers.Control.Navigation.prototype.wheelChange.apply(this, arguments);
    var currentZoom = this.map.getZoom();
    var newZoom = this.map.getZoom() + Math.round(deltaZ);
    newZoom = Math.max(newZoom, 0);
    newZoom = Math.min(newZoom, this.map.getNumZoomLevels());
    if (newZoom === currentZoom) {
      return;
    }
    var size    = this.map.getSize();
    var deltaX  = size.w/2 - evt.xy.x;
    var deltaY  = evt.xy.y - size.h/2;
    var newRes  = this.map.baseLayer.getResolutionForZoom(newZoom);
    var zoomPoint = this.map.getLonLatFromPixel(evt.xy);
    var newCenter = new OpenLayers.LonLat(
      zoomPoint.lon + deltaX * newRes,
      zoomPoint.lat + deltaY * newRes );
    if (this.zoomAnimationFx) {
      this.zoomFx(deltaZ, evt.xy);
    }
    this.map.setCenter( newCenter, newZoom );
  },

  zoomFx: function(deltaZ, px) {
    //console.log('zoomFx', this, arguments);
    // rectangle animation
    var div = dojo.create('div',
      { style: 'z-index:100000;position:absolute;border:2px solid #f00;'},
      this.map.div);
    var smallRectSize = 30;
    var bigRectSize = 60;
    var startRectSize = deltaZ > 0 ? smallRectSize : bigRectSize;
    var endRectSize   = deltaZ < 0 ? smallRectSize : bigRectSize;
    var props = {
      left:   { start: px.x - startRectSize / 2,
                end: px.x - endRectSize / 2 },
      top:    { start: px.y - startRectSize / 2,
                end: px.y - endRectSize / 2 },
      width:  { start:  startRectSize, end: endRectSize },
      height: { start:  startRectSize, end: endRectSize },
      opacity: { start: 1, end: 0 }
    };
    var anim = dojo.animateProperty(
      {
        node: div, duration: 800, //rate: 50,
        properties: props,
        easing: dojo.fx.easing.quadOut,
        onEnd: function() { div.parentNode.removeChild(div); }
      });
    anim.play();
  }

});
