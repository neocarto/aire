
dojo.provide('geonef.jig.list.File');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.jig.list.header.File');
dojo.require('geonef.jig.list.record.File');

dojo.declare('geonef.jig.list.File', geonef.jig.list.Abstract,
{
  title: 'Fichiers',
  icon: dojo.moduleUrl('geonef.jig', 'style/icon/admin_files.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.jig.list.header.File',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.jig.list.record.File',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 7,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'name', 'module', 'type', 'size', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'name', 'module', 'type', 'size', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'listQuery.file',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'jig/file/save',

  mapsButtonClass: 'geonef.jig.button.InstanciateAnchored', // geonef.jig.button.TooltipWidget

  mapsListParams: {}

});
