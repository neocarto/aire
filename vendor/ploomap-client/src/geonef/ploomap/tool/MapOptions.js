dojo.provide('geonef.ploomap.tool.MapOptions');

dojo.require('dijit._Templated');
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.ploomap.control.ZoomBar');
dojo.require('geonef.ploomap.tool.Layers');

dojo.declare('geonef.ploomap.tool.MapOptions',
		[ geonef.jig.layout._Anchor, dijit._Templated ],
{

  templateString: dojo.cache("geonef.ploomap.tool", "templates/MapOptions.html"),

  widgetsInTemplate: true,

  destroy: function() {
    console.log(this, 'MapOptions destroy');
    this.inherited(arguments);
  },

  startup: function(){
    //console.log('----------- startup MapOptions ', this, this.tabContainer);
    this.inherited(arguments);
    this.tabContainer.resize();
  },

  //////////// Actions: tab "map"

  actionMapControlZoomBar: function() {
    var self = this,
    creator =
      function(id) {
	return new geonef.ploomap.
          control.ZoomBar({
					     id: id,
					     mapWidget: self.relatedWidget });
      },
    controlW = geonef.jig.workspace.loadWidget(
      this.relatedWidget.id+'_control_zoomBar', creator);
    if (controlW) {
      dojo.style(controlW.domNode, {
		   position: 'absolute', zIndex: 42000,
		   left: 0, top: 0, right: 'auto', bottom: 'auto'});
      this.relatedWidget.addChild(controlW);
      controlW.startup();
    }
  },

  test: function() {
    console.log('test!!!', this);
  },

  //////////// Actions: tab "application"

  actionAppDumpWorkspace: function() {
    var data = geonef.jig.workspace.getState();
    console.log('JiG Workspace state:', data);
  },

  actionAppDumpCacoin: function() {
    //console.log('MapOptions!!!', this);
    var data = this.relatedWidget.attr('state');
    console.log('JiG Map cacoin state:', data);

  }

});
