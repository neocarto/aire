
dojo.provide('geonef.jig.data.list.header.Template');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.Name');
dojo.require('geonef.jig.list.header.generic.Module');
dojo.require('geonef.jig.list.header.generic.NumberField');
dojo.require('geonef.jig.data.list.header.template.Actions');
dojo.require('geonef.jig.list.header.action.CreateModuleButtons');


dojo.declare('geonef.jig.data.list.header.Template', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache('geonef.jig.data.list.header', 'templates/Template.html'),

});
