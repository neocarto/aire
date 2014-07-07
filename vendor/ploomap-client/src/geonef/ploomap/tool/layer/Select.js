dojo.provide('geonef.ploomap.tool.layer.Select');

dojo.require('geonef.ploomap.tool.layer.Simple');
dojo.require('dijit.form.Select');

dojo.declare('geonef.ploomap.tool.layer.Select', geonef.ploomap.tool.layer.Simple,
{
  // summary:
  //    Provide the control for a group of layers - show one at a time (select menu)
  //

  visible: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.map = this.layer.map;
    this.mapWidget = this.map.mapWidget;
    this.layers = [];
    this.label = this.layer.isBaseLayer ? 'Fond' : this.layer.name.replace(/ .*/, '');
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.selectWidget = new dijit.form.Select();
    this.selectWidget.placeAt(this.mainNode);
  },

  initWidget: function() {
    this.connect(this.selectWidget, 'onChange', 'setCurrentLayer');
    // if (this.isBaseLayer)
    // this.layer.map.events.on({
    //                            changebaselayer: this
    // });
    this.isBaseLayer = this.layer.isBaseLayer;
    if (this.isBaseLayer) {
      this.connect(this.layer.map, 'setBaseLayer', 'setCurrentLayer');
    } else {
      this.connect(this.mapWidget, 'onZoomChange', 'onZoomChange');
    }
    if (this.layer.group) {
      this.group = this.layer.group;
    }
    this.addLayer(this.layer);
  },

  addLayer: function(layer) {
    //console.log('addLayer', this);
    if (!this.isBaseLayer) {
      if (this.layers.length) {
	layer.setVisibility(false);
      }
      this.connect(layer, 'setVisibility', 'updateVisibility');
      this.connect(this.layer, 'onReAddAttempt', 'onLayerReAddAttempt');
    }
    if (this.layers.length) {
      this.updateVisibility();
    }
    this.layers.push(layer);
    this.updateLayerSelectOption(layer);
    //layer.oldInRange = true;
    //this.onZoomChange();
    // This is done in map.Classical
    // if (layer !== this.layer) {
    //   geonef.jig.connectOnce(this.layer, 'destroy', this,
    //                   function() {
    //                     if (layer.map) {
    //                       console.log('also removing', layer);
    //                       layer.map.removeLayer(layer);
    //                       layer.destroy();
    //                     }
    //                   });
    // }
  },

  updateLayerSelectOption: function(layer) {
    //console.log('updateLayerOption', this, arguments);
    var option = this.selectWidget.getOptions(layer.id);
    var label = layer.isBaseLayer ? layer.name : layer.name.replace(/[^ ]* /, '');
    if (layer.inRange || layer.isBaseLayer) {
      if (!option) {
        this.selectWidget.addOption({ value: layer.id, label: label });
        if (this.selectWidget.options.length === 1) {
          this.onInRangeChange(true);
        }
      }
    } else {
      if (option) {
        this.selectWidget.removeOption(layer.id);
      }
      if (this.selectWidget.options.length === 0) {
        this.onInRangeChange(false);
      }
    }
  },

  actionRemove: function() {
    this.layers.forEach(
      function(layer) { layer.map.removeLayer(layer); });
  },

  /**
   * check all layers' visibility status & update UI accordingly
   */
  updateVisibility: function() {
    //console.log('updateVisibility', this);
    this.selectedLayer = null;
    var self = this;
    this.layers.forEach(
      function(l) {
	//console.log('* test', l.id, self.map.baseLayer.id);
	if (self.isBaseLayer ?
	    l === self.map.baseLayer : l.getVisibility()) {
	  self.selectedLayer = l;
	}
      });
    this.visibilityCheckBox.attr('checked', !!this.selectedLayer);
    if (this.selectedLayer) {
      this.selectWidget.attr('value', this.selectedLayer.id);
      this.checkVisibility(this.selectedLayer.inRange);
    }
  },

  toggleVisibility: function(state) {
    //console.log('toggleVisibility', state);
    this.visible = state;
    if (!this.selectedLayer) {
      this.selectedLayer = this.map.getLayer(this.selectWidget.attr('value'));
    }
    if (this.selectedLayer) {
      //console.log('in toogle vis', this.selectedLayer.id);
      if (this.selectedLayer.isBaseLayer && state) {
	this.map.setBaseLayer(this.selectedLayer);
      }
      this.selectedLayer.setVisibility(state);
    }
    //dojo.style(this.slider.domNode, 'display', state ? '' : 'none');
  },

  changeOpacity: function(value) {
    //console.log('changeOpacity', this, value);
    if (this.selectedLayer) {
      this.selectedLayer.setOpacity(value / 100);
    }
  },

  setCurrentLayer: function(layer) {
    //console.log('setCurrentLayer', this, arguments);
    if (!dojo.isObject(layer)) {
      layer = this.map.getLayer(layer);
    }
    if (this._wit_setCurrentLayer) {
      return;
    }
    this._wit_setCurrentLayer = true;
    layer.setOpacity(this.slider.attr('value') / 100);
    this.selectedLayer = layer;
    if (this.visible) {
      if (this.isBaseLayer) {
        this.map.setBaseLayer(this.selectedLayer);
      } else {
        this.layers.forEach(function(l) {
			      l.setVisibility(l === layer);
			    });
      }
      this.visibilityCheckBox.attr('checked', true);
      //dojo[layer.icon ? 'addClass' : 'removeClass'](this.domNode, 'withIcon');
      dojo.style(this.iconNode, 'backgroundImage',
                 layer.icon ? 'url('+layer.icon+')' : 'none');
    }
    if (this.selectWidget.attr('value') !== layer.id) {
      this.selectWidget.attr('value', layer.id);
    }
    this._wit_setCurrentLayer = false;
    this.layer = layer;
  },

  onZoomChange: function() {
    var self = this;
    this.layers.forEach(
      function(layer) {
        if (layer.inRange !== layer.oldInRange) {
          self.updateLayerSelectOption(layer);
        }
        layer.oldInRange = layer.inRange;
      });
  },

  setIndex: function(index) {
    var self = this;
    this.layers.forEach(function(layer) {
                          self.map.setLayerIndex(layer, index);
                        });
  },

  onInRangeChange: function(state) {
    dojo.style(this.selectWidget.domNode, 'display', state ? '' : 'none');
    this.inherited(arguments);
  },

  isSliderVisible: function() {
    var layer = this.selectedLayer;
    return layer && !layer.noOpacity &&
      !(layer instanceof OpenLayers.Layer.Vector) &&
      !layer.isBaseLayer && layer.inRange;
  }

});
