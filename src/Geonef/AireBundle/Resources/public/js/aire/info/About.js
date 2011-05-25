
dojo.provide('aire.info.About');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');

// used in code
dojo.require('geonef.jig.version');

// used in template
dojo.require('dijit.form.Button');

dojo.declare('aire.info.About', [ geonef.jig.layout._Anchor, dijit._Templated ],
{
  templateString: dojo.cache("aire.info", "templates/About.html"),
  widgetsInTemplate: true,
  title: 'Notice',
  icon: '/images/icons/tool_about.png',

  postMixInProperties: function() {
    this.version = geonef.jig.version;
  }


});
