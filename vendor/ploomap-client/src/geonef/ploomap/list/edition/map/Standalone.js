
dojo.provide('geonef.ploomap.list.edition.map.Standalone');

// parents
dojo.require('geonef.ploomap.list.edition.Map');

dojo.declare('geonef.ploomap.list.edition.map.Standalone', geonef.ploomap.list.edition.Map,
{
  // summary:
  //
  //

  module: 'Standalone',

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        spatialRef: { 'class': 'dijit.form.TextBox' },
        backgroundColor: { 'class': 'geonef.jig.input.Color' },
        legendContent: { 'class': 'dijit.form.SimpleTextarea' },
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    var props = ['spatialRef', 'backgroundColor','legendContent'];
    return this.inherited(arguments).concat(props);
  }

});
