
dojo.provide('geonef.ploomap.list.edition.mapCollection.Published');

// parent
dojo.require('geonef.ploomap.list.edition.MapCollection');

/**
 * Base class for published map collections. Not meant to be instanciated.
 *
 * @class
 */
dojo.declare('geonef.ploomap.list.edition.mapCollection.Published',
             geonef.ploomap.list.edition.MapCollection,
{

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        published: { 'class': 'geonef.jig.input.BooleanCheckBox' },
        comment: { 'class': 'dijit.form.Textarea' }
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    var props = ['published', 'comment'];
    return this.inherited(arguments).concat(props);
  }

});
