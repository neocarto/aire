
dojo.provide('geonef.ploomap.list.header.MapCollection');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.SelectEntityFilter');
dojo.require('geonef.jig.list.header.generic.NumberField');
dojo.require('geonef.ploomap.list.header.mapCollection.Actions');
dojo.require('geonef.jig.list.header.action.CreateModuleButtons');

dojo.declare('geonef.ploomap.list.header.MapCollection', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache('geonef.ploomap.list.header',
                             'templates/MapCollection.html'),

  // sort: Object
  //    Default sort
  sort: { name: 'position', desc: false }

  // createNew: function() {
  //   var title = this.createNewTitle.attr('value');
  //   geonef.jig.api.request({
  //     module: 'listQuery.mapCollection',
  //     action: 'createNew',
  //     title: title,
  //     callback: function(data) {
  //       dojo.publish('ploomap/mapCollection/save', [data.uuid]);
  //     }
  //   });
  // }

});
