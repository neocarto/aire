dojo.provide('geonef.jig.list.header.generic.StringField');

// parent
dojo.require('geonef.jig.list.header.generic.FilterOperators');

// used in template
dojo.require('dijit.form.TextBox');

dojo.declare('geonef.jig.list.header.generic.StringField',
             geonef.jig.list.header.generic.FilterOperators,
{

  title: '_String_',
  name: '_string_',

  operators: {
    contains: { label: 'Contient', labelNot: 'Ne contient pas' },
    equals: { label: 'Vaut', labelNot: 'Différent de' },
    beginWith: { label: 'Commence par', labelNot: 'Ne commence pas par' },
    endWith: { label: 'Finit par', labelNot: 'Ne finit pas par' },
    regexp: { label: 'Expr. régulière', labelNot: '!expr. régulière' }
  }

});
