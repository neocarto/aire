

dojo.provide('geonef.ploomap.input.MsMapExtent');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('dijit.form.TextBox');

// used in code
dojo.require('geonef.jig.util.number');
dojo.require('geonef.jig.api');

dojo.declare('geonef.ploomap.input.MsMapExtent',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container ],
{
  // summary:
  //   Input to define an extent for MapScript map
  //

  value: [],
  nullLabel: 'Étendue...',

  templateString: dojo.cache('geonef.ploomap.input', 'templates/MsMapExtent.html'),
  widgetsInTemplate: true,
  label: '',
  arrayContainer: true,
  mapInput: '',

  getInputRootNodes: function() {
    return [this.dialog.domNode];
  },

  _setLabelAttr: function(label) {
    label = label || this.nullLabel;
    this.label = label;
    this.button.attr('label', label);
  },

  _getValueAttr: function() {
    //console.log('_getValueAttr', this, arguments);
    var value = this.inherited(arguments);
    if (value.every(
          function(v) {
            return dojo.trim(v) !== '' && !isNaN(parseInt(v)); }) &&
        value.length === 4) {
      value = value.map(function(v) { return parseFloat(v, 10); });
      this.nullButton.attr('disabled', false);
    } else {
      value = null;
      if (this.nullButton && this.nullButton.domNode) {
        this.nullButton.attr('disabled', true);
      }
    }
    //console.log('got value (mapExtent)', value, this);
    return value;
  },

  setNull: function() {
    this.attr('value', null);
  },

  onChange: function() {
    var extent = this.attr('value');
    var label;
    if (!extent || !extent.length) {
      label = null;
    } else {
      label = geonef.jig.util.number.formatDims(
          [extent[2] - extent[0], extent[3] - extent[1]],
          { joinSep: ' x ' });
    }
    this.attr('label', label);
  },

  _setMapInputAttr: function(mapInput) {
    //console.log('_setMapInputAttr', this, arguments, this.domNode,
    //           this.domNode.parentNode);
    if (mapInput === 'auto') {
      if (!this.domNode.parentNode) {
        geonef.jig.connectOnce(this, 'startup', this,
                        dojo.hitch(this, '_setMapInputAttr', 'auto'));
        return;
      }
      // get from ascendants
      mapInput = null;
      for (var node = this.domNode.parentNode; node; node = node.parentNode) {
        if (node.hasAttribute('widgetId')) {
          mapInput = dijit.byNode(node);
          break;
        }
      }
      if (!mapInput) {
        throw new Error('auto map input: not found in ascendants',
          this, 'parentNode:', this.domNode.parentNode);
      }
    }
    if (mapInput && dojo.isString(mapInput)) {
      mapInput = dijit.byId(mapInput);
    }
    this.mapInput = mapInput;
    dojo.style(this.computeButton.domNode, 'style', mapInput ? '' : 'none');
  },

  computeFromMap: function() {
    if (!this.mapInput) {
      throw new Error('no mapInput defined for MsMapExtent widget', this);
    }
    var value = this.mapInput.attr('value');
    delete value[this.name];
    var self = this;
    geonef.jig.api.request({
      module: this.mapInput.apiModule,
      action: 'computeExtent',
      map: value,
      callback: function(data) {
        self.attr('value', data.extent);
      }
    });
  }

});
