dojo.provide('geonef.ploomap.layer.featureDetails.WorldWar2');

// parents
dojo.require('geonef.ploomap.layer.featureDetails.HistoricalFact');

dojo.declare('geonef.ploomap.layer.featureDetails.WorldWar2', [ geonef.ploomap.layer.featureDetails.HistoricalFact ],
{
  // summary:
  //   Feature bubble details of a World War 2 event
  //

  // As TinyOWS needs the WFS XML have the same attr order than PG table's :(
  attributeOrder: [ 'date', 'name', 'title', 'type', 'story',
                    'actors', 'source', 'image' ],

  getAttrSchema: function() {
    //console.log('getAttrSchema', this, window.workspaceData.settings.historicalFacts);
    return window.workspaceData.settings.worldWar2.attributes;
  },

  _setActorsAttr: function(value) {
    geonef.ploomap.layer.featureDetails.HistoricalFact.prototype.
      _setCharactersAttr.call(this, value);
  },

  _setSourceAttr: function(value) {
    geonef.ploomap.layer.featureDetails.HistoricalFact.prototype.
      _setUrlAttr.call(this, value);
  },

  _setImageAttr: function(value) {
    geonef.ploomap.layer.featureDetails.HistoricalFact.prototype.
      _setImage_urlAttr.call(this, value);
  }

});
