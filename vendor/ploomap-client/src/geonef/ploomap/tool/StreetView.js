dojo.provide('geonef.ploomap.tool.StreetView');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.Select');

// used in code
dojo.require('geonef.ploomap.layer.StreetView');
dojo.require('geonef.ploomap.OpenLayers.Layer.Vector');
dojo.require('dojo.number');


dojo.declare('geonef.ploomap.tool.StreetView',
             [ geonef.jig.layout._Anchor, dijit._Templated, geonef.ploomap.MapBinding ],
{
  name: "Immersion",
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/tool_streetview.png'),
  sldUrl: dojo.moduleUrl('geonef.ploomap', 'style/sld/streetview.xml'),
  directionFeatureDistanceMin: 60, // pixels
  directionFeatureDistanceMax: 120, // pixels
  numZoomLevels: 4,
  anchorType: 'map',
  anchorPosition: 'right',
  layoutWholeMapStyle: { top: 'auto', left: 'auto', bottom: 0, right: 0,
                         width: '250px', height: '250px' },

  /**
   * One of: 'whole', 'left', 'right', 'top', 'bottom'
   */
  sceneLayout: 'whole',

  /**
   * Options for google.maps.StreetViewPanorama
   *
   * @type {google.maps.StreetViewPanoramaOptions}
   */
  panoramaOptions: {
    //enableFullScreen: true
  },

  templateString: dojo.cache("geonef.ploomap.tool", "templates/StreetView.html"),
  widgetsInTemplate: true,

  scene: null,


  postMixInProperties: function() {
    this.inherited(arguments);
    dojo.mixin(this, {
		 gsvObject: null,
		 gsvOverlay: null,
		 positionFeature: null,
		 layerZIndex: null,
                 heading: 0, zoom: 0,
                 wgs84: new OpenLayers.Projection('EPSG:4326')
	       });
  },

  onMapBound: function() {
    //console.log('mapBound', this);
    this.inherited(arguments);
    this.connect(this.mapWidget, 'onZoomChange', 'onMapZoomChange');
    this.layer = new geonef.ploomap.OpenLayers.Layer.Vector
        ('Immersion', {
           sldUrl: this.sldUrl,
           icon: '/lib/geonef/ploomap/style/icon/tool_streetview.png',
           defaultClickControl: null
         });
    this.dragControl = new OpenLayers.Control.DragFeature(this.layer, {
	onStart: dojo.hitch(this, 'onDragStart'),
        onDrag: dojo.hitch(this, 'onDrag'),
	onComplete: dojo.hitch(this, 'onDragEnd')
    });
    this.layer.controllerWidget = this;
    this.mapWidget.map.addLayer(this.layer);
    //console.log('added kayer to map', this, this.layer.id, this.layer);
    this.layer.events.on({ visibilitychanged: this.onLayerVisibilityChange,
                           scope: this});
    this.connect(this.layer, 'applySld',
        dojo.hitch(this, function() { this.symbolizers = null; }));
    this.createGsvObject();
    this.initCustom();
    this.setVisibility(true);
    this.layer.setClickControl(this.dragControl);
    //this.layer.deactivateSelect(true);
    //this.layer.activateSelect();
    this.onDragEnd(this.positionFeature, true);
  },

  destroy: function() {
    //console.log('streetView destroy', this, arguments);
    if (this.gsvObject) {
      delete this.gsvService;
      this.gsvObject.unbindAll();
      delete this.gsvObject;
    }
    if (this.scene) {
      if (this.sceneLayout == 'whole') {
        this.scene.removeChild(this.mapWidget);
        var parent = geonef.jig.getParent(this.scene);
        parent.replaceChild(this.scene, this.mapWidget);
        // parent.removeChild(this.scene, true);
        // parent.addChild(this.mapWidget);
      }
      this.scene.destroy();
      this.scene = null;
    }
    this.positionFeature = this.directionFeature = null;

    if (this.layer) {
      this.layer.events.un({ visibilitychanged: this.onLayerVisibilityChange,
                             scope: this});
      this.layer.controllingWidget = null;
      this.mapWidget.map.removeLayer(this.layer);
      this.layer.destroy();
      this.layer = null;
    }
    this.mapWidget.attr('reduced', false);
    this.inherited(arguments);
  },

  createGsvObject: function() {
    this.mapWidget.attr('reduced', true);
    this.scene = new geonef.ploomap.tool._StreetViewScene();
    this.scene.startup();
    this.attr('sceneLayout', this.sceneLayout);
    this.gsvService = new google.maps.StreetViewService();
    this.gsvObject = new google.maps.StreetViewPanorama(
      this.scene.domNode, dojo.mixin(
        {  panoProvider: dojo.hitch(this, 'getPanorama') }, this.panoramaOptions));
    this.scene.gsv = this.gsvObject;
    google.maps.event.addListener(this.gsvObject, 'error', dojo.hitch(this, 'gsvError'));
    google.maps.event.addListener(this.gsvObject, 'position_changed', dojo.hitch(this, 'gsvMove'));
    google.maps.event.addListener(this.gsvObject, 'pov_changed', dojo.hitch(this, 'gsvPovChange'));
    var center = this.mapWidget.map.getCenter();
    var geometry = new OpenLayers.Geometry.Point(center.lon, center.lat);
    this.positionFeature = new OpenLayers.Feature.Vector(geometry);
    this.positionFeature.attributes.type = 'position';
    this.positionFeature.attributes.name = "Vue 3D<br/>"
      + "<small>Cliquer et déplacer pour changer d'endroit...</small>";
    this.directionFeature = new OpenLayers.Feature.Vector(geometry.clone());
    this.directionFeature.attributes.type = 'direction';
    this.directionFeature.attributes.name = "Direction observée<br/>"
      + "<small>Cliquer et déplacer pour tourner et zoomer...</small>";
    this.layer.addFeatures([this.positionFeature, this.directionFeature]);
    this.updateDirectionFeature();
    this.gsvPovChange(this.gsvObject.getPov());
  },

  onDragStart: function(feature, pixel) {
    this.dragging = true;
    if (feature.attributes.type === 'position') {
      this.dragPositionGeom = this.positionFeature.geometry.clone();
      this.dragDirectionGeom = this.directionFeature.geometry.clone();
      if (!this.gsvOverlayActive) {
        if (this.gsvOverlay &&
            this.mapWidget.map.baseLayer.mapObject &&
            this.mapWidget.map.baseLayer.mapObject.addOverlay) {
          this.mapWidget.map.baseLayer.mapObject.addOverlay(this.gsvOverlay);
          this.layerZIndex = this.mapWidget.map.baseLayer.getZIndex();
          this.mapWidget.map.baseLayer.setZIndex(this.layer.getZIndex() - 1);
          this.gsvOverlayActive = true;
        }
      }
    } else if (feature.attributes.type === 'direction') {
    }
  },

  onDrag: function(feature, pixel) {
    if (feature.attributes.type === 'position') {
      var x = feature.geometry.x - this.dragPositionGeom.x;
      var y = feature.geometry.y - this.dragPositionGeom.y;
      this.directionFeature.move(new OpenLayers.LonLat(
          this.dragDirectionGeom.x + x, this.dragDirectionGeom.y + y));
      //this.updateGsvLocation(new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y));
    } else if (feature.attributes.type === 'direction') {
      var geom = this.positionFeature.geometry;
      var x = feature.geometry.x - geom.x;
      var y = feature.geometry.y - geom.y;
      var h = Math.sqrt(x * x + y * y);
      var hPx = h / this.mapWidget.map.getResolution();
      var zoom = this.numZoomLevels * (hPx - this.directionFeatureDistanceMin) /
        (this.directionFeatureDistanceMax - this.directionFeatureDistanceMin);
      var ac = Math.acos(x / h);
      var angle = y > 0 ? ac : (2 * Math.PI - ac);
      var deg = 90 - angle * 180 / Math.PI;
      deg %= 360;
      if (deg < 0) { deg += 360; }
      var izoom = Math.round(Math.min(this.numZoomLevels, Math.max(0, zoom)));
      var pov = this.gsvObject.getPov();
      this.gsvObject.setPov({ heading: deg, zoom: izoom, pitch: pov.pitch });
    }
  },

  onDragEnd: function(f, isFirst) {
    this.dragging = false;
    if (f && f.attributes.type === 'position') {
      this.updateGsvLocation(new OpenLayers.LonLat(f.geometry.x, f.geometry.y));
      // if (this.gsvOverlayActive) {
      //   this.mapWidget.map.baseLayer.setZIndex(this.layerZIndex);
      //   this.mapWidget.map.baseLayer.mapObject.removeOverlay(this.gsvOverlay);
      //   this.gsvOverlayActive = false;
      // }
    } else if (f.attributes.type === 'direction') {
      this.updateDirectionFeature();
    }
    if (!isFirst) {
      geonef.jig.workspace.focus(this);
    }
  },

  gsvMove: function() {
    // when the user moves through GSV
    //console.log('gsvMove', this, arguments);
    var point = this.gsvObject.getPosition();
    if (!point) {
      return;
    }
    var self = this;
    var panoId = this.gsvObject.getPano();
    if (panoId) {
      this.gsvService.getPanoramaById(panoId, dojo.hitch(this, this.updatePano, panoId));
    }
    dojo.style(this.noViewNode, 'display', 'none');
    this.positionFeature.attributes.name = "Vue 3D"/* - " + loc.description*/ + "<br/>"
      + "<small>Cliquer et déplacer pour changer d'endroit...</small>";
    if (this.dragging) {
      this.layer.createContextMover(this.positionFeature);
      return;
    }
    var lonLat = new OpenLayers.LonLat(point.lng(), point.lat());
    // display in WGS 84
    this.positionNode.innerHTML = lonLat.toShortString();
    lonLat.transform(this.wgs84, this.mapWidget.map.getProjectionObject());
    this.positionFeature.move(lonLat);
    this.mapWidget.map.panTo(lonLat);
    this.updateDirectionFeature();
  },

  updatePano: function(panoId, data, status) {
    //console.log('updatePano', this, arguments);
    while (this.linksNode && this.linksNode.firstChild) {
      this.linksNode.removeChild(this.linksNode.firstChild);
    }
    this.addressNode.innerHTML = "-";
    if (status !== google.maps.StreetViewStatus.OK) { return; }
    this.addressNode.innerHTML = data.location.description;
    if (this.linksNode) {
      data.links.forEach(
        function(link) {
          var arrow = panoId == this.lastPano ? '&larr;' : '&rarr;';
          var self = this;
          dojo.create('li', {
              'class':'link',
              innerHTML: arrow+' '+link.description+' ('+link.heading+'°)',
              onclick: function() {
                self.gsvObject.setPano(link.pano);
              }
          }, this.linksNode);
        }, this);
    }
    this.lastPano = panoId;
  },

  gsvPovChange: function() {
    //console.log('gsvPovChange', this, arguments);
    var pov = this.gsvObject.getPov();
    if (!pov.heading || Math.abs(pov.heading - this.heading) > 1) {
      this.gsvHeadingChange(pov.heading);
    }
    if (pov.zoom !== this.zoom) {
      this.gsvZoomChange(pov.zoom);
    }
    this.pitchNode.innerHTML = dojo.number.format(dojo.number.round(pov.pitch, 2))+'°';
  },

  gsvHeadingChange: function(heading) {
    //console.log('gsvHeadingChange', arguments);
    this.azimutNode.innerHTML = dojo.number.format(dojo.number.round(heading, 2))+'°';
    this.heading = heading;
    if (!this.symbolizers) {
      // explore styleMap and grab refs to symbolizer objects,
      // for quick update of rotation property
      this.symbolizers = [];
      geonef.jig.forEach(this.layer.styleMap.styles,
          function(style) {
            style.rules.forEach(
                function(rule) {
                  if (rule.symbolizer.Point) {
                    this.symbolizers.push(rule.symbolizer.Point);
                  }
                }, this);
          }, this);
    }
    this.symbolizers.forEach(function(symb) { symb.rotation = heading; });
    this.positionFeature.layer.drawFeature(this.positionFeature);
    this.updateDirectionFeature();
  },

  gsvZoomChange: function(zoom) {
    //console.log('gsvZoomChange', this, arguments);
    this.zoom = zoom;
    this.zoomNode.innerHTML = dojo.number.format(dojo.number.round(zoom, 1));
    this.updateDirectionFeature();
  },

  updateDirectionFeature: function() {
    if (!this.directionFeature) { return; }
    this.directionFeature.attributes.name = "Direction observée - "
      + Math.round(this.heading)+"° zoom "
      + (Math.round(this.zoom*10)/10)+"<br/>"
      + "<small>Cliquer et déplacer pour tourner et zoomer...</small>";
    if (this.dragging) {
      //this.layer.optWidget.createContextMover(this.directionFeature);
      return;
    }
    var pt = this.positionFeature.geometry;
    var distancePx = this.directionFeatureDistanceMin +
      (this.directionFeatureDistanceMax - this.directionFeatureDistanceMin)
      * this.zoom / this.numZoomLevels;
    var distance = distancePx * this.mapWidget.map.getResolution();
    //console.log('update distance', distance, distancePx, this.zoom);
    var lonLat = new OpenLayers.LonLat(
      pt.x + Math.cos((90 - this.heading) * Math.PI * 2 / 360) * distance,
      pt.y + Math.sin((90 - this.heading) * Math.PI * 2 / 360) * distance);
    this.directionFeature.move(lonLat);
  },

  gsvError: function(errorCode) {
    switch(errorCode) {
    case 603:
      alert("Il manque le plugin flash à ce navigateur.\n\nLa vue 3D ne peut s'afficher.");
      return;
    case 600:
      dojo.style(this.noViewNode, 'display', '');
      dojo.publish('jig/workspace/flash', ['Pas de vue de rues pour cet emplacement !']);
      return;
    }
  },

  updateGsvLocation: function(lonlat) {
    // update GSV location to lonlat, or map center if null
    if (!lonlat.lon || !lonlat.lat) {
      lonlat = this.mapWidget.map.getCenter();
    }
    lonlat.transform(this.mapWidget.map.getProjectionObject(), this.wgs84);

    //console.log('set loc', this, lonlat, loc);
    this.gsvObject.setPosition(new google.maps.LatLng(lonlat.lat, lonlat.lon));
    //this.gsvObject.setLocationAndPOV(/*loc*/ new google.maps.LatLng(lonlat.lat, lonlat.lon));
  },

  resize: function() {
    //console.log('resize', this, arguments);
    this.inherited(arguments);
    if (this.gsvObject) {
      dojo.query('object', this.domNode).style({ width: '100%', height: '100%' });
      google.maps.event.trigger(this.gsvObject, 'resize');
      //this.gsvObject.checkResize();
    }
  },

  onMapZoomChange: function() {
    this.updateDirectionFeature();
  },

  onLayerVisibilityChange: function(event) {
    //console.log('onLayerVisibilityChange', this, arguments);
    //this.layer.getVisibility()
  },

  onAppear: function() {
    if (this.layer) {
      this.layer.activateSelect();
    }
  },

  setVisibility: function(state) {
    if (state) {
      this.enable();
    } else {
      this.disable();
    }
  },

  enable: function() {
    //console.log('enable', this);
    //this.data.enabled = true;
  },

  disable: function() {
    //this.data.enabled = false;
  },

  // this.layoutSelect ~onChange
  onLayoutSelectChange: function(layout) {
    this.attr('sceneLayout', layout);
  },

  _setSceneLayoutAttr: function(layout) {
    this.layoutSelect.attr('value', layout);
    if (!this.scene) { return; }
    var inDom = !!this.scene.domNode.parentNode;
    if (this.sceneLayout == layout && inDom) { return; }
    var sMap = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    if (sMap[layout]) {
      this.anchorScene(sMap[layout]);
      this.sceneLayout = layout;
      return;
    }
    this.sceneLayout = layout;
    var map = this.mapWidget;
    if (inDom) {
      geonef.jig.getParent(map).removeChild(map);
    } else {
      geonef.jig.getParent(map).replaceChild(map, this.scene);
    }
    this.scene.floatingChildrenProperties[map.id] =
      dojo.mixin({}, this.layoutWholeMapStyle);
    this.scene.addChild(map);
    dojo.style(map.domNode, this.layoutWholeMapStyle);
    if (this.gsvObject) {
      this.gsvMove();
    }
  },

  anchorScene: function(side) {
    if (this.sceneLayout == 'whole') {
      geonef.jig.getParent(this.scene).replaceChild(this.scene, this.mapWidget);
    }
    var anchor = new geonef.jig.layout.anchor.Border(
      { widget: this.mapWidget, border: side });
    anchor.accept(this.scene);
    anchor.destroy();
  },


  ////////////////////////////////////////////////////////////////////
  // TEST PANORAMAS

  testPanoramas: {
    pano1: {
      title: 'Carrière Hospice - Panorama 1',
      position: [2.35055995966558, 48.80932367370656],
      heading: 0,
      links: [
        { heading: 120, description: "Vers l'injection", pano: 'pano2' },
        { heading: 330, description: "Vers l'entrée", pano: 'pano3' }
      ]
    },
    pano2: {
      title: 'Carrière Hospice - Panorama 2 (longue pose)',
      position: [2.350644449249506, 48.809270681246986],
      heading: 270,
      links: [
        { heading: 315, description: "Pano longue pose", pano: 'pano1' }
      ]
    },
    pano3: {
      title: 'Carrière Hospice - Panorama 3',
      position: [2.350484857813151, 48.80941729358103],
      heading: 135,
      links: [
        { heading: 135, description: "Pano longue pose", pano: 'pano1' },
        { heading: 270, description: "Vers l'escalier d'accès", pano: 'pano4' }
      ]
    },
    pano4: {
      title: 'Carrière Hospice - Panorama 4',
      position: [2.3504030504382243, 48.80947381870344],
      heading: 45,
      links: [
        { heading: 135, description: "Vers la longue pose", pano: 'pano3' },
        { heading: 315, description: "Vers l'escalier d'accès", pano: 'pano5' }
      ]
    },
    pano5: {
      title: "Carrière Hospice - Panorama 5",
      position: [2.350141535059807, 48.80959570078181],
      heading: 100,
      links: [
        { heading: 110, description: "Vers la longue pose", pano: 'pano4' },
        { heading: 310, description: "Escalier d\'accès", pano: 'pano6' }
      ]
    },
    pano6: {
      title: "Carrière Hospice - En bas de l'escalier",
      position: [2.3496600785403956, 48.809495015610366],
      heading: 10,
      links: [
        { heading: 135, description: "L'autre salle", pano: 'pano5' },
        { heading: 10, description: "Sortir", pano: 'pano7' }
      ]
    },
    pano7: {
      title: "Carrière Hospice - Devant l'entrée",
      position: [2.349690923944067, 48.809718465767304],
      heading: 190,
      links: [
        { heading: 190, description: "Descendre...", pano: 'pano6' },
        //{ heading: 315, description: "Rue Séverine", pano: '_entry_' }
      ]
    }
  },

  getPanorama: function(pano,zoom,tileX,tileY) {
    //console.log('getCustomPanorama', this, arguments);
    if (!this.testPanoramas[pano]) {
      return null;
    }
    var def = this.testPanoramas[pano];
    var links = (def.links || []).map(
      function(o) {
        return dojo.mixin({roadColor: '#a02020'}, o);
      }, this);
    var latLng = def.position ?
      new google.maps.LatLng(def.position[1], def.position[0]) : null;
    return {
      location: {
        pano: pano,
        description: def.title,
        latLng: latLng
      },
      copyright: '(c) 2011, Communauté Catapatate',
      tiles: {
          tileSize: new google.maps.Size(256, 256),
          worldSize: new google.maps.Size(16384, 8192),
          centerHeading: def.heading || 0,
          getTileUrl: function(pano,zoom,tileX,tileY) {
            //console.log('getTestPanoramaTileUrl', arguments);
            return '/images/test/'+pano+'/tile-'+zoom+'-'+tileX+'-'+tileY+'.jpg';
          }
      },
      links: links
    };
  },

  onLinksChanged: function() {
    //console.log('onLinksChanged', this, arguments);
    if (this.entryPanoId) {
      var links = this.gsvObject.getLinks();
      var panoId = this.gsvObject.getPano();
      switch(panoId) {
      case this.entryPanoId:
        links.push(
          { 'heading': 90, 'description' : "Entrée de la carrière Hospice", 'pano' : 'pano7' });
        break;
      case 'pano7':
        links.push(
          { heading: 315, description: "Rue Séverine", 'pano' : this.entryPanoId });
        break;
      default:
        return;
      }
    }
  },

  initCustom: function() {
    var client = new google.maps.StreetViewService();
    var entryPoint = new google.maps.LatLng(48.809655, 2.349668);
    client.getPanoramaByLocation(entryPoint, 50, dojo.hitch(this,
      function(result, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          this.entryPanoId = result.location.pano;
        }
      }));
    google.maps.event.addListener(this.gsvObject, 'links_changed',
                                  dojo.hitch(this, 'onLinksChanged'));
    if (this.mapWidget.map.getZoom() < 15) {
      this.mapWidget.map.zoomTo(16);
    }
  },

  catas: function() {
    this.gsvObject.setPano(this.entryPanoId);
    var self = this;
    window.setTimeout(
      function() { self.mapWidget.map.zoomTo(19); }, 50);
  }


});

dojo.declare('geonef.ploomap.tool._StreetViewScene',
             [ geonef.jig.layout._Anchor, dijit._Templated ],
{
  gsv: null,

  templateString: '<div class="ploomapToolStreetViewScene" '
                  + 'dojoAttachPoint="containerNode"></div>',

  // buildRendering: function() {
  //   this.domNode = dojo.create('div', {'class':'ploomapToolStreetViewScene'});
  // },

  destroy: function() {
    this.gsv = null;
    this.inherited(arguments);
  },

  resize: function(changedSize) {
    //console.log('resize', this, arguments);
    if (changedSize && (changedSize.w || changedSize.h)) {
      dojo.marginBox(this.domNode, changedSize);
    }
    if (this.gsv) {
      dojo.query('object', this.domNode).style({ width: '100%', height: '100%' });
      google.maps.event.trigger(this.gsv, 'resize');
    }
  }

});
