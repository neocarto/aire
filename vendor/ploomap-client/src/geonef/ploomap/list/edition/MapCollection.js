

dojo.provide('geonef.ploomap.list.edition.MapCollection');

// parent
dojo.require('geonef.jig.list.edition.AutoProperties');

/**
 * @class Base class for the edition form of map collections submodules
 *
 * @abstract
 */
dojo.declare('geonef.ploomap.list.edition.MapCollection',
             geonef.jig.list.edition.AutoProperties,
{

  /* overloaded */
  saveNoticeChannel: 'ploomap/mapCollection/save',

  /* overloaded */
  apiModule: 'listQuery.mapCollection',

  /* overloaded */
  localeSelect: true,

  /* overloaded */
  checkProperties: false, //true,

  /* overloaded */
  propertyTypes: {
        userNotes: { 'class': 'dijit.form.Textarea' },
        category: {
          'class': 'geonef.jig.input.AbstractListRow',
          options: {
            listClass: 'geonef.ploomap.list.MapCategory',
            nullLabel: 'Catégorie...',
            requestModule: 'listQuery.mapCategory',
            listVisibleColumns: ['selection', 'title', 'published', 'mapCollectionCount'],
            labelField: 'title'
          }
        },
  },

  /* overloaded */
  getPropertiesOrder: function() {
    return ['title', 'category', 'position', 'zoomBarX', 'zoomBarY', 'userNotes'];
  },

  /* overloaded */
  _getTitleAttr: function() {
    var value = this.origValue; // this.attr('value');
    return value && value.title ?
      'Collection : ' + value.title : 'Collection sans nom';
  }

});
