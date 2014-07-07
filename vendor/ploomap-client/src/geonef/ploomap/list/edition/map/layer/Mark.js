

dojo.provide('geonef.ploomap.list.edition.map.layer.Mark');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Forward');

// used in template
dojo.require('geonef.jig.input.BooleanCheckBox');
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');

dojo.require('geonef.jig.widget._AsyncInit');

/**
 * @class "Virtual" layer meant to be replaced with layers defined in inheriting maps
 */
dojo.declare('geonef.ploomap.list.edition.map.layer.Mark',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Forward],
{

  module: 'Mark',

  templateString: dojo.cache("geonef.ploomap.list.edition.map.layer",
                             "templates/Mark.html"),

  widgetsInTemplate: true,

  uuid: '',

  name: '_mark_',

  forwardKeys: [ 'uuid', 'name', 'module' ],

  deleteMark: function() {
    this.destroy();
  }

});
