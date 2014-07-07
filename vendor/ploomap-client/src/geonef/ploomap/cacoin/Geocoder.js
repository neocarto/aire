dojo.provide('geonef.ploomap.cacoin.Geocoder');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
dojo.require('geonef.ploomap.input.Location');
dojo.declare('geonef.ploomap.cacoin.Geocoder',
	[dijit._Widget, dijit._Templated, geonef.ploomap.MapBinding], {

	templatePath: dojo.moduleUrl('geonef.ploomap.cacoin', 'templates/Geocoder.html'),
	/*templateString:
	   '<div><a href="#" dojoAttachPoint="link">Lien</a></div>',*/

	widgetsInTemplate: true,

	buildUI: function() {
		this.google = this.map.map.baseLayer;
	    dojo.connect(this.link, 'onclick', this,
	    		function() { this.callback(); });
	    dojo.connect(this.link2, 'onclick', this,
	    		function() { this.reverseGeocoding(); });
	    this.locationInput_.attr('map', this.map);
	},

	reverseGeocoding: function() {
		var c = this.map.map.getCenter(),
			lonlat = this.google.inverseMercator(c.lon, c.lat);
            gLatLng = new GLatLng(lonlat.lat, lonlat.lon);
		this.doRequest(gLatLng);
	},

	callback: function() {
		var query = this.locationInput.value;

		this.summaryNode.innerHTML = '';
		if (this.layer) {
			this.map.map.removeLayer(layer);
			this.layer.destroy();
			this.layer = null;
		}
		this.doRequest(query);
	},

	/**
	 * For geocoding or reverse (same GMap query class)
	 */
	doRequest: function(query) {
		this.summaryNode.innerHTML = ' Requête en cours... ';
		var geocoder = new GClientGeocoder();
		geocoder.getLocations(query, dojo.hitch(this,
			function(response) { this.processResponse(response); }));
	},

	/**
	 * Callback for doRequest()
	 */
	processResponse: function(r) {
		console.log('processResponse', this, r);
		if (r.Status.code === G_GEO_UNKNOWN_ADDRESS) {
			this.summaryNode.innerHTML = 'Aucun emplacement trouvé !';
			return;
		}
		this.summaryNode.innerHTML = '';
		dojo.forEach(r.Placemark, dojo.hitch(this,
			function(p) { this.processPlace(p); }));
		if (r.Placemark.length === 1) {
			this.goToPlace(r.Placemark[0]);
		}
	},

	processPlace: function(p) {
		//console.log('processPlace', this, p);
		var div =document.createElement('div'),
			a = document.createElement('a');
			human = p.address,
			acc = p.AddressDetails.Accuracy,
			c = p.Point.coordinates,
			coords = '' + c[0] + ' ; ' + c[1];

		div.innerHTML = '<b>' + human + '</b>' +
						 '<br>Coords: ' + coords + '<br>' +
						 'Précision: ' + acc + ' - ';
		//dojo.addClass(a);
		dojo.connect(a, 'click', this,
				function() { this.goToPlace(p); });
		a.innerHTML = 'Zoomer'
		div.appendChild(a);
		this.summaryNode.appendChild(div);
		dojo.style(div, {
			border: '1px dashed #b94;',
			marginTop: '5px',
			paddingTop: '5px',
			paddingBottom: '5px',
			paddingLeft: '5px',
			paddingRight: '5px',
			backgroundColor: '#222'
		});
	},

	goToPlace: function(p) {
		var coord = p.Point.coordinates,
			lonLat = this.google.forwardMercator(coord[0], coord[1]);
		//this.map.map.moveTo(lonLat, 17);
		if (p.ExtendedData.LatLonBox) {
			var bounds =
				  this.getOLBoundsFromLatLonBox(p.ExtendedData.LatLonBox);
			this.map.map.zoomToExtent(bounds);
		}

	},

	getOLBoundsFromLatLonBox: function(box) {
		sw = this.google.forwardMercator(box.west, box.south);
		ne = this.google.forwardMercator(box.east, box.north);
		return new OpenLayers.Bounds(sw.lon, sw.lat, ne.lon, ne.lat);
	}

});
