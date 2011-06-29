
/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/BaseTypes.js
 * @requires OpenLayers/Events.js
 * @requires Ploomap.js
 */

OpenLayers.Control.pmLegend = OpenLayers.Class(OpenLayers.Control,
{
  name: 'pmLegend',

  type: OpenLayers.Control.TYPE_TOGGLE,

  currentResolution: null,

  currentBaseLayer: null,

//  legendDiv: null,

  initialize: function(options) {
    OpenLayers.Control.prototype.initialize.apply(this, [options]);
  },

  draw: function(px) {
    OpenLayers.Control.prototype.draw.apply(this, arguments);
    this.div.style.top = 0;
    this.div.style.right = 0;
    this.currentResolution = this.map.getResolution();
    this.map.events.on({
      'changelayer': this.update,
      'changebaselayer': this.update,
      'moveend': this.update,
      scope: this
    });
    this.activate();
    this.update();
    return this.div;
  },

  redraw: function() {
    if (!this.div)
      return;
  },

  update: function() {
    if (this.active) {
      var update = false;
      var res = this.map.getResolution();
      if (!res)
	return;
      if (this.currentResolution != res) {
	this.currentResolution = res;
	update = true;
      }
      if (this.currentBaseLayer != this.map.baseLayer) {
	this.currentBaseLayer = this.map.baseLayer;
	update = true;
      }
      if (update) {
	var legendDiv = this.legendDiv;
	var div = this.div;
	var id = this.map.baseLayer.pmId ? this.map.baseLayer.pmId :
	  this.map.baseLayer.pmName;
	var url = '/pmServiceMap/legend?map='+id
	  +'&resolution='+this.map.getResolution();
	Ploomap.ajaxUpdate(this.div.id, url,
	  {asynchronous: true, evalScripts: true,
	   onSuccess: function() {
	     if (legendDiv)
	       legendDiv.style.display = 'block';
	   },
	   onFailure: function() {
	     if (legendDiv)
	       legendDiv.style.display = 'none';
	   },
	   onComplete: function() {
	     if (div.innerHTML == '')
	       legendDiv.style.display = 'none';
	   }
	  }
	);
      }
    }
  },

  activate: function() {
    if (this.active)
      return false;
    OpenLayers.Control.prototype.activate.apply(this, arguments);
    this.div.style.display = 'block';
    this.update();
    return true;
  },

  deactivate: function() {
    if (!this.active)
      return false;
    OpenLayers.Control.prototype.deactivate.apply(this, arguments);
    this.div.style.display = 'none';
    return true;
  },

  CLASS_NAME: 'OpenLayers.Control.pmLegend'
});
