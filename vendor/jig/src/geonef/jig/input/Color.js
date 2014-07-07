
dojo.provide('geonef.jig.input.Color');

// parents
dojo.require('geonef.jig.button.TooltipWidget');

// used in code
dojo.require('geonef.jig.util.color');

dojo.declare('geonef.jig.input.Color', [ geonef.jig.button.TooltipWidget ],
{
  // summary:
  //   Wrapper for dijit.ColorPalette, to handle it as an input button
  //

  //childWidgetClass: 'dijit.ColorPalette',
  childWidgetClass: 'dojox.widget.ColorPicker',
  childWidgetParams: {
    showRgb: false, showHsv: false,
    animatePoint: false,
  },

  name: 'color',

  label: 'Couleur...',

  value: '',

  buildRendering: function() {
    this.inherited(arguments);
    dojo.addClass(this.domNode, 'jigInputColor');
  },

  widgetCreateFunc: function() {
    var widget = this.inherited(arguments);
    this.connect(widget, 'onChange', 'onPaletteChange');
    //widget.connect(widget, 'onShow',
    //               dojo.hitch(this, 'adjustSubWidgetPosition'));
    if (this.value) {
      //widget.attr('value', this.value);
      widget.value = this.value;
    }
    window.setTimeout(function() { widget.onResize(); }, 50);
    //console.log('made color palette', widget);
    return widget;
  },

  onPaletteChange: function() {
    var value = this.subWidget.attr('value');
    //console.log('onPaletteChange', this, value);
    this.attr('value', value);
    //this.closeDropDown();
  },

  _setValueAttr: function(value) {
    //console.log('_setValueAttr', this, arguments, this.value);
    if (value === this.value) {
      return;
    }
    if (dojo.isString(value) && /\#[0-9a-fA-F]{6}/.test(value)) {
      dojo.style(this.containerNode, 'background', value);
      this.containerNode.innerHTML = value.toUpperCase();
      dojo.style(this.containerNode, 'color',
                 geonef.jig.util.color.isDark(value) ? '#fff' : '#000');
      dojo.addClass(this.containerNode, 'hexa');
      this.value = value;
    } else {
      dojo.style(this.containerNode, 'background', 'transparent');
      this.containerNode.innerHTML = this.label;
      dojo.style(this.containerNode, 'color', '#000');
      dojo.removeClass(this.containerNode, 'hexa');
      this.value = null;
    }
    if (this.subWidget) {
      this.subWidget.attr('value', value);
    }
    this.onChange();
  },

  onChange: function() {
    // hook
  }

  // adjustSubWidgetPosition: function() {
  //   // hack to re-compute coords since abs position may have changed
  //   return;
  //   (function() {
  //      var cmb = dojo.marginBox(this.cursorNode);
  //      var hmb = dojo.marginBox(this.hueCursorNode);
  //      this._shift = {
  //        hue: {
  //          x: Math.round(hmb.w / 2) - 1,
  //          y: Math.round(hmb.h / 2) - 1
  //        },
  //        picker: {
  //          x: Math.floor(cmb.w / 2),
  //          y: Math.floor(cmb.h / 2)
  //        }
  //      };
  //      this.PICKER_HUE_H = dojo.coords(this.hueNode).h;
  //      var cu = dojo.coords(this.colorUnderlay);
  //      this.PICKER_SAT_VAL_H = cu.h;
  //      this.PICKER_SAT_VAL_W = cu.w;
  //      var ox = this._shift.picker.x;
  //      var oy = this._shift.picker.y;
  //      this._mover.destroy();
  //      this._mover = new dojo.dnd.move.boxConstrainedMoveable(
  //        this.cursorNode, {
  //          box: {
  //            t:0 - oy,
  //            l:0 - ox,
  //            w:this.PICKER_SAT_VAL_W,
  //            h:this.PICKER_SAT_VAL_H
  //          }
  //        });
  //      this._hueMover.destroy();
  //      this._hueMover = new dojo.dnd.move.boxConstrainedMoveable(
  //        this.hueCursorNode, {
  //          box: {
  //            t:0 - this._shift.hue.y,
  //            l:0,
  //            w:0,
  //            h:this.PICKER_HUE_H
  //          }
  //        });
  //    }).call(this.subWidget);
  // }

});
