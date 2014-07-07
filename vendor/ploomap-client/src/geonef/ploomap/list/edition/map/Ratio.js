
dojo.provide('geonef.ploomap.list.edition.map.Ratio');

// parents
dojo.require('geonef.ploomap.list.edition.map.Statistics');

// used in code
dojo.require('geonef.ploomap.input.document.OgrLayer');
dojo.require('geonef.jig.input.AbstractListRow');

dojo.declare('geonef.ploomap.list.edition.map.Ratio',
             [ geonef.ploomap.list.edition.map.Statistics ],
{
  // summary:
  //
  //

  module: 'Ratio',

  getPropertiesOrder: function() {
    var props = ['ratioLegendTitle',
                 'ratioUnit',
                 'polygonOgrLayer',
                 'infoTable',
                 'joinField',
                 'numeratorTable',
                 'numeratorColumn',
                 'numeratorMultiplier',
                 'denominatorTable',
                 'denominatorColumn',
                 'denominatorMultiplier',
                 'classBounds',
                 'colorFamily',
                 'polygonNullFillColor',
                 'polygonOutlineColor',
                 'polygonOutlineWidth'
                ];
    return this.inherited(arguments).concat(props);
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        polygonOgrLayer: {
          'class': 'geonef.ploomap.input.document.OgrLayer',
          options: { layerType: 'geometry' }
        },
        infoTable: {
          'class': 'geonef.ploomap.input.document.OgrLayer',
          options: { layerType: 'attribute' }
        },
        joinField: {
          'class': 'geonef.ploomap.input.OgrLayerField',
          options: { mapInput: 'auto',
                     ogrLayerInputName: 'polygonOgrLayer' }
        },
        numeratorTable: {
          'class': 'geonef.ploomap.input.document.OgrLayer',
          options: { layerType: 'attribute' }
        },
        numeratorColumn: {
          'class': 'geonef.ploomap.input.OgrLayerField',
          options: { mapInput: 'auto',
                     ogrLayerInputName: 'numeratorTable' }
        },
        denominatorTable: {
          'class': 'geonef.ploomap.input.document.OgrLayer',
          options: { layerType: 'attribute' }
        },
        denominatorColumn: {
          'class': 'geonef.ploomap.input.OgrLayerField',
          options: { mapInput: 'auto',
                     ogrLayerInputName: 'denominatorTable' }
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
        polygonNullFillColor: { 'class': 'geonef.jig.input.Color' },
        polygonOutlineColor: { 'class': 'geonef.jig.input.Color' }
      }, this.propertyTypes);
  }

});
