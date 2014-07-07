
dojo.provide('geonef.jig.widget.Processing');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

/**
 * Widget quickly added to a widget while processing (API requested, etc)
 *
 * @class
 */
dojo.declare('geonef.jig.widget.Processing', [ dijit._Widget, dijit._Templated ],
{

  /**
   * @type {?HTMLElement}
   */
  processingNode: null,

  fxAppearDuration: 400,
  fxDisappearDuration: 200,

  iconUrl: dojo.moduleUrl('geonef.jig', 'style/icon'),

  /**
   * @inheritsDoc
   */
  templateString: dojo.cache('geonef.jig.widget', 'templates/Processing.html'),

  /**
   * @inheritsDoc
   */
  widgetsInTemplate: false,

  postCreate: function() {
    this.inherited(arguments);
    if (this.processingNode && !this.domNode.parentNode) {
      this.placeFx(this.processingNode);
    }
  },

  placeFx: function(node) {
    dojo.style(this.domNode, 'opacity', 0);
    this.placeAt(node);
    dojo.animateProperty(
      {
        node: this.domNode, duration: this.fxAppearDuration,
	properties: {
          opacity: { start: 0, end: 1 }
        },
	easing: dojo.fx.easing.sinIn
      }).play();
  },


  startup: function() {

  },

  end: function() {
    this.destroyFx();
  },

  destroyFx: function() {
    var self = this;
    dojo.animateProperty(
      {
        node: this.domNode, duration: this.fxDisappearDuration,
	properties: {
          opacity: { start: 1, end: 0 }
        },
	easing: dojo.fx.easing.sinIn,
        onEnd: function() {
          if (!window.__debug_keepProcessing) {
            self.destroy();
          }
        }
      }).play();
  }

});
