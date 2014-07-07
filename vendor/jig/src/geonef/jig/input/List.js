
dojo.provide('geonef.jig.input.List');

// parents
dojo.require('geonef.jig.input.MixedList');

// used in template
dojo.require('geonef.jig.button.Action');

dojo.declare('geonef.jig.input.List', geonef.jig.input.MixedList,
{
  // summary:
  //   List of objects, which are represented through objects of the same class
  //

  childClass: '',

  templateString: dojo.cache("geonef.jig.input", "templates/List.html"),

  inflectClassName: function(item) {
    return this.childClass;
  },

  createNew: function() {
    this.addItem({});
  }

});
