
dojo.provide('geonef.jig.button.UserStatus');

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

dojo.declare('geonef.jig.button.UserStatus', [ dijit._Widget, dijit._Templated ],
{
  templateString: dojo.cache('geonef.jig.button', 'templates/UserStatus.html'),
  widgetsInTemplate: true,

  creditsWidgetClass: null,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.user = dojo.mixin({ icon: '', username: '' },
                           geonef.jig.workspace.data.user);
  },

  postCreate: function() {
    this.inherited(arguments);
    //this.button.attr('label', this.user.username);
    ['username', 'email'].forEach(
      function(p) { this[p+'Node'].innerHTML = this.user[p]; }, this);
  },

  openCredits: function() {
    geonef.jig.workspace.autoAnchorInstanciate(this.creditsWidgetClass);
  },

  openFeedback: function() {
    geonef.jig.workspace.autoAnchorInstanciate('geonef.jig.tool.UserFeedback');
  },

  logout: function() {
    console.log('logout', this, arguments);
    window.location = '/user/logout';
  }

});
