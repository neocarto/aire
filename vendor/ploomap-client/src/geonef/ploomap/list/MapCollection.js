
dojo.provide('geonef.ploomap.list.MapCollection');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.ploomap.list.header.MapCollection');
dojo.require('geonef.ploomap.list.record.MapCollection');

dojo.declare('geonef.ploomap.list.MapCollection', geonef.jig.list.Abstract,
{
  title: 'Collections',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/admin_mapcollections.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.ploomap.list.header.MapCollection',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.ploomap.list.record.MapCollection',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 9,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'position', 'title', 'category', 'module',
             'published', 'mapCount', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'position', 'title', 'category', 'module',
                    'published', 'mapCount', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'listQuery.mapCollection',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'ploomap/mapCollection/save',

  mapsButtonClass: 'geonef.jig.button.InstanciateAnchored', // geonef.jig.button.TooltipWidget

  mapsListParams: {}

});
