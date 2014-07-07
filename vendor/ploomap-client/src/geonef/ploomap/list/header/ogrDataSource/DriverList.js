
dojo.provide('geonef.ploomap.list.header.ogrDataSource.DriverList');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in code
dojo.require('geonef.jig.api');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.ploomap.list.edition.ogrDataSource.Generic');

dojo.declare('geonef.ploomap.list.header.ogrDataSource.DriverList',
             [dijit._Widget, dijit._Templated],
{
  templateString: dojo.cache('geonef.ploomap.list.header.ogrDataSource',
                             'templates/DriverList.html'),

  widgetsInTemplate: true,

  apiModule: 'listQuery.ogrDataSource',

  apiAction: 'driverList',

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
              , td2 = dc('td', { innerHTML: self.bool2nat(driver.creation) }, tr)
              , td3 = dc('td', { innerHTML: self.bool2nat(driver.deletion) }, tr)
              /*, td4 = dc('td', {}, tr)
              , buttonNode = dc('button', { innerHTML: 'créer source' }, td4)
              , button = new geonef.jig.button.Action(
                { onClick: dojo.hitch(self, 'createSource', driver.name)},
                buttonNode)*/
              ;
            });
          self.onResize();
        }
      }).setControl(this.domNode);
  },

  bool2nat: function(val) {
    return val ? 'oui' : 'non';
  },

  createSource: function(driverName) {
    var getClass =
      geonef.ploomap.list.edition.ogrDataSource.Generic.prototype.getClassForDriver;
    var Class = getClass(driverName);
    var widget = new Class({ driver: driverName });
    geonef.jig.workspace.autoAnchorWidget(widget);
  }


});
