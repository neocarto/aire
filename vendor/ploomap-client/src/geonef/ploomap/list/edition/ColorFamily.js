
dojo.provide('geonef.ploomap.list.edition.ColorFamily');

// parent
dojo.require('geonef.jig.list.edition.AutoProperties');

// used in code
dojo.require('geonef.jig.input.List');
dojo.require('geonef.jig.input.ColorListInline');

dojo.declare('geonef.ploomap.list.edition.ColorFamily',
             geonef.jig.list.edition.AutoProperties,
{
  // summary:
  //   Map set edition
  //

  saveNoticeChannel: 'ploomap/colorFamily/save',

  apiModule: 'listQuery.colorFamily',

  checkProperties: true,

  propertyTypes: {
    colors: {
      'class': 'geonef.jig.input.List',
      options: {
        childClass: 'geonef.jig.input.ColorListInline',
        addButtonAtBottom: true,
        addButtonLabel: "+"
      }
    }
  },

  getPropertiesOrder: function() {
    return ['title', 'colors'];
  },

  _getTitleAttr: function() {
    var value = this.origValue; // this.attr('value');
    return value && value.title ?
      'Famille de couleurs : ' + value.title :
      'Famille de couleurs sans nom';
  }

});
