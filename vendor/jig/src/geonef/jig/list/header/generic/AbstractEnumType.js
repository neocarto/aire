dojo.provide('geonef.jig.list.header.generic.AbstractEnumType');

// parent
dojo.require('geonef.jig.list.header.generic.AbstractFilteredSortable');
dojo.require('geonef.jig.widget._AsyncInit');

// used in template
dojo.require('dijit.form.NumberTextBox');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.input.Group');

// used in code
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.jig.list.header.generic.AbstractEnumType',
             [geonef.jig.list.header.generic.AbstractFilteredSortable,
              geonef.jig.widget._AsyncInit],
{
  //
  // summary:
  //   Provides a list of items with a check box each, to manually choose which ones to filter or not
  //
  // Used by list header filters like:
  //    geonef.ploomap.list.header.ogrLayer.GeometryType
  //

  templateString: dojo.cache('geonef.jig.list.header.generic',
                             'templates/AbstractEnumType.html'),

  // defaultValueState: boolean
  //    Whether checkboxes are initially checked
  defaultValueState: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.checkboxes = [];
    this.values = [];
  },

  postCreate: function() {
    this.inherited(arguments);
    this.enumValuesInstalled = this.asyncInit.dependsOnNew();
    this.populateEnumValues();
  },

  populateEnumValues: function() {
    throw new Error("'populateEnumValues' must be overloaded on object "+this.id);
  },

  installEnumValues: function(values) {
    values.forEach(this.addValue, this);
    this.enumValuesInstalled();
  },

  addValue: function(value) {
    var cb = new geonef.jig.input.BooleanCheckBox({
               name: value.value,
	       value: value.checked !== undefined ?
                   value.checked : this.defaultValueState
             });
    var div = dojo.create('div', { 'class': 'item' },
                          this.filterWidget.domNode);
    var span = dojo.create('span', { 'class': '',
                                     innerHTML: value.label }, div);
    dojo.place(cb.domNode, div, 'first');
    this.checkboxes.push(cb);
    this.values.push(value);
  },


  _getFilterHumanValueAttr: function() {
    // summary:
    //          Return human summary of current filter def
    //
    var enabled = dojo.isArray(this.filterValue) ? this.filterValue : [];
    var count = enabled.length;
    var totalCount = this.checkboxes.length;
    if (count === totalCount) {
      return '(tout)';
    } else if (count <= 2) {
      return 'Seulement : ' + this.values
	.filter(function(v) { return enabled.indexOf(v.value) !== -1; })
	.map(function(v) { return v.label; })
	.join(', ');
    } else if (totalCount - count <= 2) {
      return 'Tout sauf : ' + this.values
	.filter(function(v) { return enabled.indexOf(v.value) === -1; })
	.map(function(v) { return v.label; })
	.join(', ');
    } else {
      return 'Seulement ' + count + ' sur les ' + totalCount;
    }
  },

  clearFilter: function() {
    //console.log('clearFilter', this);
    this.checkboxes.forEach(function(w) { w.attr('value', true); });
    this.updateFilter();
  },

  _getFilterEnabledAttr: function() {
    //console.log('_getFilterEnabledAttr', this, this.filterValue);
    if (!this.filterValue) { return false; }
    var count = dojo.isArray(this.filterValue) ? this.filterValue.length : 0;
    return count !== this.values.length;
  },

  _getValueAttr: function() {
    var value = this.inherited(arguments);
    //console.log('_getValueAttr', this, value);
    return value ? { op: 'in', value: value } : null;
  },

  _setValueAttr: function(filter, priorityChange_) {
    if (filter && filter.op !== 'in') {
      console.error('operator not supported (should be "in"):',
                    filter.op, 'in filter', filter, this);
      throw new Error('operator not supported');
    }
    if (filter && filter.not === true) {
      var options = filter.value;
      filter.not = false;
      filter.value = this.checkboxes
        .filter(function(cb) {
                  return options.indexOf(cb.attr('name')) === -1; })
        .map(function(cb) { return cb.attr('name'); });
    }
    geonef.jig.list.header.generic.AbstractFilteredSortable.
      prototype._setValueAttr.apply(this, [filter, priorityChange_]);
  },

  checkAll: function() {
    this.checkboxes.forEach(function(w) { w.attr('value', true); });
  },

  checkNone: function() {
    this.checkboxes.forEach(function(w) { w.attr('value', false); });
  },

  checkInverse: function() {
    this.checkboxes.forEach(
      function(w) { w.attr('value', !w.attr('value')); });
  }

});