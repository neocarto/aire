
dojo.provide('geonef.ploomap.list.header.ogrDataSource.AddList');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._AutoGrid');

// used in code
dojo.require('geonef.jig.button.TooltipWidget');

dojo.declare('geonef.ploomap.list.header.ogrDataSource.AddList',
             [ dijit._Widget, dijit._Templated, geonef.jig.widget._AutoGrid ],
{
  // summary:
  //   Grid widget providing a way to create dataSources of different modules
  //

  templateString: dojo.cache("geonef.ploomap.tool", "templates/MapTools.html"),
  widgetsInTemplate: true,

  modules: [ 'Generic', 'PostgreSql' ],

  classPrefix: 'geonef.ploomap.list.edition.ogrDataSource.',

  getGridMembers: function() {
    // overload
    return this.modules;
  },

  processGridMember: function(member, tr) {
    // overload
    var
      //buttonNode = dojo.create('button', {}, tr)
    //, img = dojo.create('img', { src: Class.prototype.icon }, buttonNode)
    //, br = dojo.create('br', {}, buttonNode)
    //, span = dojo.create('span', { innerHTML: member }, buttonNode)
      self = this
    , button = new geonef.jig.button.TooltipWidget(
                 {
                   //childWidgetClass: this.classPrefix + member,
                   //childWidgetParams: {},
                 //anchor: 'auto',
                 label: member,
	         widgetCreateFunc: function() {
                   var Class = geonef.jig.util.getClass(self.classPrefix + member);
	           var widget = new Class();
                   // self.connect(widget, 'postSave',
                   //              function() { widget.attr('uuid', null); });
                   return widget;
	         }});
    ;
    dojo.place(button.domNode, tr);
    button.startup();
  }

});
