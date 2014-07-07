dojo.provide('geonef.jig.macro.action.MacroRunner');

// parents
dojo.require('geonef.jig.macro.action.Runner');

dojo.declare('geonef.jig.macro.action.MacroRunner', [ geonef.jig.macro.action.Runner ],
{
  // summary:
  //   Display text in a toaster
  //

  EDITOR_CLASS: 'geonef.jig.macro.action.MacroEditor',

  label: "Présentation",

  terminate: false,

  replay: false,

  doPlay: function() {
    //console.log('doPlay (text)', this, arguments);
    if (this.replay) {
      this.macroRunner.replay();
    } else if (this.terminate) {
      this.macroRunner.terminate();
    }
  }

});
