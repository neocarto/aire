
dojo.provide('geonef.ploomap.data.edition.gdalDataset.Generic');

// parents
dojo.require('geonef.ploomap.data.edition.GdalDataset');

dojo.declare('geonef.ploomap.data.edition.gdalDataset.Generic',
             geonef.ploomap.data.edition.GdalDataset,
{
  module: 'Generic',

  getPropertiesOrder: function() {
    var props = ['path', 'average'];
    return this.inherited(arguments).concat(props);
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        path: { 'class': 'dijit.form.TextBox' }
      }, this.propertyTypes);
  }

});
