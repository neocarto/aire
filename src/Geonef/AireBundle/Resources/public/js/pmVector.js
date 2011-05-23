
OpenLayers.Layer.pmVector = OpenLayers.Class(OpenLayers.Layer.Vector,
{
  objName: null,
  pmView: null,
  wkt: null,
  featureFlashElement: null,
  featureFlashVisibility: true,
  ploomapControl: null,
  insertMode: false,
  selectedFeature: null,
  currentFeatureType: null,
  batchInsertMode: false,
  
  initialize: function(name, options) {
    OpenLayers.Layer.Vector.prototype.initialize.apply(this, arguments);
    if (this.objName)
      this.pmView = window[this.objName];
    this.wkt = new OpenLayers.Format.WKT();

    if (!this.featureFlashElement && this.featureFlashVisibility)
      this.featureFlashElement = $('flash');
    if (this.featureFlashVisibility)
    this.setFeatureFlashVisibility(true);
    
    OpenLayers.Feature.Vector.prototype.closePopup = function() {
      if (!this.popup) return;
      this.popup.hide();
      this.popup = null;
    };

  },

  setMap: function(map) {
    OpenLayers.Layer.Vector.prototype.setMap.apply(this, arguments);
//    this.map.addControl(new OpenLayers.Control.Navigation({'zoomWheelEnabled': false}));
    var layer = this; // for the closure
    this.ploomapControl = new OpenLayers.Control.PloomapFeature
	(this, { callbacks: { over: function(f) { layer.onOverFeature(f); },
			      out: function(f) { layer.onOutFeature(f);  }}});
    this.map.addControl(this.ploomapControl);
    this.ploomapControl.activate();

    var clickControls = {
      select: new OpenLayers.Control.SelectFeature
	(this, { onSelect: function(f) { layer.onFeatureSelect(f);},
     	         onUnselect: function(f) {layer.onFeatureUnselect(f);}}),
      point: new OpenLayers.Control.DrawFeature(this, OpenLayers.Handler.Point,{}),
      line: new OpenLayers.Control.DrawFeature(this, OpenLayers.Handler.Path,{}),
      polygon: new OpenLayers.Control.DrawFeature(this, OpenLayers.Handler.Polygon,{}),
      modify: new OpenLayers.Control.PloomapModifyFeature
	(this, { onModificationEnd: function(f) {layer.onFeatureUpdate(f);},
                 deleteCodes: [46, 100] }),
      drag: new OpenLayers.Control.DragFeature
	(this, { onComplete: function(f) {layer.onFeatureUpdate(f);}})
    };
    for (var key in clickControls) {
      this.map.addControl(clickControls[key]);
      clickControls[key].deactivate();
      this.pmView.clickControls[key] = clickControls[key];
    }
    this.pmView.selectClickControl('select');

  },
  
  setFeatureFlashVisibility: function(state) {
    this.featureFlashVisibility = this.featureFlashElement && state;
  },
  
  setFTVisibility: function(name, state) {
    var els = $$('#'+this.objName+'-'+this.pmName+'-ft-'+name+' li');
    if (state) {
      this.batchInsertMode = true;
      for (n in els)
	if (els[n].feature)
	  this.addFeatures([els[n].feature]);
      this.batchInsertMode = false;
    } else {
      for (n in els)
	if (els[n].feature)
	  this.removeFeatures([els[n].feature]);
    }
  },

  modeCreateFeature: function(type, geometryType) {
    this.pmView.selectClickControl(geometryType);
    this.currentFeatureType = type;
    $('area').innerHTML = '<b>Mode de cr&eacute;ation <i>'+type+'</i> activ&eacute;</b>';
  },

  
  // Feature-related methods
  // -----------------------------------------------

  featureCreate: function(id, name, type, wktstring) {
    var feature = this.wkt.read(wktstring);
    feature.attributes.id = id;
    feature.attributes.name = name;
    feature.attributes.type = type;
    feature.style = this.typeStyles[type];
    this.featureIntegrateList(feature);
//    if ($(this.objName+'-'+this.pmName+'-ft-'+type).checked)
    this.addFeatures([feature]);
  },

  featureDelete: function(id) {
    for (n in this.features)
      if (this.features[n].attributes && this.features[n].attributes.id == id) {
	this.featureUnintegrateList(this.features[n]);
        this.destroyFeatures([this.features[n]]);
	break;
      }
  },

  featureIntegrateList: function(feature) {
    if (feature.listLI)
      this.featureUnintegrateList(feature);
    feature.listUL = $(this.objName+"-"+this.pmName+'-ft-'+feature.attributes.type);
    if (!feature.listUL)
      return;
    feature.listLI = document.createElement("li");
    feature.listLI.feature = feature;
    var link = document.createElement("a");
    link.setAttribute('href', '#');
    link.setAttribute('onclick', this.objName+'.getLayer(\''+this.pmName+'\').featureChoose'
		      +'(this.parentNode.feature); return false;');
    var name = document.createTextNode(feature.attributes.name);
    link.appendChild(name);
    feature.listLI.appendChild(link);
    feature.listUL.appendChild(feature.listLI);
  },
  
  featureUnintegrateList: function(feature) {
    if (!feature.listLI)
      return;
    feature.listLI.feature = null;
    feature.listUL.removeChild(feature.listLI);
    feature.listUL = null;
    feature.listLI = null;
  },
  
  featureChoose: function(feature) {
    if (this.selectedFeature)
      this.pmView.clickControls.select.unselect(this.selectedFeature);
    this.selectedFeature = feature;
    this.featureSelect(feature);
  },

  featureSelect: function(feature) {
    this.featureShowForm(feature);
  },

  featureShowForm: function(feature) {
    var featureType = feature.attributes.id ? feature.attributes.type : this.currentFeatureType;
    var featureID = feature.attributes.id ? feature.attributes.id : 0;
    var featureGeo = feature.attributes.id ? '' : this.wkt.write(feature);
    var layer = this;
    Ploomap.ajaxRequest("pmViewOpenLayers/featureForm", {
      method: 'post',
      parameters: {id: featureID, fid: feature.id, type: featureType,
		   geometry: featureGeo, objName: this.objName, mapName: this.map.pmName, layerName: this.pmName },
      onSuccess: function(transport) {
	var popup = new OpenLayers.Popup.FramedCloud
		      ("chicken", feature.geometry.getBounds().getCenterLonLat(), null,
		      transport.responseText, null, true, function(f) {layer.onPopupCloseButton(f);});
	feature.popup = popup;
        this.map.addPopup(popup);
      	//transport.responseText.evalScripts();
      }
    });
  },

  featureAddType: function(name) {
    var el = $(this.objName+'-'+this.pmName+'-ft-'+name+'-content');
    /*if (el)*/ el.show();
    el = $('mode-create-'+name);
    /*if (el)*/ el.show();
  },

  featureDeleteType: function(name) {
    var el = $(this.objName+'-'+this.pmName+'-ft-'+name+'-content');
    if (el) el.hide();
    el = $('mode-create-'+name);
    if (el) el.hide();
  },

  // Callback methods
  // -----------------------------------------------

  onOverFeature: function(feature) {
    if (this.featureFlashVisibility)
      this.featureFlashElement.innerHTML = feature.attributes.name;
  },
  
  onOutFeature: function(feature) {
    if (this.featureFlashVisibility)
      this.featureFlashElement.innerHTML = '';
  },
  
  onPopupCloseButton: function(evt) {
    if (!this.selectedFeature)
      return;
    var feature = this.selectedFeature;
    this.pmView.clickControls.select.unselect(feature);
    if (!feature.attributes.id)
      this.removeFeatures([feature]);
  },

  /**
   * 'onSelect' event of select control
   */
  onFeatureSelect: function(feature) {
    //  alert("onFeatureSelect");
//    if (!this.insertMode) return;
    if (this.selectedFeature)
      this.pmView.clickControls.select.unselect(this.selectedFeature);
    this.selectedFeature = feature;
    this.featureSelect(feature);
  },
  onFeatureUnselect: function(feature) {
    this.selectedFeature = null;
    feature.closePopup();
  },

  /**
   * 'preFeatureInsert' event of vector layer (overloads parent method)
   */
  preFeatureInsert: function(feature) {
    if (this.batchInsertMode)
      return;
    feature.style = this.typeStyles[this.currentFeatureType];
    this.pmView.selectClickControl('select');
    this.selectFeature = feature;
    this.pmView.clickControls.select.select(feature);
  },

  /**
   * Called by modify and drag controls when the operation finishes
   */
  onFeatureUpdate: function(feature) {
    if (feature.attributes.id)
      Ploomap.ajaxUpdate("area", "pmViewOpenLayers/updateFeatureGeometry", {
	method: 'post',
        parameters: {id: feature.attributes.id, geometry: this.wkt.write(feature) },
        evalScripts: true
      });
  },

  CLASS_NAME: "OpenLayers.Layer.pmVector"

});
