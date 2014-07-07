
dojo.provide('geonef.jig.start.loadWorkspace');

dojo.require('geonef.jig.start');

dojo.mixin(geonef.jig.start,
{
  loadPackages: function() {
    dojo['require'](window.startPackage || 'package.application');
    dojo['require']('geonef.jig.workspace');
  },

  startApplication: function() {
    geonef.jig.workspace.initialize({ data: window.workspaceData });
    var workspace = geonef.jig.workspace.loadWidget('root');
    workspace.placeOnWindow();
    workspace.startup();
    dojo.style('wait', 'display', 'none');
  }

});
