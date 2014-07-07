
dojo.provide('geonef.ploomap.data.list.header.gdalDataset.DriverList');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in code
dojo.require('geonef.jig.api');
dojo.require('geonef.jig.button.Action');

dojo.declare('geonef.ploomap.data.list.header.gdalDataset.DriverList',
             [dijit._Widget, dijit._Templated],
{

  apiModule: 'listQuery.gdalDataset',

  apiAction: 'driverList',

  templateString: dojo.cache('geonef.ploomap.data.list.header.gdalDataset',
                             'templates/DriverList.html'),

  widgetsInTemplate: true,

  startup: function() {
    this.inherited(arguments);
    this.refresh();
  },

  refresh: function() {
    var self = this;
    dojo.query('> tr', self.listNode).forEach(
      function(tr) { self.listNode.removeChild(tr); });
    geonef.jig.api.request(
      {
        module: this.apiModule,
        action: this.apiAction,
        callback: function(resp) {
          resp.drivers.forEach(
            function(driver) {
              var dc = dojo.create
              , tr = dc('tr', {}, self.listNode)
              , td1 = dc('td', { innerHTML: driver.name }, tr)
              //, td2 = dc('td', { innerHTML: self.bool2nat(driver.creation) }, tr)
              ;
            });
          self.onResize();
        }
      }).setControl(this.domNode);
  },

  // bool2nat: function(val) {
  //   return val ? 'oui' : 'non';
  // },


});
