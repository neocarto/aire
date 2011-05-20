
dojo.provide('geonef.sandbox.layerLibrary.Application');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');

// used in template
dojo.require('geonef.ploomap.tool.layerLibrary.AutoGrid');
dojo.require('geonef.jig.button.TooltipWidget');

dojo.declare('geonef.sandbox.layerLibrary.Application',
             [ geonef.jig.layout._Anchor, dijit._Templated, geonef.ploomap.MapBinding ],
{
  // summary:
  //   // Layer library for application "geonef.sandbox""
  //


  templateString: dojo.cache('geonef.sandbox.layerLibrary',
                             'templates/Application.html'),
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
        //optClass: 'geonef.ploomap.layer.UserVector',
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
