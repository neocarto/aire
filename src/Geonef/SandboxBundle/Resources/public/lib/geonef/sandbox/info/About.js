
dojo.provide('geonef.sandbox.info.About');

dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.version');

dojo.declare('geonef.sandbox.info.About', [ geonef.jig.layout._Anchor, dijit._Templated ],
{
  templateString: dojo.cache("geonef.sandbox.info", "templates/About.html"),
  widgetsInTemplate: true,
  name: 'Notice',
  icon: '/images/icons/tool_about.png',

  postMixInProperties: function() {
    this.version = geonef.jig.version;
  }


});
