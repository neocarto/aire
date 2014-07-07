
dojo.provide('geonef.jig.widget.Toaster');

dojo.require('dojox.widget.Toaster');
dojo.require('geonef.jig.util.string');

dojo.declare('geonef.jig.widget.Toaster', dojox.widget.Toaster,
{
  // hardStyle: object
  //    Style to be applied to domNode after any call to setContent() - useful to
  hardStyle: {},

  buildRendering: function() {
    this.inherited(arguments);
    var self = this;
    dojo.create('div', { 'class': 'opacity' },
                this.containerNode, 'first');
    dojo.create('div', { 'class': 'close link',
                         title: 'Cacher ces messages',
                         innerHTML: 'X',
                         onclick: function() { self.hide(); }
                       }, this.containerNode);
  },

  setContent: function() {
    this.inherited(arguments);
    dojo.style(this.domNode, this.hardStyle);
  },

  _setPositionDirectionAttr: function(positionDirection) {
    dojo.removeClass(this.domNode,
                     this.positionDirection2cssClass(this.positionDirection));
    this.positionDirection = positionDirection;
    dojo.addClass(this.domNode,
                     this.positionDirection2cssClass(this.positionDirection));
  },

  positionDirection2cssClass: function(positionDirection) {
    return 'jigToaster'
      + positionDirection.split('-').map(geonef.jig.util.string.ucFirst).join('');
  }

});
