/**
 * @requires OpenLayers/Control/WMSGetFeatureInfo.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.WMSGetFeatureInfo');

/**
 * Class: OpenLayers.Control.AireToolbar
 *
 * @todo since we have the geometry, no hover request should be made
 *       until the mouse is out of current feature shape.
 *
 * Inherits from:
 *  - <OpenLayers.Control.Panel>
 */
geonef.ploomap.OpenLayers.Control.WMSGetFeatureInfo =
  OpenLayers.Class(OpenLayers.Control.WMSGetFeatureInfo,
{
  title: "Mode clic d'informations",
  //hover: true,
  //url: '/ows/',
  layers: null,// [water],
  baseLayerOnly: true,
  //layerUrls: [],
  infoFormat: 'gml',
  queryVisible: true,
  maxFeatures: 1,
  PopupClass: OpenLayers.Popup.FramedCloud,

  /**
   * Added param to restrect the layers to query, from regular layers list
   *
   * @type {?Array.<string>}
   */
  queryLayers: null,

  initialize: function(options) {
    OpenLayers.Control.WMSGetFeatureInfo.prototype.initialize.apply(
      this, arguments);
    this.setPloomapHandlers();
  },

  setPloomapHandlers: function() {
    this.events.on(
      {
        beforegetfeatureinfo: this.handle_beforegetfeatureinfo,
        nogetfeatureinfo: this.handle_nogetfeatureinfo,
        getfeatureinfo: this.handle_getfeatureinfo,
        scope: this
      });
  },

  destroy: function() {
    this.events.un(
      {
        beforegetfeatureinfo: this.handle_beforegetfeatureinfo,
        nogetfeatureinfo: this.handle_nogetfeatureinfo,
        getfeatureinfo: this.handle_getfeatureinfo,
        scope: this
      });
    OpenLayers.Control.prototype.destroy.call(this);
  },

  activate: function () {
    if (!this.layer) {
      this.layer = new OpenLayers.Layer.Vector('data',
        {
          styleMap: new OpenLayers.StyleMap(
            dojo.mixin({}, OpenLayers.Feature.Vector.style['default'],
                       { pointRadius: '${size}' })),
          //projection: this.map.getProjection(),
          //optClass: 'geonef.ploomap.layer.UserVector',
          //geometryType: OpenLayers.Geometry.Polygon
          //sldUrl: '/sld/plans.xml',
          //icon: '/images/icons/layer_plans.png'
        });
      this.map.addLayer(this.layer);
      this.changeBaseHdl = dojo.subscribe('ploomap/map/changebaselayer', this,
        function() {
          this.cleanPopup();
          this.layer.destroyFeatures(this.layer.features.slice(0));
        });
    }
    return OpenLayers.Control.WMSGetFeatureInfo.prototype.activate.apply(
      this, arguments);
  },

  deactivate: function () {
    this.cleanPopup();
    if (this.active) {
      this.map.removeLayer(this.layer);
      this.layer = null;
      dojo.unsubscribe(this.changeBaseHdl);
    }
    return OpenLayers.Control.WMSGetFeatureInfo.prototype.deactivate.apply(
      this, arguments);
  },

  findLayers: function() {
    if (this.baseLayerOnly) {
      if (!this.map.baseLayer instanceof OpenLayers.Layer.WMS) {
        console.warn("base layer is not WMS:", this.map.baseLayer);
      }
      this.url = this.map.baseLayer.url instanceof Array ?
        this.map.baseLayer.url[0] : this.map.baseLayer.url;
      return [this.map.baseLayer];
    }
    return layers.push(OpenLayers.Control.WMSGetFeatureInfo.prototype.findLayers.apply(this, arguments));
  },

  handle_beforegetfeatureinfo: function() {
    //console.log('beforegetfeatureinfo', arguments);
    dojo.publish('jig/workspace/flash',
                 ['Récupération de la donnée...']);
    this.cleanPopup();
    this.layer.destroyFeatures(this.layer.features.slice(0));
  },

  handle_nogetfeatureinfo: function() {
    //console.log('nogetfeatureinfo', this, arguments);
    //alert("Aucune donnée à cet emplacement !");
  },

  handle_getfeatureinfo: function(event) {
    //console.log('getfeatureinfo', arguments);
    if (!event.features || !event.features.length) {
      console.log('no data!', this, arguments);
      dojo.publish('jig/workspace/flash',
                   ["Aucune donnée à cet emplacement !"]);
      alert("Aucune donnée à cet emplacement !");
      return;
    }
    var features = [this.chooseFeature(event.features)];
    features.forEach(this.preAddFeature, this);
    this.layer.addFeatures(features);
    this.openPopup(event);
    //console.log('layer/f', this, this.layer, event.features);
  },

  chooseFeature: function(features) {
    //console.log('chooseFeature', this, arguments);
    return features[features.length - 1];
  },

  preAddFeature: function(feature) {
    if (feature.attributes.symbolsize) {
      var size = parseFloat(feature.attributes.symbolsize) /
        (this.map.getResolution() * 2) /* diameter->radius */;
      feature.attributes.size = size;
      console.log('size', this, size, feature);
    }
    if (feature.attributes.data) {
      var width = parseFloat(feature.attributes.data);
      feature.style = { strokeWidth: width };
    }
  },

  cleanPopup: function() {
    if (this.popup) {
      this.map.removePopup(this.popup);
      this.popup.destroy();
      this.popup = null;
    }
  },

  openPopup: function(event) {
    this.cleanPopup();
    var feature = this.chooseFeature(event.features);
    this.popup =
      new this.PopupClass(
        "chicken",
        this.map.getLonLatFromPixel(event.xy),
        null,
        this.buildPopupContent(feature),
        null,
        true
      );
    this.map.addPopup(this.popup);
  },

  buildPopupContent: function(feature) {
    //console.log('buildPopupContent', this, feature.attributes);
    var props = ['ratio','stock'];
    var name = feature.attributes.name;
    var text = "";
    if (name) {
      text += "<b>"+name+"</b><br/>";
    }
    if (this.map.mapWidget.legendContainer) {
      text +=
        this.map.mapWidget.legendContainer.getFeatureInfoHtml(feature);
    }
    return text;
  },

    /**
     * Method: buildWMSOptions (overloads OpenLayers')
     * Build an object with the relevant WMS options for the GetFeatureInfo request
     *
     * Parameters:
     * url - {String} The url to be used for sending the request
     * layers - {Array(<OpenLayers.Layer.WMS)} An array of layers
     * clickPosition - {<OpenLayers.Pixel>} The position on the map where the mouse
     *     event occurred.
     * format - {String} The format from the corresponding GetMap request
     */
    buildWMSOptions: function(url, layers, clickPosition, format) {
        var layerNames = [], styleNames = [];
        for (var i = 0, len = layers.length; i < len; i++) {
            layerNames = layerNames.concat(layers[i].params.LAYERS);
            styleNames = styleNames.concat(this.getStyleNames(layers[i]));
        }
        var queryLayerNames = this.queryLayers ?
            this.queryLayers.filter(
              function(l) { return layerNames.indexOf(l) != -1; }) : layerNames;
        var params = OpenLayers.Util.extend({
            service: "WMS",
            version: layers[0].params.VERSION,
            request: "GetFeatureInfo",
            layers: layerNames,
            query_layers: queryLayerNames,
            styles: styleNames,
            bbox: this.map.getExtent().toBBOX(null,
                layers[0].reverseAxisOrder()),
            feature_count: this.maxFeatures,
            height: this.map.getSize().h,
            width: this.map.getSize().w,
            format: format,
            info_format: this.infoFormat
        }, (parseFloat(layers[0].params.VERSION) >= 1.3) ?
            {
                crs: this.map.getProjection(),
                i: clickPosition.x,
                j: clickPosition.y
            } :
            {
                srs: this.map.getProjection(),
                x: clickPosition.x,
                y: clickPosition.y
            }
        );
        OpenLayers.Util.applyDefaults(params, this.vendorParams);
        return {
            url: url,
            params: OpenLayers.Util.upperCaseObject(params),
            callback: function(request) {
                this.handleResponse(clickPosition, request);
            },
            scope: this
        };
    },


});
