dojo.provide('geonef.ploomap.tool.MapTools');

// parent classes
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
dojo.require('geonef.jig.widget._AutoGrid');

// used in code
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.layout.anchor.Border');

// used in template
dojo.require('dijit.form.Button');
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
//dojo.require('geonef.ploomap.control.ZoomBar');
dojo.require('geonef.ploomap.tool.Layers');
dojo.require('geonef.jig.button.InstanciateAnchored');

dojo.declare('geonef.ploomap.tool.MapTools',
	     [ geonef.jig.layout._Anchor, dijit._Templated, geonef.ploomap.MapBinding, geonef.jig.widget._AutoGrid ],
{

  templateString: dojo.cache("geonef.ploomap.tool", "templates/MapTools.html"),
  widgetsInTemplate: true,

  getGridMembers: function() {
    // overload
    return this.tools || window.workspaceData.settings.mapTools.tools;
  },

  processGridMember: function(member, tr) {
    // overload
    var
      Class = geonef.jig.util.getClass(member)
    , buttonNode = dojo.create('button', {}, tr)
    , img = dojo.create('img', { src: Class.prototype.icon }, buttonNode)
    , br = dojo.create('br', {}, buttonNode)
    , span = dojo.create('span', { innerHTML: Class.prototype.name }, buttonNode)
    , self = this
    , button = new dijit.form.Button(
                 { onClick: dojo.hitch(this,
                                       geonef.jig.workspace.autoAnchorInstanciate,
                                       member, null, null) },
                 buttonNode)
                 //{ onClick: function() { self.instanciateCacoin(Class); } }, buttonNode)
    ;
  },

  instanciateCacoin: function(Class, button) {
    var
      self = this
    , creator = function(id) {
                    return new Class(
                      { id: id, mapWidget: self.mapWidget }); }
    , widget = geonef.jig.workspace.loadWidget(null, creator)
    ;
    //widget.anchorType widget.anchorPosition
    if (widget.anchorType === 'map') {
      var anchor = new geonef.jig.layout.anchor.Border(
        { widget: this.mapWidget, border: widget.anchorPosition || 'top' });
      //console.log('created anchor ', anchor);
      anchor.accept(widget);
      anchor.destroy();
    } else {
      geonef.jig.workspace.autoAnchorWidget(widget);
    }
    widget.startup();
    return widget;
  }

});
