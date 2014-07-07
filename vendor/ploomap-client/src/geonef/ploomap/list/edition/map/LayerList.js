
dojo.provide('geonef.ploomap.list.edition.map.LayerList');

dojo.require('geonef.ploomap.list.edition.map.Standalone');

dojo.declare('geonef.ploomap.list.edition.map.LayerList',
             geonef.ploomap.list.edition.map.Standalone,
{
  module: 'LayerList',

  getPropertiesOrder: function() {
    var props = ['layers'];
    return this.inherited(arguments).concat(props);
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        layers: {
          'class': 'geonef.jig.input.MixedList',
          options: {
            listType: 'table',
            reverseOrder: true,
            childClassPrefix: 'geonef.ploomap.list.edition.map.layer.',
            availableModules: [
              'OgrVector',
              'Mark'
              //'MapFileDef',
              //'StaticLayer',
            ]
          },
          noApplyActions: true
        }
      }, this.propertyTypes);
  }

});
