
dojo.provide('geonef.ploomap.layer.featureDetails.HistoricalFact');

// parents
dojo.require('geonef.ploomap.layer.featureDetails.Auto');

dojo.declare('geonef.ploomap.layer.featureDetails.HistoricalFact',
             [ geonef.ploomap.layer.featureDetails.Auto ],
{
  // summary:
  //   Feature detail : historical facts
  //

  isReadOnly: false,

  templateString: dojo.cache('geonef.ploomap.layer.featureDetails', 'templates/HistoricalFacts.html'),

  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    name: { node: 'nameNode', type: 'innerHTML' },
    title: { node: 'titleNode', type: 'innerHTML' }
  }),

  // As TinyOWS needs the WFS XML have the same attr order than PG table's :(
  attributeOrder: [ 'name', 'date', 'story', 'url', 'title',
                    'image_url', 'characters' ],

  startup: function() {
    this.inherited(arguments);
    this.tabContainer.resize();
  },

  buildPropertiesList: function() {
    return this.buildFormPropertiesList();
  },

  getAttrSchema: function() {
    return window.workspaceData.settings.historicalFacts.attributes;
  },

  _setDateAttr: function(value) {
    var date;
    if (dojo.isString(value)) {
      date = ' (' + this.feature.layer.getNiceDate(this.feature) + ')';
    } else {
      date = '';
    }
    this.dateNode.innerHTML = date;
  },

  _setStoryAttr: function(value) {
    var html = value.replace(/\n/g, '<br/>'); //.replace(/</g, '&lt;');
    this.storyNode.innerHTML = html;
  },

  _setCharactersAttr: function(value) {
    var node = this.actorsNode;
    var actors = value.split(',').map(dojo.trim);
    dojo.style(this.actorsLabelNode, 'display', actors.length ? '' : 'none');
    node.innerHTML = '';
    actors.forEach(
      function(actor) { dojo.create('li', { innerHTML: actor }, node); });
  },

  _setUrlAttr: function(value) {
    dojo.style(this.urlNode, 'display', value ? '' : 'none');
    this.urlLinkNode.setAttribute('href', value);
    this.urlLinkNode.innerHTML = value;
  },

  _setImage_urlAttr: function(value) {
    value = dojo.trim(value);
    this.imageNode.setAttribute('src', value);
    this.imageNode.setAttribute('title', value);
    dojo.style(this.imageEmptyNode, 'display', value ? 'none' : '');
  },

  filterSaveValue: function(value) {
    var get2digits = function(nb) { return ''+(nb<10?'0':'')+nb; };
    if (value.date){
      var date = value.date;
      value.date = ''+date.getFullYear()+'-'+get2digits(date.getMonth()+1)+
                                              '-'+get2digits(date.getDate());
    }
    return geonef.ploomap.layer.featureDetails.Auto.
             prototype.filterSaveValue.call(this, value);
  }

});
