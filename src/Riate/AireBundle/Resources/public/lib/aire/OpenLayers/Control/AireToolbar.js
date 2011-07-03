/**
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/Navigation.js
 * @requires OpenLayers/Control/ZoomBox.js
 */

dojo.provide('aire.OpenLayers.Control.AireToolbar');

// used in code
dojo.require('geonef.ploomap.OpenLayers.Control.WMSGetFeatureInfo');

/**
 * Class: OpenLayers.Control.AireToolbar
 *
 * Inherits from:
 *  - <OpenLayers.Control.Panel>
 */
aire.OpenLayers.Control.AireToolbar =
  OpenLayers.Class(OpenLayers.Control.Panel,
{

  initialize: function(options) {
    OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
  },

  draw: function() {
    var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
    if (!this._controlsDefined) {
      this.defineControls();
    }
    return div;
  },

  activate: function() {
    return OpenLayers.Control.Panel.prototype.activate.apply(this, arguments);
  },


  defineControls: function() {
    this._controlsDefined = true;
    var nav = new OpenLayers.Control.NavigationHistory();
    this.map.addControl(nav);
    var __ = function(s) { return s; };
    var self = this;
    var legendButton;
    var controls =
      [
	new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlHome",
	    title: __("Revenir à l'accueil"),
	    trigger: function() { window.location = '/'+aire.app.locale;} }),
	new OpenLayers.Control.Navigation(
          {
	    title: __("Activer le mode navigation"),
            zoomWheelEnabled: false }),
	new geonef.ploomap.OpenLayers.Control.WMSGetFeatureInfo(),
	nav.previous,
	new OpenLayers.Control.ZoomToMaxExtent(
          {
	    title: __("Afficher l'Europe entière")}),
	nav.next,
	new OpenLayers.Control.ZoomBox(
          {
	    title: __("Activer le mode zoom en rectangle") }),
	new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlSave",
	    title: __("Exporter la carte en SVG"),
	    trigger: aire.app.exportSvg }),
	new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlPrint",
	    title: __("Afficher la carte en mode impression"),
	    trigger: aire.app.exportPrint }),
	new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlData",
	    title: __("Récupérer les données"),
	    trigger: aire.app.exportData }),
	new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlHelp",
	    title: __("Afficher l'aide"),
	    trigger: function() { dojo.hash('help/'); } }),
	legendButton = new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlLegend",
            type: OpenLayers.Control.TYPE_TOGGLE,
            activate: function() {
              var state = OpenLayers.Control.Button.prototype.activate.call(this, arguments);
              aire.app.updateLegend(true);
              return state;
            },
            deactivate: function() {
              var state = OpenLayers.Control.Button.prototype.deactivate.call(this, arguments);
              aire.app.updateLegend(false);
              return state;
            },
	    title: __("Afficher ou masquer la légende"),
	    active: true })
      ];
    this.defaultControl = controls[1];
    //console.log('adding controls', this, controls);
    this.addControls(controls);
    legendButton.activate();
  }

});
