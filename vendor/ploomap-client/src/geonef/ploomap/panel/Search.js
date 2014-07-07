
dojo.provide('geonef.ploomap.panel.Search');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');

// used in template
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.button.Link');

// used in code
dojo.require('geonef.ploomap.service.geocoding.Google');
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.ploomap.panel.Search',
             [ dijit._Widget, dijit._Templated,
               geonef.ploomap.MapBinding ],
{

  panelPath: "Résultats de recherche",

  search: '',

  layerSldUrl: dojo.moduleUrl('geonef.ploomap', 'style/sld/search.xml'),
  templateString: dojo.cache('geonef.ploomap.panel', 'templates/Search.html'),
  widgetsInTemplate: true,


  destroy: function() {
    this.clearVectorLayer();
    this.inherited(arguments);
  },

  _setSearchAttr: function(search) {
    this.search = search;
    this.makeSearch(search);
  },

  makeSearch: function(search) {
    if (!dojo.trim(search)) { return; }
    dojo.addClass(this.domNode, 'waiting');
    this.clearResults();
    var service = this.getService();
    service.search(search, dojo.hitch(this, this.handleResponse));
  },

  clearResults: function() {
    if (this.resultNodes) {
      dojo.forEach(this.resultNodes, dojo.destroy);
      this.resultNodes = null;
    }
    delete this.response;
  },

  getGeocodingService: function() {
    if (!this.service) {
      this.service = new geonef.ploomap.service.geocoding.Google();
    }
    return this.service;
  },

  handleResponse: function(response) {
    this.response = response;
    dojo.removeClass(this.domNode, 'waiting');
    if (!response.isSuccessful()) {
      this.setMessage(response.getStatusMessage());
      return;
    }
    this.setMessage(null);
    this.createVectorLayer();
    // sort places by distance with map center, and distinguish between
    // inside or outside map extent
    var map = this.mapWidget.map;
    var places = response.getSortedPlaces(map.getCenter(), map.getProjectionObject());
    var intersectPlaces = [], notIntersectPlaces = [];
    var bounds = map.getExtent();
    this.resultNodes = [];
    places.forEach(
        function(place) {
          if (place.getDisplayBounds(map.projection).intersectsBounds(bounds)) {
            intersectPlaces.push(place);
          } else {
            notIntersectPlaces.push(place);
          }
        });
    if (intersectPlaces.length && notIntersectPlaces.length) {
      this.resultNodes.push(
        dojo.create('h2', { innerHTML: "Dans l'étendue courante" }, this.resultNode));
      intersectPlaces.forEach(this.addPlace, this);
      this.resultNodes.push(
        dojo.create('h2', { innerHTML: "À l'extérieur" }, this.resultNode));
      notIntersectPlaces.forEach(this.addPlace, this);
    } else {
      places.forEach(this.addPlace, this);
    }
    if (places.length === 1) {
      places[0].zoomMap(map);
    } else if (places.length > 1) {
      this.createZoomButton();
      if (intersectPlaces.length == 0) {
        this.zoomToExtent();
      }
    }
  },

  createZoomButton: function() {
    var self = this;
    var link = new geonef.jig.button.Action(
      { label: "Tout voir",
        onClick: dojo.hitch(this, this.zoomToExtent)
      });
    this.resultNodes.push(link.domNode);
    dojo.addClass(link.domNode, 'seeAll');
    link.placeAt(this.resultNode).startup();
  },

  zoomToExtent: function() {
    this.mapWidget.map.zoomToExtent(this.layer.getDataExtent());
  },

  createVectorLayer: function() {
    this.clearVectorLayer();
    this.layer = new geonef.ploomap.OpenLayers.Layer.Vector
      ('Itinéraires', {
         /*icon: this.icon,*/
         sldUrl: this.layerSldUrl,
         defaultClickControl: null });
    var map = this.mapWidget.map;
    this.layer.events.on(
        {
          featureover: this.onFeatureOver,
          featureout: this.onFeatureOut,
          featureselected: this.onFeatureSelected,
          scope: this
        });
    this.layer.controllerWidget = this;
    this.mapWidget.map.addLayer(this.layer);
  },

  clearVectorLayer: function() {
    if (this.layer) {
      this.layer.features.forEach(
        function(f) {
          delete f.place;
          delete f.link;
        });
      this.layer.events.un(
        {
          featureover: this.onFeatureOver,
          featureout: this.onFeatureOut,
          featureselected: this.onFeatureSelected,
          scope: this
        });
      this.mapWidget.map.removeLayer(this.layer);
      this.layer.destroy();
      delete this.layer;
    }
  },

  addPlace: function(place) {
    var map = this.mapWidget.map;
    // create link
    var feature;
    var link = new geonef.jig.button.Link(
      { label: place.getFormattedAddress(null, true, 1),
        title: place.getLongAddress(),
        onClick: function() { place.zoomMap(map); },
        onMouseOver: function() {
          feature.layer.drawFeature(feature, 'hover');  },
        onMouseOut: function() {
          feature.layer.drawFeature(feature, feature.selected ?
                                    'select' : 'default');  }
      });
    this.resultNodes.push(link.domNode);
    dojo.addClass(link.domNode, 'place');
    link.placeAt(this.resultNode).startup();
    // create marker
    var lonLat = place.getDisplayBounds().getCenterLonLat();
    feature = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat),
      { name: place.getLongAddress() });
    feature.place = place;
    feature.link = link;
    this.layer.addFeatures([feature]);
  },

  getService: function() {
    if (!this.geocodingService) {
      this.geocodingService = new geonef.ploomap.service.geocoding.Google();
    }
    return this.geocodingService;
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

  onDisappear: function() {
    this.clearVectorLayer();
  },

  onAppear: function() {
    if (this.response) {
      this.clearResults();
      if (this.response) {
        this.handleResponse(this.response);
      }
    }
  },

  onFeatureOver: function(evt) {
    dojo.addClass(evt.feature.link.domNode, 'hover');
  },
  onFeatureOut: function(evt) {
    dojo.removeClass(evt.feature.link.domNode, 'hover');
  },
  onFeatureSelected: function(evt) {
    var feature = evt.feature;
    this.layer.map.selectControl.unselect(feature);
    feature.place.zoomMap(this.mapWidget.map);
  }

});
