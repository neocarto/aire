
dojo.provide('geonef.ploomap.panel.layer.Simple');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
dojo.require('geonef.jig.widget.ButtonContainerMixin');

// used in code
dojo.require('geonef.ploomap.input.ExtentView');

/**
 * Panel widget for layer controllers
 *
 * Note: at destroy stage, the layer may be already removed from the map.
 */
dojo.declare('geonef.ploomap.panel.layer.Simple',
             [ geonef.jig.layout._Anchor, dijit._Templated,
               geonef.ploomap.MapBinding,
               geonef.jig.widget.ButtonContainerMixin ],
{
  layerTitle: '-',

  layerWidget: '',

  templateString: dojo.cache("geonef.ploomap.panel.layer", "templates/Simple.html"),
  widgetsInTemplate: true,


  postMixInProperties: function() {
    this.inherited(arguments);
    this.layerWidget = dijit.byId(this.layerWidget);
    this.layer = this.layerWidget.layer;
    this.layer.optWidget = this;
    //this.connect(this.layer, 'removeMap', this.destroy);
    this.setupEvents();
    this.panelPath = [ "Couches", this.layer.name ];
  },

  setupEvents: function() {
    this.layer.events.on({
      removed: this.onRemoved,
      scope: this
    });
  },

  onRemoved: function(event) {
    console.log('onRemoved', this, arguments);
    this.destroy();
  },

  //
  // UI UPDATE
  ///////////////////////////////////////////////

  buildButtons: function() {
    if (this.layer.vectorLayerName &&
        !(this.layer instanceof OpenLayers.Layer.Vector)) {
      this.buildButton('general', 'actionVectorLayer', "Afficher vecteurs");
    }
    if (this.layer.isBaseLayer) {
      dojo.style(this.titleNode, 'display', 'none');
    } else {
      this.buildButton('general', 'actionRemove', "Enlever");
    }
  },

  onMapBound: function() {
    this.setMetadata();
  },

  setMetadata: function() {
    var props = {
      description: 'Description',
      source: 'Source',
      url: 'En savoir plus',
      copyright: 'Droits',
      region: 'Région'
    };
    if (!dojo.isObject(this.layer.metadata)) {
      return;
    }
    for (var i in props) {
      if (props.hasOwnProperty(i) && this.layer.metadata.hasOwnProperty(i)) {
        var ct = this.layer.metadata[i];
        if (ct.search(/http:\/\//) === 0) {
          ct = '<a href="'+ct+'" target="_blank">'+ct+'</a>';
        }
        var tr = dojo.create('tr', {}, this.metadataListNode)
        , td1 = dojo.create('td', { 'class': 'n', innerHTML: props[i] }, tr)
        , td2 = dojo.create('td', { innerHTML: ct }, tr);
      }
    }
    this.addExtent();
  },

  addExtent: function() {
    if (this.layer.layerExtent || this.layer.isBaseLayer) {
      var tr = dojo.create('tr', {}, this.metadataListNode)
        , td1 = dojo.create('td', { 'class': 'n', innerHTML: "Étendue" }, tr)
        , td2 = dojo.create('td', {}, tr);
      this.extent = new geonef.ploomap.input.ExtentView({
                      mapWidget: this.mapWidget, autoPanMap: false });
      this.extent.attr('value', this.layer.layerExtent ||
                                this.layer.map.getMaxExtent());
      this.extent.placeAt(td2).startup();
    }
  },



  //
  // ACTIONS
  ///////////////////////////////////////////////

  onClose: function() {}, // hook

  actionRemove: function() {
    //console.log('remove simple', this, arguments);
    if (this.layer.controllerWidget) {
      geonef.jig.workspace.highlightWidget(this.layer.controllerWidget, 'warn');
    } else {
      this.mapWidget.destroyLayerWithEffect(this.layer);
      this.onClose();
    }
  },

  actionZoomToMaxExtent: function() {
    var extent = this.layer.layerExtent || this.layer.maxExtent;
    if (extent) {
      this.layer.map.zoomToExtent(extent, true);
    } else {
      dojo.publish('jig/workspace/flash', [ 'Étendue non définie pour cette couche' ]);
    }
  },

  actionOpacityWheel: function() {
    var self = this;
    if (this.opacityWheelButton.attr('checked')) {
      console.log('set handler', this, arguments);
      this.mapWidget.setMouseWheelHandler(
        function(dir) {
          var _o;
          self.layer.setOpacity(
            _o=Math.max(0.0, Math.min(1.0, self.layer.opacity + (dir > 0 ? 0.1 : -0.1))));
          console.log('setOp', self, _o);
        },
        function() { self.opacityWheelButton.attr('checked', false); });
    } else {
      this.mapWidget.setMouseWheelHandler(null, null);
    }
  },

  actionVectorLayer: function() {
    this.mapWidget.layersDefs.addLayerToMap(this.layer.vectorLayerName);
  }

});
