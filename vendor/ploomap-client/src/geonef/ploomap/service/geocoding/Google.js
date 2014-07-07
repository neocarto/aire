
dojo.provide('geonef.ploomap.service.geocoding.Google');

dojo.declare('geonef.ploomap.service.geocoding.Google', null,
{
  constructor: function() {
    this.volatileCache = {};
  },

  search: function(query, handleCB) {
    console.log('search', this, arguments);
    query = dojo.trim(query);
    if (!this.volatileCache[query]) {
      this.volatileCache[query] =
        new geonef.ploomap.service.geocoding._GoogleRequest(query);
    }
    this.volatileCache[query].execute(handleCB);
  }

});

dojo.declare('geonef.ploomap.service.geocoding._GoogleRequest', null,
{
  query: '',

  /**
   * @type {Array.<google.maps.GeocoderResult>}
   */
  response: null,

  /**
   * @type {string}
   */
  status: null,

  /**
   * @type {?Array}
   */
  places: null,

  constructor: function(query) {
    this.query = query;
  },

  execute: function(handleCB) {
    this.handleCB = handleCB;
    if (this.status) {
      handleCB(this);
    } else {
      this.geocoder = new google.maps.Geocoder();
      this.geocoder.geocode({address: this.query},
                            dojo.hitch(this, this.handleResponse));
    }
  },

  handleResponse: function(response, status) {
    this.response = response;
    this.status = status;
    if (this.handleCB) {
      var handleCB = this.handleCB;
      delete this.handleCB;
      handleCB(this);
    }
  },

  isSuccessful: function() {
    return this.status === geonef.ploomap.service.GeocoderStatus.OK;
  },

  getPlaces: function() {
    if (!this.places) {
      this.places = this.response.map(
          function(result) {
            return new geonef.ploomap.service.geocoding._GoogleResultPlace(result);
          });
    }
    return this.places;
  },

  /**
   * Same as getPlaces(), but storted by distance to given lonLat
   *
   * @param {OpenLayers.LonLat} lonLat
   * @param {OpenLayers.Projection} lonLat
   */
  getSortedPlaces: function(lonLat, projection) {
    //console.log('getSortedPlaces', this, arguments);
    var places = this.getPlaces();
    places.sort(
      function(p1, p2) {
        var l1 = p1.getDisplayBounds(projection).getCenterLonLat();
        var l2 = p2.getDisplayBounds(projection).getCenterLonLat();
        var d1 = Math.sqrt(Math.pow(l1.lon - lonLat.lon, 2) +
                           Math.pow(l1.lat - lonLat.lat, 2));
        var d2 = Math.sqrt(Math.pow(l2.lon - lonLat.lon, 2) +
                           Math.pow(l2.lat - lonLat.lat, 2));
        return d1 > d2;
      });
    return places;
  },

  getStatusMessage: function() {
    var msgs = {
      ERROR: "Erreur générique",
      INVALID_REQUEST: "Requête invalide",
      OK: "Succès",
      OVER_QUERY_LIMIT: "Quota dépassé",
      REQUEST_DENIED: "Requête rejetée",
      UNKOWN_ERROR: "Erreur inconnue",
      ZERO_RESULTS: "Aucun résultat",
    };
    return msgs[this.status];
  },

});

dojo.declare('geonef.ploomap.service.geocoding._GoogleResultPlace', null,
{
  gResult: null,

  constructor: function(gResult) {
    this.gResult = gResult;
  },

  /**
   * @param {Function} filter for address components to filter
   * @param {boolean} html
   * @param {integer} boldLevel_  if defined, the first N components are in bold
   * @return {string}
   */
  getFormattedAddress: function(filter_, html, boldLevel_) {
    if (!filter_) {
      filter_ = function(cnt) {
        return (cnt.types.indexOf('political') !== -1 ||
          cnt.types.indexOf('route') !== -1 ||
          cnt.types.indexOf('street_number') !== -1) &&
          cnt.types.indexOf('sublocality') === -1 &&
          cnt.types.indexOf('neighborhood') === -1;
      };
    }
    var cpnts = this.gResult.address_components.filter(filter_);
    cpnts.reverse();
    var tab  = cpnts.map(function(c, idx) {
                           var n = c.long_name;
                           if (boldLevel_ >= idx + 1) {
                             n = '<b>'+n+'</b>';
                           }
                           return n;
                         });
    var tab2 = [];
    tab.forEach(function(t) { if (tab2.indexOf(t) === -1) { tab2.push(t); } });
    return tab2.join(html ? ' &gt;&nbsp;' : ' > ');
  },

  getLongAddress: function(html) {
    return this.getFormattedAddress(
      function(cnt) {
        return cnt.types.indexOf('political') !== -1 ||
          cnt.types.indexOf('route') !== -1 ||
          cnt.types.indexOf('street_number') !== -1;
      }, html);
  },

  /**
   * @param {OpenLayers.Projection} projection
   * @return {OpenLayers.Bounds}
   */
  getDisplayBounds: function(projection) {
    if (!this.displayBounds) {
      var sphericalMeractor = OpenLayers.Layer.SphericalMercator
        , box = this.gResult.geometry.viewport
        , ne = box.getNorthEast()
        , sw = box.getSouthWest()
        //, box = p.ExtendedData.LatLonBox
        , lonLatSW = sphericalMeractor.forwardMercator(sw.lng(), sw.lat())
        , lonLatNE = sphericalMeractor.forwardMercator(ne.lng(), ne.lat())
        // , lonLatSW = sphericalMeractor.forwardMercator(box.west, box.south)
        // , lonLatNE = sphericalMeractor.forwardMercator(box.east, box.north)
        , value = new OpenLayers.Bounds(
          lonLatSW.lon, lonLatSW.lat, lonLatNE.lon, lonLatNE.lat)
        , pointProj = new OpenLayers.Projection('EPSG:900913');
      this.displayBounds = value.transform(pointProj, projection);
    }
    return this.displayBounds;
  },

  /**
   * @param {OpenLayers.Map} map
   */
  zoomMap: function(map) {
    var extent = this.getDisplayBounds(map.getProjectionObject());
    map.zoomToExtent(extent);
  }

});

/**
 * Error statuses
 */
(function() {
   var geocodingStatus = geonef.ploomap.service.GeocoderStatus = {};
   ['ERROR', 'INVALID_REQUEST', 'OK', 'OVER_QUERY_LIMIT',
    'REQUEST_DENIED', 'UNKNOWN_ERROR', 'ZERO_RESULTS'].forEach(
        function(name) {
          geocodingStatus[name] = name;
        });
 })();
