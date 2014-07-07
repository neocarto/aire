

//
// NOT USED - L'idée n'est pas gardée, widgvets sont orientés UI d'abord.
// À faire : widgets input.ButtonSelect compatible avec dijit.form.Select
//

dojo.provide('geonef.jig.input.Choice');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('geonef.jig.input.Choice', [ dijit._Widget, dijit._Templated ],
{
  /**
   * Type of widget: one of 'buttons'
   *
   * @type {string}
   */
  type: '',

  // inherited
  templateString: '<span class="jigInputChoice"></span>',
  widgetsInTemplate: false,

  buildRendering: function() {
    this.inherited(arguments);

  },

  clearInput: function() {
    while (this.domNode.firstChild) {
      this.domNode.removeChild(this.domNode.firstChild);
    }
  },

  buildInput: function() {
    var map = {
      buttons: this.buildInputButtons
    };
    map[this.type]();
  },

  buildInputButtons: function() {

  },

  // hook
  onChange: function() {},


});
