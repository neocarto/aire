dojo.provide('geonef.jig.macro.action.ScriptRunner');

// parents
dojo.require('geonef.jig.macro.action.Runner');

// code
dojo.require('geonef.jig.util');

dojo.declare('geonef.jig.macro.action.ScriptRunner', [ geonef.jig.macro.action.Runner ],
{
  // summary:
  //   Run custom script
  //

  EDITOR_CLASS: 'geonef.jig.macro.action.ScriptEditor',

  label: "Script",

  script: '',

  scriptCallsOnEnd: false,

  runnerClass: '',

  doPlay: function() {
    if (this.runnerClass) {
      //console.log('using class', this.runnerClass, this);
      var Class = geonef.jig.util.getClass(this.runnerClass);
      this.subObj = new Class(
        {
          macroRunner: this.macroRunner,
          doPlay: dojo.hitch(this, 'playScript'),
          onEnd: dojo.hitch(this, 'onEnd')
        });
      //console.log('sub-obj', this.subObj);
      this.subObj.play();
    } else {
      this.subObj = null;
      this.playScript();
    }
  },

  playScript: function() {
    //console.log('doPlay (text)', this, arguments);
    var error = false;
    var script = dojo.trim(this.script);
    var obj = this.subObj || this;
    try {
      var v = (function() { return eval(script); }).call(obj);
    }
    catch (e) {
      console.warn('error in action eval script', script);
      console.warn('sub-object is:', obj);
      console.warn('actual object is:', this);
      console.warn('thrown exception:', e);
      alert('Une erreur a eu lieu dans le script :\n' + e);
      error = true;
    }
    //console.log('script finished, retval:', v, script, this);
    if (!this.scriptCallsOnEnd || error) {
      this.onEnd();
      this.subObj = null;
    }
  },

  onEnd: function() {
    if (this.subObj) {
      this.subObj.destroy();
      this.subObj = null;
    }
    this.inherited(arguments);
  },

  stop: function() {
    if (this.subObj) {
      this.subObj.stop();
      this.subObj.destroy();
      this.subObj = null;
    }
    this.inherited(arguments);
  }

});
