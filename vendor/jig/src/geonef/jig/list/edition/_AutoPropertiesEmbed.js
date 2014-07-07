
dojo.provide('geonef.jig.list.edition._AutoPropertiesEmbed');

// parent
dojo.require('geonef.jig.widget._AsyncInit');

// code
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.data.tool.generic.PropValidity');

dojo.declare('geonef.jig.list.edition._AutoPropertiesEmbed', null,
{
  // summary:
  //   Automatically manage a list of properties
  //
  // The concrete class must provide this.propertyListNode as a ref to the
  // node where property rows will be created.
  //
  // The concrete must also extend geonef.jig.widget._AsyncInit.
  //
  // The concrete class will usually extent geonef.jig.input._Container as
  // well, or using_AutoPropertiesEmbed make little sense.
  //

  apiModule: 'listQuery.__abstract__',

  defaultInputWidgets: {
    'string': 'dijit.form.TextBox',
    'integer': 'dijit.form.NumberSpinner',
    'float': 'dijit.form.NumberSpinner',
    'collection': 'geonef.jig.input.CollectionTextBox',
    'hash': 'geonef.jig.input.HashTextBox'
  },

  propertyTypes: {
  },

  /**
   * Mapping between client & server property names
   *
   * Keys are client names, values are server names
   *
   * @type {Object.<string, string>}
   */
  propertyMap: {
  },

  /**
   * Whether the properties should be checked (server-side)
   *
   * @param boolean
   */
  checkProperties: false,

  propertiesOrder: null,

  postMixInProperties: function() {
    this.propertyMap = dojo.mixin({}, this.propertyMap);
    this.propRows = {};
    this.propValids = {};
    this.inherited(arguments);
  },

  destroy: function() {
    geonef.jig.forEach(dojo.mixin({}, this.propRows),
      function(row) {
        this.destroyPropertyRow(row);
      }, this);
    this.propRows = null;
    this.inherited(arguments);
  },

  getPropertiesOrder: function() {
    return this.propertiesOrder || [];
  },

  onShow: function() {
    //console.log('onShow', this, arguments);
  },

  postCreate: function() {
    this.inherited(arguments);
    this.loadMetaData();
  },

  loadMetaData: function() {
    if (!this.metaData) {
      //console.log('loading metadata', this, arguments);
      var params = this.uuid ?
        { uuid: this.uuid } : { discriminator: this.module || null };
      this.asyncInit.dependsOn(
        geonef.jig.api.request(dojo.mixin(
          {
            module: this.apiModule,
            action: 'getMetaData',
            callback: dojo.hitch(this, 'setMetaData')
          }, params)));
    }
  },

  setMetaData: function(data) {
    //console.log('setMetaData', this, arguments, this.propertyMap);
    var self = this;
    this.metaData = data;
    var made = [];
    this.getPropertiesOrder().forEach(
      function(p) {
        var f = this.propertyMap.hasOwnProperty(p) ?
          this.propertyMap[p] : p;
        if (data.fieldMappings.hasOwnProperty(f) &&
            made.indexOf(p) === -1) {
          var fieldDef = data.fieldMappings[f];
          self.buildPropertyRow(p);
          made.push(p);
        }
      }, this);
    this.updateChildren();
    if (this.onResize) {
      this.onResize();
    }
    this.onObjectUpdate();
  },

  preSave: function(value) {
    geonef.jig.forEach(this.propertyMap,
      function(serverName, clientName) {
        if (value.hasOwnProperty(clientName)) {
          value[serverName] = value[clientName];
          delete value[clientName];
        }
      }, this);
    this.inherited(arguments);
  },

  buildPropertyRow: function(field) {
    if (this.propRows[field]) { return null; }
    var order = this.getPropertiesOrder().indexOf(field);
    if (order === -1) { return null; }
    var type = this.getTypeDef(field);
    var dc = dojo.create;
    var tr = dc('tr', { 'class': 'property '+field,
                        title: "Propriété : "+field },
                this.propertyListNode);
    var td1 = dc('td', { 'class': 'n' }, tr);
    if (this.checkProperties) {
      this.propValids[field] =
        new geonef.jig.data.tool.generic.PropValidity({ field: field });
      this.propValids[field].placeAt(td1);
      this.propValids[field].startup();
    }
    var name = dc('span', { innerHTML: field }, td1);
    var td2 = dc('td', { 'class': 'v' }, tr);
    var td3 = dc('td', { }, tr);
    var inputWidget = this.buildPropertyInput(field, type);
    if (this.onResize) {
      inputWidget.connect(inputWidget, 'onResize', dojo.hitch(this, 'onResize'));
    }
    inputWidget.placeAt(td2);
    inputWidget.startup();
    this.propRows[field] = tr;
    this.onPropertyRowAdded(tr);
    return tr;
  },

  onPropertyRowAdded: function(tr) {
    // hook
  },


  destroyPropertyRow: function(name) {
    var tr = this.propRows[name];
    //var tr = dojo.query('> tr.property.'+name, this.propertyListNode)[0];
    if (!tr) { return; }
    dijit.findWidgets(tr).forEach(
        function(w) { w.destroyRecursive(); });
    // var iw = this.getDescendants()
    //   .filter(function(w) { return w.name === name; })[0];
    // //console.log('destroyPropertyRow', this, arguments, iw);
    // if (!iw) { return; }
    // var tr = iw.domNode.parentNode/*td*/.parentNode/*tr*/;
    // iw.destroyRecursive();
    this.propertyListNode.removeChild(tr);
    delete this.propRows[name];
    delete this.propValids[name];
  },

  highlightPropCheck: function(data) {
    console.log('highlightPropCheck (_autoProps)', data);
    if (!data) { return; }
    this.inherited(arguments);
    if (data.errors) {
      geonef.jig.forEach(this.propValids,
                  function(p) { p.attr('error', null); });
      geonef.jig.forEach(data.errors,
          function(error, prop) {
            if (this.propValids[prop]) {
              this.propValids[prop].attr('error', error);
            }
          }, this);
    }
  },

  getTypeDef: function(field) {
    var type = { 'class': 'dijit.form.TextBox' };
    if (this.propertyTypes.hasOwnProperty(field)) {
      type = this.propertyTypes[field];
    }
    return type;
  },

  buildPropertyInput: function(field, type) {
    var Class = geonef.jig.util.getClass(type['class']);
    var widget = new Class(dojo.mixin({ name: field }, type['options']));
    if (type.attachEvents) {
      geonef.jig.forEach(type.attachEvents,
                 function(callback, event) {
                   widget.connect(widget, event, dojo.hitch(this, callback));
                 }, this);
    }
    return widget;
  },

  onObjectUpdate: function() {
    // hook
    this.inherited(arguments);
  }

});
