
dojo.provide('geonef.jig.layout.RootPane');

// parents
dojo.require('dijit.layout.ContentPane');
dojo.require('geonef.jig.layout._StateContainer');

// used by code
dojo.require('geonef.jig.layout.BorderContainer');
dojo.require('geonef.jig.widget.Toaster');

dojo.declare('geonef.jig.layout.RootPane',
		[ dijit.layout.ContentPane, geonef.jig.layout._StateContainer ],
{
  // summary:
  //    Root pane, managing a single child
  //
  // todo:
  //    - manage resize event properly (currently is a workaround)
  //

  doLayout: true,

  //content: '<b>hello!</b>',

  postCreate: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'jigLayoutRootPane');
  },

  startup: function() {
    //console.log('root pane startup', this, arguments);
    this.inherited(arguments);
    this.playFx();
  },


  placeOnWindow: function() {
    //console.log(this, 'RootPane placeOnWindow');
    dojo.style(this.domNode,
      { position: 'absolute', top: '0', right: '0', bottom: '0', left: '0' });
    dojo.place(this.domNode, dojo.body());
    this.resize();
  },

  addChild: function(child, noStyle) {
    //var box = dojo.contentBox(this.domNode);
    //console.log('RootPane addChild', this.id, child.id, box);
    dojo.style(child.domNode,
      { position: 'absolute', top: '0', right: '0', bottom: '0', left: '0',
        width: 'auto', height: 'auto' });
    dojo.place(child.domNode, this.containerNode);
    this.connect(this, 'resize',
      function() {
        //console.log('resize root!!', arguments);
        dojo.style(child.domNode, { width: 'auto', height: 'auto' });
        child.resize();
      });
  },

  removeChild: function(child) {
    this.containerNode.removeChild(child.domNode);
  },

  replaceChild: function(oldChild, newChild) {
    this.removeChild(oldChild);
    this.addChild(newChild);
    newChild.startup();
    newChild.resize();
  },

  _setToasterAttr: function(options) {
    this.toaster = new geonef.jig.widget.Toaster(
      dojo.mixin({ separator: '<br/>', positionDirection: 'tr-down',
                   duration: 5000, messageTopic: 'jig/workspace/flash'
                 }, options));
    this.domNode.appendChild(this.toaster.domNode);
    this.toaster.startup();

  },


  _setStateAttr: function(state) {
    if (state.toaster) {
      this.attr('toaster', state.toaster);
    }
    this.inherited(arguments);
  },

  playFx: function() {
    dojo.animateProperty(
      {
        node: this.domNode, duration: 1000,
	properties: {
          opacity: { start: 0, end:1 }
        },
	easing: dojo.fx.easing.sinIn,
        onEnd: function() {}
      }).play();
  }


});
