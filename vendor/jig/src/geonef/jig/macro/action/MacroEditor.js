
dojo.provide('geonef.jig.macro.action.MacroEditor');

// parents
dojo.require('geonef.jig.macro.action.Editor');

// for template
dojo.require('dijit.form.DropDownButton');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.jig.macro.action.MacroEditor', [ geonef.jig.macro.action.Editor ],
{
  // summary:
  //   Editor for textRunner properties
  //

  RUNNER_CLASS: 'geonef.jig.macro.action.MacroRunner',

  templateString: dojo.cache('geonef.jig.macro.action', 'templates/MacroEditor.html'),

  getSummary: function() {
    var value = this.attr('value');
    if (value.replay) { return "Rejouer"; }
    if (value.terminate) { return "Terminer"; }
    return "(aucune action)";
    /*var opts = [];
    if (value.terminate) { opts.push('T'); }
    opts = opts ? " [" + opts.join(",") + "]" : opts;
    return opts;*/
  }

});
