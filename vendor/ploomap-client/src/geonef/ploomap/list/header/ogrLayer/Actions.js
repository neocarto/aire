
dojo.provide('geonef.ploomap.list.header.ogrLayer.Actions');

// parent
dojo.require('geonef.jig.list.header.generic.Actions');

// used in code
dojo.require('geonef.ploomap.list.tool.ogrLayer.Copy');
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.ploomap.list.header.ogrLayer.Actions', geonef.jig.list.header.generic.Actions,
{

  buildCustomButtons: function() {
    this.inherited(arguments);
    this.buildButton('selection', 'copySelected', 'Copier...', 'first');
    this.buildBreak('selection');
    this.buildButton('selection', 'syncSelected', 'Synchroniser');
    this.buildButton('selection', 'softDeleteSelected', "Supp. l'entrée");
    // var refreshLayersButton =
    //   new geonef.jig.button.Action(
    //       { label: 'Rafraîchir', onClick: dojo.hitch(this, 'refreshLayer') });
    // refreshLayersButton.placeAt(this.selectionNode);
    // refreshLayersButton.startup();
  },

  syncSelected: function() {
    var list = this.getListWidget();
    var uuids = list.getSelectedRows().map(function(r) { return r.attr('uuid'); });
    list.request({
        action: 'refreshStats',
        uuids: uuids,
        callback: function(resp) {
          list.refresh();
        }
    });

  },

  softDeleteSelected: function(selection) {
    var list = this.getListWidget();
    var uuids = selection.map(function(r) { return r.attr('uuid'); });
    var txt = ''+uuids.length+' layers will be deleted (from this list only).\n'
      + 'Are you sure?';
    if (!confirm(txt)) {
      return;
    }
    list.request(
      {
        action: 'delete',
        uuids: uuids,
        soft: true,
        callback: function(resp) {
          list.refresh();
        }
      });
  },

  copySelected: function() {
    var list = this.getListWidget();
    var layers = list.getSelectedRows()
      .map(function(r) { return { uuid: r.attr('uuid'),
                                  info: r.attr('value') }; });
    var copyTool = new geonef.ploomap.list.tool.ogrLayer.Copy(
                     { layers: layers });
    geonef.jig.workspace.autoAnchorWidget(copyTool);
    copyTool.startup();
  }

});
