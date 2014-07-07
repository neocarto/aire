
dojo.provide('geonef.jig.data.list.header.pgLinkView.Actions');

// parent
dojo.require('geonef.jig.list.header.generic.Actions');

// used in code
dojo.require('geonef.jig.data.list.PgLinkData');
dojo.require('geonef.jig.data.list.PgLinkTable');

dojo.declare('geonef.jig.data.list.header.pgLinkView.Actions',
             geonef.jig.list.header.generic.Actions,
{

  buildRendering: function() {
    this.inherited(arguments);
    dojo.style(this.buttonNode.domNode, 'display', 'none');
  },

  buildCustomButtons: function() {
    this.buildButton('general', 'createNew', 'Nouvelle vue');
    this.buildButton('general', 'openTableList', 'Liste des tables ');
    this.inherited(arguments);
    this.buildButton('selection', 'rebuildViews', 'Réinitialiser');
  },

  createNew: function() {
    var title = window.prompt("Titre de la nouvelle vue ?");
    title = dojo.trim(title);
    if (!title) { return; }
    var list = this.getListWidget();
    list.request({
      action: 'createNew',
      title: title,
      callback: function(resp) {
        if (resp.viewId) {
          geonef.jig.data.list.PgLinkData.prototype.open(resp.viewId);
        }
      }
    });
    list.refresh();
  },

  openTableList: function() {
    var list = new geonef.jig.data.list.PgLinkTable();
    geonef.jig.workspace.autoAnchorWidget(list);
    list.startup();
  },

  rebuildViews: function(selection) {
    var list = this.getListWidget();
    var uuids = selection.map(function(r) { return r.attr('uuid'); });
    dojo.publish('jig/workspace/flash',
                 ["Réinitialisation de "+uuids.length+" vue(s)"]);
    list.request({
      action: 'rebuildViews',
      uuids: uuids,
      callback: function(resp) {
        dojo.publish('jig/workspace/flash', ["Réinitialisation effectuée."]);
        list.refresh();
      }
    });
  }

});
