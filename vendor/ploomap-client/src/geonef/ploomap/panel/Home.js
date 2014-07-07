
dojo.provide('geonef.ploomap.panel.Home');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.button.Link');
dojo.require('geonef.ploomap.tool.layerLibrary.AutoGrid');
dojo.require('geonef.ploomap.tool.MapTools');

// used in code
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.ploomap.panel.Home', [ dijit._Widget, dijit._Templated ],
{

  panelPath: "Accueil",
  noPanelBrowse: true,

  templateString: dojo.cache('geonef.ploomap.panel', 'templates/Home.html'),
  widgetsInTemplate: true,

  showCredits: function() {
    geonef.jig.workspace.autoAnchorInstanciate('geonef.sandbox.panel.Credits');
  },
  showFeedback: function() {
    geonef.jig.workspace.autoAnchorInstanciate('geonef.jig.tool.UserFeedback');
  }

});
