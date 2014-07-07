

dojo.provide('geonef.jig.data.edition.Template');

// parent
dojo.require('geonef.jig.list.edition.AutoProperties');

/**
 * @class Base class for template documents
 *
 * @abstract
 */
dojo.declare('geonef.jig.data.edition.Template', geonef.jig.list.edition.AutoProperties,
{

  saveNoticeChannel: 'jig/template/save',

  apiModule: 'geonefZig/listQuery.template',

  checkProperties: true, //true,

  propertyTypes: {
  },

  getPropertiesOrder: function() {
    return ['name'];
  },

  _getTitleAttr: function() {
    var value = this.origValue;
    return value && value.name ?
      'Modèle : ' + value.name : 'Modèle sans nom';
  }

});
