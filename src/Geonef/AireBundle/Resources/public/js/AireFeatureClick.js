OpenLayers.Control.AireFeatureClick = OpenLayers.Class(OpenLayers.Control,
{
  defaultHandlerOptions: {
    'single': true,
    'double': false,
    'pixelTolerance': 0,
    'stopSingle': false,
    'stopDouble': false
  },

  initialize: function(options) {
    this.handlerOptions = OpenLayers.Util.extend(
      {}, this.defaultHandlerOptions
    );
    OpenLayers.Control.prototype.initialize.apply(
      this, arguments
    );
    this.handler = new OpenLayers.Handler.Click(
      this, {
        'click': this.trigger
      }, this.handlerOptions
    );
  },

  trigger: function(e) {
    var lonlat = map.getLonLatFromViewPortPx(e.xy);
//    var mapName = map.baseLayer.pmName;
    var mapName = map.baseLayer.pmId;
    var url = '/aire/infoClick?map='+mapName+'&x='+lonlat.lon+'&y='+lonlat.lat;
    Ploomap.ajaxUpdate('info', url, {evalScripts: true});
  },

  activate: function() {
    if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
      return true;
    } else return false;
  },

  deactivate: function() {
    if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
      if (vectorLayer)
	map.removeLayer(vectorLayer);
      vectorLayer = null;
      return true;
    } else return false;
  },

  CLASS_NAME: "OpenLayers.Control.AireFeatureClick"

});
