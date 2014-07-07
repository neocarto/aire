
dojo.provide('geonef.jig.list.header.generic.SelectFilter');

// parent
dojo.require('geonef.jig.list.header.generic.AbstractSortable');
dojo.require('geonef.jig.widget._AsyncInit');

// in template
dojo.require('dijit.form.Select');

// in code
dojo.require('dojo._base.Deferred');

dojo.declare('geonef.jig.list.header.generic.SelectFilter',
             [geonef.jig.list.header.generic.AbstractSortable, geonef.jig.widget._AsyncInit],
{
  title: '_Select_',
  name: '_select_',
  inListTitle: false,

  templateString: dojo.cache('geonef.jig.list.header.generic', 'templates/SelectFilter.html'),

  optionsCreated: false,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.checkboxes = [];
    this.values = [];
  },

  postCreate: function() {
    //console.log('postCreate', this, arguments);
    this.inherited(arguments);
    this.valuesInstalled = this.asyncInit.dependsOnNew();
    this.populateValues();
  },

  populateValues: function() {
    throw new Error("'populateValues' must be overloaded on object "+this.id);
  },

  installValues: function(values) {
    values.forEach(this.addValue, this);
    this.optionsCreated = true;
    this.valuesInstalled();
  },

  addValue: function(value) {
    this.filterWidget.addOption(
      { value: value.value, label: value.label });
  },

  _getValueAttr: function() {
    //console.log('_getValueAttr common', this.title, this);
    var value = this.filterWidget.attr('value');
    return value === '__all__' ? null : { op: 'ref', value: value };
  },

  _setValueAttr: function(value, priorityChange) {
    //console.log('_setValueAttr', this, arguments);
    if (dojo.isObject(value)) {
      value = value.value;
    }
    var doIt = function() {
      this.filterWidget._onChangeActive = false;
      this.filterWidget.attr('value', !value ? '__all__' : value);
      this.filterWidget._onChangeActive = true;
      if (priorityChange) {
        this.onChange();
      } else {
        this.updateUi(); // for 1st setting
      }
    };
    if (this.optionsCreated) {
      doIt.call(this);
    } else {
      geonef.jig.connectOnce(this, 'installOptions', this, doIt);
    }
  },

  onChange: function() {
    console.log('onChange', this, arguments);
    this.updateUi();
  },

  updateUi: function() {
    var isFiltered = !!this.attr('value');
    if (isFiltered) {
      dojo.addClass(this.domNode, 'filteredField');
    } else {
      dojo.removeClass(this.domNode, 'filteredField');
    }
    if (this.inListTitle) {
      this.getListWidget().attr('titleArgument',
          isFiltered ? this.filterWidget.attr('displayedValue') : null);
    }
  }

});
