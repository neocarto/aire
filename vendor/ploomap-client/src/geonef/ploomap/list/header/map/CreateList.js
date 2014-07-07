
dojo.provide('geonef.ploomap.list.header.map.CreateList');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._AutoGrid');

// used in code
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.InstanciateAnchored');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.api');

dojo.declare('geonef.ploomap.list.header.map.CreateList',
             [ dijit._Widget, dijit._Templated, geonef.jig.widget._AutoGrid ],
{
  // summary:
  //   Grid widget providing a way to create dataSources of different modules
  //

  //templateString: dojo.cache("geonef.ploomap.tool", "templates/MapTools.html"),

  modules: [ 'ProportionalSymbol', 'Ratio', 'MapFile', 'LayerList' ],

  classPrefix: 'geonef.ploomap.list.edition.map.',

  saveNoticeChannel: 'ploomap/map/save',

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
    , button = this.createButton(member)
    ;
    dojo.place(button.domNode, tr);
    button.startup();
  },

  createButton: function(member) {
    return this.createButtonImmediate(member);
    //return this.createButtonProps(member);
  },

  createButtonImmediate: function(member) {
    return new geonef.jig.button.Action(
      {
        label: member,
        onClick: dojo.hitch(this, 'createMap', member)
      });
  },

  createButtonProps: function(member) {
    return new geonef.jig.button.InstanciateAnchored( //geonef.jig.button.TooltipWidget(
      {
        //childWidgetClass: this.classPrefix + member,
        //childWidgetParams: {},
        anchor: 'auto',
        label: member,
        widgetCreateFunc: function() {
          //console.log('create func!', this, arguments);
          var Class = geonef.jig.util.getClass(self.classPrefix + member);
	  var widget = new Class();
          // self.connect(widget, 'postSave',
          //   function() { console.log('connect postSave', this, arguments);
          //                widget.attr('uuid', null); });
          return widget;
        }
      });
  },

  createMap: function(member) {
    var self = this;
    geonef.jig.api.request(
      {
        module: 'listQuery.map',
        action: 'saveDocument',
        value: { module: member },
        callback: function(data) {
          //console.log('callback', self, arguments);
          dojo.publish(self.saveNoticeChannel, [ data.value.uuid ]);
        }
      });
  }


});
