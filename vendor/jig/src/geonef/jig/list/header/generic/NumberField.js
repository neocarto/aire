dojo.provide('geonef.jig.list.header.generic.NumberField');

// parent
dojo.require('geonef.jig.list.header.generic.FilterOperators');

// used in template
dojo.require('dijit.form.TextBox');

dojo.declare('geonef.jig.list.header.generic.NumberField',
             geonef.jig.list.header.generic.FilterOperators,
{

  title: '_Number_',
  name: '_number_',
  canInverse: false,
  realNumber: false,

  operators: {
    equals: { label: '=' },
    notEqual: { label: '!=' },
    gt: { label: '>' },
    gte: { label: '>=' },
    lt: { label: '<' },
    lte: { label: '<=' },
  },

  processFilterValue: function(value) {
    return this.realNumber ? parseFloat(value) : parseInt(value);
  }

});
