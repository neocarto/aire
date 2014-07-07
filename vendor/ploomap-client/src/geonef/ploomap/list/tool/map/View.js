
dojo.provide('geonef.ploomap.list.tool.map.View');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');

// in template
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.HorizontalSlider');

// used in code
dojo.require('geonef.jig.api');
dojo.require('dojox.uuid.generateRandomUuid');

dojo.declare('geonef.ploomap.list.tool.map.View',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container ],
{
  // summary:
  //   Map preview through WMS
  //
  // todo:
  //    Full OpenLayers navigation
  //

  uuid: '',

  imageSize: 300,

  format: 'image/png',

  templateString: dojo.cache('geonef.ploomap.list.tool.map',
                             'templates/View.html'),
  widgetsInTemplate: true,

  refreshMap: function() {
    //this.removeMap();
    this.getMapInfo();
  },

  getMapInfo: function() {
    if (!this.uuid || isNaN(this.imageSize)) {
      return;
    }
    dojo.addClass(this.domNode, 'loading');
    geonef.jig.api.request(
      {
        module: 'listQuery.map',
        action: 'getWmsInfo',
        uuid: this.uuid,
        callback: dojo.hitch(this, 'updateMapRequest')
      }).setControl(this.domNode);
  },

  updateMapRequest: function(data) {
    //var url = '/ows/' + encodeURIComponent(dojo.toJson(value)) + '?' +
    this.data = data;
    this.updateImage();
  },

  updateImage: function() {
    if (!this.data) {
      this.getMapInfo();
      return;
    }
    while (this.mapContainerNode.firstChild) {
      this.mapContainerNode.removeChild(this.mapContainerNode.firstChild);
    }
    var url = geonef.ploomap.list.tool.map.View.prototype.getImageUrl(
        this.data, this.imageSize, this.format);
    /*this.newMapImageNode =*/ dojo.create('img',
        { src: url, alt: 'Chargement...',
          onload: dojo.hitch(this, 'onImageLoaded') }, this.mapContainerNode);
  },

  removeMap: function() {
    // if (this.mapImageNode) {
    //   this.mapContainerNode.removeChild(this.mapImageNode);
    //   this.mapImageNode = null;
    // }
  },

  onImageLoaded: function() {
    //this.removeMap();
    //this.mapImageNode = this.newMapImageNode;
    dojo.removeClass(this.domNode, 'loading');
    this.onResize();
  },

  onChange: function(subWidget, value) {
    //this[subWidget.name] = value;
    dojo.mixin(this, this.attr('value'));
    var size = parseInt(this.imageSize);
    dojo.style(this.mapContainerNode,
        { width: this.imageSize+'px', height: this.imageSize+'px' });
    //this.refreshMap();
    this.updateImage();
  },

  _setUuidAttr: function(uuid) {
    if (uuid !== this.uuid) {
      this.uuid = uuid;
      this.onChange();
    }
  },

  _setImageSizeAttr: function(imageSize) {
    this.imageSize = imageSize;
    this.setSubValue('imageSize', imageSize);
  },

  _setFormatAttr: function(format) {
    this.format = format;
    this.setSubValue('format', format);
  },


});

  geonef.ploomap.list.tool.map.View.prototype.getImageUrl = function(data, size, format) {
    //console.log('getImageUrl', this, arguments);
    var wOh = (data.extent[2] - data.extent[0]) /
      (data.extent[3] - data.extent[1]);
    var width = wOh > 1 ? size : size * wOh;
    var height = wOh < 1 ? size : size / wOh;
    var url = data.url + // '/ows/' + data.uuid + '?' +
      dojo.objectToQuery(
        {
          TRANSPARENT: 'false',
          SERVICE: 'WMS',
          VERSION: '1.1.1',
          REQUEST: 'GetMap',
          STYLES: '',
          EXCEPTIONS: 'application%2Fvnd.ogc.se_inimage',
          FORMAT: format,
          SRS: data.srs[0],
          BBOX: data.extent.join(','),
          WIDTH: width,
          HEIGHT: height,
          LAYERS: data.enabledLayers.join(','),
          _uniqRequestId: dojox.uuid.generateRandomUuid()
        });
    return url;
  };
