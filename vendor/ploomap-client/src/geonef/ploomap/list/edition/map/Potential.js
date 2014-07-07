
dojo.provide('geonef.ploomap.list.edition.map.Potential');

// parents
dojo.require('geonef.ploomap.list.edition.map.Statistics');

// used in code
dojo.require('geonef.jig.input.AbstractListRow');

dojo.declare('geonef.ploomap.list.edition.map.Potential',
             [ geonef.ploomap.list.edition.map.Statistics ],
{
  // summary:
  //
  //

  module: 'Potential',

  getPropertiesOrder: function() {
    var props = ['potentialLegendTitle',
                 'potentialUnit',
                 'gdalDataset',
                 'stockMultiplier',
                 'classBounds',
                 'colorFamily',
                 'nullColor'
                ];
    return this.inherited(arguments).concat(props);
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        gdalDataset: {
          'class': 'geonef.jig.input.AbstractListRow',
          options: {
            listClass: 'geonef.ploomap.data.list.GdalDataset',
            nullLabel: 'Source raster...',
            requestModule: 'listQuery.gdalDataset',
            listVisibleColumns: ['selection', 'name', 'module', 'width',
                                 'height'],
            labelField: 'name'
          }
        },
        classBounds: { 'class': 'geonef.jig.input.ListString',
                       options: { itemType: 'float' } },
        colorFamily: {
          'class': 'geonef.jig.input.AbstractListRow',
          options: {
            listClass: 'geonef.ploomap.list.ColorFamily',
            nullLabel: 'Famille de couleur...',
            requestModule: 'listQuery.colorFamily',
            listVisibleColumns: ['selection', 'name', 'colors'],
            labelField: 'title'
          }
        },
        nullColor: { 'class': 'geonef.jig.input.Color' }
      }, this.propertyTypes);
  }

});
