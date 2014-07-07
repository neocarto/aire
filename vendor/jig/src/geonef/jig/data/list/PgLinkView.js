
dojo.provide('geonef.jig.data.list.PgLinkView');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.jig.data.list.header.PgLinkView');
dojo.require('geonef.jig.data.list.row.PgLinkView');

dojo.declare('geonef.jig.data.list.PgLinkView', geonef.jig.list.Abstract,
{
  title: 'Views PgLink',
  icon: dojo.moduleUrl('geonef.jig', 'style/icon/admin_sources.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.jig.data.list.header.PgLinkView',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.jig.data.list.row.PgLinkView',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 7,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'title', 'columns', 'linkedViewCount', 'rowCount', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'uuid', 'title', 'columns', 'linkedViewCount', 'rowCount', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'geonefPgLink/listQuery.view',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'jig/pgLinkView/save',

  linkedViewsButtonClass: 'geonef.jig.button.TooltipWidget'
  //linkedViewsButtonClass: 'geonef.jig.button.InstanciateAnchored' // geonef.jig.button.TooltipWidget

});
