
dojo.provide('geonef.ploomap.list.tool.map.Services');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// in template
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.SimpleTextarea');

// used in code
dojo.require('geonef.jig.api');
dojo.require('geonef.ploomap.list.tool.map.View');

dojo.declare('geonef.ploomap.list.tool.map.Services',
             [ dijit._Widget, dijit._Templated ],
{
  uuid: '',

  templateString: dojo.cache('geonef.ploomap.list.tool.map',
                             'templates/Services.html'),
  widgetsInTemplate: true,

  postCreate: function() {
    this.inherited(arguments);
    this.connect(this.tabContainer, 'onResize', 'onResize');
  },

  refreshMap: function() {
    this.getMapInfo();
  },

  _setUuidAttr: function(uuid) {
    this.uuid = uuid;
    this.refreshMap();
  },

  getMapInfo: function() {
    if (!this.uuid) { return; }
    geonef.jig.api.request(
      {
        module: 'listQuery.map',
        action: 'getWmsInfo',
        uuid: this.uuid,
        callback: dojo.hitch(this, 'updateMapRequest')
      }).setControl(this.domNode);
    this.clearBuild(false);
  },

  updateMapRequest: function(data) {
    this.owsUrlNode.innerHTML = data.url;
    this.owsUrlNode.href = data.url;
    this.wmsGetCapsUrlNode.innerHTML = data.urlGetCapabilitiesWms;
    this.wmsGetCapsUrlNode.href = data.urlGetCapabilitiesWms;
    this.wfsGetCapsUrlNode.innerHTML = data.urlGetCapabilitiesWfs;
    this.wfsGetCapsUrlNode.href = data.urlGetCapabilitiesWfs;
    while (this.exportNode.lastChild) {
      this.exportNode.removeChild(this.exportNode.lastChild);
    }
    geonef.jig.forEach(data.exports,
      function(url, key) {
        dojo.place(geonef.jig.makeDOM(['li', {},
            ['a', { href: url, target: '_blank' }, key]]), this.exportNode);
      }, this);
    while (this.sqlPane.containerNode.lastChild) {
      this.sqlPane.containerNode.removeChild(this.sqlPane.containerNode.lastChild);
    }
    if (data.sql) {
      geonef.jig.forEach(data.sql,
          function(sql, layer) {
            dojo.create('h2', { innerHTML:
              'Couche "'+layer+'", requête :'}, this.sqlPane.containerNode);
            dojo.create('p', { innerHTML: sql }, this.sqlPane.containerNode);
          }, this);
    }
      // + dojo.objectToQuery(
      // {
      //     SERVICE: 'WMS',
      //     VERSION: '1.1.1',
      //     REQUEST: 'GetCapabilities'
      // });
    this.onResize();
  },

  updateMapString: function(data) {
    this.mapFileArea.attr('value', data.mapString);
  },

  getMapString: function() {
    geonef.jig.api.request(
      {
        module: 'listQuery.map',
        action: 'getMapString',
        uuid: this.uuid,
        callback: dojo.hitch(this, 'updateMapString')
      }).setControl(this.mapFilePane.domNode);
  },

  clearBuild: function(rebuild_) {
    geonef.jig.api.request(
      {
        module: 'listQuery.map',
        action: 'clearBuild',
        uuids: [this.uuid],
        getMapString: rebuild_ === true,
        callback: dojo.hitch(this, 'updateMapString')
      }).setControl(this.mapFilePane.domNode);
  },

  rebuild: function() {
    this.clearBuild(true);
  },

  onResize: function() {
    // hook
  }

});
