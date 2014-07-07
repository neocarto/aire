
dojo.provide('geonef.jig.macro.action.TextEditor');

// parents
dojo.require('geonef.jig.macro.action.Editor');

// for code
dojo.require('geonef.jig.util.string');

// for template
dojo.require('dijit.form.DropDownButton');
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.TextBox');
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.jig.macro.action.TextEditor', [ geonef.jig.macro.action.Editor ],
{
  // summary:
  //   Editor for textRunner properties
  //

  RUNNER_CLASS: 'geonef.jig.macro.action.TextRunner',

  templateString: dojo.cache('geonef.jig.macro.action', 'templates/TextEditor.html'),

  _getValueAttr: function() {
    var val = dojo.mixin({ style: {} }, this.inherited(arguments));
    if (val.defStyleSize) { val.style.fontSize = ''+(val.styleSize / 100)+'em'; }
    if (val.styleBold) { val.style.fontWeight = 'bold'; }
    if (val.styleItalic) { val.style.fontStyle = 'italic'; }
    delete val.defStyleSize;
    delete val.styleSize;
    delete val.styleBold;
    delete val.styleItalic;
    return val;
  },

  _setValueAttr: function(value) {
    var val = dojo.mixin({ defStyleSize: false }, value);
    var style = dojo.mixin({}, val.style);
    if (style.fontWeight === 'bold') {
      val.styleBold = true;
    }
    if (style.fontStyle === 'italic') {
      val.styleItalic = true;
    }
    if (/[0-9]?\.?[0-9]+em/.test(style.fontSize)) {
      val.defStyleSize = true;
      val.styleSize = parseFloat(style.fontSize.replace(/em/, '')) * 100;
    }
    delete val.style;
    geonef.jig.macro.action.Editor.prototype._setValueAttr.call(this, val);
  },

  onChange: function() {
    this.styleSizeInput.attr('disabled', !this.styleSizeCheckBox.attr('value'));
    this.inherited(arguments);
  },

  getSummary: function() {
    var value = this.attr('value');
    var opts = [];
    if (value.clear) { opts.push('E'); }
    if (value.manualNext) { opts.push('M'); }
    opts = opts.length ? " [" + opts.join(",") + "]" : opts;
    return geonef.jig.util.string.summarize(value.text, 16) + opts;
  }

});
