
dojo.provide('geonef.jig.macro.action.ScriptEditor');

// parents
dojo.require('geonef.jig.macro.action.Editor');

// for template
dojo.require('dijit.form.DropDownButton');
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.SimpleTextarea');
dojo.require('geonef.jig.input.BooleanCheckBox');
dojo.require('dijit.form.Select');

dojo.declare('geonef.jig.macro.action.ScriptEditor', [ geonef.jig.macro.action.Editor ],
{
  // summary:
  //   Editor for timeRunner properties
  //

  RUNNER_CLASS: 'geonef.jig.macro.action.ScriptRunner',

  templateString: dojo.cache('geonef.jig.macro.action', 'templates/ScriptEditor.html'),

  _getValueAttr: function() {
    var val = this.inherited(arguments);
    if (!val.defRunnerClass) {
      delete val.runnerClass;
    }
    delete val.defRunnerClass;
    return val;
  },

  _setValueAttr: function(value) {
    var val = dojo.mixin({ defRunnerClass: false }, value);
    if (val.runnerClass) {
      val.defRunnerClass = true;
    }
    geonef.jig.macro.action.Editor.prototype._setValueAttr.call(this, val);
  },

  onChange: function() {
    this.runnerClassInput.attr('disabled', !this.runnerClassCheckBox.attr('value'));
    this.inherited(arguments);
  },

  getSummary: function() {
    var value = this.attr('value');
    var t = '';
    if (value.script) {
      var script = dojo.trim(value.script);
      t = '' + script.split('\n').length + ' lignes';
    } else {
      t = '(non défini)';
    }
    var opts = [];
    if (value.scriptCallsOnEnd) { opts.push('L'); }
    if (value.runnerClass) { opts.push('C'); }
    opts = opts.length ? " [" + opts.join(",") + "]" : opts;
    return t + opts;
  }

});
