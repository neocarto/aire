
dojo.provide('geonef.jig.list.record.generic.EditAction');

dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.jig.list.record.generic.EditAction', geonef.jig.button.Action,
{
  uuid: '',

  label: 'éditer',

  listWidget: '',

  postMixInProperties: function() {
    this.inherited(arguments);
    this.listWidget = dijit.byId(this.listWidget);
  },

  onClick: function() {
    if (!this.listWidget.editionWidgetClass) {
      throw new Error('admin widget has no "editionWidgetClass" property');
    }
    var Class = geonef.jig.util.getClass(this.listWidget.editionWidgetClass);
    var self = this;
    this.editionWidget = geonef.jig.workspace.loadWidget(
      this.uuid,
      function() { return new Class({ uuid: self.uuid }); });
    // this._cnt = [
    //   this.connect(this.editionWidget, 'destroy', 'onEditionDestroy'),
    //   this.connect(this.editionWidget, 'postSave', 'postSave')
    // ];
    geonef.jig.workspace.autoAnchorWidget(this.editionWidget);
  },

  // onEditionDestroy: function() {
  //   this._cnt.forEach(dojo.disconnect);
  // },

  // postSave: function() {
  //   console.log('postSave!', this, arguments);
  //   this.listWidget.refreshList();
  // },

  _setAdminWidgetAttr: function(adminWidget) {
    this.adminWidget = dijit.byId(adminWidget);
  }

});
