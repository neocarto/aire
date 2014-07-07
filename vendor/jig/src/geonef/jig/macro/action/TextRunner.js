dojo.provide('geonef.jig.macro.action.TextRunner');

// parents
dojo.require('geonef.jig.macro.action.Runner');

// used in code
dojo.require('geonef.jig.macro.action.TextRunnerHandler');

dojo.declare('geonef.jig.macro.action.TextRunner', [ geonef.jig.macro.action.Runner ],
{
  // summary:
  //   Display text in a toaster
  //

  EDITOR_CLASS: 'geonef.jig.macro.action.TextEditor',

  label: "Texte",

  // text: string
  //    text to display
  text: '',

  // clear: boolean
  //    former text is cleaned before this one is displayed,
  //    and this one is hidden if another text comes later
  clear: false,

  // duration: integer
  //    in milliseconds, time to live for the text
  duration: null,

  // style: object
  //    style to set to the DIV node, as taken by dojo.style()
  style: {},

  manualNext: false,


  doPlay: function() {
    //console.log('doPlay (text)', this, arguments);
    if (!this.macroRunner.handlers.text) {
      this.macroRunner.handlers.text =
        new geonef.jig.macro.action.TextRunnerHandler({ macroRunner: this.macroRunner });
    }
    if (this.clear) {
      this.macroRunner.handlers.text.clean();
    }
    if (this.text) {
      this.textDiv = this.macroRunner.handlers.text.print(this.text);
      dojo.style(this.textDiv, this.style);
      if (this.duration) {
        window.setTimeout(dojo.hitch(this, 'killText', this.duration));
      }
    }
    if (this.manualNext) {
      this.macroRunner.handlers.text.showNextButton(dojo.hitch(this, 'onEnd'));
    } else {
      this.onEnd();
    }
  },

  killText: function() {
    console.log('killText', this, arguments);
    if (this.textDiv) {
      dojo.destroy(this.textDiv);
    }
  }

});
