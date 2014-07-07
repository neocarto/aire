
dojo.provide('geonef.ploomap.list.edition.map.Stock');

// parents
dojo.require('geonef.ploomap.list.edition.map.Statistics');

dojo.declare('geonef.ploomap.list.edition.map.Stock',
             [ geonef.ploomap.list.edition.map.Statistics ],
{
  // summary:
  //
  //

  module: 'Stock',

  getPropertiesOrder: function() {
    var props = ['stockLegendTitle',
                 'stockUnit',
                 'polygonOgrLayer',
                 'symbolOgrLayer',
                 'infoTable',
                 'joinField',
                 'indicatorTable',
                 'stockColumn',
                 'stockMultiplier',
                 'symbol', // todo
                 'sizeMultiplier',
                 'symbolFillColor',
                 'symbolOutlineColor',
                 'symbolOutlineWidth',
                 'polygonFillColor',
                 'polygonNullFillColor',
                 'polygonOutlineColor',
                 'polygonOutlineWidth',
                 'legendBounds'
                ];
    return this.inherited(arguments).concat(props);
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        symbolFillColor: { 'class': 'geonef.jig.input.Color' },
        symbolOutlineColor: { 'class': 'geonef.jig.input.Color' },
        polygonFillColor: { 'class': 'geonef.jig.input.Color' },
        polygonNullFillColor: { 'class': 'geonef.jig.input.Color' },
        polygonOutlineColor: { 'class': 'geonef.jig.input.Color' },
        polygonOgrLayer: {
          'class': 'geonef.ploomap.input.document.OgrLayer',
          options: { layerType: 'geometry' }
        },
        symbolOgrLayer: {
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
                     ogrLayerInputName: 'symbolOgrLayer' }
        },
        indicatorTable: {
          'class': 'geonef.ploomap.input.document.OgrLayer',
          options: { layerType: 'attribute' }
        },
        stockColumn: {
          'class': 'geonef.ploomap.input.OgrLayerField',
          options: { mapInput: 'auto',
                     ogrLayerInputName: 'indicatorTable' }
        },
        legendBounds: { 'class': 'geonef.jig.input.ListString' }
      }, this.propertyTypes);
  }

});
