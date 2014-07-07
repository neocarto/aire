dojo.provide('geonef.jig.list.Abstract');

// parents
//dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._AsyncInit');
//dojo.require('geonef.jig.widget._I18n');

// used in template
dojo.require('geonef.jig.list.tool.Pager');

// used in code
dojo.require('geonef.jig.api');
dojo.require('geonef.jig.locale');

/**
 * Abstract base for building a list (main class)
 *
 * All occurences of ___*___ below must be overloaded.
 *
 * Async (deferred) events:
 *      - metaReady
 *              When list metadata info is available
 *              and basic UI has been rendered.
 *              Delayed for dynamic metadata (such as PgLink data tables).
 *      - asyncInit
 *              When the list header is ready.
 *              Depends on "metaReady" and header's "asyncInit"
 *              Delayed for example by filters requiring server data
 *              (such as the list of modules - see list.header.generic.Module)
 *      - refreshReady
 *              When the list is ready to be refreshed.
 *              Depends on "asyncInit"
 *
 * @author Okapi <okapi@lapatate.org>
 */
dojo.declare('geonef.jig.list.Abstract',
	     //[geonef.jig.layout._Anchor, dijit._Templated, geonef.jig.widget._AsyncInit],
	     [dijit._Widget, dijit._Templated, geonef.jig.widget._AsyncInit],
{

  locale: '',

  templateString: dojo.cache("geonef.jig.list", "templates/Abstract.html"),

  title: 'List',

  // widgetsInTemplate: Boolean
  //    Whether we have widgets (attr dojoType="...")
  widgetsInTemplate: true,

  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.jig.list.header.___MyConcreteQueryClass___',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.jig.list.record.___MyConcreteRecordClass___',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 42,

  // columns: array
  //    Static member, list of column names
  columns: [],

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'list.___myConcreteQueryApiClass___',

  // requestParams: Object
  //    Additional parameters to pass to API request
  requestParams: {},

  // refreshTopic: string
  //    Topic to subscribe to for automatic refresh
  refreshTopic: '',

  readOnly: false,

  // visibleColumns: array
  //    Names of columns to display. Set empty array to display all fields.
  visibleColumns: [],

  // selectionChangeTopic: string
  //    Topic on which to publish when the selection is modified
  selectionChangeTopic: '',

  pageLength: 10,

  asyncMeta: false,

  filter: {},

  asyncInitControl: false,


  postMixInProperties: function() {
    this.inherited(arguments);
    this.requestParams = dojo.mixin({}, this.requestParams);
    this.metaReady = new geonef.jig.Deferred();
    this.asyncInit.dependsOn(this.metaReady);
    this.refreshReady = new geonef.jig.Deferred();
    this.refreshReady.addCallback(dojo.hitch(this, 'onRefreshReady'));
    this.refreshReady.dependsOn(this.asyncInit);
    this.refreshReady.callback();
    this.selectionCount = 0;
    if (!this.locale) {
      this.locale = geonef.jig.locale.getLocale();
    }
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.metaReady.callback();
    this.refreshReady.setControl(this.domNode);
  },

  postCreate: function() {
    this.inherited(arguments);
    this.asyncInit.dependsOn(this.queryWidget.asyncInit);
    this.inherited(arguments);
  },

  destroy: function() {
    this.refreshReady = null;
    this.attr('refreshTopic', null);
    this.getRows().forEach(function(w) { w.destroyRecursive(); });
    this.inherited(arguments);
  },

  onRefreshReady: function() {
    //console.log('onRefreshReady', this, arguments);
    this.refresh();
  },

  _setRefreshTopicAttr: function(topic) {
    if (this.refreshTopicH) {
      this.unsubscribe(this.refreshTopicH);
      this.refreshTopicH = null;
    }
    this.refreshTopic = topic;
    if (topic) {
      this.refreshTopicH = this.subscribe(topic, dojo.hitch(this, 'refresh', false));
    }
  },

  /**
   * Initiate query to server API
   */
  refresh: function(interactive_) {
    //console.log('refresh', this);
    if (!this.refreshReady.hasFired()) { return; }
    if (this._refreshing) { return; }
    if (!this.checkBeforeClean(interactive_)) { return; }
    this._refreshing = true;
    this.beforeRefresh();
    /*if (!this.emptyList()) {
      this.cleanRefresh();
      return;
    }*/
    var request = dojo.mixin({}, this.requestParams, {
    			       callback: dojo.hitch(this, 'installList')
    	                     });
    dojo.publish(this.id + '/request', [ request ]);
    this.queryWidget.fetch(request);
  },

  refreshList: function() {
    console.warn('refreshList is obsolete');
    this.refresh();
  },

  /**
   * Process query result data and build rows
   */
  installList: function(data) {
    //console.log('installList', this, data);
    //this.emptyList(true);
    this.locale = data.locale;
    var odd = true;
    var oldRows = this.getRows();
    var oldRowIdx = 0;
    this._refreshing = false;
    data.rows.forEach(
      function(rowData) {
    	odd = !odd;
    	var rowWidget = this.createRow(rowData, data.locale);
    	dojo.addClass(rowWidget.domNode, odd ? 'odd' : 'even');
        if (oldRowIdx >= oldRows.length) {
          rowWidget.placeAt(this.rowContainer);
        } else {
          rowWidget.placeAt(oldRows[oldRowIdx].domNode, 'before');
          //this.rowContainer.removeChild(oldRows[oldRowIdx].domNode);
          oldRows[oldRowIdx].destroy();
          oldRowIdx++;
        }
        //geonef.jig.workspace.highlightWidget(rowWidget, window._fx || 'glimpse');
        /*dojo.animateProperty({
          node: rowWidget.domNode, duration: 400,
	  properties: { opacity: { start: 0.0, end: 1.0 }},
	  easing: window._e || dojo.fx.easing.linear
        }).play();*/

        rowWidget.startup();
      }, this);
    while (oldRowIdx < oldRows.length) {
      this.rowContainer.removeChild(oldRows[oldRowIdx].domNode);
      oldRows[oldRowIdx].destroy();
      oldRowIdx++;
    }
    this.setEmptyMessage(!data.rows.length);
    this.cleanRefresh();
    this.afterRefresh();
  },

  setEmptyMessage: function(isEmpty) {
    if (this.emptyTrNode) {
      dojo.destroy(this.emptyTrNode);
      this.emptyTrNode = null;
    }
    if (isEmpty) {
      this.emptyTrNode = dojo.create('tr', {}, this.rowContainer);
      var td = dojo.create('td',
                           { 'class': 'wait',
                             colspan: this.columnCount,
                             innerHTML: '(Aucun enregistrement)' }, this.emptyTrNode);
    }
  },

  /**
   * Create one row widget
   */
  createRow: function(rowData, locale) {
    //console.log('createRow', this, arguments);
    var RowClass = dojo.getObject(this.rowClassName),
    rowWidget = new RowClass(
      dojo.mixin({}, rowData, { listWidget: this, locale: locale }));
    //console.log('createRow W', rowWidget);
    rowWidget.connect(rowWidget, 'onSelectStateChange', dojo.hitch(this,
    		 function(state) { this.onSelectionChange(rowWidget, state); }));
    return rowWidget;
  },

  /*emptyList: function(noCheck) {
    //console.log('emptyList', this, arguments);
    if (!noCheck && !this.checkBeforeClean()) {
      //console.log('return false');
      return false;
    }
    this.selectRows([]);
    while (this.rowContainer.lastChild) {
      this.rowContainer.removeChild(this.rowContainer.lastChild);
    }
    return true;
  },*/

  checkBeforeClean: function(interactive_) {
    var list = dojo.query('> tr', this.rowContainer)
      .map(function(n) { return dijit.byNode(n); })
      .filter(function(w) { return w && w.attr('isDirty'); });
    if (list.length) {
      if (interactive_ !== false) {
        alert('The state of '+list.length+' entry(es) ' +
              'was not saved. Please save or cancel them explicitely.');
      }
      return false;
    }
    return true;
  },

  onQueryChange: function() {
    //console.log('onQueryChange', this, arguments);
    this.refresh();
  },

  selectRows: function(rows, prop) {
    //console.log('selectRows', this, arguments);
    this.getRows().forEach(
      function(r) {
        var should = rows.indexOf(prop ? r[prop] : r) !== -1;
        if (should !== r.attr('selected')) {
          //console.log('selectRows CHANGE', r, should);
          r.attr('selected', should, false);
          //this.onSelectionChange(r, should);
        }
      }, this);
  },

  onSelectionChange: function(row, state) {
    //console.log('onSelectionChange', this, arguments);
    this.selectionCount += state ? 1 : -1;
    //var list = this.getSelectedRows();
    //console.log('list length', list.length);
    if (this.selectionChangeTopic.length > 0) {
      dojo.publish(this.selectionChangeTopic, [ this ]);
    }
  },

  getRows: function() {
    return dojo.query('> tr[widgetid]', this.rowContainer)
      .map(dijit.byNode);
  },

  getSelectedRows: function() {
    return this.getRows()
      .filter(function(w) { return w.attr('selected'); });
  },

  /**
   * Hook: before list is refreshed
   */
  beforeRefresh: function() {
    /*dojo.style(this.waitRow, 'display', '');
    var box = dojo.coords(this.tableNode);
    //console.log('box table', box);
    dojo.style(this.tableNode, 'width', '' + box.w + 'px');*/
    var trs = dojo.query('> tr[widgetid]', this.rowContainer);
    if (trs.length) {
        trs.removeClass('selectedRow').addClass('dying');
    } else {
      dojo.style(this.waitRow, 'display', '');
    }
  },

  /**
   * Hook: after list is refreshed
   */
  cleanRefresh: function() {
    dojo.style(this.waitRow, 'display', 'none');
    /*dojo.style(this.tableNode, 'width', '');*/
    this.onResize();
  },

  afterRefresh: function() {
    // hook
  },

  /**
   * Perform API action on admin API module
   */
  request: function(struct) {
    return geonef.jig.api.request(
      dojo.mixin({ module: this.queryApiModule }, this.requestParams, struct))
          .setControl(this.domNode);
  },

  /**
   * Same as request(), but auto pass the IDs of selected entries
   */
  selectionRequest: function(struct) {
    var sel = this.getSelectedRows()
      .map(function(w) { return w.attr('entryId'); });
    return this.request(dojo.mixin({ selection: sel }, struct));
  },

  onResize: function() {
    // hook
  },

  _setPageLengthAttr: function(pageLength) {
    var mod = this.pageLength !== pageLength;
    this.pageLength = pageLength;
    if (mod) {
      console.log('_setPageLengthAttr: refreshing', this, arguments);
      this.refresh();
    }
  },

  _setFilterAttr: function(filter) {
    var self = this;
    this.refreshReady.dependsOnCallback(
      this.asyncInit, function() { self.queryWidget.attr('value', filter); });
  },

  _getFilterAttr: function() {
    return this.queryWidget.attr('value');
  },

  _setTitleAttr: function(title) {
    this.title = title;
  },

  _setTitleArgumentAttr: function(arg) {
    console.log('_setTitleArgumentAttr', this, arguments);
    if (!this._initialTitle) {
      this._initialTitle = this.title;
    }
    this.attr('title', this._initialTitle +
              (arg ? ' ['+arg+']' : ''));
  },

});
