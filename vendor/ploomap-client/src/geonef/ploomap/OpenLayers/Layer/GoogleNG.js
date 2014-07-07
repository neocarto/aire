/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

dojo.provide('geonef.ploomap.OpenLayers.Layer.GoogleNG');

/**
 * @requires OpenLayers/Layer/GoogleNG.js
 */

/**
 * Class: geonef.ploomapOpenLayers.Layer.GoogleNG
 *
 * Inherits from:
 *  - <OpenLayers.Layer.GoogleNG>
 */
geonef.ploomap.OpenLayers.Layer.GoogleNG = OpenLayers.Class(OpenLayers.Layer.GoogleNG,
{
  postInitCallback: null,

  buffer: 1,

  isBaseLayer: true,

  wrapDateLine: true,

  // metadata: {
  //   description: def.description,
  //   url: 'http://maps.google.com/',
  //   region: 'Monde'
  // },

  /**
   * Custom option:
   *    - postInitCallback: function that is called upon initLayer()
   *                        (and then deleted from object)
   */
  initialize: function(options) {
    //console.log('initialize', this, arguments);
    options = OpenLayers.Util.applyDefaults({}, options);
    if (options.postInitCallback) {
      this.postInitCallback = options.postInitCallback;
      delete options.postInitCallback;
    }
    // var newArgs = [options];
    // OpenLayers.Layer.GoogleNG.prototype.initialize.apply(this, newArgs);

    options = OpenLayers.Util.applyDefaults({
                sphericalMercator: true
    }, options);

    if (!options.type) {
      options.type = google.maps.MapTypeId.ROADMAP;
    }
    var newArgs = [options.name, null, options];
    OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArgs);
    var gmapOptions = {};
    if (this.styles) {
      gmapOptions.styles = this.styles;
    }
        if (!OpenLayers.Layer.GoogleNG.mapObject) {
            OpenLayers.Layer.GoogleNG.mapObject =
                new google.maps.Map(document.createElement("div"), gmapOptions);
        }
        if (OpenLayers.Layer.GoogleNG.mapObject.mapTypes[this.type]) {
            this.initLayer();
        } else {
            google.maps.event.addListenerOnce(
                OpenLayers.Layer.GoogleNG.mapObject,
                "idle",
                OpenLayers.Function.bind(this.initLayer, this)
            );
        }

    // if (this.styles) {
    //   var styledMapType = new google.maps.StyledMapType(this.styles,
    //                { name: "Styled", minZoom: 0, maxZoom: 20, alt: "Styled" });
    //   this.type = 'styled_'+this.id.substr(this.id.lastIndexOf('.')+1).toLowerCase();
    //   OpenLayers.Layer.GoogleNG.mapObject =
    //     new google.maps.Map(document.createElement("div"),
    //                         { mapTypeControlOptions: {
    //                             mapTypeIds: [google.maps.MapTypeId.ROADMAP, this.type] }});
    //   var mapObject = OpenLayers.Layer.GoogleNG.mapObject;
    //   console.log('styledMapType', this, arguments, styledMapType, this.type);
    //   //console.log('new type', mapObject.mapTypes[this.type]);
    //   //mapObject.mapTypeId = this.type;
    //   mapObject.mapTypes.set(this.type, styledMapType);
    //   mapObject.setMapTypeId(this.type);
    //   window.styledMapType = styledMapType;
    //   this.mapTypes = dojo.mixin({}, this.mapTypes);
    //   this.mapTypes[this.type] = "p";
    // } else if (!mapObject) {
    //   OpenLayers.Layer.GoogleNG.mapObject =
    //     new google.maps.Map(document.createElement("div"));
    // }
    // // if (OpenLayers.Layer.GoogleNG.mapObject.mapTypes[this.type]) {
    // //   this.initLayer();
    // // } else {
    //   google.maps.event.addListenerOnce(
    //     OpenLayers.Layer.GoogleNG.mapObject,
    //     "idle",
    //     OpenLayers.Function.bind(this.initLayer, this)
    //   );
    // // }
  },

  initLayer: function() {
    console.log('initLayer', this, arguments);
    OpenLayers.Layer.GoogleNG.prototype.initLayer.apply(this, arguments);
    if (this.postInitCallback) {
      //console.log('call postInitCB', this.postInitCallback);
      this.postInitCallback(this);
      delete this.postInitCallback;
    }
  },

  clone: function(obj) {
    if (obj == null) {
      obj = new geonef.ploomap.OpenLayers.Layer.GoogleNG(this.options);
    }
    //get all additions from superclasses
    obj = OpenLayers.Layer.GoogleNG.prototype.clone.apply(this, [obj]);
    // copy/set any non-init, non-simple values here
    return obj;
  }

});
