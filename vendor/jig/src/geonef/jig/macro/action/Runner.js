
dojo.provide('geonef.jig.macro.action.Runner');


dojo.declare('geonef.jig.macro.action.Runner', null,
{
  // summary:
  //   base class for all action classes
  //
  // description:
  //   The action is given a callback to be called when the action ends.
  //   But the action can very well do things taking longer. The callback
  //   just lets the macro runner to continue.
  //

  label: "Action",

  macroRunner: null,

  postscript: function(options) {
    dojo.mixin(this, options);
  },

  destroy: function() {
    this.macroRunner = null;
    this.inherited(arguments);
  },


  play: function() {
    //console.log('play action', this, arguments);
    this.doPlay();
  },

  pause: function() {
    // if it makes sense, pause the action in place
    //console.log('pause', this, arguments);
  },

  stop: function() {
    // clean everything
    //console.log('stop', this, arguments);
    if (this.animation) {
      this.animation.stop();
      this.animation = null;
    }
  },

  doPlay: function() {
    console.warn('doPlay must be overloaded!');
  },

  onEnd: function() {
    //console.log('onEnd', this, arguments);
  },

  getUniqueWidgetByClass: function(_class, filter) {
    var ws = dijit.registry.filter(
      function(w) { return w.isInstanceOf(_class); });
    if (filter) {
      ws = ws.filter(filter);
    }
    if (!ws.length) {
      console.error('did not found widget for given class', this, _class);
    }
    if (ws.length > 1) {
      console.error('found more than one widget for given class', ws, _class);
    }
    return (ws.toArray())[0];
  }

});
