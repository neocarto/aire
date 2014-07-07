
dojo.provide('geonef.ploomap.list.edition.map.layer.Abstract');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');
dojo.require('geonef.jig.list.edition._AutoPropertiesEmbed');
dojo.require('geonef.jig.widget._AsyncInit');

dojo.declare('geonef.ploomap.list.edition.map.layer.Abstract',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container,
               geonef.jig.list.edition._AutoPropertiesEmbed,
               geonef.jig.widget._AsyncInit ],
{
  // summary:
  //   Layer whose configuration is close to MapServer's
  //

  module: '__Abstract__',

  apiModule: 'listQuery.mapLayer',

  widgetsInTemplate: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.asyncInit.deferCall(this, ['_setValueAttr']);
    this.propertyTypes = dojo.mixin(
      {
        name: { 'class': 'dijit.form.TextBox' }
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    return ['name'];
  },

  getInputRootNodes: function() {
    return [ this.domNode, this.formDialog.domNode ];
  },

  onChange: function() {
    this.summaryNode.innerHTML = this.attr('summary');
  },

  _getSummaryAttr: function() {
    var value = this.attr('value');
    var txt = value.name ? value.name : 'Couche à configurer';
    return txt;
  }

});
