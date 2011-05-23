pmContainerEnum = OpenLayers.Class(
{
  name:			null,
  baseLayers:		false,
  layers:		null,
  selectedLayer:	null,
  opacity:		1,
  start:		null,
  visibility:		true,
  
  initialize: function(name, baseLayers, options) {
    this.name = name;
    this.baseLayers = baseLayers;
    this.layers = [];
    OpenLayers.Util.extend(this, options);
  },
  
  setOpacity: function(opacity) {
    this.selectedLayer.setOpacity(opacity);
    this.opacity = opacity;
  },

  setVisibility: function(visibility) {
    this.selectedLayer.setVisibility(visibility);
    this.visibility = visibility;
  },
  
  addLayer: function(layer) {
    layer.container = this;
    layer.isBaseLayer = this.baseLayers;
    var fullName = layer.fullName ? layer.fullName : layer.name;
    layer.fullName = this.name + ' - ' + fullName;
    if (this.start ? (this.start == layer.pmName) : !this.layers.length) {
      layer.visibility = this.visibility;
      layer.setOpacity(this.opacity);
      this.selectedLayer = layer;
    }  else if (!this.baseLayers)
      layer.visibility = false;
    this.layers.push(layer);
 },
  
  selectLayer: function(name) {
    for (var i = 0; i < this.layers.length; i++)
      if (this.layers[i].pmName == name) {
	if (!this.baseLayers)
	  this.selectedLayer.setVisibility(false);
	this.selectedLayer = this.layers[i];
	break;
      }
    if (this.selectedLayer) {
      this.selectedLayer.setOpacity(this.opacity);
      if (this.baseLayers)
	this.selectedLayer.map.setBaseLayer(this.selectedLayer);
      else
	this.selectedLayer.setVisibility(this.visibility);
    }
  },
  
  getLayer: function(name) {
    for (var i = 0; i < this.layers.length; i++)
      if (name == this.layers[i].pmName)
	return this.layers[i];
    return null;
  }
  
});

pmContainerUnion = OpenLayers.Class(
{
  name:			null,
  layers:		null,
  opacity:		1.0,
  visibility:		true,
  
  initialize: function(name, options) {
    this.name = name;
    this.layers = [];
    OpenLayers.Util.extend(this, options);
  },
  
  setOpacity: function(opacity) {
    this.opacity = opacity;
    for (var i = 0; i < this.layers.length; i++)
      this.layers[i].setEffectiveOpacity(this.layers[i].selfOpacity * opacity);
  },

  setVisibility: function(visibility) {
    this.visibility = visibility;
    for (var i = 0; i < this.layers.length; i++)
      this.layers[i].setEffectiveVisibility(this.layers[i].selfVisibility && visibility);
  },
  
  addLayer: function(layer) {
    layer.container = this;
    layer.isBaseLayer = false;
    layer.selfVisibility = layer.visibility;
    layer.setEffectiveVisibility = layer.setVisibility;
    layer.setVisibility = function(visibility) {
      this.selfVisibility = visibility;
      this.setEffectiveVisibility(this.selfVisibility && this.container.visibility);
    };
    layer.selfOpacity = 1.0;//layer.opacity;
    layer.setEffectiveOpacity = layer.setOpacity;
    layer.setOpacity = function(opacity) {
      this.selfOpacity = opacity;
      this.setEffectiveOpacity(this.selfOpacity * this.container.opacity);
    };
    layer.visibility = layer.visibility && this.visibility;
    this.layers.push(layer);
    if (this.ploomap)
      this.ploomap.map.addLayer(layer);
   },

  removeLayer: function(name) {
    var layer = this.getLayer(name);
    if (this.ploomap)
      this.ploomap.map.removeLayer(layer);
    OpenLayers.Util.removeItem(this.layers, layer);
  },
  
  getLayer: function(name) {
    for (var i = 0; i < this.layers.length; i++)
      if (name == this.layers[i].pmName)
	return this.layers[i];
    return null;
  }
  
});

