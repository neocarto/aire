
dojo.provide('geonef.jig.data.list.Template');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.jig.data.list.header.Template');
dojo.require('geonef.jig.data.list.row.Template');

dojo.declare('geonef.jig.data.list.Template', geonef.jig.list.Abstract,
{
  title: 'Templates',
  icon: dojo.moduleUrl('geonef.jig', 'style/icon/admin_files.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.jig.data.list.header.Template',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.jig.data.list.row.Template',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 8,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'name', 'validity', 'module', 'type', 'lastEdition', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'name', 'validity', 'module', 'type', 'lastEdition', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'geonefZig/listQuery.template',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'jig/template/save',

  //linkedViewsButtonClass: 'geonef.jig.button.TooltipWidget'
  //linkedViewsButtonClass: 'geonef.jig.button.InstanciateAnchored' // geonef.jig.button.TooltipWidget

});
