
dojo.provide('geonef.ploomap.list.header.MapCategory');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.NumberField');
dojo.require('geonef.ploomap.list.header.mapCategory.Actions');

dojo.declare('geonef.ploomap.list.header.MapCategory', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache('geonef.ploomap.list.header',
                             'templates/MapCategory.html'),

  // sort: Object
  //    Default sort
  sort: { name: 'position', desc: false },

  createNew: function() {
    var title = this.createNewTitle.attr('value');
    geonef.jig.api.request({
      module: 'listQuery.mapCategory',
      action: 'createNew',
      title: title,
      callback: function(data) {
        dojo.publish('ploomap/mapCategory/save', [data.uuid]);
      }
    });
  }

});
