
dojo.provide('geonef.jig.button.InstanciateAnchored');

dojo.require('dijit.form.Button');
dojo.require('geonef.jig.util');

dojo.declare('geonef.jig.button.InstanciateAnchored', dijit.form.Button,
{

  childWidgetClass: 'dijit.layout.ContentPane',
  childWidgetParams: {},
  anchor: '',        // fix this

  postMixInProperties: function() {
    if (!this.anchor) {
      console.warn('geonef.jig.button.InstanciateAnchored: '
                   + '"anchor" defaults to "map"');
      this.anchor = 'map';
    }
    this.subWidgetLoaded = new geonef.jig.Deferred();
    this.inherited(arguments);
    this.childWidgetParams = dojo.mixin({}, this.childWidgetParams);
  },

  onClick: function() {
    var widget = this.widgetCreateFunc();
    if (widget) {
      this.anchorWidget(widget);
      widget.startup();
      this.subWidgetLoaded.callback();
    }
  },

  anchorWidget: function(widget) {
    var self = this;
    var methods = {
      auto: function(widget) {
        geonef.jig.workspace.autoAnchorWidget(widget);
      },
      map: function(widget) {
        dojo.style(widget.domNode, {
		     position: 'absolute', zIndex: 42000,
		     left: 0, top: 0, right: 'auto', bottom: 'auto'});
        this.mapWidget.addChild(widget);

      }
    };
    methods[this.anchor].call(this, widget);
  },

  widgetCreateFunc: function() {
    //console.log('widgetCreateFunc', this.childWidgetClass);
    var self = this,
    createChildWidget = function(id) {
      var Class = geonef.jig.util.getClass(self.childWidgetClass);
      return new Class(dojo.mixin(self.childWidgetParams, { id: id }));
    },
    id = this.childWidgetParams.id || this.id + '_child';
    var widget = geonef.jig.workspace.loadWidget(id, createChildWidget);
    return widget;
  }

});
