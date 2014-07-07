
dojo.provide('geonef.ploomap.list.record.OgrDataSource');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.button.TooltipWidget');

// used in code
dojo.require('geonef.ploomap.list.OgrLayer');
dojo.require('geonef.ploomap.list.edition.ogrDataSource.Generic');

dojo.declare('geonef.ploomap.list.record.OgrDataSource', geonef.jig.list.record.Abstract,
{
  uuid: '!',
  name: '!',
  module: '!',
  layerCount: '!',

  forwardKeys: ['uuid', 'name', 'module', 'layerCount'],

  templateString: dojo.cache("geonef.ploomap.list.record", "templates/OgrDataSource.html"),

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    name: { node: 'nameNode', type: 'innerHTML' },
    module: { node: 'moduleNode', type: 'innerHTML' },
    layerCount: { node: 'layerCountNode', type: 'innerHTML' }
  }),

  postCreate: function() {
    this.inherited(arguments);
    this.showLayersButton.childWidgetParams = dojo.mixin(
      { filter: { dataSource: { op: 'ref', value: this.uuid }}},
      this.listWidget.layersListParams);
  },


  getNoReadOnlyWidgets: function() {
    return [
      this.editButton
    ];
  },

  editAction: function() {
    var getClass =
      geonef.ploomap.list.edition.ogrDataSource.Generic.prototype.getClassForModule;
    var Class = getClass(this.module);
    console.log('got class', Class);
    var widget = new Class({ uuid: this.uuid });
    console.log('instanciated', this, arguments);
    geonef.jig.workspace.autoAnchorWidget(widget);
    console.log('anchored', this, arguments);
  },

  _setLayerCountAttr: function(count) {
    this.layerCount = count;
    this.layerCountNode.innerHTML = count;
    this.showLayersButton.attr('label', count);
    dojo.style(this.layerCountNode, 'display', !count ? '' : 'none');
    dojo.style(this.showLayersButton.domNode, 'display', !!count ? '' : 'none');
  }

});
