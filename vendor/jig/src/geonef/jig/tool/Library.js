dojo.provide('geonef.jig.tool.Library');

// parent classes
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._AutoGrid');

// used in code
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.button.Submit');

// used in template
dojo.require('dijit.form.Button');
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.button.InstanciateAnchored');

dojo.declare('geonef.jig.tool.Library',
	     [ geonef.jig.layout._Anchor, dijit._Templated, geonef.jig.widget._AutoGrid,
               geonef.jig.widget._AutoState ],
{
  title: 'Library',

  widgetList: null,
  widgetListPath: '',
  cssClass: '',
  gridFillDummy: true,

  templateString: '<div class="jigCacoin jigToolLibrary ${cssClass}">'
    + '<button dojoType="dijit.form.Button" '
    + 'style="position:absolute;top:0;right:0;" '
    + 'class="jigBorderTop jigBorderRight" '
    + 'dojoAttachEvent="onClick:destroy">Fermer</button></div>',
  widgetsInTemplate: true,

  getGridMembers: function() {
    // overload
    return this.widgetList || dojo.getObject(this.widgetListPath);
  },

  processGridMember: function(member, tr) {
    // overload
    var method;
    if (!dojo.isObject(member)) {
      member = { value: member, type: 'auto' };
    }
    if (!member.type) { member.type = 'auto'; }
    if (member.type === 'url' ||
        member.type === 'auto' && member.value.indexOf('/') !== -1) {
      method = this.processUrl;
    } else if (member.type === 'class' ||
               member.type === 'auto' && member.value.indexOf('.') !== -1) {
      method = this.processMemberClassName;
    } else if (member.type === 'widget') {
      method = this.processMemberClassName;
    } else {
      console.error('invalid library member:', member, this);
      return;
    }
    method.call(this, member, tr);
  },

  processMemberClassName: function(member, tr) {
    var
      Class = geonef.jig.util.getClass(member.value)
    , buttonNode = dojo.create('button', {}, tr)
    , img = dojo.create('img', { src: Class.prototype.icon }, buttonNode)
    , br = dojo.create('br', {}, buttonNode)
    , span = dojo.create('span',
        { innerHTML: member.title || Class.prototype.title }, buttonNode)
    , self = this
    , button = new dijit.form.Button(
                 { onClick: function() { self.instanciateCacoin(Class); } }, buttonNode)
    ;
  },

  processWidgetName: function(member, tr) {
    var
      buttonNode = dojo.create('button', {}, tr)
    //, img = dojo.create('img', { src: Class.prototype.icon }, buttonNode)
    //, br = dojo.create('br', {}, buttonNode)
    , span = dojo.create('span', { innerHTML: member.title || member.value },
                         buttonNode)
    , self = this
    , button = new dijit.form.Button(
                 { onClick: function() {
                     var w = geonef.jig.workspace.loadWidget(member.value);
                     self.instanciateCacoin(w);
                   } }, buttonNode)
    ;
  },

  processUrl: function(member, tr) {
    var
      span1 = dojo.create('span', {}, tr)
    , img = dojo.create('img', { src: member.icon }, span1)
    , br = dojo.create('br', {}, span1)
    , span = dojo.create('span', { innerHTML: member.title }, span1)
    , button = new geonef.jig.button.Submit(
                 { label: member.title, action: member.value }, span1);
  },

  instanciateCacoin: function(Class) {
    if (dojo.isFunction(Class)) {
      var
      self = this
      , creator = function(id) {
        return new Class(
          { id: id, mapWidget: self.mapWidget }); }
      , widget = geonef.jig.workspace.loadWidget(null, creator)
      ;
    } else {
      var widget = Class;
    }
    geonef.jig.workspace.autoAnchorWidget(widget);
    widget.startup();
    return widget;
  }

});
