
dojo.provide('geonef.jig.data.list.header.PgLinkTable');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.Name');
dojo.require('geonef.jig.list.header.generic.NumberField');
dojo.require('geonef.jig.data.list.header.pgLinkTable.Actions');
dojo.require('dijit.form.TextBox');
dojo.require('geonef.jig.button.Action');


dojo.declare('geonef.jig.data.list.header.PgLinkTable', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache('geonef.jig.data.list.header', 'templates/PgLinkTable.html'),

  // sort: Object
  //    Default sort
  sort: { name: 'uuid', desc: false },

});
