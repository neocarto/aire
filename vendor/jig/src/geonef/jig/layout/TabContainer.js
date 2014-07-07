
dojo.provide('geonef.jig.layout.TabContainer');

// parent
dojo.require('dijit.layout.TabContainer');
dojo.require('geonef.jig.layout._StateContainer');

dojo.declare('geonef.jig.layout.TabContainer',
             [ dijit.layout.TabContainer, geonef.jig.layout._StateContainer ],
{
  neverEmpty: false,

  addChild: function(child) {
    //console.log('TabC addChild', this, arguments);
    var dc = dojo.connect;
    child._tabCnt = [
      dc(child, 'uninitialize', this, function() { this.removeChild(child); })
    ];
    child.closable = true;
    this.inherited(arguments);
    if (this._started) {
      this.selectChild(child);
    }
    var self = this;
    window.setTimeout(
      function() {
        self.tablist.pane2button[child.id].onClickCloseButton =
          function(evt) {
            evt.stopPropagation();
            child.destroy();
          };
      });
  },

  removeChild: function(child, keepIntact) {
   // console.log('TabC removeChild', this, arguments);
    child._tabCnt.forEach(dojo.disconnect);
    child._tabCnt = null;
    this.inherited(arguments);
    if (!this.getChildren().length && !keepIntact && this.neverEmpty) {
      window.setTimeout(dojo.hitch(this,
        function() {
          var w = geonef.jig.workspace.loadWidget(this.neverEmpty);
          this.addChild(w);
        }), 300);
    }
  },

  replaceChild: function(oldChild, newChild) {
    //console.log('TabC replaceChild', oldChild, ' WITH ', newChild);
    var index = this.getChildren().indexOf(oldChild);
    this.removeChild(oldChild, true);
    this.addChild(newChild, index);
  },

  resize: function(newSize, currentSize){
    //console.log('TabC resize', this, arguments, dojo.contentBox(this.domNode));
    this.inherited(arguments);
    //console.log('TabC resize END');
  },

  // startup: function() {
  //   console.log('TabC startup', this, arguments);
  //   this.resize();
  //   this.inherited(arguments);
  //   this.resize();
  // },

  _setStateAttr: function(state) {
    //console.log('TabC setState', this, arguments);
    this.inherited(arguments);
    this.neverEmpty = state.neverEmpty;
  }

});
