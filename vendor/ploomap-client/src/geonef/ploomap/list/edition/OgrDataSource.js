
dojo.provide('geonef.ploomap.list.edition.OgrDataSource');

// parent
dojo.require('geonef.jig.list.edition.AutoProperties');

dojo.declare('geonef.ploomap.list.edition.OgrDataSource',
             geonef.jig.list.edition.AutoProperties,
{
  // summary:
  //   Base class for map edition
  //

  saveNoticeChannel: 'ploomap/ogrDataSource/save',

  apiModule: 'listQuery.ogrDataSource',

  /**
   * Whether the properties should be checked (server-side)
   *
   * @param boolean
   */
  checkProperties: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        name: { 'class': 'dijit.form.TextBox' },
        userNotes: { 'class': 'dijit.form.SimpleTextarea' }
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    return ['name', 'userNotes'];
  },

  _getTitleAttr: function() {
    var value = this.origValue; // this.attr('value');
    return value && value.name ?
      'Source : ' + value.name : 'Source sans nom';
  }

});
