
dojo.provide('geonef.ploomap.data.list.header.GdalDataset');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.Module');
dojo.require('geonef.jig.list.header.generic.NumberField');
dojo.require('geonef.ploomap.data.list.header.gdalDataset.Actions');
dojo.require('geonef.jig.list.header.action.CreateModuleButtons');
//dojo.require('geonef.ploomap.data.list.header.ogrDataSource.AddList');

dojo.declare('geonef.ploomap.data.list.header.GdalDataset', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache('geonef.ploomap.data.list.header', 'templates/GdalDataset.html'),

  // sort: Object
  //    Default sort
  sort: { name: 'uuid', desc: false }

});
