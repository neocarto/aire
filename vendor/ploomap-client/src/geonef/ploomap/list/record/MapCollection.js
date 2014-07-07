
dojo.provide('geonef.ploomap.list.record.MapCollection');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.InstanciateAnchored');
dojo.require('geonef.jig.button.Submit');

dojo.declare('geonef.ploomap.list.record.MapCollection', geonef.jig.list.record.Abstract,
{
  templateString: dojo.cache('geonef.ploomap.list.record',
                             'templates/MapCollection.html'),

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    position: { node: 'positionNode', type: 'innerHTML' },
    title: { node: 'titleNode', type: 'innerHTML' },
    mapCount: { node: 'mapCountNode', type: 'innerHTML' },
    module: { node: 'moduleNode', type: 'innerHTML' }
  }),

  uuid: '!',
  position: '!',
  title: '!',
  category: '!',
  module: '!',
  published: null,
  mapCount: -1,

  postCreate: function() {
    this.inherited(arguments);
    this.showMapsButton.childWidgetParams = dojo.mixin(
      { filter: { mapCollection: { op: 'ref', value: this.uuid }}},
      this.listWidget.mapsListParams);
    //dojo.style(this.detailButton.domNode, 'display',
    //           this.module === 'ReprLevels' ? '' : 'done');
  },

  _setCategoryAttr: function(label) {
    this.category = label;
    this.categoryNode.innerHTML = label ? label : '(aucune)';
  },

  _setPublishedAttr: function(state) {
    this.publishedNode.innerHTML = state === true ? 'oui' :
                                     (state === false ? 'non' : '-');
  },

  _setMapCountAttr: function(count) {
    this.mapCount = count;
    this.mapCountNode.innerHTML = count;
    this.showMapsButton.attr('label', count);
    dojo.style(this.mapCountNode, 'display', !count ? '' : 'none');
    dojo.style(this.showMapsButton.domNode, 'display', !!count ? '' : 'none');
  }

});
