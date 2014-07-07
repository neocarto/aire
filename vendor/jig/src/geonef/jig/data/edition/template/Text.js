
dojo.provide('geonef.jig.data.edition.template.Text');

// parents
dojo.require('geonef.jig.data.edition.Template');

// used in code
dojo.require('dijit.form.Textarea');

dojo.declare('geonef.jig.data.edition.template.Text',
             geonef.jig.data.edition.Template,
{
  /* overloaded */
  module: 'Text',

  /* overloaded */
  localeSelect: true,

  /* overloaded */
  getPropertiesOrder: function() {
    var props = ['content'];
    return this.inherited(arguments).concat(props);
  },

  /* overloaded */
  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        content: { 'class': 'dijit.form.Textarea' }
      }, this.propertyTypes);
  }

});
