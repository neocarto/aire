
dojo.provide('geonef.ploomap.list.tool.ogrLayer.Copy');
dojo.provide('geonef.ploomap.list.tool.ogrLayer._CopyLayer');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');

// used in templates
dojo.require('geonef.jig.input.AbstractListRow');
dojo.require('geonef.jig.input.List');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.ploomap.list.record.OgrLayer');

// used in code
dojo.require('geonef.jig.api');

dojo.declare('geonef.ploomap.list.tool.ogrLayer.Copy',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container ],
{
  // summary:
  //   Form to request the copy of multiple OGR layers
  //

  title: 'Copie de couches',

  templateString: dojo.cache('geonef.ploomap.list.tool.ogrLayer',
                             'templates/Copy.html'),

  widgetsInTemplate: true,

  apiModule: 'listQuery.ogrLayer',

  startCopy: function() {
    var value = this.attr('value');
    this.clearLog();
    this.logEntry('*', 'REQUESTING...', 'Envoi de la requête. Attente...');
    geonef.jig.api.request(dojo.mixin(
      {
        module: this.apiModule,
        action: 'copy',
        callback: dojo.hitch(this, 'handleResponse', value)
      }, value)).setControl(this.domNode);
  },

  handleResponse: function(req, data) {
    //console.log('handleResponse', this, arguments);
    this.logEntry('*', 'DONE', 'Requête effectuée. Voir détails ci-dessous.');
    geonef.jig.forEach(data.layers,
      function(task, uuid) {
        var label = req.layers.filter(function(l) { return l.uuid === uuid; })[0].name;
        this.logEntry(label, 'UUID', uuid);
        this.logEntry(label, 'STATE', task.state);
        task.log.forEach(
          function(entry) {
            this.logEntry(label, entry.level+' | '+ entry.name, entry.message);
          }, this);
      }, this);
  },

  logEntry: function(ref, type, msg) {
    var tr = dojo.create('tr', {}, this.logNode)
    , td1 = dojo.create('td', { innerHTML: ref }, tr)
    , td2 = dojo.create('td', { innerHTML: type }, tr)
    , td3 = dojo.create('td', { innerHTML: msg }, tr)
    ;
  },

  _setLayersAttr: function(layers) {
    //console.log('_setLayersAttr', this, arguments);
    this.setSubValue('layers', layers);
  },

  _setValueAttr: function(value) {
    //console.log('_setValueAttr', this, arguments);
    this.inherited(arguments);
  },

  clearLog: function() {
    dojo.query('> *', this.logNode).orphan();
  },


});

dojo.declare('geonef.ploomap.list.tool.ogrLayer._CopyLayer',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container ],
{
  // summary:
  //   Form to request the copy of multiple OGR layers
  //

  templateString: dojo.cache('geonef.ploomap.list.tool.ogrLayer',
                             'templates/_CopyLayer.html'),

  widgetsInTemplate: true,

  uuid: null,

  getInputRootNodes: function() {
    return [ this.settingsNode ];
  },

  buildRendering: function() {
    this.inherited(arguments);
    dojo.style(this.infoGroup.selectCheckBoxNode.domNode.parentNode,
               'display', 'none');
    this.infoGroup.attr('selected', true);
  },

  _getValueAttr: function() {
    var value = this.inherited(arguments);
    value.uuid = this.uuid;
    return value;
  },

  _setValueAttr: function(value) {
    console.log('_setValueAttr', this, arguments);
    //console.dir(value);
    var current = this.attr('value');
    if (value.uuid) {
      this.attr('uuid', value.uuid);
      delete value.uuid;
    }
    if (value.info) {
      console.log('value.info', value.info);
      this.infoGroup.attr('value', value.info);
      if (!current.name && !value.name) {
        value.name = value.info.name.toLowerCase();
      }
      if (!current.geometryType && !value.geometryType) {
        value.geometryType = value.info.geometryType;
      }
      delete value.info;
    }
    geonef.jig.input._Container.prototype._setValueAttr.apply(this, [value]);
    //this.inherited(arguments);
  },

});
