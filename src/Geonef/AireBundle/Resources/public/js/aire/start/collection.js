dojo.provide('aire.start.collection');

/**
 * AIRE - view "set" - start function
 *
 */
(function() {

   var deps = ['OpenLayers'];

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
     dojo['require']('package.set');
     geonef.jig.workspace.initialize({ data: workspaceData });
     dojo.parser.parse();
     // var rootC = dijit.byId('rootContainer');
     // console.log('init', this, rootC);
     // rootC.connect(window, 'onresize', onResize);
     // onResize();
     if (window.aireCollection.startMap) {
       var startMap = window.aireCollection.startMap;
       var mapW = dijit.byId('map');
       var def = mapW.layersDefs.layers.filter(function(d) {
                   return d.code === startMap; })[0];
       if (def) {
         mapW.layersDefs.addLayerToMap(def.name);
       } else {
         alert("Carte initiale non définie : "+startMap);
       }
       //map.showMap(window.mapSet.startMap);
     }
     // var workspace = geonef.jig.workspace.loadWidget('root');
     // workspace.placeOnWindow();
     // workspace.startup();
     // dojo.style('wait', 'display', 'none');
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
