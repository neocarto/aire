
dojo.provide('geonef.ploomap.map.Geoportal');

// parents
dojo.require('geonef.ploomap.map.Classical');

//
dojo.require('geonef.ploomap.OpenLayers.Control.SexyZoomBar');

dojo.declare('geonef.ploomap.map.Geoportal', [ geonef.ploomap.map.Classical ],
{
  // summary:
  //   A Geoportal map, provided by the French National Institute of Geography (IGN)
  //

  keptControls: [
    'Geoportal.Control.PermanentLogo',
    'Geoportal.Control.TermsOfService',
    'Geoportal.Control.Logo',
    'Geoportal.Control.Information',
    'Geoportal.Control.Copyright',
    'Geoportal.Control.GraphicScale',
    'OpenLayers.Control.Navigation'
  ],

  visuType: 'mini', // 'mini' or 'normal'

  zoomLevelGroups: [
    { min: 0, max: 1, name: 'world', label: 'Monde', lineHeight: 18 },
    { min: 2, max: 3, name: 'continent', label: 'Continent', lineHeight: 18 },
    { min: 4, max: 6, name: 'country', label: 'Pays', lineHeight: 30 },
    { min: 7, max: 8, name: 'region', label: 'Région', lineHeight: 18 },
    { min: 9, max: 11, name: 'department', label: 'Département', lineHeight: 30 },
    { min: 12, max: 14, name: 'city', label: 'Commune', lineHeight: 30 },
    { min: 15, max: 16, name: 'district', label: 'Quartier', lineHeight: 18 },
    { min: 17, max: 17, name: 'street', label: 'Rue', lineHeight: 8 }
  ],

  createMap: function() {
    var id = this.id + '_geoportal';
    dojo.create('div', { id: id, style: 'width:100%;height:100%;' },
                this.domNode);
    geoportalLoadVISU(id, this.visuType);
    if (!VISU) {
      alert('Le visualisateur Geoportal n\' a échoué à se charger.');
      throw new Error('Failed to load Geoportal VISU!');
    }
    this.visu = VISU;
    this.map = this.visu.getMap();
    this.map.mapWidget = this;
    this.map.setProxyUrl(OpenLayers.ProxyHost);
    dojo.query('> .olMapViewport', this.map.div)
      .style('cursor', 'default');
    var self = this;
    this.map.controls.filter(function() { return true; } /* do nothing */)
      .forEach(function(control) {
                 //console.log('control', control);
                 if (self.keptControls.indexOf(control.CLASS_NAME) !== -1) {
                   control.activate();
                 } else {
                   control.deactivate();
                   self.map.removeControl(control);
                   control.destroy();
                 }
               });
  },

  resize: function(size, size2) {
    if (this.visu) {
      var box = dojo.coords(this.domNode);
      this.visu.setSize(box.w - 2, box.h - 2);
    }
    this.inherited(arguments);
  }

});
