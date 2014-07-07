
dojo.provide('geonef.ploomap.list.record.OgrFeature');

dojo.require('geonef.jig.list.record.Abstract');
dojo.require('geonef.jig.list.record.generic.EditAction');
dojo.require('geonef.ploomap.list.SourceLayer');

dojo.declare('geonef.ploomap.list.record.OgrFeature', geonef.jig.list.record.Abstract,
{
  templateString: dojo.cache("geonef.ploomap.list.record", "templates/OgrFeature.html"),

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    name: { node: 'nameNode', type: 'innerHTML' },
    fidColumn: { node: 'hostNode', type: 'innerHTML' },
    geomColumn: { node: 'userNode', type: 'innerHTML' },
    objCount: { node: 'userNode', type: 'innerHTML' },
    extent: { node: 'userNode', type: 'innerHTML' },
    projection: { node: 'userNode', type: 'innerHTML' }
  }),

  name: '!',
  fidColumn: '!',
  geomColumn: '!',
  objCount: '!',
  extent: '!',
  projection: '!',

  featuresAction: function() {
    console.log('not implemented (featuresAction)', this, arguments);
  }


});
