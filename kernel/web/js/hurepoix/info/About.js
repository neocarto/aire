
dojo.provide('hurepoix.info.About');

dojo.require('jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('jig.version');

dojo.declare('hurepoix.info.About', [ jig.layout._Anchor, dijit._Templated ],
{
  templateString: dojo.cache("hurepoix.info", "templates/About.html"),
  widgetsInTemplate: true,
  name: 'Notice',
  icon: '/images/icons/tool_about.png',

  postMixInProperties: function() {
    this.version = jig.version;
  }


});
