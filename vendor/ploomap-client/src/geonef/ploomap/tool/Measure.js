
dojo.provide('geonef.ploomap.tool.Measure');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');

// used in templates
dojo.require('dijit.form.CheckBox');
dojo.require('geonef.jig.button.Link');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.jig.workspace');
dojo.require('geonef.ploomap.tool.MeasureOne');


/**
 * Tool for measuring distances or areas by drawing on the map
 */
dojo.declare('geonef.ploomap.tool.Measure',
             [ dijit._Widget, dijit._Templated, geonef.ploomap.MapBinding ],
{

  //helpPresentation: 'geonef.ploomap.presentation.measure',
  name: 'Mesure',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/tool_measure.png'),
  layerSldUrl: dojo.moduleUrl('geonef.ploomap', 'style/sld/measure.xml'),

  templateString: dojo.cache("geonef.ploomap.tool", "templates/Measure.html"),
  widgetsInTemplate: true,

  measureLinks: [],


  postMixInProperties: function() {
    this.inherited(arguments);
    this.measureLinks = [];
  },

  startup: function() {
    this.inherited(arguments);
    // this.createLayer();
  },

  createLayer: function() {
    if (this.layer) { return; }
    this.layer = new geonef.ploomap.OpenLayers.Layer.Vector("Mesure",
      {
        icon: this.icon,
        sldUrl: this.layerSldUrl,
        noAppearFx: true,
        defaultClickControl: null
      });
    this.layer.controllerWidget = this;
    this.layer.events.on({
      featureover: this.onFeatureOver,
      featureout: this.onFeatureOut,
      featureselected: this.onFeatureSelect,
      featureunselected: this.onFeatureUnselect,
      scope: this
    });
    this.mapWidget.map.addLayer(this.layer);

  },

  measureDistance: function() {
    this.addMeasure(geonef.ploomap.tool._MeasureDistance);
  },

  measureArea: function() {
    this.addMeasure(geonef.ploomap.tool._MeasureArea);
  },

  /**
   * @type {geonef.ploomap.tool._MeasureArea} type
   */
  addMeasure: function(Type) {
    this.createLayer();
    var self = this;
    var child = new Type({
        measureTool: this,
        index: this.measureLinks.length,
        mapWidget:this.mapWidget,
        onEnd: function(fmt, f) { self.measureEnd(child, fmt, f); }
    });
    geonef.jig.workspace.autoAnchorWidget(child);
  },

  measureEnd: function(child, formatted, feature) {
    //console.log('measureEnd', this, arguments);
    var map = this.mapWidget.map;
    var link = new geonef.jig.button.Link({
      label: formatted,
      nodeName: 'li',
      onClick: function() {
        if (map.selectControl) {
          map.selectControl.clickFeature(feature);
        } else {
          geonef.jig.workspace.focus(child);
        }
      },
      onMouseOver: function() {
        feature.layer.drawFeature(feature, 'hover');  },
      onMouseOut: function() {
        feature.layer.drawFeature(feature, feature.selected ?
                                  'select' : 'default');  }
    });
    feature.link_id = link.id;
    link.placeAt(this.listNode).startup();
    this.measureLinks.push(link);
    dojo.style(this.measureNode, 'display', '');
    geonef.jig.workspace.focus(this);
    geonef.jig.workspace.highlightWidget(link, 'focus');
    this.layer.addFeatures([feature]);
  },

  onFeatureSelect: function(event) {
    var measure = dijit.byId(event.feature.attributes.id);
    geonef.jig.workspace.focus(measure);
  },

  onFeatureUnselect: function() {
    geonef.jig.workspace.focus(this);
  },

  onFeatureOver: function(event) {
    dijit.byId(event.feature.link_id).attr('emphasize', true);
  },

  onFeatureOut: function(event) {
    dijit.byId(event.feature.link_id).attr('emphasize', false);
  },

  onAppear: function() {
    if (this.layer) {
      this.layer.activateSelect();
    }
  },

  clean: function() {
    var self = this;
    dojo.style(this.measureNode, 'display', 'none');
    this.measureLinks.forEach(
      function(link) {
        this.listNode.removeChild(link.domNode);
        link.destroy();
      }, this);
    this.layer.removeFeatures(this.layer.features.slice(0));
  },

  destroy: function() {
    this.layer.events.un({
      featureover: this.onFeatureOver,
      featureout: this.onFeatureOut,
      featureselected: this.onFeatureSelect,
      featureunselected: this.onFeatureUnselect,
      scope: this
    });
    this.layer.destroy();
    delete this.layer;

    this.cancel();
    this.inherited(arguments);
  }

});

/**
 * TODO: in SLD
 */
geonef.ploomap.tool.Measure.sketchSymbolizers = {
      "Point": {
        pointRadius: 4,
        graphicName: "square",
        fillColor: "white",
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#333333"
      },
      "Line": {
        strokeWidth: 3,
        strokeOpacity: 1,
        strokeColor: "#FFFF00",
        strokeDashstyle: "dash"
      },
      "Polygon": {
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeColor: "#FFFF00",
        strokeDashstyle: "dash",
        fillColor: "#FFFF00",
        fillOpacity: 0.3
      }
    };
