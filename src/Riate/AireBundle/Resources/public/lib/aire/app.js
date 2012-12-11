
dojo.provide('aire.app');

dojo.require('dojo.hash');
dojo.require('dojo.i18n');
dojo.requireLocalization('aire', 'app');


/*
 * Provide app management & global AIRE actions
 */
dojo.mixin(aire.app, {

  setLayout: function(layout) {
    dojo.removeClass(dojo.body(), aire.app.layout);
    aire.app.layout = layout;
    dojo.addClass(dojo.body(), aire.app.layout);
  },

  showHelp: function(path, fromHashChange_) {
    //console.log('showHelp', arguments);
    if (path === true) {
      path = '';
    }
    if (dojo.isString(path)) {
      if (path === '') {
        path = 'index.'+aire.app.locale+'.php';
      }
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
    window.open('/map/'+mapId+'/svg/'+aire.app.locale, mapId+'svg');
  },

  exportPrint: function() {
    var mapId = aire.app.map.map.baseLayer.name;
    // var qs = '';
    // if (aire.app.map.map.getZoom() !== 0) {
    //   qs = '?extent='+aire.app.map.map.getExtent().toBBOX();
    // }
    var center = aire.app.map.map.getCenter();
    var qs = '?loc='+center.toShortString().replace(/ /g, '')
      +'&res='+aire.app.map.map.getResolution();
    var url = '/map/'+mapId+'/print/'+aire.app.locale+qs;
    var winId = mapId+'print';
    window.open(url, winId);
  },

  exportData: function() {
    var mapId = aire.app.map.map.baseLayer.name;
    var qs = '';
    //if (aire.app.map.map.getZoom() !== 0) {
    //  qs = '?extent='+aire.app.map.map.getExtent().toBBOX();
    //}
    window.open('/map/'+mapId+'/csvFeatures/'+aire.app.locale+qs,
                mapId+'data');
  },

  updateLegend: function(state) {
    if (aire.app.map) {
      dojo.style(aire.app.map.legendContainer.domNode,
                 'display', state ? '' : 'none');
    }
  },

  showLayer: function(code) {
    //console.log('showLayer', this, arguments);
    var def = aire.app.map.layersDefs.layers.filter(
      function(d) { return d.code === code; })[0];
    if (!def) {
      def = aire.app.map.layersDefs.layers[0];
    }
    if (def) {
      aire.app.map.layersDefs.addLayerToMap(def.name);
    } else {
      alert(aire.app.i18n.undefinedStartMap+': '+code);
    }
  },

  setCenter: function() {
    aire.app.map.map.setCenter.apply(aire.app.map.map, arguments);
  },

  init: function() {
    aire.app.i18n = dojo.i18n.getLocalization('aire', 'app');
    aire.app.locale = dojo.body().getAttribute('lang');
    aire.app.layout = 'layoutNormal';
    aire.app.map = dijit.byId('map');
    dojo.query('#screen > tbody > tr > td.collections > .commentSmall')
        .connect('onclick', null, dojo.partial(dojo.hash, 'comment'));
    this.helpFrame = dojo.byId('helpFrame');
    dojo.connect(this.helpFrame, 'onload', null, dojo.
                 hitch(null, aire.app.onFrameLoad, this.helpFrame));
  },

  start: function() {
    dojo.query('td.reprs > .area').style('overflow', 'hidden');
    if (window.aireCollection.startMap) {
      var startMap = window.aireCollection.startMap;
      var mapW = dijit.byId('map');
      var def = mapW.layersDefs.layers.filter(function(d) {
                                                return d.code === startMap; })[0];
      if (def) {
        mapW.layersDefs.addLayerToMap(def.name);
      } else {
        alert(aire.app.i18n.undefinedStartMap+" : "+startMap);
      }
      //map.showMap(window.mapSet.startMap);
      var hash = dojo.hash();
      if (hash) {
        aire.app.onHashChange(hash);
      }
      dojo.subscribe('/dojo/hashchange', null, aire.app.onHashChange);
    }
  },

  onFrameLoad: function(frame) {
    //var path =  this.src.replace(/https?:\/\/[^/]+\/data\/help\//, '');
    var path =  frame.contentWindow.location.pathname
      .replace(/\/data\/help\//, '');
    //console.log('onload!', this, arguments, path);
    if (path) {
      var hash = 'help/'+path;
      if (dojo.hash() !== hash) {
        //console.log('current hash', dojo.hash(), 'different from', hash, 'setting..');
        dojo.hash(hash);
      }
    }
  },

  onHashChange: function(hash) {
    //console.log('onHashChange', this, arguments);
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
          aire.app.showHelp(path, true);
        } else {
          aire.app.showHelp(null, true);
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

});
