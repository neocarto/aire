
dojo.provide('catapatate.info.About');

dojo.require('jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('jig.version');

dojo.declare('catapatate.info.About', [ jig.layout._Anchor, dijit._Templated ],
{
  templateString: dojo.cache("catapatate.info", "templates/About.html"),
  widgetsInTemplate: true,
  name: 'Notice',
  icon: '/images/icons/tool_about.png',

  postMixInProperties: function() {
    this.version = jig.version;
  }


});
