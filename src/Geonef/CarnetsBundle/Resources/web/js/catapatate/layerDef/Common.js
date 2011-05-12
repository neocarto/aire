

dojo.provide('catapatate.layerDef.Common');

// parents
dojo.require('ploomap.layerDef.Base');

dojo.declare('catapatate.layerDef.Common', [ ploomap.layerDef.Base ],
{
  // summary:
  //   Couches spécifique à l'application Catapatate
  //

  registerLayers: function() {
    this.inherited(arguments);
    this.registerCatapatateCommonLayers();
  },

  registerCatapatateCommonLayers: function() {
    this.addLayers(this.catapatateCommonLayers);
  },

  // catapatateCommonLayers: array of layer defs
  catapatateCommonLayers: [
    // {
    //   name: 'lieux_activites',
    //   title: "Lieux d'activités",
    //   icon: '/images/icons/layer_hurepoix_lieux_activites.png',
    //   provider: 'cartapatate-hurepoix',
    //   layers: [
    //     {
    //       creator: function(mapWidget) {
    //         return new OpenLayers.Layer.Vector('lieux_activites',
    //           {
    //             title: "Lieux d'activité",
    //             //projection: 'EPSG:4326',
    //             minResolution: 0.07464553542137146,
    //             maxResolution: 76.43702827148438,
    //             noOpacity: true,
    //             strategies: [new ploomap.OpenLayers.Strategy.BBOX({ ratio: 1.0 }),
    //                          new OpenLayers.Strategy.Save()],
    //             protocol: new OpenLayers.Protocol.WFS(
    //               {
    //                 version: '1.0.0',
    //                 url: "/cgi-bin/tinyows?",
    //                 featureType: "lieuxactivites",
    //                 featureNS: "http://hurepoix.cartapatate.net/",
    //                 geometryName: "wkb_geometry",
    //                 srsName: "EPSG:4326",
    //                 formatOptions: {
    //                   internalProjection: mapWidget.map.getProjectionObject(),
    //                   externalProjection: new OpenLayers.Projection("EPSG:4326")
    //                 }
    //               }),
    //             optClass: 'hurepoix.layer.LieuActivite',
    //             sldUrl: '/res/sld/lieu_activite.xml'
    //           });
    //       }
    //     }
    //   ]
    // },
    // {
    //   name: 'annuaire',
    //   title: 'Annuaire louveteaux',
    //   icon: '/images/icons/layer_annuaire.png',
    //   provider: 'cartapatate-hurepoix',
    //   layers: [
    //     {
    //       creator: function(mapWidget) {
    //         return new OpenLayers.Layer.Vector('annuaire',
    //           {
    //             title: "Annuaire louveteaux",
    //             //projection: 'EPSG:4326',
    //             minResolution: 0.07464553542137146,
    //             maxResolution: 76.43702827148438,
    //             noOpacity: true,
    //             strategies: [new ploomap.OpenLayers.Strategy.BBOX({ ratio: 1.0 }),
    //                          new OpenLayers.Strategy.Save()],
    //             protocol: new OpenLayers.Protocol.WFS(
    //               {
    //                 version: '1.0.0',
    //                 url: "/cgi-bin/tinyows?",
    //                 featureType: "annuaire",
    //                 featureNS: "http://hurepoix.cartapatate.net/",
    //                 geometryName: "wkb_geometry",
    //                 srsName: "EPSG:4326",
    //                 formatOptions: {
    //                   internalProjection: mapWidget.map.getProjectionObject(),
    //                   externalProjection: new OpenLayers.Projection("EPSG:4326")
    //                 }
    //               }),
    //             optClass: 'hurepoix.layer.Annuaire',
    //             getFeatureTitle: function(feature) {
    //               var s = '';
    //               s += feature.attributes.prenom + ' ' + feature.attributes.nom;
    //               return s;
    //             },
    //             sldUrl: '/res/sld/annuaire.xml'
    //           });
    //       }
    //     }
    //   ]
    // }
  ]

});
