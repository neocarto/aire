dojo.provide('geonef.ploomap.macro.action.RegionRunner');

// parents
dojo.require('geonef.ploomap.macro.action.MapBindingRunner');

dojo.declare('geonef.ploomap.macro.action.RegionRunner', [ geonef.ploomap.macro.action.MapBindingRunner ],
{
  // summary:
  //   Move the map to the given region
  //

  EDITOR_CLASS: 'geonef.ploomap.macro.action.RegionEditor',

  label: 'Région',

  // duration: integer
  //    duration of move, in milliseconds. Zero makes an instant move
  duration: 0,

  // region: array
  //    region as [x0,y0,x1,y1], as coming from (geonef.ploomap.input.Region).attr('value').toArray()
  region: null,

  // noZoomChange: boolean
  //    if true, the zoom will not change, only the map center
  noZoomChange: false,

  // save: string
  //    if set, the former region is saved under the given identifier (see 'restore')
  save: null,

  // restore: string
  //    if set, the previously-saved given region is restored back
  restore: '',

  doPlay: function() {
    //console.log('**** doPlay (region)', this, arguments);
    if (this.animation) {
      this.animation.play();
      return;
    }
    var bounds;
    if (this.save) {
      if (!this.macroRunner.ploomapRegionSave) {
        this.macroRunner.ploomapRegionSave = {};
      }
      this.macroRunner.ploomapRegionSave[this.save] =
        this.mapWidget.map.getExtent();
    }
    if (this.restore) {
      if (!this.macroRunner.ploomapRegionSave ||
          !this.macroRunner.ploomapRegionSave[this.restore]) {
        console.warn('region not found in saved regions:', this.restore);
        return;
      }
      bounds = this.macroRunner.ploomapRegionSave[this.restore];
    } else {
      if (!this.region) {
        console.warn('region not defined', this);
        this.onEnd();
        return;
      }
      var r = this.region;
      bounds = new OpenLayers.Bounds(r[0], r[1], r[2], r[3]);
      //console.log('bounds', bounds);
    }
    this.performMove(bounds);
  },

  performMove: function(bounds) {
    if (this.duration) {
      var self = this;
      this.animation = this.makeAnimation(bounds);
      this.animation.play();
    } else {
      this.mapWidget.map.zoomToExtent(bounds, true);
      this.onEnd();
    }
  },

  makeAnimation: function(bounds) {
    var curve = this.noZoomChange ?
      new geonef.ploomap.macro.action.RegionRunner._AnimLonLatLine(
        this.mapWidget.map.getCenter(), bounds.getCenterLonLat()) :
      new geonef.ploomap.macro.action.RegionRunner._AnimBoundsLine(
        this.mapWidget.map.getExtent(), bounds);
    var self = this;
    var animate = this.noZoomChange ?
      function(value) { self.mapWidget.map.setCenter(value); } :
      function(value) { self.mapWidget.map.zoomToExtent(value); };
    return new dojo.Animation(
        {
          curve: curve,
          easing: dojo.fx.easing.sinInOut,
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

// curve function for OpenLayers.LonLat
geonef.ploomap.macro.action.RegionRunner._AnimLonLatLine =
  function(startLonLat, endLonLat) {
    var startLonLatArray = [startLonLat.lon, startLonLat.lat];
    var endLonLatArray = [endLonLat.lon, endLonLat.lat];
    this.lineArray = [];
    for (var i = 0; i < 2; ++i) {
      this.lineArray[i] = new dojo._Line(startLonLatArray[i], endLonLatArray[i]);
    }
  };
geonef.ploomap.macro.action.RegionRunner._AnimLonLatLine.prototype.getValue =
  function(r) {
    var c = this.lineArray.map(function(line) { return line.getValue(r); });
    return new OpenLayers.LonLat(c[0], c[1]);
  };

// curve function for OpenLayers.Bounds
geonef.ploomap.macro.action.RegionRunner._AnimBoundsLine =
  function(startBounds, endBounds) {
    var startBoundsArray = startBounds.toArray();
    var endBoundsArray = endBounds.toArray();
    this.lineArray = [];
    for (var i = 0; i < 4; ++i) {
      this.lineArray[i] = new dojo._Line(startBoundsArray[i], endBoundsArray[i]);
    }
  };
geonef.ploomap.macro.action.RegionRunner._AnimBoundsLine.prototype.getValue =
  function(r) {
    var c = this.lineArray.map(function(line) { return line.getValue(r); });
    return new OpenLayers.Bounds(c[0], c[1], c[2], c[3]);
  };
