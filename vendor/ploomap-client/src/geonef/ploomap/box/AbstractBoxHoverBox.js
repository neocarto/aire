
dojo.provide('geonef.ploomap.box.AbstractBoxHoverBox');

// parents
dojo.require('geonef.ploomap.box.AbstractBox');

// used in code
dojo.require('geonef.jig.util');

/**
 *
 * Workflows:
 *   hover (activate) -> click -> togglepersistant -> setPersistant
 *   setpersistant
 */
dojo.declare('geonef.ploomap.box.AbstractBoxHoverBox', geonef.ploomap.box.AbstractBox,
{
  panel: null,

  hoverBoxClass: null,

  persistanceEnabled: true,

  uninitialize: function() {
    this.inherited(arguments);
    if (this.boxLayer.persistantBox === this) {
      delete this.boxLayer.persistantBox;
    }
  },

  createHighlight: function() {
    this.inherited(arguments);
    this.createHoverBox();
    // if (this.boxLayer.persistantBox && this.boxLayer.persistantBox.hoverBox) {
    //   dojo.style(this.boxLayer.persistantBox.hoverBox.domNode, 'display', 'none');
    // }
  },

  destroyHighlight: function() {
    this.inherited(arguments);
    this.destroyHoverBox();
    // if (this.boxLayer.persistantBox && this.boxLayer.persistantBox.hoverBox) {
    //   dojo.style(this.boxLayer.persistantBox.hoverBox.domNode, 'display', '');
    // }
  },

  onPersist: function(zoomTo) {
    var hoverBox = this.hoverBox;
    if (hoverBox) {
      dojo.addClass(hoverBox.domNode, 'persistant');
      hoverBox.attr('readOnly', this.panel.readOnly);
      hoverBox.onPersist && hoverBox.onPersist(zoomTo);
    }
  },

  createHoverBox: function() {
    var _Class = geonef.jig.util.getClass(this.hoverBoxClass);
    this.hoverBox = new _Class({ feature: this.feature/*, featureBox: this*/ });
    // this.setHoverBoxStyle();
    var map = this.feature.layer.map;
    this.hoverBox.placeAt(map.div).startup();
    var self = this;
    this.hoverBox.connect(this.hoverBox, 'onClose',
        function() { self._persistant=false; self.deactivate(); });
    this.hoverBox.connect(this.hoverBox, 'triggerNeedMap',
        function() { self.destroyMagnifier(); });
    this.hoverBox.connect(this.hoverBox, 'triggerNoNeedMap',
        function() { if (self._activated) { self.createMagnifier(); }});
    //console.log('hoverBox', this, this.hoverBox);
  },

  // setHoverBoxStyle: function() {
  //   var margin = 10;
  //   var maxWidth = 400;
  //   var b = dojo.marginBox(this.domNode);
  //   var map = this.feature.layer.map;
  //   var geometry = this.feature.geometry;
  //   var px1 = map.getViewPortPxFromLonLat({ lon: geometry.x, lat: geometry.y });
  //   var px2 = map.getViewPortPxFromLayerPx(new OpenLayers.Pixel(b.l, b.t));
  //   var lw = Math.min(px1.x, px2.x) - 2 * margin;
  //   var rw = map.size.w - Math.max(px1.x, px2.x + b.w) - 2 * margin;
  //   var node = this.hoverBox.domNode;
  //   dojo.addClass(node, lw > rw ? 'left' : 'right');
  //   dojo.style(node, 'width', Math.min(maxWidth, lw > rw ? lw : rw)+'px');
  // },

  destroyHoverBox: function() {
    if (this.hoverBox) {
      this.hoverBox.destroyRecursive();
      delete this.hoverBox;
    }
  }

});
