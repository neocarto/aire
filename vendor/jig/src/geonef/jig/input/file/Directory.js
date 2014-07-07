dojo.provide('geonef.jig.input.file.Directory');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.input.Group');
dojo.require('geonef.jig.input.Label');
dojo.require('geonef.jig.list.File');

// used in code
dojo.require('geonef.jig.input.file.Upload');
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.api');

dojo.declare('geonef.jig.input.file.Directory', [ dijit._Widget, dijit._Templated ],
{
  // Summary:
  //    Directory management
  //

  name: 'directory',

  // dijit._Templated HTML template file
  templatePath: dojo.moduleUrl('geonef.jig.input.file', 'templates/Directory.html'),

  // Whether we have widgets (attr dojoType="...")
  widgetsInTemplate: true,

  // Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap),
    {
      notice: { node: 'noticeNode', type: 'innerHTML' },
      warning: { node: 'warningNode', type: 'innerHTML' },
      error: { node: 'errorNode', type: 'innerHTML' }
    }),

  notice: null,

  warning: null,

  error: null,

  media: {},

  title: 'File',

  uploadClass: 'geonef.jig.input.file.Upload',

  uploadClassParams: {},

  info: {},

  value: null,

  ////////////////////////////////////////////////////////////////
  // Widget lifecycle

  postMixInProperties: function() {
    this.inherited(arguments);
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.shrinkButton =
      this.dirList.queryWidget.actions.buildButton(
        'selection', dojo.hitch(this, 'setSelectedAsUniqueFile'),
        'Remplacer le rép.');
    this.dirList.connect(this.dirList, 'onSelectionChange', dojo.hitch(this,
        function() {
          this.shrinkButton.attr('disabled',
                                 this.dirList.getSelectedRows().length !== 1);
        }));
    this.shrinkButton.attr('disabled', true);
  },


  ////////////////////////////////////////////////////////////////
  // Getters/setters

  _getValueAttr: function() {
    return this.uuid;
  },

  _setValueAttr: function(value) {
    console.log('_setValueAttr', this, arguments);
    if (!value) {
      this.uuid = null;
      this.attr('info', null);
      dojo.style(this.newNode, 'display', '');
    } else {
      dojo.style(this.newNode, 'display', 'none');
      if (dojo.isObject(value)) {
        value = value.uuid;
      }
      this.uuid = value;
      this.queryFile(value);
    }
    this.onChange();
  },

  _setInfoAttr: function(info) {
    console.log('_setInfoAttr', this, arguments, this.dirList);
    this.info = info;
    this.infoGroup.attr('value', info);
    var isDir = info && info.module ? info.module === 'Directory' : undefined;
    dojo.style(this.fileNode, 'display', isDir === false ? '' : 'none');
    dojo.style(this.dirNode, 'display', isDir === true ? '' : 'none');
    if (isDir) {
      this.dirList.requestParams = dojo.mixin(
        {}, this.dirList.requestParams, { inDirectory: this.uuid });
      //this.dirList.attr('filter',
      //  { children: { op: 'referredByMany', value: this.uuid }});
      this.dirList.refresh();
    }
  },


  // __setMessageAttr: function(name, value) {
  //   //console.log('__setMessageAttr', arguments);
  //   this[name] = value;
  //   var node = this[name + 'Node'];
  //   if (dojo.isString(value) && value.length > 0) {
  //     dojo.style(node, 'display', '');
  //     node.innerHTML = value.replace("\n", "<br/>");
  //   } else {
  //     dojo.style(node, 'display', 'none');
  //     node.innerHTML = '';
  //   }
  // },


  ////////////////////////////////////////////////////////////////
  // Operating

  queryFile: function(uuid) {
    if (!uuid) { return; }
    geonef.jig.api.request(
      {
        module: 'file',
        action: 'getInfo',
        uuid: uuid,
        callback: dojo.hitch(this, 'onQueryResponse')
      });
  },

  onQueryResponse: function(data) {
    if (!data.uuid) { return; }
    var changed = this.uuid === data.uuid;
    this.uuid = data.uuid;
    this.attr('info', data.info);
    if (changed) {
      this.onChange();
    }
  },


  ////////////////////////////////////////////////////////////////
  // Actions


  uploadNewVersion: function() {
    //console.log('uploadNewVersion', this);
    var Class = geonef.jig.util.getClass(this.uploadClass);
    this.uploadWidget = new Class(this.uploadClassParams);
    //dojo.connect(this.uploadWidget, 'startSending', this, 'onUploadStart');
    this.uploadWidget.connect(this.uploadWidget, 'onChange',
                              dojo.hitch(this, 'onUploadChange'));
    this.uploadWidget.connect(this.uploadWidget, 'onUploadCancelButtonClick',
                              dojo.hitch(this, 'onCancelUpload'));
    this.uploadWidget.connect(this.uploadWidget, 'onUploadError',
                              dojo.hitch(this, 'onUploadError'));
    this.uploadWidget.connect(this.uploadWidget, 'onUploadTransportError',
                              dojo.hitch(this, 'onUploadError'));
    //dojo.style(this.actionNode, 'display', 'none');
    this.uploadWidget.placeAt(this.uploadNode);
    this.uploadWidget.startup();
  },

  destroyUploadWidget: function() {
    console.log('destroyUploadWidget', this, arguments);
    if (this.uploadWidget) {
      console.log('bef destroy', this, arguments);
      this.uploadWidget.destroy();
      this.uploadWidget = null;
      //dojo.style(this.actionNode, 'display', '');
    }
  },

  setNull: function() {
    this.attr('value', null);
  },

  moveIntoNewDirectory: function() {
    geonef.jig.api.request(
      {
        module: 'file',
        action: 'moveIntoNewDirectory',
        uuid: this.uuid,
        callback: dojo.hitch(this, 'onQueryResponse')
      });
  },

  setSelectedAsUniqueFile: function(selection) {
    if (selection.length !== 1) {
      throw new Error('setSelectedAsUniqueFile must get a ' +
                      'single-entry selection');
    }
    var uuid = selection[0].attr('uuid');
    geonef.jig.api.request(
      {
        module: 'file',
        action: 'shrinkDirectoryToFile',
        directory: this.uuid,
        file: uuid,
        callback: dojo.hitch(this, 'onQueryResponse')
      });
  },


  ////////////////////////////////////////////////////////////////
  // Event handlers

  /*onUploadStart: function() {
   },*/

  onCancelUpload: function() {
    this.destroyUploadWidget();
  },

  onUploadChange: function() {
    var value = this.uploadWidget ?
    	      this.uploadWidget.attr('value') : null;
    console.log('onUploadChange', this, value);
    this.attr('value', value);
    this.destroyUploadWidget();
  },

  onUploadError: function(msg) {
    //alert('Sorry, an error happened.');
    this.attr('error', msg);
    this.destroyUploadWidget();
  },

  onChange: function() {
    // hook
  },


});
