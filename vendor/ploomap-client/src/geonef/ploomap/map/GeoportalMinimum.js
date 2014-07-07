
dojo.provide('geonef.ploomap.map.GeoportalMinimum');

// parents
dojo.require('geonef.ploomap.map.Geoportal');

dojo.declare('geonef.ploomap.map.GeoportalMinimum', [ geonef.ploomap.map.Geoportal ],
{
  // summary:
  //   A Geoportal map, provided by the French National Institute of Geography (IGN) - Minimum version
  //

  createMap: function() {
    // ETRS89 geographic - plate-carree base map :
    //console.log('hehe', this, this.domNode, this.domNode.id);
    var epsg4258= new OpenLayers.Projection("EPSG:4258");
    var options = OpenLayers.Util.extend({
      // overwrite OL defaults :
      mapWidget: this,
      maxResolution: 1.40625,
      numZoomLevels: 21,
      projection: epsg4258,
      units: epsg4258.getUnits(),
      maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
      // add controls :
      controls:[
        //new OpenLayers.Control.PanZoomBar(),
        //new OpenLayers.Control.NavToolbar(),
        //new OpenLayers.Control.LayerSwitcher({'ascending':false}),
        new OpenLayers.Control.Attribution(),
        new Geoportal.Control.PermanentLogo(),
        new Geoportal.Control.TermsOfService()
      ]}, gGEOPORTALRIGHTSMANAGEMENT);
    console.log('projaa', epsg4258, 'options', options);
    //this.map = new OpenLayers.Map(this.domNode.id, options);
    this.map = new OpenLayers.Map(this.domNode.id, options);
    console.log('map', this.map, OpenLayers.ProxyHost);
    //this.map.setProxyUrl(OpenLayers.ProxyHost);
    //console.log('proxy', this, arguments);
    this.createLayers();
    // center map (otherwise : centered at (0,0), zoom 0 :
    this.map.setCenter(new OpenLayers.LonLat(2.345274398,48.860832558),5);
    console.log('created map', this, this.map);
  },

  createLayers: function() {
    // get IGNF's catalogue :
    console.log('bef cat', this, arguments);
    var cat = new Geoportal.Catalogue(this.map, gGEOPORTALRIGHTSMANAGEMENT);
    console.log('after cat', this, arguments);
    // prepare CRS :
    var zon = cat.getTerritory('EUE');
    var baseLayer = new OpenLayers.Layer('__PlateCarre__', {
                      isBaseLayer: true,
                      displayInLayerSwitcher: false,
                      projection: new OpenLayers.Projection('EPSG:4326'),
                      units: 'degrees',
                      maxResolution: 1.40625,
                      numZoomLevels: 21,
                      maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
                      minZoomLevel:5,
                      maxZoomLevel:18,
                      territory:'EUE'
    });
    this.map.addLayers([ baseLayer ]);
    console.log('added layer', baseLayer);
    // get Geoportail layer's parameters :
    var europeanMapOpts = cat.getLayerParameters(zon, 'GEOGRAPHICALGRIDSYSTEMS.MAPS:WMSC');
    // overwrite some :
    europeanMapOpts.options.opacity = 1.0;
    // link with GeoRM :
    europeanMapOpts.options["GeoRM"] = this.setGeoRM();
    europeanMapOpts.transitionEffect = 'resize';
    // build map :
    var europeanMap = new europeanMapOpts.classLayer(
      OpenLayers.i18n(europeanMapOpts.options.name),
      europeanMapOpts.url,
      europeanMapOpts.params,
      europeanMapOpts.options);
    // reproject maxExtent (Geoportal's API standard and extended do it automagically :
    europeanMapOpts.options.maxExtent.transform(europeanMapOpts.options.projection,
                                                this.map.getProjection(), true);
    // add it to the map :
    this.map.addLayers([europeanMap]);
    console.log('added layer eur', europeanMap);
  },

  setGeoRM: function() {
    return Geoportal.GeoRMHandler.addKey(
            gGEOPORTALRIGHTSMANAGEMENT.apiKey,
            gGEOPORTALRIGHTSMANAGEMENT[gGEOPORTALRIGHTSMANAGEMENT.apiKey].tokenServer.url,
            gGEOPORTALRIGHTSMANAGEMENT[gGEOPORTALRIGHTSMANAGEMENT.apiKey].tokenServer.ttl,
            this.map);

  }

});
