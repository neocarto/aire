
dojo.provide('geonef.jig.list.header.generic.Module');

// parents
dojo.require('geonef.jig.list.header.generic.AbstractEnumType');
dojo.require('geonef.jig.widget._AsyncInit');

dojo.declare('geonef.jig.list.header.generic.Module',
             [geonef.jig.list.header.generic.AbstractEnumType],
{
  // summary:
  //   Header field for usual "module" property
  //

  name: 'module',
  title: 'Type',
  apiModule: '',
  locale: '',

  postCreate: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'margin center');
  },

  populateEnumValues: function() {
    geonef.jig.api.request({
      module: this.apiModule,
      action: 'getModuleList',
      locale: this.locale,
      callback: dojo.hitch(this, 'installModuleList')
    });
  },

  installModuleList: function(data) {
    var values = data.modules.map(
      function(m) { return { value: m.name, label: m.label }; });
    this.installEnumValues(values);
  }

});
