
dojo.provide('geonef.jig.widget._LayoutSwitch');

dojo.require('dijit.form.CheckBox');

dojo.declare('geonef.jig.widget._LayoutSwitch', null,
{
  // summary:
  //   helper to manage alternate layouts for widgets - basically deals with CSS classes
  //

  // forceAlternateLayout: boolean
  //    if true; alternate layout is forced whatever the mouse state is
  forceAlternateLayout: false,

  // alternateLayoutOnHover: boolean
  //    if true, alternate layout will be enabled on mouse hover
  alternateLayoutOnMouseOver: true,

  // alternateLayoutCssClass: string
  //    CSS class to be added to widget domNode when alternate layout is active
  alternateLayoutCssClass: 'stick',

  // alternateLayoutBasicCssClass: string
  //    CSS class always applied to widget domNode
  alternateLayoutBasicCssClass: 'jigLayoutSwitch',

  // buildLayoutSwitcher: string
  //    if 'left' or 'right', automatically build a checkbox & label to
  //    make stick permanent
  //    possible values: 'left', 'right', 'none'
  layoutSwitcherPosition: 'none',

  postMixInProperties: function() {
    this.inherited(arguments);
    this.alternateLayoutConstraints = {};
    this.forceAlternateLayoutCount = 0;
  },

  buildRendering: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, this.alternateLayoutBasicCssClass);
    if (['left','right'].indexOf(this.layoutSwitcherPosition) !== -1) {
      this.buildLayoutSwitcher(this.layoutSwitcherPosition);
    }
  },

  buildLayoutSwitcher: function(position) {
    var div = dojo.create('div', { 'class': position+'LayoutSwitcher',
                                   innerHTML: ' visible' });
    this.layoutSwitchCheckBox = new dijit.form.CheckBox(
      {
        checked: false,
        onChange: dojo.hitch(this, '_setForceAlternateLayoutAttr')
      });
    dojo.place(this.layoutSwitchCheckBox.domNode, div, 'first');
    var opacityNode = dojo.query('> .opacity', this.domNode)[0];
    if (opacityNode) {
      dojo.place(div, opacityNode, 'after');
    } else {
      dojo.place(div, this.domNode, 'first');
    }
  },

  _setAlternateLayoutOnMouseOverAttr: function(state) {
    if (state) {
      if (!this.alternateLayoutOnMouseOver || !this._layoutSwitchOverCnt) {
        this.alternateLayoutOnMouseOver = true;
        this._layoutSwitchOverCnt =
          this.connect(this.domNode, 'onmouseover', 'onMouseOver');
        this._layoutSwitchOutCnt =
          this.connect(this.domNode, 'onmouseout', 'onMouseOut');
      }
    } else {
      if (this.alternateLayoutOnMouseOver) {
        this.alternateLayoutOnMouseOver = false;
        dojo.disconnect(this._layoutSwitchOverCnt);
        dojo.disconnect(this._layoutSwitchOutCnt);
        if (this.isMouseOver) {
          this.onMouseOut();
        }
      }
    }
  },

  _setForceAlternateLayoutAttr: function(state) {
    //console.log('_setAlternateLayoutAttr', this, arguments);
    this.forceAlternateLayout = state;
    this.updateLayoutState();
    if (this.layoutSwitchCheckBox) {
      this.layoutSwitchCheckBox.attr('checked', state);
    }
  },

  onMouseOver: function() {
    //console.log('onMouseOver', this, arguments);
    this.isMouseOver = true;
    this.updateLayoutState();
  },

  onMouseOut: function() {
    //console.log('onMouseOut', this, arguments);
    this.isMouseOver = false;
    this.updateLayoutState();
  },

  setAlernateLayoutConstraint: function(name, state) {
    if (!!this.alternateLayoutConstraints[name] === !!state) {
      return;
    }
    this.forceAlternateLayoutCount += state ? 1 : -1;
    this.alternateLayoutConstraints[name] = !!state;
    this.updateLayoutState();
  },

  updateLayoutState: function() {
    this._z++;
    var alternate = this.forceAlternateLayout ||
      this.forceAlternateLayoutCount > 0 ||
      (this.alternateLayoutOnMouseOver && this.isMouseOver);
    //console.log('updateLayoutState', this, alternate);
    dojo[alternate ? 'addClass': 'removeClass'](
      this.domNode, this.alternateLayoutCssClass);
    return alternate;
  }

});
