
dojo.provide('geonef.ploomap.list.Map');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.ploomap.list.header.Map');
dojo.require('geonef.ploomap.list.record.Map');

dojo.declare('geonef.ploomap.list.Map', geonef.jig.list.Abstract,
{
  title: 'Cartes',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/admin_maps.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.ploomap.list.header.Map',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.ploomap.list.record.Map',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 8,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'name', 'validity', 'mapCollection',
             'module', 'level', 'lastEdition', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'name', 'validity', 'mapCollection',
                    'module', 'level', 'lastEdition', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'listQuery.map',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'ploomap/map/save'

});
