
dojo.provide('geonef.ploomap.list.header.ColorFamily');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.Name');
dojo.require('geonef.ploomap.list.header.colorFamily.Actions');
dojo.require('geonef.jig.list.header.action.CreateModuleButtons');

dojo.declare('geonef.ploomap.list.header.ColorFamily', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache("geonef.ploomap.list.header", "templates/ColorFamily.html"),

  // sort: Object
  //    Default sort
  sort: { name: 'title', desc: false },

  createNew: function() {
    var title = this.createNewTitle.attr('value');
    geonef.jig.api.request({
      module: 'listQuery.colorFamily',
      action: 'createNew',
      title: title,
      callback: function(data) {
        dojo.publish('ploomap/colorFamily/save', [data.uuid]);
      }
    });
  }

});
