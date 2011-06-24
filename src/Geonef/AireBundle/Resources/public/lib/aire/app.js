
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

  showHelp: function(path) {
    console.log('showHelp', arguments);
    if (path === true) {
      path = '';
    }
    if (dojo.isString(path)) {
      dojo.byId('helpFrame').src = '/data/help/'+path;
    }
    aire.app.setLayout('layoutHelp');
  },

  setComment: function(state) {
    aire.app.setLayout(state ? 'layoutComment' : 'layoutNormal');
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

  showLayer: function(code) {
    console.log('showLayer', this, arguments);
    var def = aire.app.map.layersDefs.layers.filter(
      function(d) { return d.code === code; })[0];
    if (def) {
      aire.app.map.layersDefs.addLayerToMap(def.name);
    } else {
      alert("Carte non définie (pour cette collection) : "+code);
    }
  },

  setCenter: function() {
    console.log('setCenter', this, arguments);
    aire.app.map.map.setCenter.apply(aire.app.map.map, arguments);
  },

  init: function() {
    aire.app.layout = 'layoutNormal';
    aire.app.map = dijit.byId('map');
    dojo.query('#screen > tbody > tr > td.collections > .commentSmall')
        .connect('onclick', window,
                 dojo.hitch(aire.app, aire.app.setComment, true));
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
