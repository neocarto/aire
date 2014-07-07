dojo.provide('geonef.jig.workspace');

dojo.require('geonef.jig._base');
dojo.require('geonef.jig.workspace.fx');
dojo.require('geonef.jig.layout.anchor.Border');
dojo.require('dojo.dnd.autoscroll');
dojo.require('geonef.jig.util');
dojo.require('dojo.back');

dojo.mixin(geonef.jig.workspace,
{
  // summary:
  //    Main workspace-related functions
  //
  //

  widgetCreationHooks: [
    function(widget) {
      //console.log(this, 'hook', widget);
    }
  ],

  initialize: function(params) {
    this.data = params.data;
    dojo.dnd.autoScroll = function(e) {}; // avoid scrolling (we are fullscreen)
    dojo.back.setInitialState({
        handle: function() { console.log('history', this, arguments); },
    });
  },

  loadWidget: function(id, creator) {
    // summary:
    //		Search app datastore for widget "id", create it otherwise
    //
    // id: string
    //		If not null, search dijit widget with the given ID
    //		in the app datastore
    //
    // creator: function
    //		If "id" is null, or if it isn't found in the datastore,
    //		this function is called to build the widget.
    //		The function takes the id parameter and return
    //		the widget object.
    //
    //console.log('geonef.jig.workspace.loadWidget', id);
    var widget, _w;
    if ((_w = this._checkLoadedWidget(id))) {
      console.log('widget is already loaded:', id, _w);
      return null;
    }
    var widgets = dojo.getObject('widgets', true, this.data);
    if (id && widgets.hasOwnProperty(id)) {
      var Class = geonef.jig.util.getClass(widgets[id]._class);
      widget = new Class({ id: id, _jigLoad: true });
      this.applyHooks(widget);
      if (widgets[id].state) {
	widget.attr('state', widgets[id].state);
      }
      //console.log(this, 'geonef.jig.workspace returning', widget);
    } else {
      widget = creator(id);
      widget._jigLoad = true;
      this.applyHooks(widget);
    }
    dojo.publish('jig/workspace/load', [ widget ]);
    //console.log('ZiG loaded widget: ', widget);
    return widget;
  },

  /**
   * automatically anchor the given widget to the best place of the workspace
   *
   * //The target is deteced from widget's "anchorTarget" and "anchorPosition"
   * //properties.
   *
   * /*Otherwise,* the best place is determined from the 'appearTarget' property
   * of all widgets. That property can be 'top', 'right', 'bottom', 'left'.
   *
   * @param {dijit._Widget} widget
   * @return {?dijit._Widget}
   */
  autoAnchorWidget: function(widget) {
    // summary:
    //
    //
    // description:
    //
    //
    //
    var target = dijit.registry
                   .filter(function(w) { return !!w.appearTarget; })
                   .toArray()[0];
    if (!target) {
      console.error('did not find a widget with a defined appearTarget');
      console.error('tried to auto-anchor widget: ', widget);
      return null;
    }
    //console.log('auto-anchor: found target: ', target);
    if (target.appearTarget === 'add') {
      target.addChild(widget);
      if (target.selectChild) {
        target.selectChild(widget);
      }
    } else {
      var anchor = new geonef.jig.layout.anchor.Border(
        { widget: target, border: target.appearTarget });
      //console.log('created anchor ', anchor);
      anchor.accept(widget);
      anchor.destroy();
    }
    //geonef.jig.workspace.highlightWidget(widget, 'open'); // a voir...
    //console.log('anchor accepted');
    return widget;
  },

  /**
   * Automatically load, instanciate and anchor widget for given class
   *
   * Works on singletons only. If already loaded, selectChild() of
   * parent is invoked to focus on the widget.
   *
   * @param {string} widgetClass
   * @return {object}
   */
  autoAnchorInstanciate: function(widgetClass, _id, options) {
    var id = _id || widgetClass.replace(/\./g, '_');
    //console.log('id', this, arguments, id);
    var widget = dijit.byId(id);
    if (widget) {
      geonef.jig.workspace.focus(widget);
    } else {
      var _Class = geonef.jig.util.getClass(widgetClass);
      widget = geonef.jig.workspace.loadWidget(
        id, function(id) { return new _Class(dojo.mixin({id: id}, options)); });
      geonef.jig.workspace.autoAnchorWidget(widget);
    }
    return widget;
  },

  /**
   * Focus on the given widget
   *
   * @param {dijit._Widget} widget
   * @return {object}
   */
  focus: function(widget) {
    var parent = dijit.getEnclosingWidget(widget.domNode.parentNode);
    if (parent.selectChild) {
      parent.selectChild(widget);
    }
    return widget;
  },

  _checkLoadedWidget: function(id) {
    var w = dijit.byId(id);
    if (!w) {
      return false;
    }
    this.highlightWidget(w, 'warn');
    return w;
  },

  highlightWidget: function(widget, fx) {
    //console.log('highlightW', this, arguments);
    geonef.jig.workspace.highlightNode(widget.domNode, fx);
  },

  highlightNode: function(element, fx) {
    dijit.scrollIntoView(element);
    var box = dojo.coords(element)
      , div = dojo.create('div')
    , effect = geonef.jig.workspace.fx.widget[fx || 'focus'](div, box);
    if (!effect) { return; }
    dojo.style(div, { position: 'fixed', zIndex: 43000 });
    dojo.place(div, dojo.body());
    effect.onEnd = function() { dojo.body().removeChild(div); };
    effect.play();
  },


  applyHooks: function(widget) {
    this.widgetCreationHooks.forEach(function(hook) {
			               hook.call(widget, widget);
		                     });
  },

  getState: function() {
    var widgets = {};
    dijit.registry
      .filter(function(w) { return !!w._jigLoad; })
      .forEach(function(w) {
		 if (w.attr) {
		   var state = w.attr('state');
		   widgets[w.id] = { _class: w.declaredClass };
		   if (state) {
		     widgets[w.id].state = state;
		   }
		 }
	       });
    return {
      widgets: widgets
    };
  }

});

// (function(d) {
//    console.log('loaders', d._loaders.length, d._loaders);
//    console.dir(d._loaders);
//    console.log('removing!', this, arguments);
//    d._loaders = [];
//  })(dojo);
