
dojo.provide('geonef.jig.data.list.header.generic.Validity');

// parents
dojo.require('geonef.jig.list.header.generic.AbstractFilteredSortable');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');

dojo.declare('geonef.jig.data.list.header.generic.Validity',
             geonef.jig.list.header.generic.AbstractFilteredSortable,
{
  name: 'validity',

  templateString: dojo.cache('geonef.jig.data.list.header.generic',
                             'templates/Validity.html'),

  widgetsInTemplate: true,



});
