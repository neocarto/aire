
dojo.provide('geonef.jig.data.list.header.pgLinkTable.Actions');

// parent
dojo.require('geonef.jig.list.header.generic.Actions');

dojo.declare('geonef.jig.data.list.header.pgLinkTable.Actions',
             geonef.jig.list.header.generic.Actions,
{

  buildRendering: function() {
    this.inherited(arguments);
    dojo.style(this.buttonNode.domNode, 'display', 'none');
  },

  buildCustomButtons: function() {
    this.buildButton('general', 'refreshList', 'Rachaîchir');
    this.buildButton('general', 'close', 'Fermer');
  }

});
