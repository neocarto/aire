dojo.provide('aire.start.print');

/**
 * AIRE - view "print" - start function
 *
 */
(function() {

   var deps = [];

   var workspaceData = {
     widgets: {}
   };

   var init = function() {
      dojo.registerModulePath('dojo', '/js/dojo');
      dojo.registerModulePath('dijit', '/js/dijit');
      dojo.registerModulePath('dojox', '/js/dojox');
      dojo.registerModulePath('jig', '/js/jig');
      dojo.registerModulePath('ploomap', '/js/ploomap');
      dojo.registerModulePath('aire', '/js/aire');
      dojo.registerModulePath('package', '/js/package');
   };

   // var onResize = function() {
   //   var rootC = dijit.byId('rootContainer');
   //   //console.log('resize', rootC);
   //   rootC.resize();
   // };

   var start = function() {
     dojo['require']('package.print');
     //geonef.jig.workspace.initialize({ data: workspaceData });
     dojo.parser.parse();
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
