
dojo.provide('geonef.ploomap.list.header.OgrFeature');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.ploomap.list.header.sourceLayer.Actions');
dojo.require('geonef.jig.list.header.generic.Name');

dojo.declare('geonef.ploomap.list.header.OgrFeature', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache("geonef.ploomap.list.header", "templates/OgrFeature.html")

  // sort: Object
  //    Default sort
  //sort: { name: 'name', desc: false }

});
