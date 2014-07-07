
dojo.provide('geonef.jig.data.tool.generic.DocValidity');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');

// used in code
dojo.require('geonef.jig.data.tool.generic.PropValidity');

dojo.declare('geonef.jig.data.tool.generic.DocValidity',
             [ dijit._Widget, dijit._Templated ],
{
  /**
   * @type {{valid: boolean, errors: Object.<string, Array.<string>>}}
   */
  validity: {},

  templateString: dojo.cache('geonef.jig.data.tool.generic',
                             'templates/DocValidity.html'),

  widgetsInTemplate: true,

  _setValidityAttr: function(validity) {
    //console.log('_setValidityAttr', this, arguments);
    this.validity = validity;
    this.update();
  },

  update: function() {
    dojo.removeClass(this.domNode, 'valid invalid');
    if (!this.validity) { return; }
    var state = this.validity.valid;
    if (state !== null && state !== undefined) {
      dojo.addClass(this.domNode, state ? 'valid' : 'invalid');
    }
    while (this.listNode.lastChild) {
      this.listNode.removeChild(this.listNode.lastChild);
    }
    var message = this.validity.valid ? "Les paramètres sont valides." :
      "Les paramètres ne sont pas valides :";
    this.messageNode.innerHTML = message;
    geonef.jig.forEach(this.validity.errors || {},
      function(error, prop) {
        var s = geonef.jig.data.tool.generic.PropValidity.prototype.getError(error);
        dojo.place(
          geonef.jig.makeDOM(
            ['tr', {}, [
               ['td', {},
                [['div', { 'class': 'prop' }, prop],
                 ['div', { 'class': 'message' }, s.message],
                 ['div', { 'class': 'detail' }, s.detail]]]]]),
          this.listNode);
      }, this);
  }


});
