dojo.provide('geonef.ploomap.cacoin.Measure');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
/**
 * http://openlayers.org/dev/examples/measure.html
 */
dojo.declare('geonef.ploomap.cacoin.Measure',
	[dijit._Widget, dijit._Templated, geonef.ploomap.MapBinding], {

	templatePath: dojo.moduleUrl('geonef.ploomap.cacoin', 'templates/Measure.html'),

	widgetsInTemplate: true,

	constructor: function() {
		dojo.mixin(this, {
			measureControls: null
		});
	},

	buildUI: function() {
	    this.initControl();
	},

    initControl: function(){
        OpenLayers.Util.onImageLoadErrorColor = "transparent";
        // style the sketch fancy
        var sketchSymbolizers = {
            "Point": {
                pointRadius: 4,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 1,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#DDBB66"
            },
            "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#DDBB66",
                strokeDashstyle: "dash"
            },
            "Polygon": {
                strokeWidth: 2,
                strokeOpacity: 1,
                strokeColor: "#DDBB66",
                fillColor: "#DDBB66",
                fillOpacity: 0.3
            }
        };
        var style = new OpenLayers.Style();
        style.addRules([
            new OpenLayers.Rule({symbolizer: sketchSymbolizers})
        ]);
        var styleMap = new OpenLayers.StyleMap({"default": style});
        this.measureControls = {
            line: new OpenLayers.Control.Measure(
                OpenLayers.Handler.Path, {
                    persist: true,
                    handlerOptions: {
                        layerOptions: {styleMap: styleMap}
                    }
                }
            ),
            polygon: new OpenLayers.Control.Measure(
                OpenLayers.Handler.Polygon, {
                    persist: true,
                    handlerOptions: {
                        layerOptions: {styleMap: styleMap}
                    }
                }
            )
        };
        var control, self = this;
        for(var key in this.measureControls) {
            control = this.measureControls[key];
            control.events.on({
                "measure": function()
                	{ self.handleMeasurements.apply(self, arguments); },
                "measurepartial": function()
                	{ self.handleMeasurements.apply(self, arguments); }
            });
            this.map.map.addControl(control);
        }
        dojo.query('input.controlToggle', this.optionsNode)
        	.connect('onclick', this, function(radio) {
        		this.toggleControl(radio.currentTarget);
        	});
        dojo.query('input.geodesicToggle', this.optionsNode)
        	.connect('onclick', this, function(radio) {
        		this.toggleGeodesic(radio.currentTarget);
        	});
        //this.noneToggle.checked = true;
    },

    handleMeasurements: function(event) {
    	console.log('handleMeasurements', this, event);
        var geometry = event.geometry;
        var units = event.units;
        var order = event.order;
        var measure = event.measure;
        var element = this.outputNode;
        var out = "";
        if(order == 1) {
            out += "measure: " + measure.toFixed(3) + " " + units;
        } else {
            out += "measure: " + measure.toFixed(3) + " " + units + "<sup>2</" + "sup>";
        }
        element.innerHTML = out;
    },

    toggleControl: function(element) {
    	console.log('toggleControl', this, element);
        for(key in this.measureControls) {
            var control = this.measureControls[key];
            if(element.value == key && element.checked) {
                control.activate();
            } else {
                control.deactivate();
            }
        }
    },

    toggleGeodesic: function(element) {
        for(key in this.measureControls) {
            var control = measureControls[key];
            control.geodesic = element.checked;
        }
    }
});
