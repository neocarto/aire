
dojo.provide('geonef.ploomap.list.record.Map');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.InstanciateAnchored');
dojo.require('geonef.ploomap.list.tool.map.View');
dojo.require('geonef.jig.data.tool.generic.DocValidity');

dojo.declare('geonef.ploomap.list.record.Map', geonef.jig.list.record.Abstract,
{
  templateString: dojo.cache("geonef.ploomap.list.record", "templates/Map.html"),

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    title: { node: 'nameNode', type: 'innerHTML' },
    level: { node: 'levelNode', type: 'innerHTML' },
    module: { node: 'moduleNode', type: 'innerHTML' }
  }),

  uuid: '!',
  //name: '!',
  position: -1,
  mapCollection: '!',
  level: '!',
  module: '!',
  title: '!',
  propValidity: '!',
  lastEditedAt: {},

  _setMapCollectionAttr: function(label) {
    this.mapCollection = label;
    this.mapCollectionNode.innerHTML = label ? label : '(aucune)';
  },

  _setPropValidityAttr: function(check) {
    this.propValidity = check;
    this.validity.attr('validity', check);
    this.infoButton.attr('disabled', !check.valid);
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
