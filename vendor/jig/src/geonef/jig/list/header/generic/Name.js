dojo.provide('geonef.jig.list.header.generic.Name');

// parent
dojo.require('geonef.jig.list.header.generic.StringField');

// used in template
dojo.require('dijit.form.TextBox');

dojo.declare('geonef.jig.list.header.generic.Name', geonef.jig.list.header.generic.StringField,
{

  title: 'Name',
  name: 'name'

});