dojo.provide('geonef.jig.macro.action.TimeRunner');

// parents
dojo.require('geonef.jig.macro.action.Runner');

dojo.declare('geonef.jig.macro.action.TimeRunner', [ geonef.jig.macro.action.Runner ],
{
  // summary:
  //   Wait for a number of milliseconds
  //

  EDITOR_CLASS: 'geonef.jig.macro.action.TimeEditor',

  label: "Attente",

  // time: integer
  //    time to wait, in milliseconds
  time: 0,

  doPlay: function() {
    //console.log('doPlay (time)', this, arguments);
    this.timeoutHandler =
      window.setTimeout(dojo.hitch(this, 'onEnd'), this.time);
  },

  onEnd: function() {
    this.inherited(arguments);
    this.timeoutHandler = null;
  },


  stop: function() {
    this.inherited(arguments);
    if (this.timeoutHandler) {
      window.clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

});
