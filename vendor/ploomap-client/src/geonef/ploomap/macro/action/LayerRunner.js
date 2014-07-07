
dojo.provide('geonef.ploomap.macro.action.LayerRunner');

// parents
dojo.require('geonef.ploomap.macro.action.MapBindingRunner');

dojo.declare('geonef.ploomap.macro.action.LayerRunner', [ geonef.ploomap.macro.action.MapBindingRunner ],
{
  // summary:
  //   action to add a layer or change its properties (visibility, opacity...)
  //

  EDITOR_CLASS: 'geonef.ploomap.macro.action.LayerEditor',

  label: 'Couche',

  // duration: integer
  //    duration of property change
  duration: 0,

  // layer: string
  //    layer name to operate on (if on the map), or to add (if not on the map)
  layer: null,

  // visibility: boolean
  //    if not null, set layer visibility
  visibility: null,

  // opacity: float
  //    if not null, set layer opacity
  opacity: null,

  // zIndex: integer
  //    if not null, set layer z-index
  zIndex: null,

  // highlight: boolean
  //    if true, the layer widget from the layer manager is highlighted
  highlight: false,

  // remove: boolean
  //    if true, the layer is removed immediately, nothing else is done (duration does not apply)
  remove: null,

  /*postscript: function() {
    this.inherited(arguments);
  },*/

  doPlay: function() {
    this.layerObj = this.findLayer(this.layer);
    //console.log('doPlay', this, arguments);
    if (this.layerObj) {
      if (this.remove) {
        this.mapWidget.map.removeLayer(this.layerObj);
        this.layerObj.destroy();
        this.onEnd();
      } else {
        this.updateProperties();
        if (this.highlight) {
          this.highlightWidget();
        }
      }
    } else {
      if (this.remove) {
        // layer was not on map, and must be removed: do nothing
        //console.log('nothing to do!', this, this.remove, this.layer, this.layerObj);
        this.onEnd();
      } else {
        this.addLayerToMap();
        this.updatePropertiesAfterAdding();
      }
    }
  },

  addLayerToMap: function() {
    this.layerObj = this.mapWidget.layersDefs.addLayerToMap(this.layer);
    console.log('addLayerToMap', this, this.layerObj);
    //throw new Error("layer adding not implemented");
  },

  updatePropertiesAfterAdding: function() {
    if (this.visibility !== null) {
      this.layerObj.setOpacity(this.visibility);
    }
    if (this.opacity !== null) {
      this.layerObj.setOpacity(this.opacity);
    }
    if (this.zIndex !== null) {
      this.layerObj.setZIndex(this.zIndex);
    }
    this.onEnd();
  },

  updateProperties: function() {
    // !vis + !opa : vis=~, opa=~
    //  vis + !opa : vis=vis, opa=~
    // !vis +  opa : vis=true, opa=opa
    //  vis +  opa : vis=vis, opa=opa
    var opacity = this.opacity;
    var visibility = this.visibility;
    if (this.zIndex !== null) {
      this.layerObj.setZIndex(this.zIndex);
    }
    if (visibility === null) {
      if (opacity === null) {
        visibility = this.layerObj.getVisibility();
      } else {
        visibility = true;
      }
    }
    if (opacity === null) {
      opacity = this.layer.opacity;
    }
    if (this.duration) {
      this.animation = this.makeAnimation(visibility, opacity);
      this.animation.play();
    } else {
      this.layerObj.setOpacity(opacity);
      this.layerObj.setVisibility(visibility);
      this.onEnd();
    }

  },

  makeAnimation: function(visibility, opacity) {
    var startOpacity = !this.layerObj.getVisibility() && visibility ?
      0.0 : // means the layer is becoming visible
      this.layerObj.opacity
    , endOpacity = this.layerObj.getVisibility() && !visibility ?
      0.0 : // means the layer is becoming hidden
      opacity
    , startVisibility = this.layerObj.getVisibility()
    ;
    //console.log('info', startVisibility, visibility, startOpacity, endOpacity, opacity);
    var self = this;
    return new dojo.Animation(
        {
          curve: [startOpacity, endOpacity],
          //easing: dojo.fx.easing.sinInOut,
          duration: this.duration,
          onBegin: function() {
            self.layerObj.setVisibility(startVisibility);
          },
          onAnimate: function(value) {
            self.layerObj.setOpacity(value);
          },
          onEnd: function() {
            self.layerObj.setVisibility(visibility);
            self.layerObj.setOpacity(opacity);
            self.stop();
            self.onEnd();
          }
        });
  },

  highlightWidget: function() {
    var layer = this.layerObj;
    var layerWidget = dijit.registry.filter(
      function(w) { return w.defaultOptClass && w.layer === layer; })[0];
    console.log('highlightWidget', this, layerWidget);
    if (layerWidget) {
      geonef.jig.workspace.highlightWidget(layerWidget, 'focus');
    }
  }

});
