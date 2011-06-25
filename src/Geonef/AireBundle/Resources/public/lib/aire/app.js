
dojo.provide('aire.app');

dojo.require('dojo.hash');

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
      this.helpFrame.src = '/data/help/'+path;
    }
    aire.app.setLayout('layoutHelp');
    //dojo.hash(dojo.isString(path) ? 'help/'+path : 'help');
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
        .connect('onclick', null, dojo.hitch(null, dojo.hash, 'comment'));
    this.helpFrame = dojo.byId('helpFrame');
    dojo.connect(this.helpFrame, 'onload', this.helpFrame,
                 function() {
                   //var path =  this.src.replace(/https?:\/\/[^/]+\/data\/help\//, '');
                   var path =  this.contentWindow.location.pathname
                     .replace(/\/data\/help\//, '');
                   console.log('onload!', this, arguments, path);
                   dojo.hash('help/'+path);
                 });
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
       var hash = dojo.hash();
       if (hash) {
         aire.app.onHashChange(hash);
       }
       dojo.subscribe("/dojo/hashchange", null, aire.app.onHashChange);
     }
  },

  onHashChange: function(hash) {
    console.log('onHashChange', this, arguments);
    var handlers = {
      comment: function() {
        aire.app.setComment(true);
      },
      map: function() {
        aire.app.setLayout('layoutNormal');
      },
      help: function(p) {
        if (p.length > 0) {
          var path = p.join('/');
          aire.app.showHelp(path);
        } else {
          aire.app.showHelp();
        }
      }
    };

    if (hash === '') {
      hash = 'map';
    }
    var p = hash.split('/');
    var name = p.shift();
    if (!handlers[name]) {
      console.warn("hash not handled:", hash);
      return;
    }
    handlers[name](p);
  }

};
