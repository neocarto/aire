
dojo.provide('geonef.jig.widget._AutoState');

dojo.declare('geonef.jig.widget._AutoState', null,
{
  // summary:
  //
  //

  _setStateAttr: function(state) {
    this.inherited(arguments);
    for (var i in state) {
      if (state.hasOwnProperty(i)) {
        this.attr(i, state[i]);
      }
    }
  }

});
