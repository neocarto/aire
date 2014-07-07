
dojo.provide('geonef.ploomap.input.Extent');

// parents
dojo.require('geonef.ploomap.input.ExtentView');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.ToggleButton');

// used in code
dojo.require('geonef.jig.clipboard');

dojo.declare('geonef.ploomap.input.Extent', geonef.ploomap.input.ExtentView,
{
  // summary:
  //    Special input for geographic extent. Provides rich UI to manipulate it.
  //
  // todo:
  //    - bookmarks
  //    - address history (autocomplete)
  //    - mouse cursor change on drawMode (layer div onMouseOver)
  //

  templateString: dojo.cache('geonef.ploomap.input', 'templates/Extent.html'),
  widgetsInTemplate: true,

  name: 'extent',
  value: undefined,

  hideSelectMapExtentButton: false,

  label: "Région",

  geocodingEnabled: false,
  _noHistory: true,

  postMixInProperties: function() {
    //console.log('prop', this, arguments);
    //window.tt = this;
    this.inherited(arguments);
    this.history = [];
    this.historyCurrent = Number.NaN;
  },

  buildRendering: function() {
    this.inherited(arguments);
    if (this.hideSelectMapExtentButton) {
      dojo.style(this.selectMapExtentButton.domNode, 'display', 'none');
    }
  },


  // EXTENT-RELATED
  /////////////////////////////////////////////////////////////

  _doSetValue: function(bounds) {
    var s = this.inherited(arguments);
    if (s) {
      this.pushToHistory(bounds);
    }
  },

  goZoom: function() {
    var value = this.attr('value');
    if (value) {
      this.attr('value', value.scale(0.5));
    }
  },

  goUnZoom: function() {
    var value = this.attr('value');
    if (value) {
      this.attr('value', value.scale(2));
    }
  },

  selectMapExtent: function() {
    this.isMapExtent = true;
    this.destroyVectorLayer();
    this.attr('label', this.label);
    this.onChange();
  },


  // RECTANGLE TRACING FUNCTIONALITY
  /////////////////////////////////////////////////////////////

  toggleDraw: function(state) {
    this.afterMapBound(
      function() {
        var _dh
        , _destroyDrawControl = dojo.hitch(this,
          function() {
            if (_dh) { this.disconnect(_dh); _dh = null; }
            if (this.drawControl) {
              this.drawControl.deactivate();
              this.mapWidget.map.removeControl(this.drawControl);
              this.drawControl.destroy(); // forgotten
              this.drawControl = null;
              this.destroyVectorLayer();
              this.toggleDrawButton.attr('checked', false);
            }
          });
        if (state) {
          if (this.drawControl) { return; }
          var _drawEnd = dojo.hitch(this,
              function(feature) {
                window.setTimeout(dojo.hitch(this,
                  function() {
                    this.attr('value', feature.geometry.getBounds());
                    _destroyDrawControl();
                  }), 10);
              });
          this.createVectorLayer();
          this.drawControl = new OpenLayers.Control.DrawFeature(
                               this.vectorLayer, OpenLayers.Handler.RegularPolygon,
                                 { handlerOptions: { sides: 4, irregular: true },
                                   featureAdded: _drawEnd });
          this.connect(this.drawControl.handler, 'activate',
                       function() {
                         if (this.drawControl.handler.layer) {
                           this.drawControl.handler.layer.controllerWidget = this;
                         }
                       });
          _dh = this.connect(this, 'destroyVectorLayer', _destroyDrawControl);
          this.mapWidget.map.addControl(this.drawControl);
          this.drawControl.activate();
          dojo.publish('jig/workspace/flash', ['Mode tracé activé.']);
          dojo.publish('jig/workspace/flash', ['Veuillez cliquer puis déplacer pour définir le rectangle.']);
        } else {
          _destroyDrawControl();
        }
      });
  },

  createVectorLayer: function() {
    //console.log('createVectorLayer', this, arguments);
    if (!this.vectorLayer) {
      this.vectorLayer = new OpenLayers.Layer.Vector(
        'Région : tracé', { maxResolution: 'auto', controllerWidget: this,
                            displayInLayerSwitcher: false });
      this.mapWidget.map.addLayer(this.vectorLayer);
    }
    // add feature
    if (!this.isMapExtent) {
      var bounds = this.attr('value');
      if (bounds) {
        var feature = new OpenLayers.Feature.Vector(bounds.toGeometry());
        this.vectorLayer.destroyFeatures();
        this.vectorLayer.addFeatures([feature]);
      }
    }
  },

  destroyVectorLayer: function() {
    if (this.vectorLayer) {
      //this.mapWidget.map.removeLayer(this.vectorLayer);
      this.mapWidget.destroyLayerWithEffect(this.vectorLayer);
      this.vectorLayer = null;
    }

  },

  onDialogOpen: function() {
    this.dialogOpen = true;
    this.createVectorLayer();
    /*if (this.vectorLayer) {
      this.vectorLayer.setVisibility(true);
    }*/
  },

  onDialogClose: function() {
    this.dialogOpen = false;
    if (this.vectorLayer && !this.drawControl) {
      //this.vectorLayer.setVisibility(false);
      this.destroyVectorLayer();
    }
  },


  // HISTORY FUNCTIONALITY
  /////////////////////////////////////////////////////////////

  goBackward: function() {
    this.goHistory(-1);
  },

  goForward: function() {
    this.goHistory(1);
  },

  pushToHistory: function(bounds) {
    if (this._noHistory) { return; }
    if (this.historyCurrent !== this.history.length - 1 && !isNaN(this.historyCurrent)) {
      var self = this;
      dojo.query('> li', this.historyNode).slice(0, this.history.length - this.historyCurrent - 1)
        .forEach(function(li) { self.historyNode.removeChild(li); });
      this.history.splice(this.historyCurrent + 1, this.history.length - this.historyCurrent);
    }
    var current = this.historyCurrent = this.history.push(bounds) - 1;
    var label = ''+current+' - '+this.formatSize(bounds);
    var self = this,
      node = dojo.create('li',
        {
          onclick: function() { self.goHistory(current, true); },
          innerHTML: label,
          'class': 'link item'
        }, this.historyNode, 'first');
    this.onHistoryChange();
  },

  goHistory: function(shift, isIndex) {
    if (!this.history.length) { return false; }
    //console.log('goHistory', arguments);
    var idx = isIndex ? shift : this.historyCurrent + shift;
    if (idx < 0) { idx = 0; }
    if (idx >= this.history.length) { idx = this.history.length - 1; }
    if (idx === this.historyCurrent) { return false; }
    this.historyCurrent = idx;
    this._noHistory = true;
    this._doSetValue(this.history[this.historyCurrent]);
    this._noHistory = false;
    this.onHistoryChange();
    return idx;
  },

  onHistoryChange: function() {
    // this.goBackwardButton.attr('disabled', !(this.historyCurrent > 0));
    // this.goForwardButton.attr('disabled',  !(this.historyCurrent < this.history.length - 1));
  },


  // CLIPBOARD FUNCTIONALITY
  /////////////////////////////////////////////////////////////

  pasteFromClipboard: function() {
    var obj = geonef.jig.clipboard.fetch('extent');
    if (!dojo.isArray(obj)) {
      alert('Aucune région à coller !');
      return;
    };
    var value = OpenLayers.Bounds.fromArray(obj);
    console.log('paste location', value);
    this.attr('value', value);
    dojo.publish('jig/workspace/flash', [ 'Région collée depuis le presse-papier' ]);
  },

  // copyToClipboard defined in geonef.ploomap.input.ExtentView

});
