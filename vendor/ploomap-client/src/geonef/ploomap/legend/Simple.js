
dojo.provide('geonef.ploomap.legend.Simple');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');

// used in code
dojo.require('geonef.jig.util.number');

dojo.declare('geonef.ploomap.legend.Simple',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container ],
{
  // summary:
  //   Base class for legend widgets
  //

  resolution: null,

  manageValueKeys: ['content'],
  templateString: dojo.cache('geonef.ploomap.legend', 'templates/Simple.html'),
  widgetsInTemplate: true,

  buildRendering: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'ploomapLegend');
  },

  _setContentAttr: function(text) {
    this.containerNode.innerHTML = text;
  }

});
