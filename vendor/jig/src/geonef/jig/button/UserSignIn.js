
dojo.provide('geonef.jig.button.UserSignIn');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('dijit.form.TextBox');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.button.Link');

// used in code
dojo.require('geonef.jig.api');
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.jig.button.UserSignIn', [ dijit._Widget, dijit._Templated ],
{
  templateString: dojo.cache('geonef.jig.button', 'templates/UserSignIn.html'),
  widgetsInTemplate: true,

  login: function() {
    console.log('login', this, arguments);
  }

});
