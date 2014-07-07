
dojo.provide('geonef.ploomap.list.MapCategory');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.ploomap.list.header.MapCategory');
dojo.require('geonef.ploomap.list.record.MapCategory');

dojo.declare('geonef.ploomap.list.MapCategory', geonef.jig.list.Abstract,
{
  title: 'Catégories',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/admin_map_categories.png'),

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.ploomap.list.header.MapCategory',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.ploomap.list.record.MapCategory',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 6,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'uuid', 'position', 'title', 'published',
             'mapCollectionCount', 'actions' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [ 'selection', 'position', 'title', 'published',
                    'mapCollectionCount', 'actions' ],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'listQuery.mapCategory',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: 'ploomap/mapCategory/save',

  mapCollectionsButtonClass: 'geonef.jig.button.InstanciateAnchored', // geonef.jig.button.TooltipWidget

  mapCollectionsListParams: {}

});
