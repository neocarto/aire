
/**
 * @requires OpenLayers/Control/OverviewMap.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.OverviewMap');

geonef.ploomap.OpenLayers.Control.OverviewMap = OpenLayers.Class(OpenLayers.Control.OverviewMap,
{
  // summary:
  //    Extend Openlayers's map overview control and update it while the user pans the map
  //

  panAware: true,

  draw: function() {
    var div = OpenLayers.Control.OverviewMap.prototype.draw.apply(this, arguments);
    var self = this;
    this.map.controls.forEach(
      function(control) {
        if (control.dragPan) {
          self.dragPanControl = control.dragPan;
        }
      });
    this.setPanAware(this.panAware);
    return div;
  },

  setPanAware: function(state) {
    if (this.panAware) {
      this.map.events.unregister('move', this, this.move);
    }
    if (state) {
      this.map.events.register('move', this, this.move);
    }
    this.panAware = state;
  },


  destroy: function() {
    this.setPanAware(false);
    OpenLayers.Control.OverviewMap.prototype.destroy.apply(this, arguments);
  },

  move: function() {
    if (this.dragPanControl && this.dragPanControl.panned) {
      this.updateRectToMap();
    }
  },

    /**
     * Method updateOverview
     * Called by <update> if <isSuitableOverview> returns true
     *
     * COPIED FROM OL-src : never go beyond olmap's maxExtent
     */
    // updateOverview: function() {
    //     var mapRes = this.map.getResolution();
    //     var targetRes = this.ovmap.getResolution();
    //     var resRatio = targetRes / mapRes;
    //     if(resRatio > this.maxRatio) {
    //         // zoom in overview map
    //         targetRes = this.minRatio * mapRes;
    //     } else if(resRatio <= this.minRatio) {
    //         // zoom out overview map
    //         targetRes = this.maxRatio * mapRes;
    //     }
    //     var center;
    //     if (this.ovmap.getProjection() != this.map.getProjection()) {
    //         center = this.map.center.clone();
    //         center.transform(this.map.getProjectionObject(),
    //             this.ovmap.getProjectionObject() );
    //     } else {
    //         center = this.map.center;
    //     }
    //     this.ovmap.setCenter(center, this.ovmap.getZoomForResolution(
    //         targetRes * this.resolutionFactor));
    //     this.updateRectToMap();
    // },

  CLASS_NAME: 'geonef.ploomap.OpenLayers.Control.OverviewMap'

});
