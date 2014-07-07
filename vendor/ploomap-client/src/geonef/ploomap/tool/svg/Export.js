dojo.provide('geonef.ploomap.tool.svg.Export');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
dojo.declare('geonef.ploomap.tool.svg.Export',
		[dijit._Widget, dijit._Templated, geonef.ploomap.MapBinding], {

	templatePath: dojo.moduleUrl('geonef.ploomap', 'templates/ToolSvgExport.html'),

	commands: [ 'DrawRectangle', 'StopDraw' /*'Export'*/ ],

	bounds: null,

	constructor: function() {
		dojo.mixin(this, {
			vectorLayer: null,
			drawExtentControl: null,
		});
	},

	mapBound: function() {
		var self = this;
		/*if (!this.bounds && this.data.bounds) {
			this.bounds = this.data.bounds;
		}*/
		if (this.bounds) {
			this.setBounds(this.bounds);
		}
		this.init();
		this.connectCommands();
	},

	init: function() {
		this.infoDiv.innerHTML = 'Dessiner le rectangle pour procéder à ' +
				'l\'exportation SVG.';
	},

	onCommandDrawRectangle: function() {
		dojo.addClass(this.commandDrawRectangle, 'active');
		dojo.removeClass(this.commandStopDraw, 'active');
		this.createVectorLayer();
		this.createControl();
	},

	onCommandStopDraw: function() {
		dojo.removeClass(this.commandDrawRectangle, 'active');
		dojo.addClass(this.commandStopDraw, 'active');
		this.map.map.removeControl(this.drawExtentControl);
		this.drawExtentControl.destroy();
		this.drawExtentControl = null;
		this.vectorLayer.removeFeatures(this.vectorLayer.features);
	},

	/**
	 * Called by onCommandDrawRectangle to create the vector layer
	 */
	createVectorLayer: function()
	{
		var self = this;
	    this.vectorLayer = new OpenLayers.Layer.Vector
	    ("export", { maxResolution:"auto",
			  preFeatureInsert:function(f) { self.onDrawExtent(f);}});
	    this.map.map.addLayer(this.vectorLayer);
	},

	/**
	 * Called by onCommandDrawRectangle to create the vector layer
	 */
	createControl: function() {
	    this.drawExtentControl = new OpenLayers.Control.DrawFeature
	      (this.vectorLayer, OpenLayers.Handler.RegularPolygon,
	       {handlerOptions: {sides:4,irregular:true }});
	    this.map.map.addControl(this.drawExtentControl);
	    this.drawExtentControl.activate();
	},

	/*onCommandExport: function() {

	},*/

	onDrawExtent: function(feature) {
		this.setBounds(feature.geometry.getBounds());
		//dojo.filter(
		this.vectorLayer.removeFeatures(
			this.vectorLayer.features
					.filter(function (f) { return f !== feature; }));
	},

	setBounds: function(bounds) {
		var w = parseInt(bounds.getWidth()),
			h = parseInt(bounds.getHeight());
		this.bounds = bounds;
		//this.data.bounds = this.bounds();
	    var dim = '' + w + 'x' + h + ' mètres';
		this.infoDiv.innerHTML = dim;
		this.commandExport.href = this.getUrl();
		dojo.style(this.commandExport, 'display', '');

	},

	getUrl: function() {
		return '/cartapatate/svg?' + dojo.objectToQuery({
			bbox: this.bounds.toBBOX()
		});
	}

});
