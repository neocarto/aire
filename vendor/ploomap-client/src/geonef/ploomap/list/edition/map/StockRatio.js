
dojo.provide('geonef.ploomap.list.edition.map.StockRatio');

// parents
dojo.require('geonef.ploomap.list.edition.map.Stock');

// used in code
dojo.require('geonef.ploomap.input.document.OgrLayer');
dojo.require('geonef.jig.input.AbstractListRow');

dojo.declare('geonef.ploomap.list.edition.map.StockRatio',
             [ geonef.ploomap.list.edition.map.Stock ],
{
  // summary:
  //
  //

  module: 'StockRatio',

  getPropertiesOrder: function() {
    var props = ['ratioLegendTitle',
                 'ratioUnit',
                 'numeratorTable',
                 'numeratorColumn',
                 'numeratorMultiplier',
                 'denominatorTable',
                 'denominatorColumn',
                 'denominatorMultiplier',
                 'classBounds',
                 'colorFamily'
                ];
    return this.inherited(arguments).concat(props);
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
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
        }
      }, this.propertyTypes);
  }

});
