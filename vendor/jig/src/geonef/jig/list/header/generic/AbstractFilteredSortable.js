dojo.provide('geonef.jig.list.header.generic.AbstractFilteredSortable');

// parents
dojo.require('geonef.jig.list.header.generic.AbstractSortable');
dojo.require('geonef.jig.input._Container');

// commonly used in child classes' templates
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.button.Action');

/**
 * @todo rename "buttonNode" to "button" since it is a widget, not a DOMElement
 */
dojo.declare('geonef.jig.list.header.generic.AbstractFilteredSortable',
             [geonef.jig.list.header.generic.AbstractSortable, geonef.jig.input._Container],
{

  filterValue: null,
  validateFilter: false,

  postCreate: function() {
    var self = this;
    this.inherited(arguments);
  },

  _setTitleAttr: function(value) {
    this.buttonNode.attr('label', value);
  },

  /**
   * Getter for filter definition
   */
  _getValueAttr: function() {
    //console.log('_getValueAttr common', this.title, this);
    return this.attr('filterEnabled') ? this.filterValue : null;
  },

  /**
   * Setter for filter definition
   */
  _setValueAttr: function(value, priorityChange) {
    if (value && dojo.isObject(value)) {
      if (value.op) {
        this.attr('operator', value.op);
        value = value.value;
      }
    }
    this.filterValue = value;
    if (this.filterWidget) {
      this.filterWidget.attr('value', value, priorityChange);
    }
    if (value) {
      this.updateUi();
    } else {
      this.onChange(); // setting null on filterWidget
                       // does not trigger 'onChange'
    }
  },

  /**
   * Getter for filter state (active or not)
   */
  _getFilterEnabledAttr: function() {
    //console.log('_getFilterEnabledAttr', this);
    return this.filterValue !== undefined &&
      this.filterValue !== null &&
      this.filterValue !== '';
  },

  /**
   * Get human-readable representation of the filter value
   */
  _getFilterHumanValueAttr: function() {
    return this.filterValue;
  },

  /**
   * Triggered when filter input has changed
   */
  onFilterChange: function() {
    //var v = this.filterWidget.attr('value');
    //console.log('onFilterChange', this, v, arguments);
  },

  /**
   * Update filter value (after click on the OK button)
   */
  updateFilter: function() {
    var status = !this.validateFilter || this.filterWidget.validate();
    if (status) {
      this.filterValue = this.processFilterValue(this.filterWidget.attr('value'));
      this.onChange();
    } else {
      console.warn('validation failed on ', this, this.attr('value'));
    }
  },

  processFilterValue: function(value) {
    return value; // hook
  },

  /**
   * Clear current filter
   */
  clearFilter: function() {
    this.attr('value', null);
    //this.filterWidget.attr('value', null);
    //this.updateFilter();
  },

  /**
   * When the filter value has changed
   */
  onChange: function() {
    //console.log('onChange', this.title);
    this.inherited(arguments);
    this.updateUi();
  },

  updateUi: function() {
    if (this.attr('filterEnabled')) {
      this.filterSummaryValueNode.innerHTML = this.attr('filterHumanValue');
      dojo.style(this.filterSummaryNode, 'display', '');
      dojo.addClass(this.domNode, 'filteredField');
    } else {
      dojo.removeClass(this.domNode, 'filteredField');
      dojo.style(this.filterSummaryNode, 'display', 'none');
    }
  }

});
