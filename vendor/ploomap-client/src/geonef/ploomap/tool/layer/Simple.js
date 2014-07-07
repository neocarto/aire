dojo.provide('geonef.ploomap.tool.layer.Simple');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.HorizontalSlider');

dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.button.Link');

dojo.require('geonef.jig.workspace');
dojo.require('geonef.jig.util');

dojo.declare('geonef.ploomap.tool.layer.Simple',
		[ dijit._Widget, dijit._Templated ],
{

  templateString: dojo.cache("geonef.ploomap.tool.layer", "templates/Simple.html"),

  widgetsInTemplate: true,

  label: '',

  defaultOptClass: 'geonef.ploomap.panel.layer.Simple',
  defaultVectorOptClass: 'geonef.ploomap.panel.layer.Vector',

  layersWidget: null,

  postMixInProperties: function() {
    this.inherited(arguments);
    //console.log('layer:', this.layer);
    //this.label = this.translateLayerName(this.layer.name);
    this.optClass = this.optClass || this.layer.optClass || this.getDefaultOptClass();
    dojo['require'](this.optClass);
  },

  postCreate: function() {
    // common
    this.inherited(arguments);
    this.initWidget();
  },

  initWidget: function() {
    // overloaded
    this.map = this.layer.map;
    this.map.events.register('changelayer', this, this.onChangeLayer);
    this.connect(this.map.mapWidget, 'onZoomChange', 'onZoomChange');
    this.connect(this.layer, 'onReAddAttempt', 'onLayerReAddAttempt');
    this.updateLabel();
    this.updateVisibility();
    this.updateOpacity();
    this.onInRangeChange(this.layer.inRange);
  },

  destroy: function() {
    //console.log('destroy Simple', this, arguments);
    this.map.events.unregister('changelayer', this, this.onChangeLayer);
    this.map = null;
    this.layer = null;
    this.inherited(arguments);
  },

  onLayerReAddAttempt: function() {
    this.labelClick();
    // geonef.jig.workspace.highlightWidget(this);
    // this.layer.setVisibility(true);
  },

  onChangeLayer: function(event) {
    //console.log('onChangeLayer', this, arguments);
    if (event.layer !== this.layer) { return; }
    var self = this;
    var handlers = {
      visibility: function() { self.updateVisibility(); },
      opacity: function() { self.updateOpacity(); },
      name: function() { self.updateLabel(); },
      order: function() { console.warn('TODO: reorder layers on changelayer event'); }
    };
    if (handlers.hasOwnProperty(event.property)) {
      handlers[event.property]();
    };
  },


  getDefaultOptClass: function() {
    return this.layer instanceof OpenLayers.Layer.Vector ?
      this.defaultVectorOptClass : this.defaultOptClass;
  },

  updateLabel: function() {
    var label = this.layer.title || this.layer.name;
    this.attr('label', label);
    if (this.layer.icon) {
      //dojo.addClass(this.domNode, 'withIcon');
      dojo.style(this.iconNode, 'backgroundImage', 'url('+this.layer.icon+')');
    }
  },

  /**
   * Check layer & options, update UI accordingly
   */
  updateVisibility: function() {
    //console.log('updateVisibility', this.layer, arguments);
    var state = this.layer.getVisibility();
    this.visibilityCheckBox.attr('checked', state);
    this.checkVisibility(this.layer.inRange);
  },

  /**
   * Should the slider be visible?
   */
  isSliderVisible: function() {
    return !this.layer.noOpacity &&
      !(this.layer instanceof OpenLayers.Layer.Vector) &&
      !this.layer.isBaseLayer && this.layer.inRange;
  },


  checkVisibility: function(inRange) {
    var state = this.visibilityCheckBox.attr('checked') && inRange;
    dojo.style(this.slider.domNode, 'display',
               state && this.isSliderVisible() ? '' : 'none');
    return state;
  },

  updateOpacity: function() {
    //console.log('updateOpacity!', this, arguments);
    var opacity = this.layer.opacity === null ? 1.0 : this.layer.opacity;
    this.slider.attr('value', opacity * 100);
  },

  toggleVisibility: function(state) {
    if (this.layer.isBaseLayer) {
      if (state) {
	this.layer.map.setBaseLayer(this.layer);
      }
    } else {
      this.layer.setVisibility(state);
    }
  },

  changeOpacity: function(value) {
    this.layer.setOpacity(value / 100);
  },

  onZoomChange: function() {
    var inRange = this.layer.inRange;
    //console.log('update state', inRange, this.layer.oldInRange);
    if (inRange !== this.layer.oldInRange) {
      this.onInRangeChange(inRange);
    }
    this.layer.oldInRange = inRange;
  },

  /**
   * Update UI for change in 'inRange'. Also check global visibility rules.
   */
  onInRangeChange: function(state) {
    //console.log('onInRangeChange', this, arguments);
    dojo[state ? 'removeClass' : 'addClass'](this.labelLink.domNode, 'notInRange');
    this.checkVisibility(state);
  },

  _setLabelAttr: function(label) {
    this.label = label;
    //this.labelNode.innerHTML = label;
    this.labelLink.attr('label', label);
    // if (this.button) {
    //   this.button.attr('label', label);
    // }
  },

  labelClick: function() {
    if (this.layer.controllerWidget) {
      geonef.jig.workspace.autoAnchorInstanciate('', this.layer.controllerWidget.id);
    } else {
      geonef.jig.workspace.autoAnchorInstanciate(
          this.optClass, 'panel_layer_'+this.layer.name, { layerWidget: this });
    }
  },


  setIndex: function(index) {
    this.layer.map.setLayerIndex(this.layer, index);
  }

});