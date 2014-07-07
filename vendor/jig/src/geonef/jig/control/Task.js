
dojo.provide('geonef.jig.control.Task');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('geonef.jig.control.Task', [ dijit._Widget, dijit._Templated ],
{
  // summary:
  //   Task summary & control UI tool
  //

  templateString: dojo.cache('geonef.jig.control', 'templates/Task.html'),
  widgetsInTemplate: false,

  postCreate: function() {
    this.inherited(arguments);

  }


});
