
dojo.provide('geonef.jig.start');


dojo.mixin(geonef.jig.start,
{
  // summary:
  //    Handles onLoad event and start the application
  //
  // description:
  //    This is an abstract (incomplete) object.
  //    The method loadApplication must be provided.
  //

  startApplication: function() {
    // programmatically replace this
  },

  loadPackages: function() {
    // programmatically replace this
  },

  loadApplication: function() {
    geonef.jig.start._initPackages();
    geonef.jig.start.loadPackages();
    geonef.jig.start._customSettings();
    geonef.jig.start.startApplication();
    return true;
  },

  _initPackages: function() {
    if (window.devMode) {
      dojo.registerModulePath('dojo', '/lib/dojo');
      dojo.registerModulePath('dijit', '/lib/dijit');
      dojo.registerModulePath('dojox', '/lib/dojox');
      dojo.registerModulePath('aire', '/lib/aire');
      dojo.registerModulePath('geonef', '/lib/geonef');
      dojo.registerModulePath('package', '/lib/package');
    } else {
      dojo.registerModulePath('package', '/x');
    }
  },

  _customSettings: function() {
    OpenLayers.ProxyHost = '/proxy?url=';
  }

});

if (!geonef.jig._startRegistered) {
  geonef.jig._startRegistered = true;
  dojo.addOnLoad(
    function() {
      // Workaround to wait for needed third-part apis to async load
      var checkFunction;
      checkFunction = function() {
        if (!window.workspaceObjDeps ||
            window.workspaceObjDeps.every(
              function(p) { return !!dojo.getObject(p); })) {
          geonef.jig.start.loadApplication();
        } else {
          window.setTimeout(checkFunction, 200);
        }
      };
      checkFunction();
    });
}
