dojo.provide('geonef.jig.layout._Anchor');

// parent classes
dojo.require('dijit.layout._LayoutWidget');
dojo.require('geonef.jig.layout._StateContainer');

// code dependencies
dojo.require('geonef.jig.layout.anchor.Corner');
dojo.require('geonef.jig.layout.anchor.Border');
//dojo.require('geonef.jig.layout.AnchorButton');
//dojo.require('dojox.layout.ResizeHandle');
//dojo.require('geonef.ploomap.tool.MapOptions');

//dojo.require('dijit.form.Button');

// not possible (geonef.jig.layout._Anchor is a parent of jgi.amcro.Player):
//dojo.require('geonef.jig.macro.Player');

// Be careful : this class is used for many widgets as a base class,
//              so none of these widgets should be required here
//              or widget's dojo.declare() will have a null or {} values
//              in parent class list!


dojo.declare('geonef.jig.layout._Anchor',
		[ dijit.layout._LayoutWidget,
		  geonef.jig.layout._StateContainer ],
{
  // summary:
  //		Mixin class to give widget capability to have floating child widgets and active DnD targets
  //
  // description:
  //    IMPORTANT: this was the initial concept. Must be updated. The class should be renamed.
  //               This is more now a base class for any widget needing to leverage the common
  //               JiG widget functionnalities.
  //
  //		Mixin class for widgets, handling:
  //			- floating children widgets
  //			- DnD targets at corners & sides
  //
  //		Like a ContentPane, which has children anchored:
  //			- in the main area (one single OR within sub-tabs)
  //			- on the sides and/or corners
  //			- floating
  //
  //		It has the following capabilities:
  //			- reduced to a button (within the parent pane)
  //			- reduced
  //

  autoBuildAnchorButton: false,

  _floatAnchor: false,

  //_floatAnchor: false,

  appearTarget: null,

  // helpPresentation: string
  //    if set, a question mark icon is added at the right of title to
  //    start the given presentation
  helpPresentation: '',


  /////////////////////////////////////////////////////////////
  // WIDGET LIFECYCLE

  constructor: function() {
    //console.log('_Anchor constructor', this);
    this.floatingChildrenProperties = {};
  },

  postCreate: function() {
    //console.log('postCreate', this, arguments);
    this.inherited(arguments);
    if (this.autoBuildAnchorButton) {
      var self = this;
      this.anchorButton = new geonef.jig.button.TooltipWidget(
        {
	  label: '',
	  widgetCreateFunc: function() {
	    dojo.require('geonef.jig.widget.Options');
	    return new geonef.jig.widget.Options({ relatedWidget: self });
	  }
	});
      dojo.addClass(this.anchorButton.domNode, 'optionsButton');
      dojo.place(this.anchorButton.domNode, this.domNode);
    }
    if (this.titleNode && this.helpPresentation) {
      // disabled for now
      //this.buildHelpButton();
    }
  },

  startup: function() {
    // cannot used buildRendering() not postCreate(),
    // as dijit._templated's doesn't call inherited (it does in startup() )
    this.inherited(arguments);
    this._anchorIsStarted = true;
    if (this.anchorButton) {
      this.anchorButton.startup();
    }
  },

  destroy: function() {
    //console.log('_Anchor destroy', this);
    geonef.jig.workspace.highlightWidget(this, 'close');
    // the following conditions prevents the node
    // from being removed if parent node is a container
    // widget (which manages the child removing itself)
    if (this.domNode && this.domNode.parentNode &&
        (!this.domNode.parentNode.hasAttribute('widgetid') ||
         !dijit.byNode(this.domNode.parentNode).removeChild)) {
      this.domNode.parentNode.removeChild(this.domNode);
    }
    this.inherited(arguments);
    //console.log('_Anchor destroy END', this);
  },


  /////////////////////////////////////////////////////////////
  // UI

  buildHelpButton: function() {
    this.helpButton = new dijit.form.Button(
      { label: "?", onClick: dojo.hitch(this, 'startHelpPresentation'),
        title: "Lancer la présentation d'aide" });
    dojo.addClass(this.helpButton.domNode, 'jigCacoinHelpButton');
    if (this.titleNode) {
      this.helpButton.placeAt(this.titleNode, 'last');
    } else {
      dojo.addClass(this.helpButton.domNode, 'fright');
      this.helpButton.placeAt(this.domNode, 'first');
    }
    this.helpButton.startup();
  },

  startHelpPresentation: function() {
    if (dojo.isString(this.helpPresentation)) {
      dojo['require'](this.helpPresentation);
      this.helpPresentation = dojo.getObject(this.helpPresentation);
    }
    dojo['require']('geonef.jig.macro.Player');
    geonef.jig.macro.Player.prototype.attemptPlay(this.helpPresentation);
  },


  /////////////////////////////////////////////////////////////
  // Getters & setters

  _setTitleAttr: function(value) {
    // do nothing by default
  },

  _getStateAttr: function() {
    //console.log(this, '_Anchor _getStateAttr');
    this.inherited(arguments);
  },

  _setStateAttr: function(data) {
    //console.log('_Anchor _setStateAttr', this, arguments);
    if (data.floatingChildrenProperties) {
      this.floatingChildrenProperties = data.floatingChildrenProperties;
    }
    if (data.appearTarget) {
      this.appearTarget = data.appearTarget;
    }
    this.inherited(arguments);
  },

  addChild: function(child) {
    var props = this.floatingChildrenProperties[child.id];
    if (props) {
      //console.log('apply props', this, arguments, props);
      dojo.style(child.domNode, dojo.mixin(
		   { position: 'absolute', zIndex: 42000 }, props));
    }
    child._floatAnchor = true;
    /*child._floatResizer = new dojox.layout.ResizeHandle({
     targetId: this.id,
     resizeAxis: "xy"
     });
     this.domNode.appendChild(child._floatResizer.domNode);*/
    //" targetId="testWindow"
    //resizeAxis="xy" animateMethod="combine" class="handle"></div>
    this.inherited(arguments);
  },

  removeChild: function(child) {
    /*if (child._floatResizer) {
     this.domNode.removeChild(child._floatResizer.domNode);
     child._floatResizer.destroy();
     child._floatResizer = undefined;
     }*/
    child._floatAnchor = undefined;
    this.inherited(arguments);
  },

  getChildren: function() {
    // filter: only children which were actually
    //		   added through this.addChild()
    return this.inherited(arguments)
      .filter(function(c) { return c._floatAnchor; });
  },

  addOnStartup: function(callback) {
    // summary:
    //		callback will be called after startup() is triggered, or immediately if it was already (~ dojo.addOnLoad)
    //console.log('_Anchor addOnStartup', this);
    if (this._anchorIsStarted) {
      callback.call(this);
    } else {
      var _h;
      _h = dojo.connect(this, 'startup', this,
        function() {
	  callback.call(this);
	  dojo.disconnect(_h);
	  //window.setTimeout(function() { dojo.disconnect(_h); }, 50);
	});
    }
  },

  buildAnchors: function(/*sourceWidget*/) {
    var anchors = [],
    self = this;
    //console.log('buildAnchors', this._floatAnchor, this);
    if (!this._floatAnchor) {
      ['TL'/*,'TR'*/,'BL','BR'].forEach(function(corner) {
				          var anchor = new geonef.jig.layout.anchor.Corner({
						                                      widget: self,
						                                      corner: corner });
				          anchors.push(anchor);
			                });
      ['left','top','right','bottom'].forEach(function(border) {
				                var anchor = new geonef.jig.layout.anchor.Border({
						                                            widget: self,
						                                            border: border });
				                anchors.push(anchor);
			                      });
    }
    //console.log('return ANCHORS', this, box, anchors);
    return anchors;
  }

});
