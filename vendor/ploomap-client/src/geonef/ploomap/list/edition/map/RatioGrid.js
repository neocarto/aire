
dojo.provide('geonef.ploomap.list.edition.map.RatioGrid');

// parents
dojo.require('geonef.ploomap.list.edition.map.Ratio');

// used in code
dojo.require('geonef.ploomap.input.document.OgrLayer');

dojo.declare('geonef.ploomap.list.edition.map.RatioGrid',
             [ geonef.ploomap.list.edition.map.Ratio ],
{
  // summary:
  //
  //

  module: 'RatioGrid',

  getPropertiesOrder: function() {
    var props = [
                 'gridOgrLayer',
                 'gridJoinField',
                 'matchTable'
                ];
    return props.concat(this.inherited(arguments));
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        gridOgrLayer: {
          'class': 'geonef.ploomap.input.document.OgrLayer',
          options: { layerType: 'geometry' }
        },
        gridJoinField: {
          'class': 'geonef.ploomap.input.OgrLayerField',
          options: { mapInput: 'auto',
                     ogrLayerInputName: 'gridOgrLayer' }
        },
        matchTable: {
          'class': 'geonef.ploomap.input.document.OgrLayer',
          options: { layerType: 'attribute' }
        },
      }, this.propertyTypes);
  }

});
