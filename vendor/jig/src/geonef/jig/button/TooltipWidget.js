dojo.provide('geonef.jig.button.TooltipWidget');

// parent
dojo.require('dijit.form.DropDownButton');

// in code
dojo.require('dijit.TooltipDialog');
dojo.require('dijit.layout.ContentPane');
dojo.require('geonef.jig.util');
dojo.require('dojo._base.Deferred');

dojo.declare('geonef.jig.button.TooltipWidget',
		dijit.form.DropDownButton,
{
  // summary:
  //    overload dropDownButton to provide automatic sub-widget lazy-loading
  //
  // description
  //    The caller must provide 'childWidgetClass', or overload 'widgetCreateFunc'
  //

  label: 'Options',

  childWidgetClass: 'dijit.layout.ContentPane',
  childWidgetParams: {},
  childWidgetStyle: {},
  autostartNestedWidget: false, // unused??

  // childWidgetParams="{mapWidget:${mapWidget}}"

  postMixInProperties: function() {
    this.subWidgetLoaded = new geonef.jig.Deferred();
    this.inherited(arguments);
    this.childWidgetParams = dojo.mixin({}, this.childWidgetParams);
  },

  destroy: function() {
    //console.log(this, 'TooltipWidget destroy');
    this.inherited(arguments);
  },

  startup: function() {
    if(this._started){ return; }

    //console.log('startup', this);
    this.dropDown = { _destroyed: true };
    // no parent has an interesting startup method

    //this.dropDownContainer = null;	// hack to make parent (DropDownButton)
    // to assume first widget in body as dropDown
    // and leave isLoaded() do the proper work
    //this.inherited(arguments);
    //this.dropDown = null;
    //console.log('startup END', this);
  },

  widgetCreateFunc: function() {
    //console.log('widgetCreateFunc', this.childWidgetClass, this);
    var self = this;
    var createChildWidget =
      function(id) {
        var Class = geonef.jig.util.getClass(self.childWidgetClass);
        return new Class(dojo.mixin({}, self.childWidgetParams, { id: id }));
      };
    var id = this.childWidgetParams.id || (this.id + '_child');
    var widget = geonef.jig.workspace.loadWidget(id, createChildWidget);
    widget._floatAnchor = true;
    dojo.style(widget.domNode, this.childWidgetStyle);
    return widget;
  },

  openDropDown: function() {
    this.inherited(arguments);
    if (this.subWidget && this.subWidget.onShow) {
      this.subWidget.onShow(this);
    }
  },

  loadDropDown: function(/* Function */ loadCallback){
    // summary:
    //		Loads the data for the dropdown, and at some point, calls
    //		the given callback
    // tags:
    //		protected
    //console.log('loadDropDown', this, arguments);
    this.dropDown = this.createDropDownTooltip();
    if (this.subWidget) {
      loadCallback();
      this.subWidget.startup();
      //console.log('run callback on subWidgetLoaded', this, arguments);
      this.subWidgetLoaded.callback();
    }
  },

  createDropDownTooltip: function() {
    //console.log('createDropDownTooltip', this);
    var dd = new dijit.TooltipDialog(
      {
	//title: 'Hello!',
	removeChild: dojo.hitch(this, 'removeSubWidget')
      });
    this.subWidget = this.widgetCreateFunc();
    this._isJigLoaded = !!this.subWidget;
    if (this.subWidget) {
      this.subWidget._floatAnchor = true;
      dojo.place(this.subWidget.domNode, dd.containerNode); // no addChild!
      this.connect(this.subWidget, 'onResize', 'onDropDownResize');
      //this.subWidget.startup();
    }
    //console.log('createDropDownTooltip END');
    return dd;
  },

  removeSubWidget: function() {
    //console.log('removeSubWidget', this.subWidget);
    this.subWidget.domNode.parentNode.removeChild(this.subWidget.domNode);
    this.closeDropDown();
    this._isJigLoaded = false;
  },

  isLoaded: function(){
    // summary:
    //		Returns whether or not the dropdown is loaded.  This can
    //		be overridden in order to force a call to loadDropDown().
    // tags:
    //		protected
    //console.log('isLoaded', this, this._isJigLoaded);
    return !!this._isJigLoaded;
  },

  closeDropDown: function(/*Boolean*/ focus){
    // summary:
    //		Closes the drop down on this widget
    // tags:
    //		protected

    if (this.subWidget && this.subWidget.onHide) {
      this.subWidget.onHide(this);
    }
    if(this._opened){
      dijit.popup.close(this.dropDown);
      if(focus){ this.focus(); }
      this._opened = false;
      this.state = "";
    }
  },

  onDropDownResize: function() {
    if (this._opened) {
      this.closeDropDown();
      this.openDropDown();
    }
  },

  subAttr: function(name, value) {
    if (this.subWidget) {
      this.subWidget.attr(name, value);
    } else {
      this.childWidgetParams[name] = value;
    }
  },

  /*whenSubWidgetLoaded: function(func, scope) {
    if (this.subWidget) {
      func.apply(scope || window, [this.subWidget]);
    } else {
      var self = this;
      geonef.jig.connectOnce(this, 'loadDropDown', scope,
                      function() { func.apply(this, [self.subWidget]); });
    }
  }*/

});
