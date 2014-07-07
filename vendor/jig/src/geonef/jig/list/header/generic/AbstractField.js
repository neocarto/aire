dojo.provide('geonef.jig.list.header.generic.AbstractField');

//dojo.require('geonef.jig.widget._I18n');

dojo.declare('geonef.jig.list.header.generic.AbstractField', null,
{
  getListWidget: function() {
    if (!this.listWidget) {
      //console.log('getListWidget', this, this.domNode.parentNode.parentNode);
      this.listWidget = dijit.getEnclosingWidget(
	this.domNode.parentNode.parentNode.parentNode);
    }
    return this.listWidget;
  }
});
