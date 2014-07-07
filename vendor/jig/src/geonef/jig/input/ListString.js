
dojo.provide('geonef.jig.input.ListString');

// parents
dojo.require('dijit.form.TextBox');

dojo.declare('geonef.jig.input.ListString', [ dijit.form.TextBox ],
{
  // summary:
  //   Interpret string as char-separated list of values
  //

  // itemType: string
  //    type of items, among ['string', 'integer', 'float']
  itemType: 'string',

  separator: ',',

  displaySeparator: ', ',

  _getValueAttr: function() {
    var str = this.inherited(arguments) || '';
    str = dojo.trim(str);
    if (str === '') {
      return [];
    }
    return str.split(this.separator).map(dojo.hitch(this, 'filterItemGet'));
  },

  _setValueAttr: function(list) {
    if (!dojo.isArray(list)) {
      list = [list];
    }
    var str = list.map(dojo.hitch(this, 'filterItemSet'))
      .join(this.displaySeparator);
    dijit.form.TextBox.prototype._setValueAttr.apply(this, [str]);
  },

  onChange: function() {
    var value = this.attr('value');
    this.attr('value', value);
  },

  filterItemGet: function(itemStr) {
    var val = dojo.trim(itemStr);
    if (this.itemType === 'integer') {
      return parseInt(val, 10);
    }
    if (this.itemType === '') {
      return parseFloat(val);
    }
    return val;
  },

  filterItemSet: function(item) {
    return ''+item;
  }

});
