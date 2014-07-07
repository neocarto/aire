
dojo.provide('geonef.ploomap.data.list.row.GdalDataset');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.button.TooltipWidget');

dojo.declare('geonef.ploomap.data.list.row.GdalDataset', geonef.jig.list.record.Abstract,
{
  uuid: '!',
  name: '!',
  module: '!',
  width: '!',
  height: '!',

  forwardKeys: ['uuid', 'name', 'module', 'width', 'height'],

  templateString: dojo.cache("geonef.ploomap.data.list.row", "templates/GdalDataset.html"),

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    name: { node: 'nameNode', type: 'innerHTML' },
    module: { node: 'moduleNode', type: 'innerHTML' },
    width: { node: 'widthNode', type: 'innerHTML' },
    height: { node: 'heightNode', type: 'innerHTML' }
  }),

  getNoReadOnlyWidgets: function() {
    return [
      this.editButton
    ];
  }

});
