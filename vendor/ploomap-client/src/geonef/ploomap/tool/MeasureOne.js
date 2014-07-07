
dojo.provide('geonef.ploomap.tool.MeasureOne');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in templates
dojo.require('dijit.form.CheckBox');
dojo.require('geonef.jig.button.Link');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('dojo.number');
dojo.require('geonef.jig.workspace');


/**
 * Instanciated by geonef.ploomap.tool.Measure only. Private.
 */
dojo.declare('geonef.ploomap.tool._MeasureArea',
             [dijit._Widget, dijit._Templated],
{
  templateString: dojo.cache("geonef.ploomap.tool", "templates/_MeasureOne.html"),
  widgetsInTemplate: true,
  handler: OpenLayers.Handler.Polygon,
  //goList: function() {},
  title: "Aire",
  helpStart: "Cliquer successivement sur la carte pour placer les points du polygone un à un...",
  onEnd: function() {},

  postMixInProperties: function() {
    this.inherited(arguments);
    this.panelPath = [ this.measureTool, this.title ];
  },

  buildRendering: function() {
    this.inherited(arguments);
    //this.titleNode.innerHTML = this.title+' &ndash;&nbsp;'+(this.index+1);
    this.initControl();
  },

  startup: function() {
    this.inherited(arguments);
    this.start();
  },

  destroy: function() {
    this.measureTool = null;
    this.geometry = null;
    this.inherited(arguments);
  },

  start: function() {
    this.control.activate();
  },

  stop: function() {
    if (this.formatted) {
      this.cancel();
    } else {
      this.finish();
    }
  },

  cancel: function() {
    //this.control.deactivate();
    this.finish(this.geometry);
    //this.goList();
    geonef.jig.workspace.focus(this.measureTool);
    this.destroy();
  },

  goList: function() {
    geonef.jig.workspace.focus(this.measureTool);
  },

  initControl: function() {
    var sketchSymbolizers = geonef.ploomap.tool.Measure.sketchSymbolizers;
    var style = new OpenLayers.Style();
    style.addRules([ new OpenLayers.Rule({symbolizer: sketchSymbolizers}) ]);
    this.control = new OpenLayers.Control.Measure(
        this.handler, {
          persist: true,
          geodesic: true,
          handlerOptions: {
            layerOptions: {styleMap: new OpenLayers.StyleMap({"default": style})}
          }
        }
      );
    this.control.events.on({
      "measure": dojo.hitch(this, 'finishMeasurement'),
      "measurepartial": dojo.hitch(this, 'handleMeasurements')
    });
    this.mapWidget.map.addControl(this.control);
  },

  handleMeasurements: function(event) {
    //console.log('handleMeasurements', this, arguments);
    var geometry = event.geometry
      , order = event.order
      , units = event.units
      , unit = order == 1 ? units : units + '<sup>2</sup>'
      , measure = event.measure
      , out;
    //    toFixed
    this.formatted = '' + dojo.number.format(measure) + ' ' + unit;
    this.totalNode.innerHTML = this.formatted;
    dojo.style(this.cancelLink.domNode, 'display', 'none');
    if (!this.finished) {
      dojo.style(this.stopLink.domNode, 'display', '');
    }
    this.geometry = geometry;
  },

  finishMeasurement: function(event) {
    //console.log('finishMeasurement', this, arguments);
    this.handleMeasurements(event);
    this.finish(event.geometry);
  },

  /**
   * @param {OpenLayers.Geometry} geometry
   */
  finish: function(geometry) {
    //console.log('finish', this, arguments);
    dojo.style(this.helpStartNode, 'display', 'none');
    dojo.style(this.geodesicNode, 'display', 'none');
    dojo.style(this.stopLink.domNode, 'display', 'none');
    dojo.style(this.listLink.domNode, 'display', '');
    this.finished = true;
    this.control.deactivate();
    this.feature = new OpenLayers.Feature.Vector(geometry.clone(),
      { id: this.id, name: this.title+" : "+this.formatted });
    this.onEnd(this.formatted, this.feature);
  },

  toggleGeodesic: function() {
    this.control.geodesic = this.geodesicCheckBox.attr('checked');
  },

  onDisappear: function() {
    if (this.feature && this.feature.map) {
      var control = this.feature.map.selectControl;
      if (control) {
        control.unselect(this.feature);
      }
    }
  }

});

dojo.declare('geonef.ploomap.tool._MeasureDistance',
             geonef.ploomap.tool._MeasureArea,
{
  handler: OpenLayers.Handler.Path,
  title: "Distance",
  helpStart: "Cliquer successivement sur la carte pour placer les points du tracé un à un..."

});
