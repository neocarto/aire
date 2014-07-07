
dojo.provide('geonef.jig.data.list.header.generic.ProgFilterField');

// parent
dojo.require('geonef.jig.list.header.generic.AbstractFilteredSortable');

// used in template
dojo.require('geonef.jig.input.TextBox');
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.jig.data.list.header.generic.ProgFilterField',
              geonef.jig.list.header.generic.AbstractFilteredSortable,
{
  filterLabel: "",

  templateString: dojo.cache('geonef.jig.data.list.header.generic',
                             'templates/ProgFilterField.html'),

  _setValueAttr: function(value, priorityChange) {
    if (value && dojo.isObject(value) && value.title) {
      this.valueTitle = value.title;
    }
    this.inherited(arguments);
  },

  _getFilterHumanValueAttr: function() {
    console.log('_getFilterHumanValueAttr', this, arguments);
    return this.filterLabel + (this.valueTitle || this.filterValue);
  }

});
