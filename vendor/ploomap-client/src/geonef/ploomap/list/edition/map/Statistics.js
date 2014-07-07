
dojo.provide('geonef.ploomap.list.edition.map.Statistics');

// parents
dojo.require('geonef.ploomap.list.edition.map.ModelBased');

dojo.declare('geonef.ploomap.list.edition.map.Statistics',
             [ geonef.ploomap.list.edition.map.ModelBased ],
{
  // summary:
  //
  //

  module: 'Statistics',

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    var props = ['unitLabel', 'source', 'copyright'];
    return this.inherited(arguments).concat(props);
  },

  buildButtons: function() {
    this.inherited(arguments);
    this.dataViewButton = this.buildDDButton(
      'general', 'geonef.ploomap.list.tool.map.DataView', 'Données');
  },

  // buildCustomActions: function() {
  //   this.dataViewButton = new geonef.jig.button.TooltipWidget({
  //       childWidgetClass: 'geonef.ploomap.list.tool.map.DataView',
  //       childWidgetParams: { uuid: null },
  //       label: 'Données'
  //   });
  //   this.dataViewButton.placeAt(this.actionColumn);
  //   this.inherited(arguments);
  //   this.dataViewButton.startup();
  // },

  getButtons: function() {
    return [this.dataViewButton].concat(this.inherited(arguments));
  }

});
