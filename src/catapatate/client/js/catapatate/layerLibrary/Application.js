
dojo.provide('catapatate.layerLibrary.Application');

// parents
dojo.require('jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('ploomap.MapBinding');

// used in template
dojo.require('ploomap.tool.layerLibrary.AutoGrid');
dojo.require('jig.button.TooltipWidget');

dojo.declare('catapatate.layerLibrary.Application',
             [ jig.layout._Anchor, dijit._Templated, ploomap.MapBinding ],
{
  // summary:
  //   // Layer library for application "catapatate""
  //


  templateString: dojo.cache('catapatate.layerLibrary', 'templates/Application.html'),
  widgetsInTemplate: true,

  startup: function() {
    this.inherited(arguments);
    this.tabContainer.resize();
  },

  createVectorLayer: function() {
    var title = window.prompt("Nom de la couche ?");
    if (!title) { return; }
    var layer = new OpenLayers.Layer.Vector('Plans',
      {
        projection: 'EPSG:4326',
        strategies: [new OpenLayers.Strategy.Save()],
        //protocol: new OpenLayers.Protocol(),
        //optClass: 'ploomap.layer.UserVector',
        getFeatureTitle: function(feature) {
          return feature.attributes.title;
        },
        geometryType: OpenLayers.Geometry.Polygon
        //sldUrl: '/sld/plans.xml',
        //icon: '/images/icons/layer_plans.png'
      });
    this.mapWidget.map.addLayer(layer);
  }


});
