dojo.provide('geonef.ploomap.legend.RatioDisc');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget.I18nMixin');

// used in template
dojo.require('geonef.ploomap.legend.Intervals');

dojo.requireLocalization('geonef.ploomap', 'legend');

dojo.declare('geonef.ploomap.legend.RatioDisc',
             [ dijit._Widget, dijit._Templated,
               geonef.jig.widget.I18nMixin ],
{

  templateString: dojo.cache('geonef.ploomap.legend', 'templates/RatioDisc.html'),
  widgetsInTemplate: true,
  i18nModule: 'geonef.ploomap',
  i18nDomain: 'legend',

  _setValueAttr: function(value) {
    this.intervalsLegend.attr('value', value);
    if (value) {
      ['disc', 'hasNull'].forEach(
        function(prop) {
          if (value[prop]) {
            this.attr(prop, value[prop]);
          }
        }, this);
    }
  },

  _setDiscAttr: function(disc) {
    //console.log('_setDiscAttr', this, arguments);
    this.disc = disc;
    while (this.discRow.lastChild) {
      this.discRow.removeChild(this.discRow.lastChild);
    }
    var et = parseInt(Math.round(disc.maxWidth - disc.minWidth));
    var list = [disc.minWidth,
                parseInt(Math.round(disc.minWidth + et / 4)),
                parseInt(Math.round(disc.minWidth + et / 2)),
                disc.maxWidth];
    list.forEach(
        function(width, key) {
          var style = 'border-bottom: '+width+'px solid '+disc.color+';';
          var label = key === 0 ? this.trans('disc.weak') :
                      (key === list.length - 1 ? this.trans('disc.strong') : '&nbsp;');
          dojo.create('td', { style: style, innerHTML: label }, this.discRow);
        }, this);
    dojo.query('> .ploomapLegend > .nullDisc', this.domNode)
        .style('display', disc.hasNull ? '' : 'none');
    dojo.query('> .ploomapLegend > .nullDisc > .line', this.domNode)
        .style({ borderBottom: disc.nullWidth+'px solid '+disc.nullColor });
        // .style({ borderBottomWidth: disc.nullWidth+'px',
        //          borderBottomStyle: 'solid',
        //          borderBottomColor: disc.nullColor });
  },

  _setHasNullAttr: function(hasNull) {
    this.hasNull = hasNull;
    dojo[hasNull ? 'addClass' : 'removeClass'](this.domNode, 'hasNull');
  },

  getFeatureInfoHtml: function(feature) {
    //console.log('ratioDisc getFeatureInfoHtml', this, arguments);
    var text = "";
    if (feature.attributes.ratio) {
      text += this.intervalsLegend.getFeatureInfoHtml(feature);
    } else if (feature.attributes.data) {
      text += "<i><b>"+this.trans('disc.title')+" :</b></i><br/>";
      text += feature.attributes.data+" ("+
        this.trans('disc.popupExpl', this.disc)+")\n";
    }
    return text;
  }

});
