
dojo.provide('geonef.ploomap.list.edition.MapCategory');

// parent
dojo.require('geonef.jig.list.edition.AutoProperties');

dojo.declare('geonef.ploomap.list.edition.MapCategory',
             geonef.jig.list.edition.AutoProperties,
{
  // summary:
  //   Map set edition
  //

  /* overloaded */
  saveNoticeChannel: 'ploomap/mapCategory/save',

  /* overloaded */
  apiModule: 'listQuery.mapCategory',

  /* overloaded */
  localeSelect: true,

  /* overloaded */
  propertyTypes: {
    published: { 'class': 'geonef.jig.input.BooleanCheckBox' }
  },

  /* overloaded */
  getPropertiesOrder: function() {
    return ['title', 'position', 'published'];
  },

  /* overloaded */
  _getTitleAttr: function() {
    var value = this.origValue; // this.attr('value');
    return value && value.title ?
      'Catégorie : ' + value.title :
      'Catégorie sans nom';
  }

});
