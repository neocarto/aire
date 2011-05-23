dojo.provide('aire.admin.Library');

dojo.require('jig.tool.Library');

dojo.declare('aire.admin.Library', jig.tool.Library,
{
  title: 'Administration',
  widgetListPath: 'workspaceData.settings.adminWidgets',
  cssClass: 'aireAdminLibrary'
});
