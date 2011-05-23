/**
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/Navigation.js
 * @requires OpenLayers/Control/ZoomBox.js
 */

/**
 * Class: OpenLayers.Control.AireToolbar
 *
 * Inherits from:
 *  - <OpenLayers.Control.Panel>
 */
OpenLayers.Control.AireToolbar = OpenLayers.Class(OpenLayers.Control.Panel, {

    beforeTD: null,

    /**
     * Constructor: OpenLayers.Control.NavToolbar
     * Add our two mousedefaults controls.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
	var nav = new OpenLayers.Control.NavigationHistory();
	options.map.addControl(nav);
        this.addControls([
	  new OpenLayers.Control.Button({
	    displayClass: "aiControlHome",
	    title: __("Revenir à l'accueil"),
	    trigger: function() { window.location.reload();} }),
	  new OpenLayers.Control.Navigation({
	    title: __("Activer le mode navigation")}),
	  new OpenLayers.Control.AireFeatureClick({
	    displayClass: "aiControlPointer",
	    title: __("Activer le mode clic d'informations")}),
	  nav.previous,
	  new OpenLayers.Control.ZoomToMaxExtent({
	    title: __("Afficher l'Europe entière")}),
	  nav.next,
	  new OpenLayers.Control.ZoomBox({
	    title: __("Activer le mode zoom en rectangle") }),
	  new OpenLayers.Control.Button({
	    displayClass: "aiControlSave",
	    title: __("Exporter la carte en SVG"),
	    trigger: saveCommand }),
	  new OpenLayers.Control.Button({
	    displayClass: "aiControlPrint",
	    title: __("Afficher la carte en mode impression"),
	    trigger: printCommand }),
	  new OpenLayers.Control.Button({
	    displayClass: "aiControlHelp",
	    title: __("Afficher l'aide"),
	    trigger: function() {showHelp('/aide/aide_index.php');} }),
	  new OpenLayers.Control.pmLegend({
	    title: __("Afficher ou masquer la légende"),
	    active: true })
	  ]);
      this.defaultControl = this.controls[1];
      return legendControl;
    },

    /**
     * Method: draw
     * calls the default draw, and then activates mouse defaults.
     */
    draw: function() {
        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
        this.activateControl(this.controls[1]);
        return div;
    },

    /**
     * This method was picked up from the ancestor OpenLayer.Control.Panel
     * The code is the same EXCEPT a <td> element is created instead of a <div>
     */
    /*   addControls: function(controls) {
        if (!(controls instanceof Array)) {
            controls = [controls];
        }
        this.controls = this.controls.concat(controls);

        // Give each control a panel_div which will be used later.
        // Access to this div is via the panel_div attribute of the
        // control added to the panel.
        // Also, stop mousedowns and clicks, but don't stop mouseup,
        // since they need to pass through.
        for (var i = 0; i < controls.length; i++) {
            var element = document.createElement("td");
            var textNode = document.createTextNode(" ");
            controls[i].panel_div = element;
            if (controls[i].title != "") {
                controls[i].panel_div.title = controls[i].title;
            }
            OpenLayers.Event.observe(controls[i].panel_div, "click",
                OpenLayers.Function.bind(this.onClick, this, controls[i]));
            OpenLayers.Event.observe(controls[i].panel_div, "mousedown",
                OpenLayers.Function.bindAsEventListener(OpenLayers.Event.stop));
        }

        if (this.map) { // map.addControl() has already been called on the panel
            for (var i = 0; i < controls.length; i++) {
                this.map.addControl(controls[i]);
                controls[i].deactivate();
                controls[i].events.on({
                    "activate": this.redraw,
                    "deactivate": this.redraw,
                    scope: this
                });
            }
            this.redraw();
        }
	},*/

    /**
     * Method: redraw
     */
    redraw: function() {
        while (this.div.firstChild != this.beforeTD)
	  this.div.removeChild(this.div.firstChild);
        if (this.active) {
            for (var i = 0; i < this.controls.length; i++) {
                var element = this.controls[i].panel_div;
                if (this.controls[i].active) {
                    element.className = this.controls[i].displayClass + "ItemActive";
                } else {
                    element.className = this.controls[i].displayClass + "ItemInactive";
                }
		var td = document.createElement('td');
		td.className = 'c';
                td.appendChild(element);
              this.div.insertBefore(td, this.beforeTD);
            }
//	    this.div.appendChild(document.createElement('td'));
        }
    },

    CLASS_NAME: "OpenLayers.Control.AireToolbar"
});
