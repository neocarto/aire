
dojo.provide('geonef.ploomap.layer.featureDetails.ChildMixin');

dojo.declare('geonef.ploomap.layer.featureDetails.ChildMixin', null,
{
  /**
   * Related feature
   *
   * @type {Geonef.Ploomap.Feature.Vector}
   */
  feature: null,

  /**
   * Container (usually StackContainer)
   *
   * @type {dijit._Container}
   */
  container: null,

  destroy: function() {
    this.inherited(arguments);
    this.feature = null;
    this.container = null;
  },

  getAttrSchema: function() {
    return this.container.getAttrSchema();
  },

  openWidget: function(widget) {
    return this.container.openWidget(widget);
  },

  close: function() {
    this.container.destroy();
  }

});
