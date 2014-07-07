
dojo.provide('geonef.ploomap.list.edition.map.ModelBased');

dojo.require('geonef.ploomap.list.edition.Map');

dojo.declare('geonef.ploomap.list.edition.map.ModelBased', geonef.ploomap.list.edition.Map,
{
  // summary:
  //
  //

  module: 'ModelBased',

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        modelMap: {
          'class': 'geonef.jig.input.AbstractListRow',
          options: {
            listClass: 'geonef.ploomap.list.Map',
            nullLabel: 'Carte...',
            editionWidget: 'geonef.ploomap.list.edition.map.${module}',
            listVisibleColumns: ['selection', 'name', 'mapCollection',
                                 'module'],
            labelField: 'title'
          }
        }
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    var props = ['modelMap'];
    return this.inherited(arguments).concat(props);
  }

});
