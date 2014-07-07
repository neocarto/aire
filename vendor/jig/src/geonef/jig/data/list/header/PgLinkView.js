
dojo.provide('geonef.jig.data.list.header.PgLinkView');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.Name');
dojo.require('geonef.jig.data.list.header.generic.ProgFilterField');
//dojo.require('list.header.generic.SelectEntityFilter');
dojo.require('geonef.jig.list.header.generic.NumberField');
dojo.require('geonef.jig.data.list.header.pgLinkView.Actions');
dojo.require('dijit.form.TextBox');
dojo.require('geonef.jig.button.Action');


dojo.declare('geonef.jig.data.list.header.PgLinkView', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache('geonef.jig.data.list.header', 'templates/PgLinkView.html'),

  // sort: Object
  //    Default sort
  sort: { name: 'title', desc: false },

});
