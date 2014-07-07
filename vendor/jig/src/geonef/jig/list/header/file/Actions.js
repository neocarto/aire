
dojo.provide('geonef.jig.list.header.file.Actions');

dojo.require('geonef.jig.list.header.generic.Actions');

dojo.declare('geonef.jig.list.header.file.Actions',
             geonef.jig.list.header.generic.Actions,
{
  titleProp: 'name',

  buildCustomButtons: function() {
    this.buildBreak('selection');
    this.buildButton('selection', 'updateStatSelected', 'Mettre à jour');
  },

  updateStatSelected: function(selectedRows) {
    var list = this.getListWidget();
    list.request({
      action: 'updateStat',
      uuids: selectedRows.map(function(r) { return r.attr('uuid'); }),
      callback: function(resp) {
        list.refresh();
      }
    });
  },

});
