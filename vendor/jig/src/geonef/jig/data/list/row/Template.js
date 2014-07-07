
dojo.provide('geonef.jig.data.list.row.Template');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.Action');
//dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.InstanciateAnchored');
dojo.require('geonef.jig.data.tool.generic.DocValidity');

dojo.declare('geonef.jig.data.list.row.Template', geonef.jig.list.record.Abstract,
{
  uuid: '!',
  name: '!',
  module: '!',
  type: '!',
  propValidity: '!',
  lastEditedAt: {},

  forwardKeys: ['uuid', 'name', 'module', 'type'],

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    name: { node: 'nameNode', type: 'innerHTML' },
    module: { node: 'moduleNode', type: 'innerHTML' },
    type: { node: 'typeNode', type: 'innerHTML' }
  }),

  templateString: dojo.cache('geonef.jig.data.list.row', 'templates/Template.html'),

  _setPropValidityAttr: function(check) {
    this.propValidity = check;
    this.validity.attr('validity', check);
  },

  _setLastEditedAtAttr: function(timestamp) {
    //console.log('_setLastEditedAtAttr', this, arguments);
    this.lastEditedAt = timestamp;
    var label = '';
    if (timestamp) {
      var date = new Date(timestamp * 1000);
      label = date.toLocaleString();
    }
    this.lastEditedAtNode.innerHTML = label;
  }

});
