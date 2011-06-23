
dojo.provide('aire.app');

/*
 * Provide app management & global AIRE actions
 */
aire.app = {

  setLayout: function(layout) {
    dojo.removeClass(dojo.body(), aire.app.layout);
    aire.app.layout = layout;
    dojo.addClass(dojo.body(), aire.app.layout);
  },

  showHelp: function(state) {
    console.log('showHelp', arguments);
    aire.app.setLayout('layoutHelp');
  },

  setComment: function(state) {
    aire.app.setLayout('layoutComment');
  },

  exportSvg: function() {
    var mapId = aire.app.map.map.baseLayer.name;
    window.open('/map/'+mapId+'/svg', mapId+'-svg');
  },

  exportPrint: function() {
    var mapId = aire.app.map.map.baseLayer.name;
    var qs = '';
    if (aire.app.map.map.getZoom() !== 0) {
      qs = '?extent='+aire.app.map.map.getExtent().toBBOX();
    }
    window.open('/map/'+mapId+'/print'+qs, mapId+'-print');
  },

  exportData: function() {
    var mapId = aire.app.map.map.baseLayer.name;
    var qs = '';
    //if (aire.app.map.map.getZoom() !== 0) {
    //  qs = '?extent='+aire.app.map.map.getExtent().toBBOX();
    //}
    window.open('/map/'+mapId+'/csvFeatures'+qs, mapId+'-data');
  },

  updateLegend: function(state) {
    dojo.style(aire.app.map.legendContainer.domNode,
               'display', state ? '' : 'none');
  },

  init: function() {
    aire.app.layout = 'layoutNormal';
    aire.app.map = dijit.byId('map');
    dojo.connect(dojo.byId('showComment'), 'onclick', window,
                 dojo.hitch(aire.app, aire.app.setComment, true));
    dojo.connect(dojo.byId('hideComment'), 'onclick', window,
                 dojo.hitch(aire.app, aire.app.setComment, false));
    dojo.connect(dojo.byId('hideHelp'), 'onclick', window,
                 dojo.hitch(aire.app, aire.app.showHelp, false));

  },

  start: function() {
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

  },


};
