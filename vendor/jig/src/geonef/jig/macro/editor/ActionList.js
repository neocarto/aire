
dojo.provide('geonef.jig.macro.editor.ActionList');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('geonef.jig.widget._AutoGrid');

// used in code
dojo.require('geonef.jig.macro.Editor');

dojo.declare('geonef.jig.macro.editor.ActionList',
             [ geonef.jig.layout._Anchor, geonef.jig.widget._AutoGrid ],
{
  // summary:
  //   // Layer library for application "histoire""
  //

  gridFillDummy: true,

  actionRunnerClasses: [
    'geonef.jig.macro.action.TextRunner',
    'geonef.jig.macro.action.TimeRunner',
    'geonef.jig.macro.action.MacroRunner',
    'geonef.jig.macro.action.ScriptRunner',
    'geonef.ploomap.macro.action.RegionRunner',
    'geonef.ploomap.macro.action.MapRunner',
    'geonef.ploomap.macro.action.LayerRunner'
  ],

  getGridMembers: function() {
    return this.actionRunnerClasses.map(
      function(runnerClass) {
        var RunnerClass = geonef.jig.util.getClass(runnerClass);
        return {
          label: RunnerClass.prototype.label,
          //icon: editorClass.prototype.icon,
          runnerClass: runnerClass
        };
      });
  },

  addAction: function(action) {
    //console.log('addAction', this, arguments);
    this.onAddAction(action);
  },

  onAddAction: function(action) {
    //console.log('onAddAction', this, arguments);
  },


  /////////////////////////////////////////////////////////////
  // UI

  processGridMember: function(actionType, tr) {
    // overload
    var dc = dojo.create
    , buttonNode = dc('button', {}, tr);
    if (actionType && actionType.icon) {
      var img = dc('img', { src: actionType.icon }, buttonNode)
      , br = dc('br', {}, buttonNode);
    }
    var params = {};
    var self = this;
    var innerHTML = '&nbsp;';
    if (actionType) {
      params.onClick = function() { self.addAction(actionType.runnerClass); };
      innerHTML = actionType.label;
    }
    var span = dc('span', { innerHTML: innerHTML }, buttonNode);
    var button = new dijit.form.Button(params, buttonNode);
  }

});
