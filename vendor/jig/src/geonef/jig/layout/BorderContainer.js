dojo.provide('geonef.jig.layout.BorderContainer');

// parents
dojo.require('dijit.layout.BorderContainer');
dojo.require('geonef.jig.layout._StateContainer');

// used in code
dojo.require('geonef.jig.layout.anchor.Border');

/**
 * BorderContainer modified to be smarter and deal with recursive containers
 *
 * Handles state, also.
 *
 * @class
 */
dojo.declare('geonef.jig.layout.BorderContainer',
		  [ dijit.layout.BorderContainer, geonef.jig.layout._StateContainer ],
{

  liveSplitters: false,
  doLayout: true,
  cs: true,
  pe: { b : 0, l: 0, t: 0, r: 0, h: 0, w: 0 },
  smartResize: true,


  buildRendering: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'jigBorderContainer');
  },

  addChild: function(child, keepStyle) {
    //console.log('addChild', this, child);
    var
      isFirst = !this.getChildren().length
    , isSidebar = this.design === 'sidebar';
    /*console.log('addChild BorderContainer', this.id, child.id/*, box,
     {
     top: 'auto', bottom: 'auto', left: 'auto', right: 'auto',
     width: isSidebar && !isFirst ? ''+width+'px' : 'auto',
     height: !isSidebar && !isFirst ? ''+height+'px' : 'auto',
     overflow: 'auto'
     });*/
    if (!keepStyle) {
      var
        box = dojo.contentBox(this.domNode)
      , width = this.paneSize ? this.paneSize : box.w ? box.w / 2 : 300
      , height = this.paneSize ? this.paneSize : box.h ? box.h / 2 : 300;
      dojo.style(child.domNode, {
        	   top: 'auto', bottom: 'auto', left: 'auto', right: 'auto',
        	   width: isSidebar && !isFirst ? ''+width+'px' : 'auto',
        	   height: !isSidebar && !isFirst ? ''+height+'px' : 'auto',
        	   overflow: 'auto'
        	 });
    }
    if (isFirst) {
      child.region =  'center';
    } else {
      child.region =  isSidebar ? 'right' : 'bottom';
      child.splitter = true;
    }
    child._jigOnDestroyHandle =
      dojo.connect(child, 'uninitialize', this,
        function() { if (!this._floatAnchor) { this.removeChild(child); } });
    this.inherited(arguments);
  },

  removeChild: function(child, intact) {
    if (child._jigOnDestroyHandle) {
      dojo.disconnect(child._jigOnDestroyHandle);
      child._jigOnDestroyHandle = undefined;
    }
    //console.log('removeChild', this, arguments);
    this.inherited(arguments);
    //console.log('removeChild after inh', this);
    var children = this.getChildren();
    if (children.length === 1 && !intact) {
      //console.log('removeChild: cascade parent replaceChild');
      this.removeChild(children[0]);
      var parent = this.getParent();
      parent.replaceChild(this, children[0]);
      /*parent.removeChild(this);
       children[0].region = this.region;
       children[0].splitter = this.splitter;
       parent.addChild(children[0]);*/
    }
  },

  replaceChild: function(oldChild, newChild) {
    //console.log('replaceChild', oldChild, ' WITH ', newChild);
    var
      children = this.getChildren()
    , isSidebar = this.design === 'sidebar'
    , child1 = children[0]
    , child2 = children[1]
    , idx = children.indexOf(oldChild)
    //, idx2 = children.indexOf(newChild)
    ;
    this.removeChild(child2, true);
    if (idx === 0) {    // replace center
      this.removeChild(child1, true);
      this.addChild(newChild, true);
      this.addChild(child2, true);
    } else {            // replace right/bottom
      var
        p = isSidebar ? 'width' : 'height'
      , dim = dojo.style(child2.domNode, p);
      dojo.style(newChild.domNode, p, ''+dim+'px');
      dojo.style(newChild.domNode,
        { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' });
      this.addChild(newChild, true);
    }
  },

  /**
   * Smart add child for adding more than 2 children
   *
   * If it's the first or second child, same as addChild.
   * Otherwise, use a border anchor to add it to the end.
   *
   * @param {dijit._Widget} child the widget to add as a child
   * @param {?boolean} first    if true, widget is added at first position
   */
  smartAddChild: function(child, first_, paneSize_) {
    //console.log('smartAddChild', this, arguments);
    var children = this.getChildren();
    if (children.length < 2) {
      if (paneSize_ !== undefined) {
        this.paneSize = paneSize_;
      }
      //console.log('adding child', this, child, this.paneSize);
      this.addChild(child);
    } else {
      var isSidebar = this.design === 'sidebar';
      var sub = first_ ? children[0] : children[1];
      if (sub.smartAddChild && sub.design === this.design) {
        sub.smartAddChild(child, first_, paneSize_);
        return;
      }
      var anchor = new geonef.jig.layout.anchor.Border(
        { widget: sub,
          border: first_ ? (isSidebar ? 'left' : 'top') :
                           (isSidebar ? 'right' : 'bottom') });
      //console.log('anchoring child', this, child, paneSize_);
      anchor.accept(child, paneSize_);
      anchor.destroy();
    }
  },

  resize: function(newSize, currentSize){
    //console.log('borderContainer resize', this, arguments);
    var horiz = this.design === 'sidebar';
    var childNode = horiz ? this._right : this._bottom;
    var sizeProportion = this.sizeProportion;
    this.inherited(arguments);
    if (this.smartResize && this._center && childNode &&
        sizeProportion > 0 && sizeProportion < 1) {
      var o = horiz ? 'w' : 'h';
      var tbox = dojo.contentBox(this.domNode);
      var size = parseInt(tbox[o] * sizeProportion);
      //console.log('apply proportion', this, sizeProportion, size, tbox[o], cbox, tbox);
      this._layoutChildren(horiz ? 'right' : 'bottom', size);
    }
  },

  _layoutChildren: function() {
    //console.log('_layoutChildren', this, arguments);
    this.inherited(arguments);
    this.rememberSizeProportion();
  },

  rememberSizeProportion: function() {
    var horiz = this.design === 'sidebar';
    var childNode = horiz ? this._right : this._bottom;
    if (childNode) {
      var o = horiz ? 'w' : 'h';
      var tbox = dojo.contentBox(this.domNode);
      var cbox = dojo.marginBox(childNode);
      this.sizeProportion = cbox[o] / tbox[o];
      //console.log('remember proportion', this, this.sizeProportion, cbox[o], tbox[o], cbox, tbox);
    }
  },

  _getStateAttr: function() {
    //console.log(this, 'BorderContainer _getStateAttr');
    return dojo.mixin({
        		design: this.design
        	      }, this.inherited(arguments));
  },

  _setStateAttr: function(data) {
    //console.log(this, 'BorderContainer _setStateAttr');
    if (data.design) {
      //console.log(this, 'BorderContainer _setStateAttr setDesign!', data.design);
      this.design = data.design;
    }
    if (data.paneSize) {
      this.paneSize = data.paneSize;
    }
    this.inherited(arguments);
  }


});
