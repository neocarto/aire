
dojo.provide('geonef.ploomap.list.OgrDataSource');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.ploomap.list.header.OgrDataSource');
dojo.require('geonef.ploomap.list.record.OgrDataSource');

dojo.declare('geonef.ploomap.list.OgrDataSource', geonef.jig.list.Abstract,
{
  title: 'Sources de données',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/admin_sources.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.ploomap.list.header.OgrDataSource',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.ploomap.list.record.OgrDataSource',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 6,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'name', 'module', 'layerCount', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'name', 'module', 'layerCount', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'listQuery.ogrDataSource',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'ploomap/ogrDataSource/save',

  layersButtonClass: 'geonef.jig.button.InstanciateAnchored', // geonef.jig.button.TooltipWidget

  layersListParams: {}

});
