
/**
 * @requires OpenLayers/Control/Panel.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.Panel');
dojo.require('dojo.fx.easing');

geonef.ploomap.OpenLayers.Control.Panel =
  OpenLayers.Class(OpenLayers.Control.Panel,
{
  controlsClasses: [],
  defaultControlIdx: 0,

  /**
   * Constructor: OpenLayers.Control.EditingToolbar
   * Create an editing toolbar for a given layer.
   *
   * Parameters:
   * layer - {<OpenLayers.Layer.Vector>}
   * options - {Object}
   */
  initialize: function(options) {
    OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
    this._controlsToAdd = [];
    for (var i = 0; i < this.controlsClasses.length; ++i) {
      this._controlsToAdd.push(this.makeControl(this.controlsClasses[i]));
    }
    //var controls = dojo.map(this.controlsClasses, this.makeControl, this);
    console.log('controls', this, this._controlsToAdd);
    console.log('div', this.div);
    this.addControls(this._controlsToAdd);
    this.defaultControl = this._controlsToAdd[this.defaultControlIdx];
    this._controlsToAdd = null;
  },

  makeControl: function(_class) {
    var options = {}; //, getterProp;
    if (dojo.isObject(_class)) {
      if (_class.getterProp) {
        var control = dojo.filter(this._controlsToAdd, function(c) {
                        return c.CLASS_NAME == _class['class']; })[0];
        if (!control) {
          throw new Error('did not find already defined control "'+
                        _class['class']+ '" in panel');
        }
        control = control[_class.getterProp];
        if (!control) {
          throw new Error('property "'+_class.getterProp+'" of control '+
                        _class['class']+' is not defined');
        }
        console.log('got control', this, _class, control);
        return control;
      }
      options = _class.options;
      _class = _class['class'];
    }
    if (dojo.isString(_class)) {
      _class = geonef.jig.util.getClass(_class, false);
    }
    var control = new _class(options);
    return control;
  }

});
