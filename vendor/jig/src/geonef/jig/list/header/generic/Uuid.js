dojo.provide('geonef.jig.list.header.generic.Uuid');

// parent
dojo.require('geonef.jig.list.header.generic.AbstractFilteredSortable');

// used in template
dojo.require('geonef.jig.input.TextBox');

dojo.declare('geonef.jig.list.header.generic.Uuid',
             geonef.jig.list.header.generic.AbstractFilteredSortable,
{

  title: 'ID',
  name: 'uuid',
  //baseMsgKey: '',

  templateString: dojo.cache('geonef.jig.list.header.generic', 'templates/Uuid.html')

});