
dojo.provide('geonef.ploomap.button.Workspace');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
//dojo.require('dijit.form.TextBox');
//dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.button.Link');

// used in code
//dojo.require('geonef.jig.api');
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.ploomap.button.Workspace', [ dijit._Widget, dijit._Templated ],
{
  templateString: dojo.cache('geonef.ploomap.button', 'templates/Workspace.html'),
  widgetsInTemplate: true,

  openFeedback: function() {
    geonef.jig.workspace.autoAnchorInstanciate('geonef.jig.tool.UserFeedback');
  },

  openCredits: function() {
    geonef.jig.workspace.autoAnchorInstanciate('geonef.sandbox.panel.Credits');
  },

  openHelp: function() {
    geonef.jig.workspace.autoAnchorInstanciate('geonef.sandbox.panel.Help');
  }

});
