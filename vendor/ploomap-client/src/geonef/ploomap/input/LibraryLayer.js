
dojo.provide('geonef.ploomap.input.LibraryLayer');

// parents
dojo.require('dijit.form.Select');
dojo.require('geonef.ploomap.MapBinding');

dojo.declare('geonef.ploomap.input.LibraryLayer',
             [ dijit.form.Select, geonef.ploomap.MapBinding ],
{
  // summary:
  //    Extends dijit.form.Select to provide a list of layers from the library
  //

  postMixInProperties: function() {
    this.inherited(arguments);
    if (dojo.isString(this.filter)) {
      this.filter = dojo.getObject(this.filter);
    }
  },

  filter: function(layer) {
    // overload this to filter the layers appearing in the list
    return true;
  },

  onMapBound: function() {
    this.createInitialOptions();
  },

  createInitialOptions: function() {
    var self = this;
    this.mapWidget.layersDefs.layers.filter(dojo.hitch(this, 'filter'))
      .forEach(function(layer) {
                 self.addOption(
                   { value: layer, label: self.getLayerLabel(layer) });
               });
  },

  _setValueAttr: function(value, priorityChange) {
    //console.log('_setValueAttr', this, arguments);
    if (dojo.isString(value)) {
      var options = this.getOptions();
      //console.log('options', options);
      var option = options.filter(function(o) { return o.value.name === value; })[0];
      //console.log('found', option);
      if (!option) {
        //console.error('value', value, 'not found in options', options, 'for', this);
      }
      dijit.form.Select.prototype._setValueAttr.call(this, option, priorityChange);
    } else {
      this.inherited(arguments);
    }
  },


  getLayerLabel: function(layer) {
    return layer.title || layer.name;
  },

  compare: function(/*anything*/val1, /*anything*/val2){
    // overload needed, as dijit implementation only works with scalar values
    return val1 === val2 ? 0 : 1;
  }

});
