dojo.provide('aire.admin.Library');

dojo.require('geonef.jig.tool.Library');

dojo.declare('aire.admin.Library', geonef.jig.tool.Library,
{
  title: 'Administration',
  widgetListPath: 'workspaceData.settings.adminWidgets',
  cssClass: 'aireAdminLibrary'
});