pmViewOpenLayers = OpenLayers.Class(
{
  
  map: null,
  mapName: null,
  varName: null,
  
  wheelHandler: null,		// OpenLayers.Handler.MouseWheel
  wheelFunctions: [],		// Associative array of functions
  wheelActiveFunc: null,	// (string) Name of active function
  
  formerExtent: null,
  
  containerLayers : [],
  
  clickControls: {},
  currentClickControlName: null,

  initialize: function(mapName, varName) {
    this.mapName = mapName;
    this.varName = varName;
  },
  
  setMap: function(map) {
    map.pmName = this.mapName;
    this.map = map;
    var obj = this;
    this.wheelHandler = new OpenLayers.Handler.MouseWheel
    (this, { up: function() { obj.onWheelMove(1);},
	     down: function() {obj.onWheelMove(-1);}});
    this.wheelHandler.activate();
    this.wheelFunctions.zoom = function(dir) {
      obj.map.zoomTo(obj.map.getZoom() + dir);
    };
    window.onresize = this.onWindowResize;
    this.map.events.register('addlayer', this, this.onLayerAdd);
    this.map.events.register("moveend", this, this.onZoom);

  },
  
  endInit: function() {
    var extent = this.map.getExtent();
//    if (extent)
      this.formerExtent = { bbox: extent.toBBOX(), zoom: this.map.getZoom() };    
  },
  
  setWheelFunction: function(name, fromSelect) {
    this.wheelActiveFunc = name;
    if (!fromSelect)
      $(this.varName+'-wheel').value = name;
  },
  
  addContainerLayer: function(obj) {
    this.containerLayers.push(obj);
    for (var i = 0; i < obj.layers.length; i++)
      this.map.addLayer(obj.layers[i]);
    if (obj.baseLayers)
      this.map.setBaseLayer(obj.selectedLayer);
    obj.ploomap = this;
    this.onLayerAdd({layer: obj});
  },
  
  getLayer: function(name) {
    for (var i = 0; i < this.containerLayers.length; i++)
      if (name == this.containerLayers[i].pmName)
	return this.containerLayers[i];
    for (var i = 0; i < this.map.layers.length; i++)
      if (name == this.map.layers[i].pmName)
	return this.map.layers[i];
    return null;
  },

  selectClickControl: function(name) {
    for (key in this.clickControls) {
      var control = this.clickControls[key];
      if (control) {
	if (key == name)
	  control.activate();
	else
	  control.deactivate();
      }
    }
    this.currentClickControlName = name;
/*    if (mode == 'drag')
      $('area').innerHTML = '<b>Mode d&eacute;placement activ&eacute;</b>';
    if (mode == 'modify')
      $('area').innerHTML = '<b>Mode modification activ&eacute;</b>';
    if (mode == 'drag' || mode == 'modify') {
      this.modeEditGeometry = true;
      this.insertMode = false;
    }*/
  },
  
  // --- Callbacks ----------------------------------------------------------------

  onLayerAdd: function(event) {
    var layer = event.layer;
    if (layer.noOpacityWheel || layer.name.search(/OpenLayers/) != -1)
      return;
    this.wheelFunctions['opacity_'+layer.pmName]
      = function(dir) { layer.changeOpacity(dir < 0 ? -0.1 : 0.1); };
    var wheelSelect = $(this.varName+'-wheel');
    if (wheelSelect && !layer.container) {
      var option = document.createElement('option');
      option.setAttribute('value', 'opacity_'+layer.pmName);
      option.appendChild(document.createTextNode('Opacité '+layer.name));
      wheelSelect.appendChild(option);
    }
    var objName = this.varName;
    layer.changeOpacity = function(byOpacity) {
      var newOpacity = (parseFloat($(objName+'-'+this.pmName+'-opacity').value) + 
			byOpacity).toFixed(1);
      newOpacity = Math.min(1.0, Math.max(0.0, newOpacity));
      this.setOpacity(newOpacity);
      $(objName+'-'+this.pmName+'-opacity').value = newOpacity;
      $(objName+'-'+this.pmName+'-opacity-value').innerHTML = (newOpacity * 100)+"%";
    };

  },
  
  onWheelMove: function(dir) {
/*    console.log(this.wheelActiveFunc);
    console.log(this.wheelFunctions);
    console.log(this.wheelFunctions[this.wheelActiveFunc]);*/
    
    if (this.wheelActiveFunc && this.wheelFunctions[this.wheelActiveFunc])
      this.wheelFunctions[this.wheelActiveFunc](dir);
  },
  
  onGoogleSearch: function(text) {
    var geocoder = new GClientGeocoder();
    geocoder.getLatLng(text, this.onGoogleSearchResponse);
  },

  onGoogleSearchResponse: function(pt) {
    if (!pt)
      return;
    var url = '/pmViewOpenLayers/goToGoogleCoords?x='+pt.lng()+'&y='+pt.lat();
    Ploomap.ajaxUpdate('area', url, {asynchronous: true, evalScripts: true});
  },
  
  onWindowResize: function() {
    if (window.hasBeenResized) return;
      window.hasBeenResized = true;
  /*  alert("Malheur ! Vue redimensionnÃ©e. La carte Google ne sera plus synchro.\n"+
          "Il faut recharger la page. Je dÃ©sactive la couche Google en attendant.");*/
  },
  
  onZoom: function(event) {
    var bbox = this.map.getExtent().toBBOX();
    var zoom = this.map.getZoom();
    var url = '/pmViewOpenLayers/move?map='+this.mapName+'&var='+this.varName+'&nbbox='+bbox+'&nzoom='+zoom;
    if (this.formerExtent)
      url += '&obbox='+this.formerExtent.bbox+'&ozoom='+this.formerExtent.zoom;
    this.formerExtent = { bbox: bbox, zoom: zoom };
    Ploomap.ajaxUpdate('area', url, {asynchronous: true, evalScripts: true});
  }

//  CLASS_NAME: "Ploomap.View.OpenLayers"
});
