
dojo.provide('geonef.jig.layout.StackContainer');

// parent
dojo.require('dijit.layout.StackContainer');
dojo.require('geonef.jig.layout._StateContainer');

dojo.declare('geonef.jig.layout.StackContainer',
             [ dijit.layout.StackContainer, geonef.jig.layout._StateContainer ],
{
  neverEmpty: false,

  addChild: function(child) {
    var dc = dojo.connect;
    child._tabCnt = [
      dc(child, 'uninitialize', this, function() {
           this.removeChild(child);
           var children = this.getChildren();
           if (children.length > 0) {
             this.selectChild(children[0]);
           }
         })
    ];
    this.inherited(arguments);
    if (this._started) {
      this.selectChild(child);
    }
  },

  removeChild: function(child, keepIntact) {
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
    var index = this.getChildren().indexOf(oldChild);
    this.removeChild(oldChild, true);
    this.addChild(newChild, index);
  },

  // resize: function(newSize, currentSize){
  //   this.inherited(arguments);
  // },

  _setStateAttr: function(state) {
    this.inherited(arguments);
    this.neverEmpty = state.neverEmpty;
  }

});
