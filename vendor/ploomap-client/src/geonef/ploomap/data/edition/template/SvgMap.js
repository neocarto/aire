
dojo.provide('geonef.ploomap.data.edition.template.SvgMap');

// parents
dojo.require('geonef.jig.data.edition.template.Text');

// used in code
dojo.require('dijit.form.Textarea');

dojo.declare('geonef.ploomap.data.edition.template.SvgMap',
             geonef.jig.data.edition.template.Text,
{
  module: 'SvgMap' ,

  /* overloaded */
  getPropertiesOrder: function() {
    var props = ['mapElementId', 'legendElementId', 'legendSizeFactor',
                 'additionalCss', 'content'];
    return this.inherited(arguments).
      filter(function(k) { return k !== 'content'; }).concat(props);
  },

  /* overloaded */
  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        additionalCss: { 'class': 'dijit.form.Textarea' }
      }, this.propertyTypes);
  }

});
