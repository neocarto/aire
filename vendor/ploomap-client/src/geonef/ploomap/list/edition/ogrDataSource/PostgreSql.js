
dojo.provide('geonef.ploomap.list.edition.ogrDataSource.PostgreSql');

// parents
dojo.require('geonef.ploomap.list.edition.OgrDataSource');

dojo.declare('geonef.ploomap.list.edition.ogrDataSource.PostgreSql',
             geonef.ploomap.list.edition.OgrDataSource,
{
  module: 'PostgreSql',

  getPropertiesOrder: function() {
    var props = ['name', 'host', 'port', 'user', 'password', 'database'];
    return props.concat(this.inherited(arguments));
  },

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        host: { 'class': 'dijit.form.TextBox' },
        port: { 'class': 'dijit.form.TextBox', // 'dijit.form.NumberSpinner',
                options: {
                  //constraints: { min: 1, max: 65535, places: 0},
                  value: 5432/*, smallDelta: 1, largeDelta: 100*/
                }},
        user: { 'class': 'dijit.form.TextBox' },
        password: { 'class': 'dijit.form.TextBox',
                    options: { type: 'password' }},
        database: { 'class': 'dijit.form.TextBox' }
      }, this.propertyTypes);
  }

});
