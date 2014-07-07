
dojo.provide('geonef.ploomap.legend.Container');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template (none)

// used in code
dojo.require('geonef.jig.api');

dojo.declare('geonef.ploomap.legend.Container',
             [ dijit._Widget, dijit._Templated ],
{
  // summary:
  //   Base class for legend widgets
  //

  uuid: '',

  apiModule: 'listQuery.map',
  apiAction: 'getLegendData',

  widgetClass: '',
  widgetOptions: {},
  widgetValue: {},

  resolution: NaN,

  templateString: dojo.cache('geonef.ploomap.legend', 'templates/Container.html'),
  widgetsInTemplate: true,

  destroy: function() {
    this.destroyWidget();
    this.inherited(arguments);
  },

  postCreate: function() {
    this.inherited(arguments);
    if (!this.uuid && this.widgetClass) {
      this.buildWidget();
    }
  },

  _setUuidAttr: function(uuid) {
    this.uuid = uuid;
    this.refresh();
  },

  refresh: function() {
    if (!this.uuid) { return; }
    geonef.jig.api.request(
      {
        module: this.apiModule,
        action: this.apiAction,
        uuid: this.uuid,
        callback: dojo.hitch(this, 'setupMap')
      });
  },

  setupMap: function(data) {
    if (!data) {
      console.error('no legend data for map '+this.uuid);
      return;
    }
    this.widgetClass = data.widgetClass;
    this.widgetOptions = data.widgetOptions;
    this.widgetValue = data.value;
    this.buildWidget();
  },

  buildWidget: function() {
    var Class = geonef.jig.util.getClass(this.widgetClass);
    if (!this.widget || !(this.widget instanceof Class)) {
      this.destroyWidget();
      this.widget = new Class(this.widgetOptions);
      this.widget.placeAt(this.containerNode);
    } else if (this.widget) {
      this.widget.attr('value', null);
    }
    this.widget.attr('resolution', this.resolution);
    this.widget.attr('value', this.widgetValue);
    this.widget.startup();
    this.onResize();
  },

  destroyWidget: function() {
    if (this.widget) {
      this.widget.destroy();
      this.widget = null;
    }
  },

  _setResolutionAttr: function(resolution) {
    this.resolution = resolution;
    if (this.widget) {
      this.widget.attr('resolution', resolution);
    }
  },

  onResize: function() {
    // hook
  },

  getFeatureInfoHtml: function(feature) {
    if (!this.widget) {
      return null;
    }
    return this.widget.getFeatureInfoHtml(feature);
  }

});
