
dojo.provide('geonef.ploomap.list.header.ogrDataSource.Actions');

// parent
dojo.require('geonef.jig.list.header.generic.Actions');

// used in code
dojo.require('geonef.ploomap.list.header.ogrDataSource.DriverList');
dojo.require('geonef.ploomap.list.header.ogrDataSource.AddList');

dojo.declare('geonef.ploomap.list.header.ogrDataSource.Actions',
             geonef.jig.list.header.generic.Actions,
{

  buildCustomButtons: function() {
    this.inherited(arguments);
    this.buildDDButton('general', geonef.ploomap.list.header.ogrDataSource.DriverList, 'Pilotes');
    this.buildBreak('selection');
    this.buildButton('selection', 'updateStatsSelected', 'Mettre à jour statistiques');
    this.buildButton('selection', 'updateLayersSelected', 'Détecter couches');
  },

  updateStatsSelected: function(selectedRows) {
    var list = this.getListWidget();
    list.request(
      {
        action: 'updateStats',
        uuids: selectedRows.map(function(r) { return r.attr('uuid'); }),
        callback: function(resp) {
          list.refresh();
        }
      });
  },

  updateLayersSelected: function(selectedRows) {
    var list = this.getListWidget();
    list.request(
      {
        action: 'updateLayers',
        uuids: selectedRows.map(function(r) { return r.attr('uuid'); }),
        callback: function(resp) {
          console.log('response', resp);
          list.refresh();
        }
      });
  }

});
