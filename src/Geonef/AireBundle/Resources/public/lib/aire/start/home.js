dojo.provide('aire.start.home');

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

   var start = function() {
     dojo['require']('package.home');
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
