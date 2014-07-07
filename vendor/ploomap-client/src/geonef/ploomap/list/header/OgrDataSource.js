
dojo.provide('geonef.ploomap.list.header.OgrDataSource');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.Module');
dojo.require('geonef.jig.list.header.generic.NumberField');
dojo.require('geonef.ploomap.list.header.ogrDataSource.Actions');
dojo.require('geonef.jig.list.header.action.CreateModuleButtons');
//dojo.require('geonef.ploomap.list.header.ogrDataSource.AddList');

dojo.declare('geonef.ploomap.list.header.OgrDataSource', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache('geonef.ploomap.list.header', 'templates/OgrDataSource.html'),

  // sort: Object
  //    Default sort
  sort: { name: 'uuid', desc: false },

  getNoReadOnlyWidgets: function() {
    return [
      /*this.actionsField.addButton,
      this.actionsField.duplicateButton,
      this.actionsField.deleteButton,
      this.actionsField.updateStatsButton,
      this.actionsField.selectAllButton,
      this.actionsField.unselectAllButton,
      this.actionsField.inverseSelectionButton*/
    ];
  },

  /*createNew: function() {
    var value = this.createNewInput.attr('value');
  },*/


});
