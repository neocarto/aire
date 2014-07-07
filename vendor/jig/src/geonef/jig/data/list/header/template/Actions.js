
dojo.provide('geonef.jig.data.list.header.template.Actions');

// parents
dojo.require('geonef.jig.list.header.generic.Actions');

// used in code
// (none)

dojo.declare('geonef.jig.data.list.header.template.Actions',
             geonef.jig.list.header.generic.Actions,
{
  titleProp: 'title',

  buildLocaleSelect: true,

  // buildCustomButtons: function() {
  //   this.inherited(arguments);
  //   this.buildDDButton('general', geonef.ploomap.data.list.header.gdalDataset.DriverList, 'Pilotes');
  //   this.buildButton('selection', 'syncSelected', 'Mettre à jour');
  // },

  // syncSelected: function(selectedRows) {
  //   var list = this.getListWidget();
  //   list.request(
  //     {
  //       action: 'sync',
  //       uuids: selectedRows.map(function(r) { return r.attr('uuid'); }),
  //       callback: function(resp) {
  //         list.refresh();
  //       }
  //     });
  // }

});
