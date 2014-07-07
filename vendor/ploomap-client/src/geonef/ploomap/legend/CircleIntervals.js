dojo.provide('geonef.ploomap.legend.CircleIntervals');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.ploomap.legend.Circle');
dojo.require('geonef.ploomap.legend.Intervals');

dojo.declare('geonef.ploomap.legend.CircleIntervals', [ dijit._Widget, dijit._Templated ],
{

  resolution: null,

  templateString: dojo.cache('geonef.ploomap.legend', 'templates/CircleIntervals.html'),
  widgetsInTemplate: true,

  _setValueAttr: function(value) {
    //console.log('_setValueAttr', this, arguments);
    this.circleLegend.attr('value', value);
    this.intervalsLegend.attr('value', value);
  },

  _setResolutionAttr: function(resolution) {
    if (resolution === this.resolution) { return; }
    this.resolution = resolution;
    this.circleLegend.attr('resolution', resolution);
  },

  getFeatureInfoHtml: function(feature) {
    var text = "";
    text += this.circleLegend.getFeatureInfoHtml(feature);
    text += this.intervalsLegend.getFeatureInfoHtml(feature);
    return text;
  }

});
