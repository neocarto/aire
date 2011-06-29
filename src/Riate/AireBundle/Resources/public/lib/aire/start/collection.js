dojo.provide('aire.start.collection');

/**
 * AIRE - view "set" - start function
 *
 */
(function() {

   var deps = [];

   var workspaceData = {
     widgets: {}
   };

   var init = function() {
      dojo.registerModulePath('dojo', '/lib/dojo');
      dojo.registerModulePath('dijit', '/lib/dijit');
      dojo.registerModulePath('dojox', '/lib/dojox');
      dojo.registerModulePath('geonef', '/lib/geonef');
      dojo.registerModulePath('aire', '/lib/aire');
      dojo.registerModulePath('package', '/lib/package');
   };

   // var onResize = function() {
   //   var rootC = dijit.byId('rootContainer');
   //   //console.log('resize', rootC);
   //   rootC.resize();
   // };

   var start = function() {
     dojo['require']('package.collection');
     geonef.jig.workspace.initialize({ data: workspaceData });
     dojo.parser.parse();
     aire.app.init();
     aire.app.start();
   };

   var attempt = function() {
     if (deps.every(function(p) { return !!dojo.getObject(p); })) {
       init();
       start();
     } else {
       window.setTimeout(attempt, 200);
     }
   };

   dojo.addOnLoad(attempt);

 })();
