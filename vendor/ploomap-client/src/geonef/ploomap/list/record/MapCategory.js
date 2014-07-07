
dojo.provide('geonef.ploomap.list.record.MapCategory');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.InstanciateAnchored');
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.ploomap.list.record.MapCategory', geonef.jig.list.record.Abstract,
{
  templateString: dojo.cache('geonef.ploomap.list.record',
                             'templates/MapCategory.html'),

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    position: { node: 'positionNode', type: 'innerHTML' },
    title: { node: 'titleNode', type: 'innerHTML' },
    mapCollectionCount: { node: 'mapCollectionCountNode', type: 'innerHTML' },
  }),

  uuid: '!',
  position: '!',
  title: '!',
  published: null,
  mapCollectionCount: -1,

  postCreate: function() {
    this.inherited(arguments);
    this.showMapCollectionsButton.childWidgetParams = dojo.mixin(
      { filter: { category: { op: 'ref', value: this.uuid }}},
      this.listWidget.mapCollectionsListParams);
  },

  _setPublishedAttr: function(state) {
    this.publishedNode.innerHTML = state ? 'oui' : 'non';
  },

  _setMapCollectionCountAttr: function(count) {
    this.mapCollectionCount = count;
    this.mapCollectionCountNode.innerHTML = count;
    this.showMapCollectionsButton.attr('label', count);
    dojo.style(this.mapCollectionCountNode, 'display', !count ? '' : 'none');
    dojo.style(this.showMapCollectionsButton.domNode, 'display',
               !!count ? '' : 'none');
  }

});
