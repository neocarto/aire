
dojo.provide('geonef.ploomap.macro.action.MapEditor');

// parents
dojo.require('geonef.jig.macro.action.Editor');

// for template
dojo.require('dijit.form.DropDownButton');
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.NumberSpinner');
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.ploomap.macro.action.MapEditor', [ geonef.jig.macro.action.Editor ],
{
  // summary:
  //   Editor for mapRunner properties
  //

  RUNNER_CLASS: 'geonef.ploomap.macro.action.MapRunner',

  templateString: dojo.cache('geonef.ploomap.macro.action', 'templates/MapEditor.html'),

  _getValueAttr: function() {
    var value = this.inherited(arguments);
    if (value.relative) {
      value.zoomChange = value.zoom;
      delete value.zoom;
    }
    if (!value.hasDuration) {
      delete value.duration;
    }
    delete value.relative;
    delete value.hasDuration;
    return value;
  },

  _setValueAttr: function(value) {
    var val = dojo.mixin({ relative: false, hasDuration: false }, value);
    if (val.zoomChange && (val.zoom === undefined || val.zoom === null)) {
      val.zoom = val.zoomChange;
      val.relative = true;
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
    //console.log('getSum, value:', value);
    var s = 'zoom ';
    if (value.zoom !== undefined && value.zoom !== null &&
        !isNaN(value.zoom)) {
      s += 'absolu '+value.zoom;
    } else if (value.zoomChange) {
      s += 'relatif '+value.zoomChange;
    } else {
      s = '(indéfini)';
    }
    return s;
  }

});
