
dojo.provide('geonef.jig.list.header.action.CreateModuleButtons');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._AutoGrid');

// used in code
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.InstanciateAnchored');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.api');

dojo.declare('geonef.jig.list.header.action.CreateModuleButtons',
             [ dijit._Widget, dijit._Templated, geonef.jig.widget._AutoGrid ],
{
  // summary:
  //   Grid widget providing a way to create dataSources of different modules
  //

  // namespace for class name inflection
  classNamespace: '.',

  // comes from listWidget.refreshTopic
  saveNoticeChannel: '',

  // comes from listWidget.queryWidget.queryApiModule
  apiModule: '',

  immediate: false,

  // must be false (wait for API response)
  autoBuildGrid: false,

  buildRendering: function() {
    this.inherited(arguments);
    this.requestModules();
  },

  requestModules: function() {
    geonef.jig.api.request({
      module: this.apiModule,
      action: 'getModuleList',
      callback: dojo.hitch(this,
        function(data) {
          this.buildGrid(this.domNode, data.modules);
        })
    });
  },

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
    return this.immediate ? this.createButtonImmediate(member) :
      this.createButtonProps(member);
  },

  createButtonImmediate: function(member) {
    return new geonef.jig.button.Action(
      {
        label: member.label,
        onClick: dojo.hitch(this, 'createDocument', member)
      });
  },

  createButtonProps: function(member) {
    var self = this;
    return new geonef.jig.button.InstanciateAnchored( //geonef.jig.button.TooltipWidget(
      {
        //childWidgetClass: this.classPrefix + member,
        //childWidgetParams: {},
        anchor: 'auto',
        label: member.label,
        widgetCreateFunc: function() {
          //console.log('create func!', this, arguments);
          var Class = geonef.jig.util.getClass(self.classNamespace+'.'+member.name);
	  var widget = new Class();
          return widget;
        }
      });
  },

  createDocument: function(member) {
    var self = this;
    geonef.jig.api.request(
      {
        module: this.apiModule,
        action: 'saveDocument',
        value: { module: member.name },
        callback: function(data) {
          dojo.publish(self.saveNoticeChannel, [ data.value.uuid ]);
        }
      });
  }

});
