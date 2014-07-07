dojo.provide('geonef.jig.macro.Player');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.macro.Runner');

dojo.declare('geonef.jig.macro.Player', [ geonef.jig.layout._Anchor, dijit._Templated ],
{
  // summary:
  //   Widget to play macros, with interactive commands
  //

  templateString: dojo.cache('geonef.jig.macro', 'templates/Player.html'),
  widgetsInTemplate: true,

  playing: true,

  macro: null,

  destroyOnStop: true,

  editorClass: 'geonef.jig.macro.Editor',

  postMixInProperties: function() {
    if (window._jigMacroPlayer) {
      throw new Error('a macro is already open!', window._jigMacroPlayer, this);
    }
    window._jigMacroPlayer = this;
    this.inherited(arguments);
  },

  destroy: function() {
    if (this.macroRunner) {
      this.macroRunner.destroy();
      this.macroRunner = null;
    }
    this.macro = null;
    window._jigMacroPlayer = null;
    this.inherited(arguments);
  },

  playMacro: function() {
    //console.log('playMacro', this, arguments);
    if (this.macroRunner) {
      this.macroRunner.play();
    }
  },

  replayMacro: function() {
    //console.log('playMacro', this, arguments);
    if (this.macroRunner) {
      this.macroRunner.replay();
    }
  },

  pauseMacro: function() {
    //console.log('pauseMacro', this, arguments);
    if (this.macroRunner) {
      this.macroRunner.pause();
    }
  },

  stopMacro: function() {
    //console.log('stopMacro', this, arguments);
    if (this.macroRunner) {
      this.macroRunner.stop();
    }
  },


  /////////////////////////////////////////////////////////////
  // ACTIONS + Getters/Setters

  _setMacroAttr: function(macro) {
    //console.log('_setMacroAttr', this, arguments);
    if (!macro) {
      dojo.style(this.playButton.domNode, 'display', 'none');
      return;
    }
    if (!dojo.isObject(macro)) {
      throw new Error('_setMacroAttr: macro must be an object', macro);
    }
    this.macro = macro;
    this.macroRunner = new geonef.jig.macro.Runner(
      {
        player: this,
        macro: this.macro,
        onPlay: dojo.hitch(this, 'onPlay'),
        onPause: dojo.hitch(this, 'onPause'),
        onStop: dojo.hitch(this, 'onStop'),
        onEnd: dojo.hitch(this, 'onEnd'),
        onActionStart: dojo.hitch(this, 'onActionStart'),
        controlPlacement: this.domNode
      });
    //this.playButton.attr('disabled', false);
    dojo.style(this.playButton.domNode, 'display', '');
  },

  _setPlayingAttr: function(state) {
    if (state) {
      if (!this.isPlaying) {
        this.playMacro();
      }
    } else {
      this.stopMacro();
    }
    //this.playButton.attr('checked', state);
  },

  onPlay: function() {
    //this.statusNode.innerHTML = 'Lecture...';
    //console.log('onPlay', this, arguments);
    this.isPlaying = true;
    this.stopButton.attr('disabled', false);
    dojo.style(this.messageNode, {display: 'none', textDecoration: 'none' });
    dojo.style(this.playButton.domNode, 'display', 'none');
    dojo.style(this.resumeButton.domNode, 'display', 'none');
    //dojo.style(this.pauseButton.domNode, 'display', '');
    dojo.style(this.nextButton.domNode, 'display', 'none');
    dojo.style(this.stopButton.domNode, 'display', '');
  },

  onPause: function() {
    //console.log('onPause', this, arguments);
    this.isPlaying = false;
    this.messageNode.innerHTML = '[ Pause ]';
    dojo.style(this.messageNode.domNode, {display: '', textDecoration: 'blink' });
    dojo.style(this.resumeButton.domNode, 'display', '');
    dojo.style(this.pauseButton.domNode, 'display', 'none');
    dojo.style(this.nextButton.domNode, 'display', 'none');
  },

  onStop: function() {
    //console.log('onStop', this, arguments);
    this.isPlaying = false;
    //this.statusNode.innerHTML = 'Stoppé';
    this.messageNode.innerHTML = '[ Arrêté ]';
    dojo.style(this.messageNode, {display: '', textDecoration: 'none' });
    dojo.style(this.playButton.domNode, 'display', '');
    dojo.style(this.resumeButton.domNode, 'display', 'none');
    dojo.style(this.pauseButton.domNode, 'display', 'none');
    dojo.style(this.nextButton.domNode, 'display', 'none');
    dojo.style(this.stopButton.domNode, 'display', 'none');
  },

  onEnd: function() {
    //this.statusNode.innerHTML = 'Fin !';
    this.messageNode.innerHTML = "[ Fin de la présentation ]";
    dojo.style(this.messageNode, {display: '', textDecoration: 'none' });
  },

  onActionStart: function(action) {
    //console.log('onActionStart', this, arguments);
    //this.infoNode.innerHTML = action.label ? action.label : 'Action...';
  },

  nextButtonClick: function() {
    dojo.style(this.nextButton.domNode, 'display', 'none');
    //this.nextButton.attr('disabled', true);
  },

  actionStop: function() {
    //console.log('actionStop', this, arguments);
    if (this.macroRunner) {
      this.macroRunner.stop();
    }
    if (this.destroyOnStop) {
      this.destroy();
    }
  },

  actionCreate: function() {
    var Editor = geonef.jig.util.getClass(this.editorClass);
    var editor = new Editor();
    geonef.jig.workspace.autoAnchorWidget(editor);
    editor.startup();
    var h = dojo.style(editor.domNode, 'height');
    h = parseInt(Math.round(h));
    // horrible workaround to make tabContainer layout correctly :-/
    [h+10, h].forEach(
      function() {
        dojo.style(editor.domNode, 'height', ''+h+'px');
        editor.resize();
      });
    return editor;
  },

  actionEdit: function() {
    if (!this.macro) {
      alert("Aucune présentation n'est chargée !");
      return;
    }
    var editor = this.actionCreate();
    editor.attr('macro', this.macro);
  }

});

geonef.jig.macro.Player.prototype.attemptPlay = function(macro) {
  if (window._jigMacroPlayer) {
    if (!window.confirm("Quitter la présentation en cours ?")) {
      return;
    }
  window._jigMacroPlayer.destroy();
    window._jigMacroPlayer = null;
  }
  var player = new geonef.jig.macro.Player({ macro: macro });
  player.placeAt(dojo.body(), 'first');
  player.startup();
  geonef.jig.workspace.highlightWidget(player, 'open');
  player.attr('playing', true);
};
