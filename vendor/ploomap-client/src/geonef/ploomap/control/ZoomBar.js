dojo.provide('geonef.ploomap.control.ZoomBar');

dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('dijit.form.VerticalSlider');
dojo.require('dijit.form.VerticalRule');
dojo.require('dijit.form.VerticalRuleLabels');
dojo.require('geonef.ploomap.MapBinding');

dojo.declare('geonef.ploomap.control.ZoomBar',
	     [ geonef.jig.layout._Anchor, dijit._Templated, geonef.ploomap.MapBinding ],
{

  templateString: dojo.cache("geonef.ploomap.control", "templates/ZoomBar.html"),

  widgetsInTemplate: true,

  onMapBound: function() {
    //this.inherited(arguments);
    console.log('onmapBound', this, arguments);
    this.updateNumZooms(this.mapWidget.map.numZoomLevels);
    this.connect(this.mapWidget, 'onZoomChange', 'updateSlider');
    this.updateSlider(this.mapWidget.map.getZoom());
  },

  updateNumZooms: function(count) {
    console.log('updateNumZooms', this, count);
    var dCount = Math.min(count, 10);
    this.slider.attr('maximum', count);
    this.slider.attr('discreteValues', count);
    this.sliderRule.attr('count', dCount);
    this.sliderRule.postCreate();
    if (!this.sliderRuleLabels.srcNodeRef) {
      this.sliderRuleLabels.srcNodeRef = dojo.create('div');
    }
    this.sliderRuleLabels.attr('count', dCount);
    this.sliderRuleLabels.attr('maximum', count);
    this.sliderRuleLabels.labels = [];
    this.sliderRuleLabels.labels = this.sliderRuleLabels.getLabels();
    this.sliderRuleLabels.postCreate();
  },

  onSliderChange: function(newValue) {
    console.log('onSliderChange', this, arguments);
    if (this._mapBound) {
      this.mapWidget.map.zoomTo(newValue);
    }
  },

  updateSlider: function(newValue) {
    //console.log('updateSlider', arguments);
    this.slider.attr('value', newValue);
  }

});
