
dojo.provide('geonef.jig.widget.ButtonContainerMixin');

/**
 * Provide helper to add buttons to different containers
 *
 * @class
 */
dojo.declare('geonef.jig.widget.ButtonContainerMixin', null,
{
  buildRendering: function() {
    this.inherited(arguments);
    this.buildButtons();
  },

  buildButtonContainer: function(name, title, ref, position) {
    var refNode = ref ? this[ref+'Node'] : this.generalNode;
    position = position || 'after';
    var div = dojo.create('div', {}, refNode, position);
    this[name+'TitleNode'] = dojo.create('h1', { innerHTML: title }, div);
    this[name+'Node'] = div;
    return div;
  },

  buildButtons: function() {
    // overload
  },

  buildDDButton: function(container, Class, label, position) {
    return this.addButton(new geonef.jig.button.TooltipWidget(
        { label: label, childWidgetClass: Class }),
        container, position);
  },

  buildButton: function(container, event, label, position) {
    if (container === 'selection') {
      var callback = dojo.hitch(this, event);
      event = function() {
        callback(this.getListWidget().getSelectedRows());
      };
    }
    return this.addButton(
        new geonef.jig.button.Action(
          { label: label, onClick: dojo.hitch(this, event) }),
            container, position);
  },

  addButton: function(button, container, position) {
    var refNode = position == 'first' ?
      this[container+'TitleNode'] : this[container+'Node'];
    position = position == 'first' ? 'after' : position;
    button.placeAt(refNode, position);
    if (!this._supportingWidgets) {
      //console.warn('_supportingWidgets prop not defined for widget ', this);
      this._supportingWidgets = [];
    }
    this._supportingWidgets.push(button);
    // todo: standardize custom widget startup
    if (this._started) {
      button.startup();
    } else if (this._startupWidgets) {
      this._startupWidgets.push(button);
    } else {
      geonef.jig.connectOnce(this, 'startup', button, 'startup');
    }
    this.buttonsUpdated(this[container+'Node']);
    return button;
  },

  buttonsUpdated: function(node) {
    var nodes = dojo.query('> span', node)
                  .filter(function(n) {
                            return dojo.style(n, 'display') !== 'none'; })
                  .removeClass('jigFirstButton jigLastButton');
    nodes.forEach(
      function(n) {
        if (n.nodeName == 'BR') { return; }
        var isFirst = !n.previousSibling ||
          n.previousSibling.nodeName !== 'SPAN';
        var isLast = !n.nextSibling || n.nextSibling.nodeName !== 'SPAN';
        //console.log('button node', n, isFirst, isLast, n.previousSibling, n.nextSibling);
        if (isFirst && !isLast) {
          dojo.addClass(n, 'jigFirstButton');
        }
        if (!isFirst && isLast) {
          dojo.addClass(n, 'jigLastButton');
        }
      });
    // if (nodes.length === 1) {
    //   dojo.removeClass(nodes[0], 'jigFirstButton jigLastButton');
    // }
    // if (nodes.length > 1) {
    //   dojo.addClass(nodes[0], 'jigFirstButton');
    //   dojo.addClass(nodes[nodes.length - 1], 'jigLastButton');
    // }
  }

});
