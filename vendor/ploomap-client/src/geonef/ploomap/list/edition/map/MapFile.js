
dojo.provide('geonef.ploomap.list.edition.map.MapFile');

// parents
dojo.require('geonef.jig.list.edition.Abstract');

// used in template
dojo.require('dijit.form.Textarea');

// used in code
dojo.require('geonef.jig.util');

//dojo.require('geonef.ploomap.list.edition.ogrDataSource.PostgreSql');

dojo.declare('geonef.ploomap.list.edition.map.MapFile',
             geonef.jig.list.edition.Abstract,
{
  templateString: dojo.cache("geonef.ploomap.list.edition.map",
                             "templates/MapFile.html"),

  apiModule: 'listQuery.map',

  module: 'MapFile',

  saveNoticeChannel: 'ploomap/map/save'

});
