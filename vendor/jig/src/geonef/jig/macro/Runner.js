dojo.provide('geonef.jig.macro.Runner');

// parents
//dojo.require('');

// used in code
dojo.require('geonef.jig.util');

dojo.declare('geonef.jig.macro.Runner', null,
{
  // summary:
  //   not-UI class responsible for running the macro
  //
  // description
  //   It will usually be used and controlled by geonef.jig.macro.Player.
  //

  // macro: object
  //    Flat macro object, whose "actions" property is the list of actions
  macro: null,

  // controlPlacement: DOMEelement
  //    If set, the text runner handler will place itself there
  controlPlacement: null,


  /////////////////////////////////////////////////////////////
  // OBJECT LIFE CYCLE

  postscript: function(options) {
    //console.log('postscript', this, arguments);
    options = dojo.mixin(options);
    if (options.macro) {
      options.macro = dojo.mixin({}, options.macro);
    }
    dojo.mixin(this, options,
               { actions: [], handlers: {}, playing: false });
  },

  destroy: function() {
    //console.log('destroy', this, arguments);
    if (this.actions) {
      this.actions.forEach(function(action) { action.destroy(); });
      this.actions = null;
    }
    for (var i in this.handlers) {
      if (this.handlers.hasOwnProperty(i)) {
        this.handlers[i].destroy();
      }
    }
    this.handlers = null;
  },


  /////////////////////////////////////////////////////////////
  // RUNNER COMMANDS

  play: function() {
    //console.log('play', this, arguments);
    dojo.publish('jig/workspace/flash', ["Lecture de l\'animation..."]);
    if (!this.loadMacro()) {
      return;
    }
    this.playing = true;
    this.onPlay();
    this.startAction(this.actions[0]);
  },

  pause: function() {
    //console.log('pause', this, arguments);
    dojo.publish('jig/workspace/flash', ["Pause de l'animation"]);
    this.onPause();
    if (this.currentAction) {
      this.currentAction.pause();
    }
    this.playing = false;
  },

  stop: function() {
    //console.log('stop', this, arguments);
    dojo.publish('jig/workspace/flash', ["Arrêt de l'animation..."]);
    this.onStop();
    (this.actions || []).forEach(function(action) { action.stop(); });
    for (var i in this.handlers) {
      if (this.handlers.hasOwnProperty(i)) {
        this.handlers[i].destroy();
      }
    }
    this.handlers = {};
  },

  replay: function() {
    this.stop();
    this.play();
  },

  terminate: function() {
    dojo.publish('jig/workspace/flash', ["Fin de l'animation !"]);
    this.onEnd();
  },


  /////////////////////////////////////////////////////////////
  // INTERNAL

  loadMacro: function() {
    if (!this.macro) {
      console.error("no macro set!", this);
      return false;
    }
    if (!this.macro.actions || !this.macro.actions.length) {
      console.error("no actions in macro!", this.macro);
      return false;
    }
    this.actions = this.macro.actions.map(dojo.hitch(this, 'loadAction'));
    return true;
  },

  loadAction: function(struct) {
    var action
    , _class = geonef.jig.util.getClass(struct.type)
    , self = this
    ;
    action = new _class(
      dojo.mixin({}, struct, { onEnd: function() { self.onActionEnd(action); },
                               macroRunner: this }));
    return action;
  },

  startAction: function(action) {
    //console.log('startAction', this, arguments);
    this.currentAction = action;
    this.currentAction.play();
    this.onActionStart(action);
  },


  /////////////////////////////////////////////////////////////
  // HOOKS

  onPlay: function() {
    // hook
  },

  onPause: function() {
    // hook
  },

  onStop: function() {
    // hook
  },

  onEnd: function() {
    // hook
  },

  onActionStart: function(action) {
    // hook
  },

  onActionEnd: function(action) {
    //console.log('onActionEnd', this, arguments);
    var idx = this.actions.indexOf(action);
    if (this.playing) {
      if (idx === this.actions.length - 1) {
        // was the last action, now stopping
        //console.log('end of animation', this, arguments);
        this.terminate();
      } else {
        // run the next action
        this.startAction(this.actions[idx + 1]);
      }
    }
  }

});
