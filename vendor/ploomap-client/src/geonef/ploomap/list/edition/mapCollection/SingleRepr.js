
dojo.provide('geonef.ploomap.list.edition.mapCollection.SingleRepr');

// parent
dojo.require('geonef.ploomap.list.edition.mapCollection.Published');

dojo.declare('geonef.ploomap.list.edition.mapCollection.SingleRepr',
             geonef.ploomap.list.edition.mapCollection.Published,
{

  module: 'SingleRepr',

  getPropertiesOrder: function() {
    var props = ['defaultLanguage'];
    return this.inherited(arguments).concat(props);
  }

});
