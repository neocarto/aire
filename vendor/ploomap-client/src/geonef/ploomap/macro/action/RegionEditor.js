
dojo.provide('geonef.ploomap.macro.action.RegionEditor');

// parents
dojo.require('geonef.ploomap.macro.action.MapBindingEditor');

// for template
dojo.require('dijit.form.DropDownButton');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.ploomap.input.Extent');
dojo.require('geonef.jig.input.BooleanCheckBox');
dojo.require('dijit.form.NumberSpinner');

dojo.declare('geonef.ploomap.macro.action.RegionEditor', [ geonef.ploomap.macro.action.MapBindingEditor ],
{
  // summary:
  //   Editor for regionRunner properties
  //

  RUNNER_CLASS: 'geonef.ploomap.macro.action.RegionRunner',

  templateString: dojo.cache('geonef.ploomap.macro.action', 'templates/RegionEditor.html'),

  _getValueAttr: function() {
    var value = this.inherited(arguments);
    if (value.region) {
      value.region = value.region.toArray();
    }
    if (!value.hasDuration) {
      delete value.duration;
    }
    delete value.hasDuration;
    return value;
  },

  _setValueAttr: function(value) {
    var val = dojo.mixin({ hasDuration: false }, value);
    if (val.region) {
      var b = val.region;
      val.region = new OpenLayers.Bounds(b[0], b[1], b[2], b[3]);
    }
    if (val.duration) {
      val.hasDuration = true;
    }
    geonef.jig.macro.action.Editor.prototype._setValueAttr.call(this, val);
  },

  onChange: function() {
    this.durationInput.attr('disabled', !this.durationCheckBox.attr('value'));
    this.inherited(arguments);
  },

  getSummary: function() {
    var value = this.attr('value');
    return (value.noZoomChange ?
            '<span style="text-decoration:line-through">zoom</span> ' :
            'zoom ') +
           this.extentInput.mainButton.attr('label');
  }

});
