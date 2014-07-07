
dojo.provide('geonef.jig.list.edition.tool.ApplyProperty');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.button.Action');

dojo.declare('geonef.jig.list.edition.tool.ApplyProperty',
             [ dijit._Widget, dijit._Templated ],
{
  // summary:
  //   Offers buttons to apply the property to other maps...
  //

  propertiesWidget: null,

  field: {},

  templateString: dojo.cache('geonef.jig.list.edition.tool',
                             'templates/ApplyProperty.html'),

  widgetsInTemplate: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.recordListRow = this.propertiesWidget.recordListRow;
  },

  postCreate: function() {
    this.inherited(arguments);
    //this.subscribe
  },

  destroy: function() {
    this.recordListRow = null;
    this.inherited(arguments);
  },


  applyToSelection: function() {
    var listWidget = this.recordListRow.listWidget;
    console.log('listWidget', this, listWidget);
    var selection = listWidget.getSelectedRows();
    console.log('selection', this, selection);
  },

  applyToMapSet: function() {
    console.error('applyToMapSet in ZiG! :( (in tool.ApplyProperty)');
    // if (!recordListRow.mapSet) {
    //   window.alert('Pas de série associée à cette carte.');

    // }
  },

  applyToCategory: function() {

  }

});
