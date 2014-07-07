
dojo.provide('geonef.jig.widget._AsyncInit');

dojo.declare('geonef.jig.widget._AsyncInit', null,
{
  // summary:
  //   auto-manage dojo.Deferred for asynchronous widget initialization
  //

  /**
   * If true, call to asyncInit callback is left to the parent widget
   */
  incompleteAsyncInit: false,

  /**
   * Attach a control (Processing) widget for the deferred
   */
  asyncInitControl: true,

  postMixInProperties: function() {
    this.asyncInit = new geonef.jig.Deferred();
    if (this.asyncInitControl) {
      this.asyncInit.setControl(this.domNode);
    }
    this.asyncInit.addCallback(dojo.hitch(this, 'onAsyncInitEnd'));
    this.asyncInit.addErrback(dojo.hitch(this, 'asyncError'));
    this.inherited(arguments);
  },

  startup: function() {
    if (this._started) { return; }
    this._started = true;
    this.inherited(arguments);
    if (!this.incompleteAsyncInit) {
      //console.log('calling startup callback()', this, arguments);
      this.asyncInit.callback();
    }
  },

  asyncInitDone: function() {
    return !!this._asyncInitDone;
  },

  onAsyncInitEnd: function() {
    //console.log('onAsyncInitEnd :)', this, arguments);
    this._asyncInitDone = true;
    // hook
  },

  asyncError: function(error) {
    console.error('caught error in AsyncInit', error, this);
  }

});
