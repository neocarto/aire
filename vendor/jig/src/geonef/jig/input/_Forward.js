
dojo.provide('geonef.jig.input._Forward');

dojo.declare('geonef.jig.input._Forward', null,
{
  // summary:
  //   Forward object value to indenpensant keys
  //

  // forwardKeys: array
  //    list of keys to forward
  forwardKeys: [],

  _setValueAttr: function(value) {
    //console.log('forward _setValueAttr', this, value);
    if (dojo.isObject(value)) {
      for (var key in value) {
        if (value.hasOwnProperty(key) &&
            this.forwardKeys.indexOf(key) !== -1) {
          this.attr(key, value[key]);
        }
      }
    } else {
      this.inherited(arguments);
    }
  },

  _getValueAttr: function() {
    var self = this;
    var obj = {};
    this.forwardKeys.forEach(
      function(key) { obj[key] = self.attr(key); });
    return obj;
  },


});
