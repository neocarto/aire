
dojo.provide('geonef.ploomap.list.edition.map.RatioDisc');

// parents
dojo.require('geonef.ploomap.list.edition.map.Ratio');

// used in code
dojo.require('geonef.ploomap.input.document.OgrLayer');

dojo.declare('geonef.ploomap.list.edition.map.RatioDisc',
             [ geonef.ploomap.list.edition.map.Ratio ],
{
  // summary:
  //
  //

  module: 'RatioDisc',

  getPropertiesOrder: function() {
    var props = [
                 'discOgrLayer',
                 'discThreshold',
                 'discMinWidth',
                 'discMaxWidth',
                 'discNullWidth',
                 'discColor',
                 'discNullColor'
                ];
    return props.concat(this.inherited(arguments));
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        discOgrLayer: {
          'class': 'geonef.ploomap.input.document.OgrLayer',
          options: { layerType: 'geometry' }
        },
        discColor: { 'class': 'geonef.jig.input.Color' },
        discNullColor: { 'class': 'geonef.jig.input.Color' }
      }, this.propertyTypes);
  }

});
