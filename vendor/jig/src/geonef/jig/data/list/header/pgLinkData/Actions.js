
dojo.provide('geonef.jig.data.list.header.pgLinkData.Actions');

// parent
dojo.require('geonef.jig.list.header.generic.Actions');

// used in code
dojo.require('geonef.jig.data.list.PgLinkData');

dojo.declare('geonef.jig.data.list.header.pgLinkData.Actions',
             geonef.jig.list.header.generic.Actions,
{

  buildRendering: function() {
    this.inherited(arguments);
    dojo.style(this.buttonNode.domNode, 'display', 'none');
  },

  buildCustomButtons: function() {
    this.buildButton('general', 'refreshList', 'Rachaîchir');
    this.buildButton('general', 'close', 'Fermer');
    this.buildBreak('general');
    this.buildButton('general', 'createRow', 'Créer une ligne');
    this.buildButton('selection', 'deleteRows', 'Supprimer');
    this.buildButtonContainer('view', "Vue");
    this.buildButton('view', 'renameView', "Renommer");
    this.buildButton('view', 'duplicateView', "Dupliquer");
    this.buildButton('view', 'deleteView', "Supprimer");
  },


  ////////////////////////////////////////////////////////////////////
  // Operations on ROWS

  createRow: function() {
    var list = this.getListWidget();
    var row = list.createRow({});
    row.placeAt(list.rowContainer);
    row.startup();
  },

  deleteRows: function(selection) {
    console.log('deleteSelected', this, arguments);
    var list = this.getListWidget();
    var ids = selection.map(function(r) { return r.attr('rowId'); });
    dojo.publish('jig/workspace/flash', ["Suppression de "+ids.join(', ')]);
    list.request({
      action: 'deleteRows',
      ids: ids,
      callback: function(resp) {
        dojo.publish('jig/workspace/flash', ["Suppression effectuée."]);
        list.refresh();
      }
    });
  },


  ////////////////////////////////////////////////////////////////////
  // Operations on the VIEW

  renameView: function() {
    var list = this.getListWidget();
    var title = window.prompt("Titre de la vue :", list.attr('title'));
    if (!title) { return; }
    var self = this;
    list.request({
      action: 'renameView',
      title: title,
      callback: function(resp) {
        list.attr('title', resp.title);
      }
    });
    dojo.publish('jig/pgLinkView/save', [list.viewId]);
  },

  duplicateView: function() {
    var list = this.getListWidget();
    var title = window.prompt("Titre de la nouvelle vue :", list.attr('title'));
    if (!title) { return; }
    var self = this;
    list.request({
      action: 'duplicateView',
      title: title,
      callback: function(resp) {
        if (resp.viewId) {
          geonef.jig.data.list.PgLinkData.prototype.open(resp.viewId);
        }
      }
    });
    dojo.publish('jig/pgLinkView/save', [list.viewId]);
  },

  deleteView: function() {
    if (!window.confirm("Supprimer cette vue ?")) { return; }
    var list = this.getListWidget();
    dojo.publish('jig/workspace/flash', ["Suppression de la vue..."]);
    var self = this;
    list.request({
      action: 'deleteView',
      callback: function(resp) {
        dojo.publish('jig/workspace/flash', ["Vue supprimée."]);
        self.close();
      }
    });
    dojo.publish('jig/pgLinkView/save', [list.viewId]);
  }

});
