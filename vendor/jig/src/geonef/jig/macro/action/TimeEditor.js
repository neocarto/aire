
dojo.provide('geonef.jig.macro.action.TimeEditor');

// parents
dojo.require('geonef.jig.macro.action.Editor');

// for template
dojo.require('dijit.form.DropDownButton');
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.NumberSpinner');

dojo.declare('geonef.jig.macro.action.TimeEditor', [ geonef.jig.macro.action.Editor ],
{
  // summary:
  //   Editor for timeRunner properties
  //

  RUNNER_CLASS: 'geonef.jig.macro.action.TimeRunner',

  templateString: dojo.cache('geonef.jig.macro.action', 'templates/TimeEditor.html'),

  getSummary: function() {
    var value = this.attr('value');
    if (isNaN(value.time)) {
      return '(non défini)';
    }
    return ''+value.time+' millisecondes';
  }

});
