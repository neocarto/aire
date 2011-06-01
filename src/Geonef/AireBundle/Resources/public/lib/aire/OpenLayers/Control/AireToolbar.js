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
    console.log('draw', this, arguments);
    var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
    if (!this._controlsDefined) {
      this.defineControls();
    }
    return div;
  },

  activate: function() {
    console.log('activate', this, arguments);
    return OpenLayers.Control.Panel.prototype.activate.apply(this, arguments);
  },


  defineControls: function() {
    this._controlsDefined = true;
    var nav = new OpenLayers.Control.NavigationHistory();
    this.map.addControl(nav);
    var __ = function(s) { return s; };
    var controls =
      [
	new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlHome",
	    title: __("Revenir à l'accueil"),
	    trigger: function() { window.location.reload();} }),
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
	    trigger: dojo.hitch(this, this.exportSvg) }),
	new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlPrint",
	    title: __("Afficher la carte en mode impression"),
	    trigger: dojo.hitch(this, this.exportPrint) }),
	new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlTab",
	    title: __("Récupérer les données"),
	    trigger: dojo.hitch(this, this.exportData) }),
	new OpenLayers.Control.Button(
          {
	    displayClass: "aiControlHelp",
	    title: __("Afficher l'aide"),
	    trigger: dojo.hitch(this, this.showHelp) }),
	// new OpenLayers.Control.pmLegend(
        //   {
	//     title: __("Afficher ou masquer la légende"),
	//     active: true })
      ];
    this.defaultControl = controls[1];
    //console.log('adding controls', this, controls);
    this.addControls(controls);
  },

  exportSvg: function() {

  },

  exportPrint: function() {
    var mapId = this.map.baseLayer.name;
    var qs = '';
    if (this.map.getZoom() !== 0) {
      qs = '?extent='+this.map.getExtent().toBBOX();
    }
    window.open('/map/'+mapId+'/print'+qs, mapId+'-print');
  },

  exportData: function() {
    var mapId = this.map.baseLayer.name;
    var qs = '';
    //if (this.map.getZoom() !== 0) {
    //  qs = '?extent='+this.map.getExtent().toBBOX();
    //}
    window.open('/map/'+mapId+'/csvFeatures'+qs, mapId+'-data');
  }

});
