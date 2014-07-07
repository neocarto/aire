
dojo.provide('geonef.ploomap.macro.action.LayerEditor');

// parents
dojo.require('geonef.ploomap.macro.action.MapBindingEditor');

// for template
dojo.require('dijit.form.DropDownButton');
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.NumberSpinner');
dojo.require('geonef.jig.input.BooleanCheckBox');
dojo.require('geonef.ploomap.input.LibraryLayer');

dojo.declare('geonef.ploomap.macro.action.LayerEditor', [ geonef.ploomap.macro.action.MapBindingEditor ],
{
  // summary:
  //   Editor for layerRunner properties
  //

  RUNNER_CLASS: 'geonef.ploomap.macro.action.LayerRunner',

  templateString: dojo.cache('geonef.ploomap.macro.action', 'templates/LayerEditor.html'),

  _getValueAttr: function() {
    var value = this.inherited(arguments);
    if (value.layer) {
      value.layer = value.layer.name;
    }
    if (!value.hasDuration) {
      delete value.duration;
    }
    if (value.defOpacity) {
      value.opacity *= 0.01;
    } else {
      delete value.opacity;
    }
    if (!value.defVisibility) {
      delete value.visibility;
    }
    if (!value.defZIndex) {
      delete value.zIndex;
    }
    delete value.hasDuration;
    delete value.defOpacity;
    delete value.defVisibility;
    return value;
  },

  _setValueAttr: function(value) {
    var val = dojo.mixin(
      { defOpacity: false, defVisibility: false, hasDuration: false }, value);
    if (val.duration) {
      val.hasDuration = true;
    }
    if (val.opacity !== undefined && val.opacity !== null) {
      val.defOpacity = true;
      val.opacity = parseInt(Math.round(val.opacity * 100));
    }
    if (val.visibility !== undefined && val.visibility !== null) {
      val.defVisibility = true;
    }
    if (val.zIndex !== undefined && val.zIndex !== null) {
      val.defZIndex = true;
    }
    geonef.jig.macro.action.Editor.prototype._setValueAttr.call(this, val);
  },

  onChange: function() {
    this.durationInput.attr('disabled', !this.durationCheckBox.attr('value'));
    this.opacityInput.attr('disabled', !this.opacityCheckBox.attr('value'));
    this.visibilityInput.attr('disabled', !this.visibilityCheckBox.attr('value'));
    this.zIndexInput.attr('disabled', !this.zIndexCheckBox.attr('value'));
    this.inherited(arguments);
  },

  getSummary: function() {
    var value = this.attr('value');
    return value.layer ? this.layerInput.attr('value').title : '(indéfini)';
  }

});
