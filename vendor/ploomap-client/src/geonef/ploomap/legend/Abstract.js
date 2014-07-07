
dojo.provide('geonef.ploomap.legend.Abstract');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');
dojo.require('geonef.jig.widget.I18nMixin');

// used in code
dojo.require('geonef.jig.util.number');
dojo.require('dojo.number');

// used in template
dojo.require('geonef.jig.input.Label');

dojo.requireLocalization('geonef.ploomap', 'legend');

dojo.declare('geonef.ploomap.legend.Abstract',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container,
               geonef.jig.widget.I18nMixin],
{
  // summary:
  //   Base class for legend widgets
  //

  resolution: null,

  manageValueKeys: ['hasNull', 'unit', 'title', 'polygonNullFillColor'],
  templateString: dojo.cache('geonef.ploomap.legend', 'templates/Abstract.html'),
  widgetsInTemplate: true,
  i18nModule: 'geonef.ploomap',
  i18nDomain: 'legend',

  buildRendering: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'ploomapLegend');
  },

  formatNumber: function(num) {
    return dojo.number.format(dojo.number.round(num, 2));
    //return geonef.jig.util.number.formatDims([num], { units: [''] });
  },

  _setTitleAttr: function(title) {
    this.title = title;
    if (this.titleLabel) {
      this.titleLabel.attr('value', title);
    }
  },

  _setHasNullAttr: function(hasNull) {
    // console.log('Abstract _setHasNullAttr', this, arguments,
    //            dojo.query('> .hasNull', this.domNode));
    dojo.query('> .hasNull', this.domNode)
        .style('display', hasNull ? '' : 'none');
  },

  _setPolygonNullFillColorAttr: function(color) {
    dojo.query('> .hasNull > .nodata', this.domNode)
        .style('background', color);
  },

  _setUnitAttr: function(unit) {
    this.unit = unit;
    var label = unit || '';
    var labelP = unit ? ('('+unit+')') : '';
    if (this.unitNode && this.unitNode2) {
      this.unitNode.innerHTML = labelP;
      this.unitNode2.innerHTML = label;
    }
  },

  getFeatureInfoHtml: function(feature) {
    var text = "";
    text += "<i><b>"+this.title+" :</b></i><br/>";
    return text;
  }

});
