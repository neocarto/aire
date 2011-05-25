dojo.provide('aire.button.ShowMap');

// parents
dojo.require('geonef.jig.button.Action');

dojo.declare('aire.button.ShowMap', [ geonef.jig.button.Action ],
{
  mapWidget: '',

  level: '',

  /**
   * Map ID
   */
  map: '',

  postMixInProperties: function() {
    //console.log('postMixInProperties', this, arguments);
    this.inherited(arguments);
    if (dojo.isString(this.mapWidget) && this.mapWidget) {
      this.mapWidget = dijit.byId(this.mapWidget);
    }
  },

  postCreate: function() {
    this.inherited(arguments);
    this._checked = false;
    this.subscribe('ploomap/map/changebaselayer', this.onBaseLayerChanged);
  },

  /**
   * Catch baseLayer change
   *
   * If the map for this button becomes the current base layer,
   * the button gets the focus and the accordeon container make
   * it visible.
   */
  onBaseLayerChanged: function(mapWidget) {
    var enabled = mapWidget.map.baseLayer.name === this.map;
    if (enabled !== this._checked) {
      (enabled ? dojo.addClass : dojo.removeClass)(this.domNode, 'mapEnabled');
      if (enabled) {
        var pane = dijit.getEnclosingWidget(this.domNode.parentNode);
        var accordeon = dijit.getEnclosingWidget(
          dijit.getEnclosingWidget(pane.domNode.parentNode).domNode.parentNode);
        if (accordeon.attr('selectedChildWidget') !== pane) {
          accordeon.selectChild(pane);
        }
      }
    }
    this._checked = enabled;
  },

  _setLevelAttr: function(level) {
    this.level = level;
    this.attr('label', level);
  },

  onClick: function() {
    //console.log('this.mapId', this, this.map);
    //this.mapWidget.showMap(this.map);
    this.mapWidget.layersDefs.addLayerToMap(this.map);
  }

});
