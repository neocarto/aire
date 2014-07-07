

dojo.provide('geonef.ploomap.data.edition.GdalDataset');

// parent
dojo.require('geonef.jig.list.edition.AutoProperties');

/**
 * @class Base class for raster GDAL datasets
 *
 * @abstract
 */
dojo.declare('geonef.ploomap.data.edition.GdalDataset', geonef.jig.list.edition.AutoProperties,
{

  saveNoticeChannel: 'ploomap/gdalDataset/save',

  apiModule: 'listQuery.gdalDataset',

  checkProperties: false, //true,

  propertyTypes: {
  },

  getPropertiesOrder: function() {
    return ['name'];
  },

  _getTitleAttr: function() {
    var value = this.origValue; // this.attr('value');
    return value && value.name ?
      'Raster : ' + value.name : 'Raster sans nom';
  }

});
