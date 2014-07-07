
dojo.provide('geonef.ploomap.list.ColorFamily');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.ploomap.list.header.ColorFamily');
dojo.require('geonef.ploomap.list.record.ColorFamily');

dojo.declare('geonef.ploomap.list.ColorFamily', geonef.jig.list.Abstract,
{
  title: 'Couleurs',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/admin_colorfamilies.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.ploomap.list.header.ColorFamily',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.ploomap.list.record.ColorFamily',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 7,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'name', 'colors', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'name', 'colors', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'listQuery.colorFamily',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'ploomap/colorFamily/save'

});
