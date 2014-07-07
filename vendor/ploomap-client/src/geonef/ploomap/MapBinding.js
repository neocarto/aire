
dojo.provide("geonef.ploomap.MapBinding");

// used by code
// avoided (circular dep): geonef.ploomap.map.Classical

dojo.declare("geonef.ploomap.MapBinding", null,
{
  // summary:
  //            helper for widgets relying on a 'mapWidget' widget
  //
  // description:
  //            this class manages the events 'onMapBound' and 'onMapUnbound'
  //

  /**
   * Event: map is bound and ready to use
   *
   * @type {!geonef.jig.Deferred}
   */
  mapReady: null,

  _uiCreated: false,

  mapWidget: '',
  mapGetterWidget: '',

  /* obsolete, use this.mapReady.hasFired() instead*/
  _mapBound: false,

  autoFindMapWidget: true,

  postMixInProperties: function() {
    //console.log('postMixInProperties MapBinding', this, arguments);
    this.mapReady = new geonef.jig.Deferred();
    this.mapReady.addCallback(dojo.hitch(this, function() { this.onMapBound(); }));
    this.mapDep = this.mapReady.dependsOnNew();
    this.inherited(arguments);
    if (!this.mapWidget && this.autoFindMapWidget) {
      var ws = dijit.registry.filter(
        function(w) { return w.isInstanceOf(geonef.ploomap.map.Classical); });
      if (!ws.length) {
        console.error('did not found any map widget for:', this);
      }
      this.mapWidget = (ws.toArray())[0];
    }
  },

  startup: function() {
    this.inherited(arguments);
    this.mapReady.callback();
  },

  _getStateAttr: function() {
    var mapW = this.mapWidget;
    if (dojo.isObject(mapW)) {
      mapW = mapW.id;
    }
    return { mapWidget: mapW };
  },

  _setStateAttr: function(state) {
    if (state.mapWidget) {
      this.attr('mapWidget', state.mapWidget);
    }
    this.inherited(arguments);
  },

  _setMapWidgetAttr: function(mapWidget) {
    //console.log('_setMapWidgetAttr', this, arguments);
    this.mapWidget = dijit.byId(mapWidget);
    if (this.mapWidget) {
      this.mapReady.dependsOn(this.mapWidget.isGeoReady);
      this.mapDep();
    } else {
      // map is not even instanciated, so wait for notification
      this.mapWidget = mapWidget; // keep ID
      this.subscribe('ploomap/map/start',
                     function(w) {
                       if (w.id === mapWidget) {
                         this.mapWidget = w;
                         this.mapDep();
                       }
                     });
    }
    // var dep = this.mapReady.dependsOnNew();
    // this.mapDep();
    // delete this.mapDep;
    // this.connect(this, 'startup', 'checkBoundMap');
    // this.subscribe('ploomap/map/start',
    //   function(w) { if (w.id === id) this.checkBoundMap(); });
    // this.checkBoundMap();
  },

  _setMapGetterWidgetAttr: function(widget) {
    //console.log('set matGetterW', this, arguments);
    var _widget = dijit.byId(widget);
    if (!_widget) {
      console.error('invalid mapGetterWidget attr ID: ', widget);
    }
    var self = this;
    //console.log('_widg', _widget);
    _widget.afterMapBound(
      function() {
        //console.log('afterMapBound', self, 'of', _widget);
        //console.log('mapWidget is:', _widget.mapWidget);
        self.attr('mapWidget', _widget.mapWidget);
      });
  },

  // checkBoundMap: function() {
  //   //console.log('checkBoundMap', this);
  //   if (this._mapBound || !this.mapWidget || !this._started) {
  //     return;
  //   }
  //   var mapWidget = dijit.byId(this.mapWidget);
  //   if (!mapWidget || !mapWidget._started) {
  //     return;
  //   }
  //   this.mapWidget = mapWidget;
  //   this._mapBound = true;
  //   //console.log('map is bound', this, mapWidget);
  //   this.onMapBound();
  // },

  onMapBound: function() {
    //console.log('onMapBound (abstract)', this, arguments);
    // overload this method if needed
  },

  /**
   *
   * @obsolete use mapReady.addCallback() instead
   */
  afterMapBound: function(_function) {
    // summary:
    //          ensure _function is called after onMapBound has been called
    //
    // _function: function to call ; automatically bound with 'this'.
    //

    var _func = dojo.hitch(this, _function);
    this.mapReady.addCallback(_func);
    // if (this._mapBound) {
    //   _func();
    // } else {
    //   var _h;
    //   _h = this.connect(this, 'onMapBound',
    //         function() { this.disconnect(_h); _func(); });
    // }
  }

});
