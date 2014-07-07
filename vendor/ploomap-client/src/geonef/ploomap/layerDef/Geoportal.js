
dojo.provide('geonef.ploomap.layerDef.Geoportal');

// parents
dojo.require('geonef.ploomap.layerDef.Base');

dojo.declare('geonef.ploomap.layerDef.Geoportal', geonef.ploomap.layerDef.Base,
{
  // summary:
  //    available Geoportal layers definitions
  //

  // this is used to setup layer order as well, in library UI
  layerTitles: {
      'GEOGRAPHICALGRIDSYSTEMS.MAPS': 'Fond de carte IGN',
      'ORTHOIMAGERY.ORTHOPHOTOS': 'Vue satellite',
      'ELEVATION.SLOPS': 'MNT, teintes hypsométriques',
      'ADMINISTRATIVEUNITS.BOUNDARIES': 'Limites administratives',
      'ELEVATION.LEVEL0': 'Traits de côte',
      'TRANSPORTNETWORKS.RAILWAYS': 'Réseaux ferroviaires',
      'TRANSPORTNETWORKS.ROADS': 'Réseaux routiers',
      'HYDROGRAPHY.HYDROGRAPHY': 'Réseaux hydrographiques',
      'ADDRESSES.CROSSINGS': 'Délimitations de route',
      'BUILDINGS.BUILDINGS': 'Constructions',
      'CADASTRALPARCELS.PARCELS': 'Parcelles cadastrales',
      'TOPONYMS.ALL': 'Toponymes',
      'TRANSPORTNETWORKS.RUNWAYS': 'Aéroports',
      'UTILITYANDGOVERNMENTALSERVICES.ALL': 'Bâtiments gouvernementaux'
  },

  postscript: function() {
    this.inherited(arguments);
    if (!this.mapWidget.visu) {
      throw new Error('this layerDef class needs a Geoportal map');
    }
  },

  registerLayers: function() {
    this.inherited(arguments);
    this.registerGeoportalLayers();
  },

  registerGeoportalLayers: function() {
    //console.log('registerGeoportalLayers', this, arguments);
    if (!this.mapWidget.map.allowedGeoportalLayers) {
      throw new Error('allowedGeoportalLayers property missing on map obj');
    }
    var layers = this.mapWidget.map.allowedGeoportalLayers.slice(0);
    var titles = (dojo.hitch(this,
      function() {
        var array = [];
        for (var name in this.layerTitles) {
          array.push(name);
        }
        return array;
      }))();
    layers.sort(function(l1, l2) { return titles.indexOf(l1.replace(/:.*/,'')) -
                                          titles.indexOf(l2.replace(/:.*/,'')); });
    var layersDefs = layers.map(dojo.hitch(this, 'makeGeoportalLayerDef'));
    this.addLayers(layersDefs);
  },

  makeGeoportalLayerDef: function(name) {
    var code = name.replace(/\:.*/, '');
    var title = this.translateLayerName(code);
    var self = this;
    var icon = dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_ign_')+
          code.replace(/\./, '_').toLowerCase()+'.png';
    var creator = function() {
      self.mapWidget.visu.addGeoportalLayer(name);
      var layer = self.mapWidget.map.getLayersByName(code)[0];
      if (layer) {
        //console.log('geoportal layer', name, layer);
        //layer.transitionEffect = 'resize'; // buggy - resizeDiv & real div sometimes get both visible!
        layer.title = title;
        layer.icon = icon;
        if (code === 'GEOGRAPHICALGRIDSYSTEMS.MAPS') {
          layer.pmExportMap = {
            carte_ign:     { min: 0, max: 38.21851413574219 },
            carte_ign_250: { min: 38.21851413574219, max: 152.8740565429687 },
            carte_ign_1m:  { min: 152.8740565429687, max: Infinity }
          };
          //layer.pmExportMap = 'carte_ign_250';
        }
        self.mapWidget.map.events.triggerEvent(
          'changelayer', { layer: layer, property: 'name' });
        layer.setOpacity(1.0);
        layer.setVisibility(true);
      } else {
        console.warn('did not find geoportal layer named', code, 'after adding');
      }
      return layer;
    };
    return {
      name: code,
      title: title,
      icon: icon,
      provider: 'geoportal',
      layers: [{ creator: creator }]
    };
  },

  translateLayerName: function(layerName) {
    // static method
    //console.log('layer name', layerName);
    return this.layerTitles.hasOwnProperty(layerName) ?
      this.layerTitles[layerName] : layerName;
  }


});
