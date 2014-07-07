
dojo.provide('geonef.ploomap.list.header.Map');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.SelectEntityFilter');
dojo.require('geonef.jig.list.header.generic.Name');
//dojo.require('geonef.jig.list.header.generic.Validity');
dojo.require('geonef.jig.list.header.generic.Module');
dojo.require('geonef.jig.list.header.generic.StringField');
dojo.require('geonef.ploomap.list.header.map.Actions');
dojo.require('geonef.jig.list.header.action.CreateModuleButtons');

dojo.declare('geonef.ploomap.list.header.Map', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache("geonef.ploomap.list.header", "templates/Map.html"),

  // sort: Object
  //    Default sort
  sort: { name: 'title', desc: false }

});
