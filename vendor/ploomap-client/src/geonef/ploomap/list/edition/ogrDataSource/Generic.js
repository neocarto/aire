
dojo.provide('geonef.ploomap.list.edition.ogrDataSource.Generic');

// parents
dojo.require('geonef.ploomap.list.edition.OgrDataSource');

dojo.declare('geonef.ploomap.list.edition.ogrDataSource.Generic',
             geonef.ploomap.list.edition.OgrDataSource,
{
  module: 'Generic',

  propertyTypes: {
    type: {
      'class': 'dijit.form.Select',
      options: {
        options: [
          { value: 'auto', label: "Auto" },
          { value: 'shapedir', label: "Répertoire de shapefiles" },
        ]
      }
    },
  },

  getPropertiesOrder: function() {
    var props = ['path', 'type'];
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
