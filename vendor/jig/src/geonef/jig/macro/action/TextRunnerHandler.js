dojo.provide('geonef.jig.macro.action.TextRunnerHandler');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.button.Action');

dojo.declare('geonef.jig.macro.action.TextRunnerHandler', [ dijit._Widget, dijit._Templated ],
{
  // summary:
  //    like a toaster, but with the good behaviour for the TextRunner
  //

  templateString: dojo.cache('geonef.jig.macro.action', 'templates/TextRunnerHandler.html'),
  widgetsInTemplate: true,

  macroRunner: null,
  macroPlayer: null,

  autoPlace: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.macroPlayer = this.macroRunner.player;
  },

  postCreate: function() {
    this.inherited(arguments);
    //dojo.style(this.nextButton.domNode, 'display', 'none');
    if (this.autoPlace) {
      var place = this.macroRunner.controlPlacement || dojo.body();
      this.placeAt(place);
    }
  },

  clean: function() {
    //console.log('clean', this, arguments);
    dojo.query('> div', this.domNode).orphan();
  },

  print: function(text) {
    //console.log('print', this, arguments);
    return dojo.create('div', { innerHTML: text }, this.domNode);
  },

  showNextButton: function(onEnd) {
    dojo.style(this.macroPlayer.nextButton.domNode, 'display', '');
    //this.macroPlayer.nextButton.attr('disabled', false);
    if (onEnd) {
      geonef.jig.connectOnce(this.macroPlayer, 'nextButtonClick', this, onEnd);
    }
  }

  //nextButtonClick: function() {
    //this.nextButton.attr('disabled', true);
    //dojo.style(this.nextButton.domNode, 'display', 'none');
  //},

  //actionStop: function() {
    //console.log('actionStop', this, arguments);
    //this.macroRunner.stop();
  //}

});
