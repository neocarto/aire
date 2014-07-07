
dojo.provide('geonef.ploomap.layer.Boxes');

dojo.require('geonef.jig.util.angle');

/**
 * Smart positioning of boxes ("permanent popups")
 *
 * To do:
 * - cut segments into 2 when needed
 * - take care of other boxes when positioning
 * - take care of existing pointers
 * - fix/check box size
 *
 * Then:
 * - manage geodesicSegments
 *      make a general processing of >2 points
 *      register each sub-segment as one segment
 *      generalise (simply) first?
 */
geonef.ploomap.layer.Boxes = OpenLayers.Class(OpenLayers.Layer,
{
  /**
   * APIProperty: isBaseLayer
   * {Boolean} The layer is a base layer.  Default is false.  Set this property
   * in the layer options.
   */
  isBaseLayer: false,

  /**
   * APIProperty: isFixed
   * {Boolean} Whether the layer remains in one place while dragging the
   * map.
   */
  isFixed: false,

  vectorLayer: null,
  features: null,

  boxOptions: {},

  initialize: function(vectorLayer, options) {
    this.vectorLayer = vectorLayer;
    this.features = [];
    this.cFeatures = [];
    this.boxOptions = dojo.mixin({}, this.boxOptions);
    OpenLayers.Layer.prototype.initialize.apply(
      this, [vectorLayer.name+' boxes', options]);
    this.vectorLayer.events.on({
        featuresadded: this.onFeaturesAdded,
        featureover: this.onFeatureOver,
        featureout: this.onFeatureOut,
        featureselected: this.onFeatureSelect,
        featureunselected: this.onFeatureUnselect,
        visibilitychanged: this.onVisibilityChanged,
        scope: this
    });
    if (this.vectorLayer.features.length > 0) {
      this.onFeaturesAdded({ features: this.vectorLayer.features });
    }
  },

  destroy: function() {
    this.vectorLayer.events.un({
        featuresadded: this.onFeaturesAdded,
        featureover: this.onFeatureOver,
        featureout: this.onFeatureOut,
        visibilitychanged: this.onVisibilityChanged,
        scope: this
    });
    OpenLayers.Layer.prototype.destroy.apply(this, arguments);
  },

  removeMap: function(map) {
    this.cleanBoxes();
    OpenLayers.Layer.prototype.removeMap.apply(this, arguments);
  },

  /**
   * Method: moveTo
   *
   * Parameters:
   * bounds - {<OpenLayers.Bounds>}
   * zoomChanged - {Boolean}
   * dragging - {Boolean}
   */
  moveTo:function(bounds, zoomChanged, dragging) {
    //console.log('moveTo', this, arguments);
    OpenLayers.Layer.prototype.moveTo.apply(this, arguments);

    if (this.features && this.features.length > 0) {
      if (!this.boxesBuilt) {
        this.buildBoxes();
      } else if (zoomChanged) {
        // this.buildBoxes();
        this.repositionBoxes();
      }
    }
  },
  redraw:function() {
    //console.log('redraw', this, arguments);
    OpenLayers.Layer.prototype.redraw.apply(this, arguments);
  },

  buildBoxes: function() {
    //console.log('buildBoxes', this, arguments, this.div, this.cFeatures);
    this.cleanBoxes();
    this.boxes = this.features.map(this.buildBox, this);
    this.boxesBuilt = true;
    this.repositionBoxes();
  },

  repositionBoxes: function() {
    this.resolution = this.map.getResolution();
    this.pointerFeatures = [];
    this.boxConstraints = [];
    this.boxes.forEach(this.positionWidget, this);
    if (this.pointerFeatures.length > 0) {
      this.vectorLayer.addFeatures(this.pointerFeatures);
    }
  },

  cleanBoxes: function(full) {
    if (this.boxes) {
      this.boxes.forEach(
        function(box) {
          if (box.shadow) {
            box.shadow.parentNode.removeChild(box.shadow);
          }
          if (box.pointerFeature) {
            delete box.pointerFeature.box;
            delete box.pointerFeature;
          }
          box.destroy();
        }, this);
      this.boxes = null;
    }
    if (this.pointerFeatures) {
      this.vectorLayer.removeFeatures(this.pointerFeatures);
      this.pointerFeatures = null;
    }
    if (full) {
      this.features = [];
      this.cFeatures = [];
    }
  },

  buildBox: function(feature) {
    //console.log('buildBox', this.div, this.map, this.map && this.map.layerContainerDiv);
    var lonLat = new OpenLayers.LonLat(
      feature.geometry.x, feature.geometry.y);
    var boxWidget = this.buildBoxWidget(feature);
    dojo.style(boxWidget.domNode, { position: 'absolute', visibility: 'hidden',
                                   zIndex: this.map.Z_INDEX_BASE['Popup'] });
    var div = this.map.layerContainerDiv;
    boxWidget.placeAt(div).startup();
    var mb = dojo.marginBox(boxWidget.domNode);
    dojo.mixin(boxWidget, { baseLonLat: lonLat,
                            boxSize: { w: mb.w, h: mb.h } });

    return boxWidget;
  },

  onFeaturesAdded: function(event) {
    var features = event.features.filter(this.featureFilter, this);
    if (features.length > 0) {
      this.features = this.features.concat(features);
      this.buildBoxes();
    }
  },

  onFeatureOver: function(event) {
    var box = event.feature.box;
    if (!box) { return; }
    box.enableHoverState();
  },

  onFeatureOut: function(event) {
    var box = event.feature.box;
    if (!box) { return; }
    box.disableHoverState();
  },

  onFeatureSelect: function() {
    console.log('onFeatureSelect', this, arguments);
  },

  onFeatureUnselect: function() {
    console.log('onFeatureUnselect', this, arguments);
  },

  onVisibilityChanged: function() {
    var vis = this.vectorLayer.getVisibility();
    this.setVisibility(vis);
    (this.boxes || []).forEach(
        function(box) {
          if (vis) {
            box.onMouseOut();
            box.show();
          } else {
            box.hide();
          }
          //dojo.style(box.domNode, 'display', vis ? '' : 'none');
        });
  },

  featureFilter: function(feature) {
    return true;
  },

  buildBoxWidget: function(feature) {
    throw "buildBoxWidget() must be implemented on child layer.Box classes";
  },


  ////////////////////////////////////////////////////////////////////
  // AUTO PLACEMENT

  positionWidget: function(boxWidget) {
    boxWidget._d = {};
    //var itv = this.getBoxConstraints(boxWidget);
    boxWidget.basePixel = this.map.getLayerPxFromLonLat(boxWidget.baseLonLat);
    var size = Math.max(boxWidget.boxSize.w, boxWidget.boxSize.h) * this.resolution;
    var boxDiag = Math.sqrt(Math.pow(size, 2) * 2); // diagonale
    var getFirstPosition = function(maxDistance) {
      // return angles which are free under maxDistance
      var boxAngleW = Math.abs(Math.atan((boxDiag/ 2) /
                                         (maxDistance - boxDiag / 2))) * 2;
      var bitv = this.getConstraintAngles(boxWidget, maxDistance);
      if (bitv.length == 0) {
        return Math.PI / -2;
      }
      var last = bitv[bitv.length - 1];
      var diffA = geonef.jig.util.angle.diff;
      var compareA = geonef.jig.util.angle.compare;
      var isAWithin = geonef.jig.util.angle.isWithin;
      var multA = geonef.jig.util.angle.mult;

      for (var i = 0; i < bitv.length; i++) {
        var cur = bitv[i];

        if (isAWithin(cur[0], last[0], last[1], true)) {
          var newA = isAWithin(cur[1], cur[0], last[1]) ?
            last[1] : cur[1];
          last = [cur[0], newA];
        } else {
          // angle libre : assez grand ?
          if (isAWithin(diffA(boxAngleW, -last[1]), last[1], cur[0])) {
            // return last[1];
            // calcule la marge, puis / 2, puis add à last[1]
            var margin = diffA(diffA(cur[0], last[1]), boxAngleW);
            margin = multA(margin, 0.5);
            return diffA(last[1], -1 * margin);
          } else {
            last = cur;
          }
        }
      }
      return null; // sorry!
    };

    for (var d = 0; d < 10; d++) {
      var distance = (10 + d * 20) * this.resolution + size;
      var pos = getFirstPosition.call(this, distance);
      //console.log('getFirstPosition', zz);
      if (pos !== null) {
        // if (d > 0) {
        //   console.log('placed at later try', boxWidget, d, pos, distance);
        // }
        this.placeBox(boxWidget, pos, distance);
        return;
      }
    }
    //console.log('skip', boxWidget, boxWidget.domNode, boxWidget._d);
  },

  /**
   * Build all constraints internally, then make a sorted array FOR THE GIVEN DISTANCE
   */
  getConstraintAngles: function(boxWidget, maxDistance) {
    var bitv = this.getBoxConstraints(boxWidget);
    bitv = bitv.map(
      function(constraint) { return constraint(maxDistance); });
    bitv = bitv.filter(function(ba, i) { return !!ba; });
    bitv.sort(function(bi1, bi2) {
                return geonef.jig.util.angle.compare(bi1[0], bi2[0]); });

    return bitv;
  },

  /**
   * Build all related to box's feature, in order to position the box
   */
  getBoxConstraints: function(boxWidget) {
    var constraints = [];
    this.cFeatures.forEach(
      function(f) { this.addFeatureConstraints(boxWidget, constraints, f); }, this);
    this.boxConstraints.forEach(
        function(seg) {
          var constraint = this.getLineSegmentConstraint(boxWidget, constraints, seg[0], seg[1], {});
          constraints.push(constraint);

        }, this);
    return constraints.filter(function(tv) { return !!tv; });
  },

  /**
   * Build box-related constraints about given feature (part of getBoxConstraints())
   */
  addFeatureConstraints: function(boxWidget, constraints, feature) {
    if (feature.geometry.components.length >= 2) {
      var pt1 = feature.geometry.components[0];
      var pt2 = feature.geometry.components[feature.geometry.components.length - 1];
      var constraint = this.getLineSegmentConstraint(boxWidget, constraints, pt1, pt2, feature.attributes);
      constraints.push(constraint);
    }
  },

  /**
   * Build the constraint about the given segment
   */
  getLineSegmentConstraint: function(boxWidget, constraints, pt1, pt2, _d) {
    var baseX = boxWidget.baseLonLat.lon;
    var baseY = boxWidget.baseLonLat.lat;
    var a1 = Math.atan2(pt1.y - baseY, pt1.x - baseX);
    var a2 = Math.atan2(pt2.y - baseY, pt2.x - baseX);
    var d1 = Math.sqrt(Math.pow(pt1.x - baseX, 2) + Math.pow(pt1.y - baseY, 2));
    var d2 = Math.sqrt(Math.pow(pt2.x - baseX, 2) + Math.pow(pt2.y - baseY, 2));
    var diffA = geonef.jig.util.angle.diff;
    var compareA = geonef.jig.util.angle.compare;
    if (d1 < 1 || d2 < 1) {
      if (d1 > 1) {
        return function() { return [diffA(a1, 0.1), diffA(a1, -0.1), _d]; };
      } else if (d2 > 1) {
        return function() { return [diffA(a2, 0.1), diffA(a2, -0.1), _d]; };
      } else {
        return null;
      }
    }
    var r1 = a1 > a2 ? { a: a1, d: d1, pt: pt1 } : { a: a2, d: d2, pt: pt2 };
    var r2 = a1 > a2 ? { a: a2, d: d2, pt: pt2 } : { a: a1, d: d1, pt: pt1 };
    //var itva = r1.a < r2.a ? [r1, r2] : [r2, r1]; // ret[0] must be 'before' ret[1]
    var angleWidth = diffA(r2.a, r1.a);

    return function(maxDistance) {
      if (r1.d > maxDistance && r2.d > maxDistance) {
        //console.log('no busy angle', arguments);
        return null; // no busy angle
      }
      if (r1.d < maxDistance && r2.d < maxDistance) {
        return diffA(r1.a, r2.a) > 0 ? [r2.a, r1.a] : [r1.a, r2.a]; // whole angle
        // return [r1.a, r2.a, _d, maxDistance, r1, r2]; // whole angle
      }
      var prop = (maxDistance - r1.d) / (r2.d - r1.d);
      var pa = r1.a + angleWidth * prop;
      pa = geonef.jig.util.angle.fix(pa);
      var limita = r1.d > r2.d ? r1.a : r2.a;
      return diffA(limita, pa) > 0 ? [pa, limita, _d] : [limita, pa, _d];
    };

  },

  /**
   * Position the widget to the given angle and distance
   */
  placeBox: function(boxWidget, angle, distance) {
    var boxSize = boxWidget.boxSize;
    var sizeX = boxSize.w * this.resolution;
    var sizeY = boxSize.h * this.resolution;
    var size = Math.max(sizeX, sizeY);
    var boxDiag = Math.sqrt(Math.pow(size, 2) * 2); // diagonale
    var boxAngleW = Math.abs(Math.atan((boxDiag / 2) /
                                       (distance - boxDiag / 2))) * 2;
    var x = Math.cos(angle) * distance; /* rel distance of 'first' corner in the wheel */
    var y = Math.sin(angle) * distance; /* " */
    var tlx = y > 0 ? x - sizeX : x;  /* rel distance of top-left corner */
    var tly = x > 0 ? y + sizeY : y;
    var left = parseInt(boxWidget.basePixel.x + tlx / this.resolution); /* px pos */
    var top = parseInt(boxWidget.basePixel.y + tly / -this.resolution);
    boxWidget.pixelExtent = [left, top, left + boxSize.w, top + boxSize.h ];
    dojo.style(boxWidget.domNode, {left: left+'px', top: top+'px', visibility: 'visible' });
    var diffA = geonef.jig.util.angle.diffAngle;
    this.drawPointer(boxWidget, angle, tlx, tly);
    this.drawShadow(boxWidget);
    // make constraints
    var baseX = boxWidget.baseLonLat.lon;
    var baseY = boxWidget.baseLonLat.lat;
    this.boxConstraints = this.boxConstraints.concat( // order: tl-tr, tr-br, br-br, bl-tl
      [[{ x: baseX + tlx, y: baseY + tly }, { x: baseX + tlx + sizeX, y: baseY + tly }],
       [{ x: baseX + tlx + sizeX, y: baseY + tly }, { x: baseX + tlx + sizeY, y: baseY + tly + sizeY }],
       [{ x: baseX + tlx + sizeX, y: baseY + tly + sizeY }, { x: baseX + tlx, y: baseY + tly + sizeY }],
       [{ x: baseX + tlx, y: baseY + tly + sizeY }, { x: baseX + tlx, y: baseY + tly }]]);
  },

  /**
   *  Draw the pointer line
   */
  drawPointer: function(boxWidget, angle, tlx, tly) {
    if (boxWidget.pointerFeature) {
      this.vectorLayer.removeFeatures([boxWidget.pointerFeature]);
    }
    var sizeX = boxWidget.boxSize.w * this.resolution;
    var sizeY = boxWidget.boxSize.h * this.resolution;
    angle = Math.atan2(tly - sizeY / 2, tlx + sizeX / 2);
    var baseX = boxWidget.baseLonLat.lon;
    var baseY = boxWidget.baseLonLat.lat;
    var ptrX = baseX;
    var ptrY = baseY;
    if (angle >= Math.PI / 4 && angle < Math.PI * 3 / 4) { // North
      ptrX += tlx + sizeX / 2;
      ptrY += tly - sizeY;
    } else if (Math.abs(angle) >= Math.PI * 3 / 4) { // West
      ptrX += tlx + sizeX;
      ptrY += tly - sizeY / 2;
    } else if (angle < -Math.PI / 4 && angle > -Math.PI * 3 / 4) { // South
      ptrX += tlx + sizeX / 2;
      ptrY += tly;
    } else if (Math.abs(angle) <= Math.PI / 4) { // East
      ptrX += tlx;
      ptrY += tly - sizeY / 2;
    }
    //dojo.mixin(boxWidget._d, { ptrX: ptrX, ptrY: ptrY });
    var pointer = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.LineString(
        [new OpenLayers.Geometry.Point(baseX, baseY),
         new OpenLayers.Geometry.Point(ptrX, ptrY)]),
      { type: 'pointer', km: boxWidget.feature.attributes.message });
    pointer.box = boxWidget;
    pointer.targetFeature = boxWidget.feature;
    this.pointerFeatures.push(pointer);
    boxWidget.pointerFeature = pointer;
  },

  /**
   * Build the shadow, below the boxWidget
   */
  drawShadow: function(boxWidget) {
    if (boxWidget.shadow) {
      boxWidget.shadow.parentNode.removeChild(boxWidget.shadow);
    }
    var mb = dojo.marginBox(boxWidget.domNode);
    var shadow = dojo.create('div', {'class': 'boxShadow'});
    dojo.style(shadow, { position: 'absolute',
                         left: mb.l+'px', top: mb.t+'px',
                         width: mb.w+'px', height: mb.h+'px' });
    this.div.appendChild(shadow);
    boxWidget.shadow = shadow;
  }


});
