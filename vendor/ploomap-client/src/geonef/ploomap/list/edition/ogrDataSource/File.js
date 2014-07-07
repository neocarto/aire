
dojo.provide('geonef.ploomap.list.edition.ogrDataSource.File');

// parents
dojo.require('geonef.ploomap.list.edition.OgrDataSource');

dojo.declare('geonef.ploomap.list.edition.ogrDataSource.File',
             geonef.ploomap.list.edition.OgrDataSource,
{
  module: 'File',

  getPropertiesOrder: function() {
    var props = ['name', 'file'];
    return props.concat(this.inherited(arguments));
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        file: { 'class': 'geonef.jig.input.file.Directory' }
      }, this.propertyTypes);
  }

});
