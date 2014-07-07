
dojo.provide('geonef.ploomap.macro.action.MapRunner');

// parents
dojo.require('geonef.ploomap.macro.action.MapBindingRunner');

dojo.declare('geonef.ploomap.macro.action.MapRunner', [ geonef.ploomap.macro.action.MapBindingRunner ],
{
  // summary:
  //   Operate on map properties

  EDITOR_CLASS: 'geonef.ploomap.macro.action.MapEditor',

  label: "Carte",

  // zoom: integer
  //    if not null, set the map to given zoom (positive)
  zoom: null,

  // zoomChange: integer
  //    if not null, change the map zoom with given difference (positive or negative)
  zoomChange: null,

  // duration: integer
  //    duration of change, in milliseconds
  duration: null,

  doPlay: function() {
    var zoom = this.zoom;
    var presentZoom = this.mapWidget.map.getZoom();
    if (!zoom && this.zoomChange !== null) {
      zoom = presentZoom + this.zoomChange;
    }
    //console.log('zoom', zoom, presentZoom, this.zoomChange);
    if (zoom !== null) {
      this.performZoomChange(zoom, presentZoom);
    } else {
      this.onEnd();
    }
  },

  performZoomChange: function(zoom, presentZoom) {
    //console.log('performZoomChange', this, arguments);
    if (this.duration === null) {
      this.mapWidget.map.zoomTo(zoom);
      this.onEnd();
    } else {
      this.animation = this.makeZoomAnimation(zoom, presentZoom);
      //console.log('playing anim', this, this.animation);
      this.animation.play();
    }
  },

  makeZoomAnimation: function(zoom, presentZoom) {
    var self = this;
    var animate = function(value) {
      var zoom = self.mapWidget.map.getZoom();
      var newZoom = parseInt(Math.round(value), 10);
      //console.log('animate', zoom, newZoom);
      if (zoom !== newZoom) {
        //console.log('change zoom to', newZoom);
        self.mapWidget.map.zoomTo(newZoom);
      }
    };
    return new dojo.Animation(
      {
        curve: [presentZoom, zoom],
        duration: this.duration,
        onAnimate: animate,
        rate: 5,
        onEnd: function() {
          self.stop();
          self.onEnd();
        }
      });
  }

});
