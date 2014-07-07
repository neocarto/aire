
dojo.provide('geonef.jig.tool.UserFeedback');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');


// used in template
dojo.require('geonef.jig.input.Group');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.Textarea');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.jig.api');
dojo.require('geonef.jig.version');
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.jig.tool.UserFeedback', [ dijit._Widget, dijit._Templated ],
{
  // summary:
  //   Form to submit a feedback through the API
  //

  templateString: dojo.cache('geonef.jig.tool', 'templates/UserFeedback.html'),
  widgetsInTemplate: true,
  name: "Retour utilisateur",
  icon: dojo.moduleUrl('jig', 'style/icon/tool_feedback.png'),

  apiModule: 'user',

  apiAction: 'feedback',

  buildRendering: function() {
    this.inherited(arguments);
    var user = geonef.jig.workspace.data.user;
    if (user && user.id) {
      this.userId = user.id;
      dojo.style(this.nameNode, 'display', 'none');
    }
  },

  startup: function() {
    this.attr('value', null);
  },

  send: function() {
    //console.log('send', this, arguments);
    var value = this.groupInput.attr('value');
    geonef.jig.api.request(dojo.mixin(
      {
        module: this.apiModule,
        action: this.apiAction,
        message: value.message,
        host: window.location.host,
        version: geonef.jig.version,
        callback: dojo.hitch(this, 'onSent')
      }, this.userId ? {} : { user: value.user }))
    .setControl(this.domNode);

  },

  onSent: function(data) {
    //console.log('onSent', this, arguments);
    alert('Votre retour a été enregistré. Merci !');
    this.groupInput.attr('value', null);
    this.onClose();
  },

  // hook
  onClose: function() {}

});
