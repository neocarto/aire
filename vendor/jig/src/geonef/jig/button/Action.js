dojo.provide('geonef.jig.button.Action');
dojo.require('dijit.form.Button');
dojo.declare('geonef.jig.button.Action', dijit.form.Button,
{

  disablingTopic: 'jig/api/request',

  _setDisablingTopicAttr: function(topic) {
    //console.log('_setDisablingTopicAttr', this, arguments);
    this.disablingTopic = topic;
    if (this.subscrHandler) {
      dojo.unsubscribe(this.subscrHandler);
    }
    if (dojo.isString(topic) && topic.length) {
      this.subscrHandler = dojo.subscribe(
	topic, this, 'disablingTopicNotif');
    }
  },

  destroy: function() {
    this.attr('disablingTopic', null);
    this.inherited(arguments);
  },

  _setDisabledAttr: function(state) {
    this.actuallyDisabled = !!state;
    this.inherited(arguments);
  },

  disablingTopicNotif: function(state) {
    //console.log('disablingTopicNotif', this, arguments);
    // restore state only if it hasn't been changed since last time
    this.disabledForTopic = !!state;
    if (this.actuallyDisabled === true || this.actuallyDisabled === false) {
      this.actuallyDisabled = null;
    } else {
      this.attr('disabled', !!state);
    }
  }

});
