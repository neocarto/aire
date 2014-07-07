
dojo.provide('geonef.jig.data.list.PgLinkTable');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.jig.data.list.header.PgLinkTable');
dojo.require('geonef.jig.data.list.row.PgLinkTable');

dojo.declare('geonef.jig.data.list.PgLinkTable', geonef.jig.list.Abstract,
{
  title: 'Tables PgLink',
  icon: dojo.moduleUrl('geonef.jig', 'style/icon/admin_sources.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.jig.data.list.header.PgLinkTable',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.jig.data.list.row.PgLinkTable',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 5,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'columns', 'viewCount', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'uuid', 'columns', 'viewCount', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'geonefPgLink/listQuery.table',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'jig/pgLinkTable/save',

  viewsButtonClass: 'geonef.jig.button.InstanciateAnchored', // geonef.jig.button.TooltipWidget

});
