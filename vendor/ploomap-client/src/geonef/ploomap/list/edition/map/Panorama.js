
dojo.provide('geonef.ploomap.list.edition.map.Panorama');

dojo.require('geonef.ploomap.list.edition.map.Standalone');

dojo.declare('geonef.ploomap.list.edition.map.Panorama',
             geonef.ploomap.list.edition.map.Standalone,
{
  module: 'Panorama',

  getPropertiesOrder: function() {
    var props = ['gdalDataSource'];
    return this.inherited(arguments).concat(props);
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        gdalDataSource: {
          'class': 'geonef.jig.input.AbstractListRow',
          options: {
            listClass: 'geonef.ploomap.data.list.GdalDataSource',
            nullLabel: 'Source raster...',
            editionWidget: 'geonef.ploomap.data.edition.gdalDataSource.${module}',
            listVisibleColumns: ['selection', 'name', 'module']
          }
        }
      }, this.propertyTypes);
  }

});
