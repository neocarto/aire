
dojo.provide('geonef.ploomap.macro.action.MapBindingEditor');

// parents
dojo.require('geonef.jig.macro.action.Editor');
dojo.require('geonef.ploomap.MapBinding');

dojo.declare('geonef.ploomap.macro.action.MapBindingEditor',
             [ geonef.jig.macro.action.Editor, geonef.ploomap.MapBinding ],
{
  // summary:
  //   Base class for action editors which depend on a map
  //

  autoFindMapWidget: true

});
