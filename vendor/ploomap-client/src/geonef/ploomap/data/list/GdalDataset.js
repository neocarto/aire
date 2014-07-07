
dojo.provide('geonef.ploomap.data.list.GdalDataset');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.ploomap.data.list.header.GdalDataset');
dojo.require('geonef.ploomap.data.list.row.GdalDataset');

dojo.declare('geonef.ploomap.data.list.GdalDataset', geonef.jig.list.Abstract,
{
  title: 'Rasters',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/admin_rasters.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.ploomap.data.list.header.GdalDataset',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.ploomap.data.list.row.GdalDataset',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 7,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'name', 'module', 'width', 'height', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'name', 'module', 'width', 'height', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'listQuery.gdalDataset',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'ploomap/gdalDataset/save',

  layersButtonClass: 'geonef.jig.button.InstanciateAnchored', // geonef.jig.button.TooltipWidget

  layersListParams: {}

});
