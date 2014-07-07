
dojo.provide('geonef.ploomap.list.header.map.Actions');

// parents
dojo.require('geonef.jig.list.header.generic.Actions');

// used in code
dojo.require('geonef.ploomap.data.edition.CommonMaps');
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.ploomap.list.header.map.Actions',
             geonef.jig.list.header.generic.Actions,
{

  /* overloaded */
  titleProp: 'title',

  /* overloaded */
  buildLocaleSelect: true,

  /* overloaded */
  buildCustomButtons: function() {
    this.inherited(arguments);
    this.buildButton('selection', 'clearBuildSelected',
                     "Reconstruire");
    this.buildButton('selection', 'editCommonSelected',
                     "Éditer ensemble");
  },

  clearBuildSelected: function(selectedRows) {
    var list = this.getListWidget();
    list.request(
      {
        action: 'clearBuild',
        uuids: selectedRows.map(function(r) { return r.attr('uuid'); }),
        callback: function(resp) {
          list.refresh();
        }
      });
  },

  editCommonSelected: function(selectedRows) {
    if (selectedRows.length < 2) {
      window.alert("L'édition commune n'est possible qu'à partir de 2 cartes sélectionnées.");
      return;
    }
    if (selectedRows.length > 10) {
      if (!window.confirm("Vous avez sélectionné "+selectedRows.length+
                          " cartes : c'est potentiellement lourd. Continuer ?")) {
        return;
      }
    }
    var widget = geonef.ploomap.data.edition.CommonMaps(
      { mapRows: selectedRows, locale: this.getListWidget().locale });
    geonef.jig.workspace.autoAnchorWidget(widget);
  }

});
