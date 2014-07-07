
dojo.provide('geonef.ploomap.list.OgrLayer');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.ploomap.list.header.OgrLayer');
dojo.require('geonef.ploomap.list.record.OgrLayer');
//dojo.require('geonef.ploomap.list.edition.OgrLayer');

dojo.declare('geonef.ploomap.list.OgrLayer', geonef.jig.list.Abstract,
{
  title: 'Couches de données',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/admin_layers.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.ploomap.list.header.OgrLayer',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.ploomap.list.record.OgrLayer',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 9,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'name', 'source', 'type', 'columns',
             'featureCount', 'extent', 'spatialRef', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  //
  //    At the moment, spatialRef is hidden because not implemented
  visibleColumns: [ 'selection', 'name', 'source', 'type', 'columns',
                    'featureCount', 'extent', 'spatialRef', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'listQuery.ogrLayer',

  editionWidgetClass: 'geonef.ploomap.list.edition.OgrLayer',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'ploomap/ogrLayer/save'

});
