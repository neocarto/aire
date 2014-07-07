
dojo.provide('geonef.ploomap.list.edition.map.layer.MapFileDef');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');

// in template
dojo.require('geonef.jig.input.BooleanCheckBox');

dojo.declare('geonef.ploomap.list.edition.map.layer.MapFileDef',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container ],
{
  // summary:
  //   Layer whose definition is a bare MapFile layer content
  //

  templateString: dojo.cache("geonef.ploomap.list.edition.map.layer",
                             "templates/MapFileDef.html"),

  widgetsInTemplate: true,

  onChange: function() {
    this.summaryNode.innerHTML = this.attr('summary');
  },

  _getSummaryAttr: function() {
    var value = this.attr('value');
    return value.content ?
      this.value.content.substr(0, 20) + '...' : '';
  }

});
