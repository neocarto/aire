dojo.provide('geonef.jig.layout._StateContainer');

dojo.require('dijit.layout._LayoutWidget');

dojo.declare('geonef.jig.layout._StateContainer', dijit.layout._LayoutWidget,
{
  // summary:
  //    Mixin class to handle "state" attribute for container children via standard _{g,s}etStateAttr()
  //

  appearTarget: null,

  _getStateAttr: function() {
    //console.log(this, '_StateContainer _getStateAttr');
    return {
      children: this.getChildren().map(
	function(child) { return child.id; })
    };
  },

  _setStateAttr: function(data) {
    //console.log(this, '_StateContainer _setStateAttr');
    if (dojo.isArray(data.children)) {
      var self = this;
      data.children
	.map(function(id) { return geonef.jig.workspace.loadWidget(id); })
	.forEach(function(child) { self.addChild(child); });
    }
    if (data.appearTarget) {
      this.appearTarget = data.appearTarget;
    }
  }

});
