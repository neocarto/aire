dojo.provide('geonef.ploomap.cacoin.Directions');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
dojo.require('geonef.ploomap.input.Location');
dojo.declare('geonef.ploomap.cacoin.Directions',
	[dijit._Widget, dijit._Templated, geonef.ploomap.MapBinding], {

	templatePath: dojo.moduleUrl('geonef.ploomap.cacoin', 'templates/Directions.html'),
	/*templateString:
	   '<div><a href="#" dojoAttachPoint="link">Lien</a></div>',*/

	widgetsInTemplate: true,

	buildUI: function() {
	    var onEitherChange = function() {
	    	console.log('onEitherChange', this);
			var start = this.startInput.attr('value'),
				end = this.endInput.attr('value');
			console.log('onEitherChange 2');
	    	if (start && end) {
	    		this.doQuery();
	    	}
	    	console.log('onEitherChange end');
	    };
	    dojo.connect(this.startInput, 'onChange', this, onEitherChange);
	    dojo.connect(this.endInput, 'onChange', this, onEitherChange);

	},

	doQuery: function() {
		var sphericalMeractor = OpenLayers.Layer.SphericalMercator,
			startOL = this.startInput.attr('value'),
			startOL2 = sphericalMeractor.inverseMercator(startOL.lon, startOL.lat),
			start = '' + startOL2.lat + ', ' + startOL2.lon,
			//start = '' + startOL2.lon + ', ' + startOL2.lat,
			endOL = this.endInput.attr('value'),
			endOL2 = sphericalMeractor.inverseMercator(endOL.lon, endOL.lat),
			end = '' + endOL2.lat + ', ' + endOL2.lon,
			//end = '' + endOL2.lon + ', ' + endOL2.lat,
			directions = new GDirections(null, this.testNode),
			options = {
				locale: 'fr',
				getPolyline: true,
				travelMode: this.travelModeSelect.value === 'walk' ?
					G_TRAVEL_MODE_WALKING : G_TRAVEL_MODE_DRIVING,
				avoidHighways: this.avoidHighwaysInput.value === 'true'
			};
		console.log('doQuery', directions, start, '||', end, startOL2, endOL2, startOL, endOL);
		this.testNode.innerHTML = '';
		if (this.layer) {
			this.map.map.removeLayer(layer);
			this.layer.destroy();
			this.layer = null;
		}
		GEvent.addListener(directions, 'load', dojo.hitch(this, function() {
			this.onRouteFound(directions);
		}));
		GEvent.addListener(directions, 'error', dojo.hitch(this, function() {
			this.onRouteError(directions);
		}));
		var query = "from: "+start+" to: "+end;
  		var s = directions.load(query, options);
  		//console.log(directions, s, this.testNode);
	},

	onRouteFound: function(directions) {
		console.log('onRouteFound', directions, this);
		// zoom
		var s = this.getOLBoundsFromGLatLngBounds(directions.getBounds());
		this.map.map.zoomToExtent(s);
		// durée
		var d = directions.getDuration().seconds,
			txt = '' + parseInt(d / 3600) + ':'
				+ parseInt((d % 3600) / 60) + ':'
				+ parseInt((d % 3600) % 60);
		// distance
		var di = directions.getDistance().meters,
			km = di / 1000,
			txt2 = km,
			nb = directions.getNumRoutes();
			txt3 =  'Nombre d\'itinéraires : ' + nb,
			msg =
			//msg = 'Durée : ' + txt + '   (' + d + ' s)<br/>' +
				//'Distance : ' + txt2 + ' km (' + di + ' m)<br/>' +
				txt3;
		//alert(msg);
		this.summaryNode.innerHTML = msg;
		var self = this;
		//window.setTimeout(function() {
			var route = directions.getRoute(0)
			self.drawGPolyline(route);
			//var polyline = directions.getPolyline();
			//self.drawGPolyline(polyline);
		//}, 2000);
	},

	drawGPolyline: function(p) {
		//console.log('drawGPolyline', this, p);
		var geom = this.getOLGeometryFromGRoute(p),
			st = {
				strokeColor: "#ff0000",
				strokeWidth: 3
			},
			style = new OpenLayers.Style(st);
			feature = new OpenLayers.Feature.Vector(geom, {
				style: style
			}),
			layer = new OpenLayers.Layer.Vector('itineraire');
		this.map.map.addLayer(layer);
		layer.setVisibility(true);
		layer.setZIndex(442000);
		layer.addFeatures([ feature ]);
		layer.drawFeature(feature, st);
		layer.refresh();
		this.layer = layer;
		//console.log('drawGPolyline var', geom, feature, layer);
	},

	getOLGeometryFromGRoute: function(p) {
		var i, v, bounds, pt, geom, x, y,
			c = p.getNumSteps(),
			pts = [],
			google = this.map.map.baseLayer;
		for (i = 0; i < c; i++) {
			v = p.getStep(i).getLatLng();
			x = google.getLongitudeFromMapObjectLonLat(v);
			y = google.getLatitudeFromMapObjectLonLat(v);
			pt = new OpenLayers.Geometry.Point(x, y);
			pts.push(pt);
		}
		geom = new OpenLayers.Geometry.LineString(pts);
		return geom;
	},

	onRouteError: function(directions) {
		console.log('onRouteError', directions, this);
		this.summaryNode.innerHTML = 'Pas d\'itinéraire trouvé !';
		//alert('Pas d\'itinéraire trouvé !');
	},

	getOLBoundsFromGLatLngBounds: function(gLatLngBounds) {
		return this.map.map.baseLayer
				.getOLBoundsFromMapObjectBounds(gLatLngBounds);
	}

});
