dojo.provide('geonef.jig.button.Submit');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('dijit.form.Button');

dojo.declare('geonef.jig.button.Submit', [dijit._Widget, dijit._Templated],
{
  action: '',
  method: 'get',
  label: "GO",
  target: '_blank',
  inline: true,
  buttonClass: '',

  templateString: dojo.cache('geonef.jig.button', 'templates/Submit.html'),
  widgetsInTemplate: true,


  _setActionAttr: function(action) {
    this.action = action;
    this.formNode.action = action;
  },

  _setMethodAttr: function(method) {
    this.method = method;
    this.formNode.method = method;
  },

  _setTargetAttr: function(target) {
    this.target = target;
    this.formNode.target = target;
  },

  _setLabelAttr: function(label) {
    this.label = label;
    this.button.attr('label', label);
  },

  _setInlineAttr: function(inline) {
    this.inline = inline;
    dojo.style(this.formNode, 'display', inline ? 'inline' : '');
  },

  _setButtonClassAttr: function(classes) {
    if (this.buttonClass) {
      dojo.removeClass(this.button.domNode, this.buttonClass);
    }
    dojo.addClass(this.button.domNode, classes);
    this.buttonClass = classes;
  }

});
