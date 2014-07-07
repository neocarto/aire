
dojo.provide('geonef.ploomap.tool.Export');

dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
dojo.require('geonef.jig.input.Form');
dojo.require('dijit.form.Select');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.NumberSpinner');
dojo.require('geonef.ploomap.input.Extent');
dojo.require('geonef.ploomap.input.Layer');
dojo.require('geonef.ploomap.OpenLayers.Layer.LegacyTMS');

dojo.declare('geonef.ploomap.tool.Export',
             [ geonef.jig.layout._Anchor, dijit._Templated, geonef.ploomap.MapBinding ],
{
  // summary:
  //    Tool for exporting raster layers
  //
  // Description:
  //
  // TODO:
  //    - draw region
  //

  templateString: dojo.cache("geonef.ploomap.tool", "templates/Export.html"),
  widgetsInTemplate: true,
  name: 'Exportation',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/tool_export.png'),

  postMixInProperties: function() {
    this.inherited(arguments);
    this.winCount = 0;
  },

  onMapBound: function() {
    this.formChange();
  },

  layerFilter: function(layer) {
    return !!layer.getExportUrl || !!layer.pmExportMap ||
      layer.CLASS_NAME === 'OpenLayers.Layer.Google' ||
      layer.CLASS_NAME === 'OpenLayers.Layer.GoogleNG';
  },

  formChange: function() {
    var value = this.formWidget.attr('value');
    //var extent = value.extent;
    this.generateButton.attr('disabled', !this.formWidget.isValid());
  },

  onLayerChange: function(layer) {
    //console.log('onLayerChange', this, arguments);
    var self = this;
    this.formatSelect.getOptions().forEach(
      function(option) { self.formatSelect.removeOption(option); });
    var formats = this.getFormatsForLayer(layer);
    for (var i in formats) {
      if (formats.hasOwnProperty(i)) {
        this.formatSelect.addOption({ value: i, label: formats[i] });
      }
    }
    var constraints = dojo.mixin({}, this.sizeInput.attr('constraints'),
                                 { max: this.getMaxSizeForLayer(layer) });
    this.sizeInput.attr('constraints', constraints);
    this.layerNoticeNode.innerHTML = this.getNoticeForLayer(layer);
  },

  formSubmit: function() {
    if (!this.formWidget.isValid()) {
      return;
    }
    var self = this
    , inputs = this.formWidget.attr('value')
    , width = inputs.size
    , height = inputs.size;
    //console.log('inputs', this, inputs);
    if (inputs.extent.getWidth() > inputs.extent.getHeight()) {
      height = parseInt(width * inputs.extent.getHeight() / inputs.extent.getWidth());
    } else {
      width = parseInt(height * inputs.extent.getWidth() / inputs.extent.getHeight());
    }
    this.getUrlForLayer(inputs.layer, {
                          format: inputs.format,
                          width: width, height: height,
                          extent: inputs.extent
                        },
      function(url) {
        //console.log('got URL', url);
        dojo.publish('jig/workspace/flash', ['Couche exportée. Ouverture dans une nouvelle fenêtre...']);
        window.setTimeout(function() { window.open(url, 'export_'+(++self.winCount)); }, 800);
      });
  },

  getNoticeForLayer: function(layer) {
    if (layer.getExportNotice) {
      return layer.getExportNotice();
    }
    if (layer.CLASS_NAME === 'OpenLayers.Layer.Google' ||
        layer.CLASS_NAME === 'OpenLayers.Layer.GoogleNG') {
      return 'Attention : l\'export des couches Google est limité à '+
        this.getMaxSizeForLayer(layer)+
        ' pixels de taille et l\'étendue sera ajustée au zoom le plus proche !';
    }
    return '';
  },

  getFormatsForLayer: function(layer) {
    if (layer.CLASS_NAME === 'OpenLayers.Layer.Google' ||
        layer.CLASS_NAME === 'OpenLayers.Layer.GoogleNG') {
      return {
        'png32': 'PNG',
        'jpg': 'JPEG',
        'gif': 'GIF',
        'png8': 'PNG 8 bits',
        'jpg-baseline': 'JPEG non interlacé'
      };
    } else if (layer.getExportFormats) {
      return layer.getExportFormats();
    } else {
      return {
        'image/png': 'PNG',
        'image/jpeg': 'JPEG',
        'image/gif': 'GIF',
        'image/tiff': 'GeoTIFF'
      };
    }
  },

  getMaxSizeForLayer: function(layer) {
    if (layer.CLASS_NAME === 'OpenLayers.Layer.Google' ||
        layer.CLASS_NAME === 'OpenLayers.Layer.GoogleNG') {
      return 640;
    }
    if (layer.getExportMaxSize) {
      return layer.getExportMaxSize();
    } else {
      return 5000;
    }
  },


  getUrlForLayer: function(layer, params, callback) {
    //console.log('getUrlForLayer', this, arguments);
    if (layer.getExportUrl) {
      layer.getExportUrl(params, callback);
      return;
    }
    if (layer.pmExportMap) {
      var extent = params.extent.clone();
      extent.transform(this.mapWidget.map.getProjectionObject(),
                       new OpenLayers.Projection('EPSG:900913'));
      var domain = layer.domain ||
        geonef.ploomap.OpenLayers.Layer.LegacyTMS.prototype.domain;
      var mapName = layer.pmExportMap;
      if (dojo.isObject(mapName)) {
        var res = Math.min(extent.getWidth() / params.width,
                           extent.getHeight() / params.height);
        for (var name in mapName) {
          if (mapName.hasOwnProperty(name) &&
              mapName[name].min <= res && mapName[name].max > res) {
            mapName = name;
            break;
          }
        }
      }
      geonef.ploomap.OpenLayers.Layer.LegacyTMS.prototype.withToken(
        function(token) {
          var url = 'http://'+domain+'/service/'+mapName
            +'?TRANSPARENT=true&SERVICE=WMS&VERSION=1.1.1'
            +'&REQUEST=GetMap&STYLES=&EXCEPTIONS=application%2Fvnd.ogc.se_inimage'
            +'&FORMAT='+params.format+'&SRS=EPSG%3A900913&BBOX='+extent.toBBOX()
            +'&WIDTH='+params.width+'&HEIGHT='+params.height+'&token='+token;
          callback(url);
        });
      return;
    }
    if (layer.CLASS_NAME === 'OpenLayers.Layer.Google' ||
        layer.CLASS_NAME === 'OpenLayers.Layer.GoogleNG') {
      var lonlat = params.extent.getCenterLonLat();
      lonlat.transform(this.mapWidget.map.getProjectionObject(),
                       new OpenLayers.Projection('EPSG:4326'));
      var resolution = params.extent.getWidth() / params.width;
      var zoom = layer.getZoomForResolution(resolution, true);
      var maptype = (
        function() {
          //console.log('layer type', layer, layer.type);
          if (layer.type === google.maps.MapTypeId.HYBRID) return 'hybrid';
          if (layer.type === google.maps.MapTypeId.ROADMAP) return 'roadmap';
          if (layer.type === google.maps.MapTypeId.SATELLITE) return 'satellite';
          if (layer.type === google.maps.MapTypeId.TERRAIN) return 'terrain';
          console.error('Unknown Google layer type', layer.type, layer);
          throw Error('Unknown Google layer type:', layer.type);
        })();
      var url = 'http://maps.google.com/maps/api/staticmap'
             + '?center='+lonlat.lat+','+lonlat.lon
             + '&zoom='+zoom
             + '&size='+params.width+'x'+params.height
             + '&format='+params.format
             + '&maptype='+maptype
             + '&sensor=false';
      callback(url);
    }
  },

  actionClose: function() {
    this.destroy();
  }

});
