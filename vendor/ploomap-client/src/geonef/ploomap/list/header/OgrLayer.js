
dojo.provide('geonef.ploomap.list.header.OgrLayer');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.SelectEntityFilter');
dojo.require('geonef.jig.list.header.generic.Name');
dojo.require('geonef.ploomap.list.header.ogrLayer.GeometryType');
dojo.require('geonef.jig.list.header.generic.NumberField');
dojo.require('geonef.ploomap.list.header.ogrLayer.Actions');

dojo.declare('geonef.ploomap.list.header.OgrLayer', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache("geonef.ploomap.list.header", "templates/OgrLayer.html"),

  // sort: Object
  //    Default sort
  sort: { name: 'name', desc: false }

});
