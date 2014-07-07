
dojo.provide('geonef.ploomap.list.edition.map.layer.StaticLayer');

// parents
dojo.require('geonef.ploomap.list.edition.map.layer.Abstract');

// used in template
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.Select');
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.ploomap.list.edition.map.layer.StaticLayer',
             geonef.ploomap.list.edition.map.layer.Abstract,
{
  // summary:
  //   Layer whose configuration is close to MapServer's
  //

  module: 'StaticLayer',

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        connectionType: { 'class': 'dijit.form.TextBox' },
        connection: { 'class': 'dijit.form.TextBox' },
        data: { 'class': 'dijit.form.TextBox' },
        geometryType: { 'class': 'geonef.ploomap.input.MsGeometryType' },
        spatialRef: { 'class': 'dijit.form.TextBox' }
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    return ['connectionType', 'connection', 'data',
            'geometryType', 'spatialRef'];
  }

});
