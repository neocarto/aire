
dojo.provide('geonef.ploomap.data.list.header.gdalDataset.Actions');

// parents
dojo.require('geonef.jig.list.header.generic.Actions');

// used in code
dojo.require('geonef.ploomap.data.list.header.gdalDataset.DriverList');

dojo.declare('geonef.ploomap.data.list.header.gdalDataset.Actions',
             geonef.jig.list.header.generic.Actions,
{
  titleProp: 'title',

  buildCustomButtons: function() {
    this.inherited(arguments);
    this.buildDDButton('general', geonef.ploomap.data.list.header.gdalDataset.DriverList, 'Pilotes');
    this.buildButton('selection', 'syncSelected', 'Mettre à jour');
  },

  syncSelected: function(selectedRows) {
    var list = this.getListWidget();
    list.request(
      {
        action: 'sync',
        uuids: selectedRows.map(function(r) { return r.attr('uuid'); }),
        callback: function(resp) {
          list.refresh();
        }
      });
  }

});
