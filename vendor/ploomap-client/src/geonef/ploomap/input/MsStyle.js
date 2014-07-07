
dojo.provide('geonef.ploomap.input.MsStyle');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');

// template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.input.Color');
dojo.require('dijit.form.TextBox');

dojo.declare('geonef.ploomap.input.MsStyle',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container ],
{
  // summary:
  //   Input for MapServer style defs
  //

  templateString: dojo.cache('geonef.ploomap.input', 'templates/MsStyle.html'),
  widgetsInTemplate: true,

  getInputRootNodes: function() {
    return [ this.dialog.domNode ];
  },

  /*startup: function() {
    this.inherited(arguments);
    console.log('startup', this, arguments);
    dojo.query('.dijitCheckBox', this.domNode)
        .map(dijit.byId)
        .forEach(function(w) { w.onChange(); });
  },*/

});
