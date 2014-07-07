
dojo.provide('geonef.jig.list.record.File');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.InstanciateAnchored');

dojo.declare('geonef.jig.list.record.File', geonef.jig.list.record.Abstract,
{
  templateString: dojo.cache("geonef.jig.list.record", "templates/File.html"),

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    name: { node: 'nameNode', type: 'innerHTML' },
    contentType: { node: 'typeNode', type: 'innerHTML' },
    size: { node: 'sizeNode', type: 'innerHTML' },
    module: { node: 'moduleNode', type: 'innerHTML' }
  }),

  uuid: '!',
  name: '!',
  module: '!',
  contentType: '!',
  size: -1

});
