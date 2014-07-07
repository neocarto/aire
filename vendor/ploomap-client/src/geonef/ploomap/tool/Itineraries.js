
dojo.provide('geonef.ploomap.tool.Itineraries');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');

// used in template
dojo.require('geonef.jig.input.TextBox');
dojo.require('geonef.jig.input.BooleanCheckBox');
dojo.require('dijit.form.Select');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.ploomap.OpenLayers.Layer.Vector');
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.ploomap.tool.Itineraries',
             [ dijit._Widget, dijit._Templated,
               geonef.ploomap.MapBinding ],
{
  // summary:
  //    Tool to query the Google server for "directions", provides an UI for input
  //
  // todo:
  //    - use a proper location input
  //
  // bugs:
  //    - style is reverted to OL default when layer is disabled then re-enabled
  //

  templateString: dojo.cache("geonef.ploomap.tool", "templates/Itineraries.html"),
  widgetsInTemplate: true,
  name: 'Itinéraires',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/tool_itineraries.png'),
  layerSldUrl: dojo.moduleUrl('geonef.ploomap', 'style/sld/itineraries.xml'),

  postMixInProperties: function() {
    this.wgs84 = new OpenLayers.Projection('EPSG:4326');
    this.inherited(arguments);
  },

  postCreate: function() {
    this.inherited(arguments);
    this.installConnects();
  },

  startup: function() {
    this.inherited(arguments);
    this.startInput.focus();
  },

  destroy: function() {
    this.wgs84 = null;
    this.inherited(arguments);
  },


  installConnects: function() {
    var onEitherChange = function() {
      //console.log('onEitherChange', this);
      var start = this.startInput.attr('value'),
      end = this.endInput.attr('value');
      //console.log('onEitherChange 2');
      //this.computeButton.attr('disabled', !start || !end);
      /*if (start && end) {
	this.doQuery();
      }*/
      //console.log('onEitherChange end');
    };
    dojo.connect(this.startInput, 'onChange', this, onEitherChange);
    dojo.connect(this.endInput, 'onChange', this, onEitherChange);
    onEitherChange.apply(this);
  },

  destroy: function() {
    this.cleanLayer();
    this.inherited(arguments);
  },

  cleanLayer: function() {
    if (this.layer) {
      this.layer.events.un({
        featureselected: this.onFeatureSelect,
        scope: this
      });
      this.mapWidget.map.removeLayer(this.layer);
      this.layer.destroy();
      this.layer = null;
    }
  },

  doQuery: function() {
    var startOL = this.startInput.attr('value'),
    start = startOL,
    endOL = this.endInput.attr('value'),
    end = endOL;
    if (!dojo.trim(start) || !dojo.trim(end)) {
      this.setMessage("Les adresses de départ et d'arrivées doivent être renseignées.");
      return;
    }
    var directions = new google.maps.DirectionsService(),
    request = {
      origin: start,
      destination: end,
      region: 'FR',
      travelMode: google.maps.DirectionsTravelMode[
        this.travelModeSelect.attr('value')],
      avoidHighways: this.avoidHighwaysInput.attr('value'),
      avoidTolls: this.avoidTollsInput.attr('value')
    };
    //console.log('doQuery', directions, start, '||', end, startOL2, endOL2, startOL, endOL);
    this.resultNode.innerHTML = '';
    this.cleanLayer();
    // GEvent.addListener(directions, 'load', dojo.hitch(this, 'onRouteFound'));
    // GEvent.addListener(directions, 'error', dojo.hitch(this, 'onRouteError'));
    //var query = "from: "+start+" to: "+end;
    dojo.publish('jig/workspace/flash', ['Requête de l\'itinéraire au service...']);
    var s = directions.route(request, dojo.hitch(this, this.onRouteResponse));
    this.startValue = start;
    this.endValue = end;
    //console.log(directions, s, this.resultNode);
  },

  zoomToExtent: function() {
    this.mapWidget.map.zoomToExtent(this.extent);
  },

  onRouteResponse: function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      this.onRouteFound(result);
    } else {
      this.onRouteError(status);
    }
  },


  onRouteFound: function(directions) {
    //console.log('onRouteFound', directions, this);
    // zoom
    this.setMessage(null);
    var route = directions.routes[0];
    var leg = route.legs[0];
    //this.extent = this.getOLBoundsFromGLatLngBounds(directions.getBounds());
    this.extent = this.getOLBoundsFromGLatLngBounds(route.bounds);
    this.zoomToExtent();
    // durée
    var d = leg.duration.value,
      txt = '' + parseInt(d / 3600) + ':'
        + parseInt((d % 3600) / 60) + ':'
        + parseInt((d % 3600) % 60);
    // distance
    // var di = directions.getDistance().meters;
    // var km = di / 1000;
    // var txt2 = km;
    var nb = directions.routes.length;
    dojo.publish('jig/workspace/flash', ['Réponse reçue : itinéraire de '+nb+' routes']);
    //var route = directions.getRoute(0);
    var dc = dojo.create
    , tr1 = dc('tr', {}, this.resultNode )
    , td2 = dc('td', { colspan: '2',
                       innerHTML: '<b>'+nb+' itinéraire ['+leg.duration.text +
                                  ', ' + leg.distance.text+']</b> ' }, tr1)
    //, tr2 = dc('tr', {}, this.resultNode )
    //, td3 = dc('td', { colspan: '2' }, tr2)
    , b1 = dc('button', { 'class': 'jigButtonFirst' }, td2)
    , button = new geonef.jig.button.Action(
                 { label: 'Zoom',
                   onClick: dojo.hitch(this, 'zoomToExtent') }, b1)
    , b2 = dc('button', { 'class': 'jigButtonLast' }, td2)
    , butto2 = new geonef.jig.button.Action(
                 { label: 'Nettoyer',
                   onClick: dojo.hitch(this, 'actionClean') }, b2)
    , tr3 = dc('tr', { 'class': 'startAddress' }, this.resultNode )
    , td4 = dc('td', {}, tr3)
    , names = { start: 'Départ : '+leg.start_address,
                end: 'Arrivée : '+leg.end_address }
    , img1 = dc('img', { src: dojo.moduleUrl('geonef.ploomap',
                                             'style/marker/waypoint.png'),
                         alt: names.start }, td4)
    , td5 = dc('td', { innerHTML: names.start }, tr3)
    ;
    this.drawGPolyline(leg.steps);
    var tr4 = dc('tr', { 'class': 'endAddress' }, this.resultNode )
    , td6 = dc('td', {}, tr4)
    , img2 = dc('img', { src: dojo.moduleUrl('geonef.ploomap',
                                             'style/marker/waypoint.png'),
                         alt: names.start }, td6)
    , td7 = dc('td', { innerHTML: names.end+'&nbsp;' }, tr4)
    , button3 = new geonef.jig.button.Action(
                 { label: 'nettoyer',
                   onClick: dojo.hitch(this, 'actionClean') })
    , self = this
    , f1 = function(gLatLng, type)
             {
               var v = self.getLonLatFromGLatLng(gLatLng)
               , point = new OpenLayers.Geometry.Point(v.lon, v.lat)
               , feature = new OpenLayers.Feature.Vector(point,
                             { name: names[type], type: type+'Point' })
               ;
               return feature;
             }
    ;
    button3.placeAt(td7).startup();
    this.layer.addFeatures([f1(leg.start_location, 'start'),
                            f1(leg.end_location, 'end')]);
  },

  drawGPolyline: function(steps) {
    //console.log('drawGPolyline', this, p);
    /*var geom = this.getOLGeometryFromGRoute(p, polyline);
    var feature = new OpenLayers.Feature.Vector(geom);
    feature.attributes.name = 'Itinéraire "'+this.startValue+'" -> "'+this.endValue+'"';*/
    var layer = new geonef.ploomap.OpenLayers.Layer.Vector
                  ('Itinéraires',
                   { icon: this.icon, sldUrl: this.layerSldUrl,
                     defaultClickControl: null });
    layer.controllerWidget = this;
    layer.events.on({
      featureselected: this.onFeatureSelect,
      scope: this
    });
    this.mapWidget.map.addLayer(layer);
    //layer.setZIndex(442000);
    //layer.addFeatures([ features[17] ]);
    //console.log('feature', features, layer);
    this.layer = layer;
    var features = this.buildFeaturesFromGRoute(steps);
    layer.addFeatures(features);
    layer.setVisibility(true);
    layer.refresh();
  },

  getLonLatFromGLatLng: function(v) {
    var lonLat = new OpenLayers.LonLat(v.lng(), v.lat());
    return lonLat.transform(this.wgs84, this.layer.projection);
  },


  buildFeaturesFromGRoute: function(steps) {
    var i, v, bounds, pt, geom, step, pts, feature, lonLat,
        features = [],
        numSteps = steps.length;
    for (i = 0; i < numSteps; i++) {
      step = steps[i];
      pts = [];
      for (var j = 0, jl = step.path.length; j < jl; ++j) {
        lonLat = this.getLonLatFromGLatLng(step.path[j]);
        pts.push(new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat));
      }
      geom = new OpenLayers.Geometry.LineString(pts);
      feature = new OpenLayers.Feature.Vector(geom, { type: 'step' });
      dojo.mixin(feature.attributes, {
                   name: 'Étape '+(i+1)+' : '+step.distance.text+', '+
                     step.duration.text+'<br/><span style="font-size:0.8em;font-weight:normal;">'+
                     step.instructions+'</span>',
                   distance: step.distance.text,
                   duration: step.duration.text
                 });
      //console.log('step', i, step.getDistance(), step.getDuration());
      features.push(feature);
      var self = this;
      (function(feature) {
         // need to isolete these vars from for() loop, for connect function
         var dc = dojo.create
         , html = '<div class="title">Étape <b>'+(i + 1) + '</b> [' +
                            step.duration.text
                            .replace(/secondes/,'s')
                            .replace(/minutes/, 'min') + ', ' +
                            step.distance.text+"]</div>" +
           '<div class="instr">'+step.instructions+'</div>'
         , tr1 = dc('tr', { 'class': 'link step' }, self.resultNode )
         , td2 = dc('td', { colspan: '2', innerHTML: html }, tr1)
         //, td1 = dc('td', { innerHTML: step.instructions }, tr1)
         , dct = dojo.connect
         , cnt1 = dct(feature, 'onMouseOver',
                      function() { dojo.addClass(tr1, 'selected');
                                   dijit.scrollIntoView(tr1); })
         , cnt2 = dct(feature, 'onMouseOut',
                      function() { dojo.removeClass(tr1, 'selected'); })
         // TODO: the following 2 cnts should not hardcode the style change
         , cnt3 = dct(tr1, 'onmouseover',
                      function() { self.layer.drawFeature(feature, 'hover'); })
         , cnt4 = dct(tr1, 'onmouseout',
                      function() { self.layer.drawFeature(feature,
                                                          feature.selDiv ? 'select' : 'default'); })
         , lonLat = self.getLonLatFromGLatLng(step.path[0])
         , cnt5 = dct(tr1, 'onclick',
                      function() { self.mapWidget.map.setCenter(lonLat, 16); })
         ;
         // TODO: cleanup connect handlers? is it done automatically when DOMNode is removed?
       })(feature);
    }
    return features;
  },

  onRouteError: function(status) {
    //console.log('onRouteError', directions, this);
    var msgs = {
      NOT_FOUND: "origine ou destination non trouvée",
      ZERO_RESULTS: "aucun itinéraire trouvé",
      MAX_WAYPOINTS_EXCEEDED: "limite maximale de points de passage dépassé",
      INVALID_REQUEST: "requête invalide",
      OVER_QUERY_LIMIT: "quota de requêtes dépassé",
      REQUEST_DENIED: "accès refusé pour ce site",
      UNKNOWN_ERROR: "erreur Google étrange"
    };
    var str = "erreur non répertoriée";
    for (var k in msgs) {
      if (msgs.hasOwnProperty(k) &&
          google.maps.DirectionsStatus[k] === status) {
        str = msgs[k];
        break;
      }
    }
    dojo.publish('jig/workspace/flash', ['Erreur itinéraire : '+str]);
    this.setMessage("Erreur : "+str);
  },

  getOLBoundsFromGLatLngBounds: function(gLatLngBounds) {
    var sw = gLatLngBounds.getSouthWest();
    var ne = gLatLngBounds.getNorthEast();
    var bounds = new OpenLayers.Bounds(sw.lng(), sw.lat(), ne.lng(), ne.lat());
    bounds.transform(this.wgs84, this.mapWidget.map.getProjectionObject());
    return bounds;
  },

  actionClean: function() {
    this.resultNode.innerHTML = '';
    this.cleanLayer();
  },

  setMessage: function(message) {
    if (message) {
      this.messageNode.innerHTML = message;
    }
    dojo.style(this.messageNode, 'display', message ? '' : 'none');
    dojo.style(this.resultNode, 'display', message ? 'none' : '');
    if (message) {
      geonef.jig.workspace.highlightNode(this.messageNode, 'focus');
    }
  },

  onFeatureSelect: function(event) {
    geonef.jig.workspace.focus(this);
  },

  onAppear: function() {
    if (this.layer) {
      this.layer.activateSelect();
    }
  }

});
