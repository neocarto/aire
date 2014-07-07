
dojo.provide('geonef.jig.data.list.PgLinkData');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.jig.data.list.header.PgLinkData');
dojo.require('geonef.jig.data.list.row.PgLinkData');

dojo.declare('geonef.jig.data.list.PgLinkData', geonef.jig.list.Abstract,
{
  viewId: '',

  title: 'Données PgLink',
  //icon: '/images/icons/admin_sources.png',

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.jig.data.list.header.PgLinkData',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.jig.data.list.row.PgLinkData',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: -1,

  // columns: array
  //    Static member, list of column names
  columns: [ 'selection', 'id' ],

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'geonefPgLink/listQuery.data',

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: null,

  asyncMeta: true,

  columnsDefs: {},

  postMixInProperties: function() {
    this.inherited(arguments);
    this.columnsDefs = dojo.mixin({}, this.columnsDefs);
    this.columns = this.columns.slice(0);
    this.visibleColumns = this.visibleColumns.slice(0);
    this.requestParams.viewId = this.viewId;
    this.setupMeta();
  },

  buildRendering: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'pgLinkDataList');
  },

  setupMeta: function() {
    this.metaReady.dependsOn(
      this.request({
        action: 'getMeta',
        callback: dojo.hitch(this, this.processMeta)
      }));
    this.inherited(arguments);
  },

  processMeta: function(data) {
    //console.log('processMeta', this, arguments);
    this.attr('title', data.view.title);
    data.columns.forEach(this.addColumn, this);
    this.columns.push('actions');
    this.columnCount = this.columns.length;
    this.visibleColumns = this.columns.slice(0);
    dojo.query('td.listColSpan', this.domNode)
        .forEach(function(td) {
                   td.setAttribute('colspan', this.columnCount); }, this);
  },

  addColumn: function(def) {
    //console.log('addColumn', this, arguments);
    this.columnsDefs[def.name] = def;
    this.columns.push(def.name);
  },

  createRow: function(rowData) {
    var data = { values: rowData };
    return geonef.jig.list.Abstract.prototype.createRow.call(this, data);
  }

});

geonef.jig.data.list.PgLinkData.prototype.open =
  function(viewId) {
    var list = new geonef.jig.data.list.PgLinkData({viewId: viewId});
    geonef.jig.workspace.autoAnchorWidget(list);
    list.startup();
  };
