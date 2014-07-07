
dojo.provide('geonef.ploomap.list.tool.map.Check');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// in template
dojo.require('geonef.jig.button.Action');

dojo.declare('geonef.ploomap.list.tool.map.Check',
             [ dijit._Widget, dijit._Templated ],
{
  // summary:
  //   Map preview through WMS
  //
  // todo:
  //    Full OpenLayers navigation
  //

  uuid: '',

  templateString: dojo.cache('geonef.ploomap.list.tool.map',
                             'templates/Check.html'),
  widgetsInTemplate: true,

  refreshMap: function() {
    this.checkMap();
  },

  checkMap: function() {
    geonef.jig.api.request(
      {
        module: 'listQuery.map',
        action: 'checkProperties',
        uuid: this.uuid,
        callback: dojo.hitch(this, 'updateCheckLog')
      });
  },

  updateCheckLog: function(data) {
    console.log('updateCheckLog', this, arguments);
    while (this.contentNode.firstChild) {
      this.contentNode.removeChild(this.contentNode.firstChild);
    }
    geonef.jig.forEach(data.errors,
      function(error, prop) {
        dojo.create('div', { innerHTML: prop+' - '+error },
                    this.contentNode);
      }, this);
    this.onResize();
  },

  onResize: function() {
    // hook
  }

});
