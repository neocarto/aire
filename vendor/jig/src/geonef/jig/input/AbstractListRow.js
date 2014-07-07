
dojo.provide('geonef.jig.input.AbstractListRow');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.jig.api');
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.util.string');
dojo.require('dojo.string');

/**
 * Sophisticated input to choose a layer row within a list
 *
 * @class
 */
dojo.declare('geonef.jig.input.AbstractListRow',
             [ dijit._Widget, dijit._Templated ],
{
  ////////////////////////////////////////////////////////////////////
  // PROPERTIES

  /**
   * Widget class for sub-list
   *
   * @type {string|dijit._Widget}
   */
  listClass: 'geonef.jig.list.__Abstract__',

  /**
   * Input name
   *
   * @type {string}
   */
  name: '__row__',

  /**
   * Label for the null value
   *
   * @type {string}
   */
  nullLabel: '__Row__',

  /**
   * Maximum label length (geonef.jig.util.string.summarize used if needed)
   *
   * @type {number}
   */
  labelLength: 30, // 14

  /**
   *
   */
  labelField: 'name',

  /**
   * Current label (updated automatically from document's -labelField- prop)
   *
   * @type {string}
   */
  label: '',

  /**
   * Visible column of subarray
   *
   * @type {Array.<string>}
   */
  listVisibleColumns: [],

  /**
   * Page size for sub-list
   *
   * @type {number}
   */
  listPageLength: 5,

  /**
   * Initial filter for sub-list
   *
   * @type {Object}
   */
  initialFilter: {},

  /**
   * Custom params to pass to sub-list
   *
   * @type {Object}
   */
  listWidgetParams: {
    readOnly: true
  },

  /**
   * @type {(string|dijit._Widget)}
   */
  editionWidget: '',


  /**
   * Document identifier
   *
   * @type {string}
   */
  value: null,

  /**
   * @type {string}
   */
  requestApiModule: '',

  /**
   * @type {string}
   */
  requestApiAction: 'getFilterForId',

  /**
   * @inheritsDoc
   */
  templateString: dojo.cache('geonef.jig.input', 'templates/AbstractListRow.html'),

  /**
   * @inheritsDoc
   */
  widgetsInTemplate: true,

  /**
   * Once retrieved, document's properties are set to this property
   *
   * @type {Object}
   */
  document: null,

  ////////////////////////////////////////////////////////////////////
  //

  postMixInProperties: function() {
    // We need listAsyncInit as the listWidget will not exist before
    // dropDown is created, or we would use listWidget.asyncInit...
    // see code of method: postCreate
    this.listAsyncInit = new geonef.jig.Deferred();
    this.inherited(arguments);
    this.listWidgetParams = dojo.mixin({
        visibleColumns: this.listVisibleColumns.slice(0),
        pageLength: this.listPageLength
      }, this.listWidgetParams);
    if (!this.requestApiModule) {
      var _class = geonef.jig.util.getClass(this.listClass);
      this.requestApiModule = _class.prototype.queryApiModule;
    }
  },

  buildRendering: function() {
    this.listWidgetParams.selectionChangeTopic = this.id+'/listSelected';
    this.inherited(arguments);
    dojo.mixin(this.button.childWidgetParams, this.listWidgetParams);
  },

  postCreate: function() {
    this.inherited(arguments);
    this.subscribe(this.id+'/listSelected', 'rowSelected');
    var self = this;
    this.button.subWidgetLoaded.addCallback(dojo.hitch(this, 'onSubWidgetLoaded'));
  },

  onSubWidgetLoaded: function() {
    this.button.subWidget.connect(
      this.button.subWidget, 'afterRefresh', dojo.hitch(this,
      function() { this.button.subWidget.selectRows([this.value], 'uuid'); }));
    this.button.subWidget.queryWidget.attr
      ('value', this.initialFilter, false);

    // listWidget is loaded, so plug our listAsyncInit on its asyncInit
    // and its refreshReady on our listAsyncInit
    this.button.subWidget.refreshReady.dependsOn(this.listAsyncInit);
    this.listAsyncInit.dependsOn(this.button.subWidget.asyncInit);
    this.listAsyncInit.callback();
  },


  destroy: function() {
    this.listAsyncInit = null;
    this.inherited(arguments);
  },

  setNull: function() {
    this.attr('value', null);
  },

  _setLabelAttr: function(label) {
    if (this.nullButton) {
      dojo.style(this.nullButton.domNode, 'display',
                 label === null ? 'none' : '');
      this.buttonsUpdated();
    }
    if (label === null) {
      label = "["+this.value+"]";
    } else if (label) {
      label = geonef.jig.util.string.summarize(label, this.labelLength);
    } else {
      label = this.nullLabel;
    }
    this.button.attr('label', label);
  },

  _setValueAttr: function(value, fromSelect) {
    //console.log('_setValueAttr', this, arguments);
    if (!value){
      this.value = null;
      this.attr('label', null);
      this.onChange();
      return;
    }
    if (dojo.isObject(value) && value[this.labelField]) {
      this.value = value.uuid;
      this.attr('label', value[this.labelField]);
      return;
    }
    if (dojo.isObject(value)) {
      value = value.uuid;
    }
    if (value && value !== this.value) {
      this.value = value;
      this.requestId(value);
      //this.listWidget.selectRows([value], 'uuid');
    }
    this.onChange();
  },

  _setEditionWidgetAttr: function(widget) {
    this.editionWidget = widget;
    if (!!widget && this.value && this.document) {
      if (dojo.isString(widget)) {
        widget = dojo.string.substitute(widget, this.document, null, this);
        // console.log('_setEditionWidgetAttr', this, arguments,
        //             this.value, this.document, widget);
      }
      this.editionButton.childWidgetClass = widget;
      this.editionButton.childWidgetParams.id = this.id+'_'+this.value;
      this.editionButton.childWidgetParams.uuid = this.value;
      dojo.style(this.editionButton.domNode, 'display', '');
    } else {
      dojo.style(this.editionButton.domNode, 'display', 'none');
    }
    this.buttonsUpdated();
  },

  buttonsUpdated: function() {
    var nodes = dojo.query('> span', this.domNode)
                  .filter(function(n) {
                            return dojo.style(n, 'display') !== 'none'; });
    nodes.removeClass('jigFirstButton jigLastButton');
    // if (nodes.length === 1) {
    //   dojo.removeClass(nodes[0], 'jigFirstButton jigLastButton');
    // }
    if (nodes.length > 1) {
      dojo.addClass(nodes[0], 'jigFirstButton');
      dojo.addClass(nodes[nodes.length - 1], 'jigLastButton');
    }
  },

  requestId: function(id) {
    //console.log('requestId 1', this, this.name, id);
    var dep = this.listAsyncInit.dependsOnNew(); // wait for request
    var self = this;
    geonef.jig.api.request({
      module: this.requestApiModule,
      action: this.requestApiAction,
      id: id,
      scope: this,
      callback: dojo.hitch(this, 'onDocumentResponse', dep)
    });
  },

  /**
   * Process response of requestApiModule / requestApiAction
   *
   * @param {Function} dep Function that will be called after subWidget's async init
   * @param {Object} data API request response
   */
  onDocumentResponse: function(dep, data) {
    if (this._destroyed) { return; }
    this.document = data.document;
    this.attr('label', data.document[this.labelField]);
    this.attr('editionWidget', this.editionWidget);
    var self = this;
    this.button.subWidgetLoaded.addCallback(
      function() { // when listWidget is loaded
        self.button.subWidget.asyncInit.addCallback(
          function() { // when list is initialized
            self.button.subWidget.queryWidget.attr(
              'value', data.filter, false);
            //this.editionButton.childWidgetParams
            //dojo.connect(self.button.subWidget, 'afterRefresh', self,
            //function() { this.button.subWidget.selectRows([self.value], 'uuid'); });
            if (dep) {
              dep();
            }
          });
        });
  },

  rowSelected: function(list) {
    //console.log('ogrLayerSelected', this, arguments);
    var sel = list.getSelectedRows();
    if (sel.length) {
      this.document = dojo.mixin({}, sel[0]);
      this.attr('value', sel[0]);
    } else {
      this.attr('value', null);
    }
    this.onRowSelected(sel[0]);
  },

  onRowSelected: function() {
    // hook
  },

  onChange: function() {
    // hook
    //console.log('onChange; value:', this.value);
    this.attr('editionWidget', this.editionWidget);
  }

});
