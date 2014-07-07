dojo.provide('geonef.jig.list.header.generic.Selection');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.list.header.generic.AbstractField');

// used in template
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.button.Action');

dojo.declare('geonef.jig.list.header.generic.Selection',
             [dijit._Widget, dijit._Templated,
              geonef.jig.list.header.generic.AbstractField],
{

  templateString: dojo.cache('geonef.jig.list.header.generic',
                             'templates/Selection.html'),

  //baseMsgKey: 'list.common.header.actions',

  /**
   * Whether we have widgets (attr dojoType="...")
   */
  widgetsInTemplate: true,

  buildRendering: function() {
    this.inherited(arguments);
    this.buildCustomButtons();
  },

  buildCustomButtons: function() {
    // to overload if needed
  },

  refreshList: function() {
    this.getListWidget().refresh();
  },

  selectAll: function() {
    this.getListWidget().getRows()
      .forEach(function(r) { r.attr('selected', true); });
  },

  unselectAll: function() {
    this.getListWidget().getSelectedRows()
      .forEach(function(r) { r.attr('selected', false); });
  },

  inverseSelection: function() {
    this.getListWidget().getRows()
      .forEach(function(r) { r.attr('selected', !r.attr('selected')); });
  }

});
