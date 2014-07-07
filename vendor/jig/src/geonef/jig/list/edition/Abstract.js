
dojo.provide('geonef.jig.list.edition.Abstract');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');
dojo.require('geonef.jig.widget._AsyncInit');

// in template
dojo.require('dijit.form.TextBox');
dojo.require('geonef.jig.button.Action');

// in code
dojo.require('geonef.jig.api');

dojo.declare('geonef.jig.list.edition.Abstract',
             [dijit._Widget, dijit._Templated, geonef.jig.input._Container,
              geonef.jig.widget._AsyncInit],
{
  manageValueKeys: ['uuid', 'module'],
  uuid: '',

  apiModule: 'listQuery.***',

  apiLoadAction: 'loadDocument',
  apiSaveAction: 'saveDocument',

  /**
   * Whether the properties should be checked (server-side)
   *
   * @param boolean
   */
  checkProperties: false,

  apiSaveParams: {},

  module: '',

  recordListRow: '',

  titleProperty: '',

  hardTitle: '',

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    //uuid: { node: 'uuidNode', type: 'innerHTML' }
  }),

  widgetsInTemplate: true,

  asyncInitControl: false,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.asyncInit.deferCall(this, ['_setValueAttr', 'highlightPropCheck']);
    this.valueReady = new geonef.jig.Deferred();
    this.apiSaveParams = dojo.mixin({}, this.apiSaveParams);
    if (this.recordListRow) {
      this.recordListRow = dijit.byId(this.recordListRow);
    }
    if (this.uuid) {
      this.valueReady.dependsOn(this.loadValues(true)); // do it here to save time
    }
    this.valueReady.callback();
  },

  destroy: function() {
    this.recordListRow = null;
    this.inherited(arguments);
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.valueReady.setControl(this.domNode);
    if (this.checkProperties && this.listContainer) {
      this.checkNode = geonef.jig.makeDOM(
          ['div', { 'class': 'checkStatus' },
           [['span', { 'class': 'status' }],
            ['span', { 'class': 'msg' }],
            ['span', { attachPoint: 'showCheckNode' }]]], this);
      var self = this;
      new geonef.jig.button.Action({
          label: "Montrer",
          onClick: function() { self.highlightPropCheck(self.propCheck); }
        }, this.showCheckNode);
      this.showCheckNode = null;
      dojo.place(this.checkNode, this.listContainer, 'before');
    }
  },

  _setUuidAttr: function(uuid) {
    //console.log('_setUuidAttr', this, arguments);
    this.uuidNode.innerHTML = uuid;
    this.uuid = uuid;
    if (!uuid) {
      this.attr('value', null);
    }
  },

  _getUuidAttr: function() {
    return this.uuid ? this.uuid : null;
  },

  loadValues: function(noUiControl) {
    //console.log('loadValues', this, arguments);
    //if (!this.uuid || !this.uuid.length) { return; }
    var self = this;
    this.attr('disabled', true);
    //this.saveButton.attr('disabled', true);
    if (this.domNode) {
      dojo.addClass(this.domNode, 'loading');
    }
    var params = {
        module: this.apiModule,
        action: this.apiLoadAction,
        modelClass: this.module,
        uuid: this.attr('uuid'),
        locale: this.locale,
        callback: dojo.hitch(this, 'setValuesFromData')
    };
    // if (this.checkProperties) {
    //   params.checkProperties = true;
    // }
    var def = geonef.jig.api.request(params);
    if (!noUiControl) {
      //console.log('loadValues setControl', this, arguments);
      def.setControl(this.domNode);
    }
    return def;
  },

  setValuesFromData: function(data) {
    //console.log('setValuesFromData', this, arguments);
    if (this.propertyMap) {
      data.value = dojo.mixin({}, data.value);
      geonef.jig.forEach(this.propertyMap,
          function(serverP, clientP) {
            if (data.value.hasOwnProperty(serverP)) {
              data.value[clientP] = data.value[serverP];
              delete data.value[serverP];
            }
          });
    }
    this.origValue = data.value;
    this.attr('value', data.value);
    this.attr('disabled', false);
    if (this.domNode) { dojo.removeClass(this.domNode, 'loading'); }
    this.onObjectUpdate(data);
  },

  rollbackValues: function() {
    this.attr('value', this.origValue );
  },

  onChange: function() {
    //console.log('onChange!', this, arguments);
    //this.saveButton.attr('disabled', !this.validate());
  },

  saveValues: function() {
    if (!this.validate()) {
      console.err('validate() returned false');
      return null;
    }
    var self = this;
    var value = this.attr('value');
    this.preSave(value);
    //console.log('saving values', this, value); //return; //
    var params = dojo.mixin(
      {
        module: this.apiModule,
        action: this.apiSaveAction,
        value: value,
        locale: this.locale,
        callback: function(data) {
          self.origValue = data.value;
          self.postSave(data);
        }
      }, this.apiSaveParams);
    // if (this.checkProperties) {
    //   params.checkProperties = true;
    // }
    return geonef.jig.api.request(params).setControl(this.domNode);
  },

  preSave: function(value) {
    dojo.publish('jig/workspace/flash',
        [ 'Enregistrement de "'+this.attr('title')+'" ...' ]);
  },

  postSave: function(data) {
    //console.log('postSave', this, arguments);
    //this.saveButton.attr('disabled', true);
    this.setValuesFromData(data);
    geonef.jig.workspace.highlightWidget(this, 'done');
    dojo.publish('jig/workspace/flash', [ 'Enregistré.' ]);
    dojo.publish(this.saveNoticeChannel, [ data.value.uuid ]);
  },

  highlightPropCheck: function(data) {
    if (!data) { return; }
    dojo.removeClass(this.domNode, 'valid invalid');
    dojo.addClass(this.domNode, data.valid ? 'valid':'invalid');
    dojo.query('> .msg', this.checkNode).forEach(
        function(node) {
          node.innerHTML = data.valid ?
            "Les paramètres sont valides" :
            "Certains des paramètres sont invalides";
        });
    this.inherited(arguments);
    this.onResize();
  },

  onObjectUpdate: function(data) {
    //console.log('onObjectUpdate (abstract)', this, arguments);
    this.attr('title', this.attr('title'));
    if (this.checkProperties && data && data.value && data.value.propValidity) {
      this.propCheck = data.value.propValidity;
      this.highlightPropCheck(data.value.propValidity);
    }
  },

  _getTitleAttr: function() {
    var value = this.attr('value');
    return this.hardTitle || value[this.titleProperty];
  },

  onResize: function() {
    // hook
  }


});
