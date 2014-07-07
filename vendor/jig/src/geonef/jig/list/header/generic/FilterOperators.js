dojo.provide('geonef.jig.list.header.generic.FilterOperators');

// parent
dojo.require('geonef.jig.list.header.generic.AbstractFilteredSortable');

// used in template
dojo.require('geonef.jig.input.TextBox');
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.jig.list.header.generic.FilterOperators',
             geonef.jig.list.header.generic.AbstractFilteredSortable,
{

  operators: {},

  canInverse: true,

  templateString: dojo.cache('geonef.jig.list.header.generic',
                             'templates/FilterOperators.html'),


  postMixInProperties: function() {
    this.inherited(arguments);
    this.operators = dojo.mixin({}, this.operators);
  },

  postCreate: function() {
    this.inherited(arguments);
    this.populateOptions();
  },

  startup: function() {
    this.inherited(arguments);
    this.updateFilterEnabled();
  },

  populateOptions: function() {
    for (var name in this.operators) {
      if (this.operators.hasOwnProperty(name)) {
        var op = this.operators[name];
        this.opSelect.addOption({ value: name, label: op.label });
      }
    }
  },

  _getValueAttr: function() {
    var value = this.inherited(arguments);
    if (value) {
      var operator = this.opSelect.attr('value');
      var not = this.inverseCheckBox.attr('value');
      value = { op: operator, value: value, not: not };
    }
    return value;
  },

  _setOperatorAttr: function(name) {
    if (!this.operators.hasOwnProperty(name)) {
      throw new Error('operator not supported "'+name+
                      '" for '+this.id);
    }
    this.opSelect.attr('value', name);
  },

  updateFilterEnabled: function() {
    if (!this.filterCheckBox) { return; }
    var state = this.filterCheckBox.attr('value');
    this.filterWidget.attr('disabled', !state);
    this.inverseCheckBox.attr('disabled', !state);
    this.opSelect.attr('disabled', !state);
  },

  _getFilterHumanValueAttr: function() {
    var op = this.operators[this.opSelect.attr('value')];
    if (!op) { return ''; }
    var not = this.inverseCheckBox.attr('value');
    var value = dojo.isString(this.filterValue) ?
      ('"'+this.filterValue+'"') : this.filterValue;
    return (not ? op.labelNot : op.label) + ' ' + value;
  },

  _setCanInverseAttr: function(state) {
    this.canInverse = state;
    dojo.style(this.inverseLabelNode, 'display', state ? '': 'none');
    dojo.style(this.inverseCheckBox.domNode, 'display', state ? '': 'none');
    this.inverseCheckBox.attr('false');
  },

});
