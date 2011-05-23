
/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/BaseTypes.js
 * @requires OpenLayers/Events.js
 * @requires Ploomap.js
 */

OpenLayers.Control.pmLabel = OpenLayers.Class(OpenLayers.Control,
{

  elementClass: null,
  label: '',

  initialize: function(options) {
    OpenLayers.Control.prototype.initialize.apply(this, [options]);
  },

  draw: function(px) {
    OpenLayers.Control.prototype.draw.apply(this, arguments);
    if (this.elementClass)
      this.div.className = this.elementClass;
    this.activate();
    this.redraw();
    return this.div;
  },

  redraw: function() {
    if (!this.div)
      return;
    this.div.innerHTML = this.label;
    this.div.style.display = this.label && this.label != '' ? 'block' : 'none';
  },

  setLabel: function(label) {
    this.label = label;
    this.redraw();
  },

  CLASS_NAME: 'OpenLayers.Control.pmLabel'
});
