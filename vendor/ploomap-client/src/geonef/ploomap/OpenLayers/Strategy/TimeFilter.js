
dojo.provide('geonef.ploomap.OpenLayers.Strategy.TimeFilter');

// parent
dojo.require("geonef.ploomap.OpenLayers.Strategy.Filter");

// used in code
dojo.require('geonef.ploomap.input.FeatureTimeRange');

geonef.ploomap.OpenLayers.Strategy.TimeFilter = OpenLayers.Class(geonef.ploomap.OpenLayers.Strategy.Filter,
{
  // summary:
  //   add TimeFilter control to filter layer features according to time limits
  //

  initialize: function(options) {
    //console.log('initialize', this, arguments);
    options = dojo.mixin({}, options, { filter: new OpenLayers.Filter() });
    geonef.ploomap.OpenLayers.Strategy.Filter.prototype.initialize.apply(this, [options]);
    this._cnt = [];
  },

  activate: function() {
    //console.log('activate', this, arguments);
    var activated = OpenLayers.Strategy.prototype.activate.apply(this, arguments);
    if (activated) {
      this.cache = [];
      // event bindings are different from parent's
      this.layer.events.on({
        "beforefeaturesadded": this.beforeFeaturesAddedWrapper,
        //"beforefeaturesremoved": this.beforeFeaturesRemovedWrapper,
        "featuresremoved": this.beforeFeaturesRemovedWrapper,
        scope: this
      });
      //geonef.ploomap.OpenLayers.Strategy.Filter.prototype.activate.apply(this, arguments);
      // create control, bind handler to filter change event, and get
      this.control = new geonef.ploomap.input.FeatureTimeRange(
        { layer: this.layer, filterStrategy: this });
      dojo.place(this.control.domNode, this.layer.map.div);
      this.filter = this.control.getFilter();
      this._cnt.push(dojo.connect(this.filter, 'onChange', this, 'onFilterChange'));
      this.onFilterChange();
    }
  },

  deactivate: function() {
    if (this.control) {
      this.control.destroy();
    }
    this.control = null;
    this.filter = null;
    geonef.ploomap.OpenLayers.Strategy.Filter.prototype.deactivate.apply(this, arguments);
  },

  onFilterChange: function() {
    //console.log('onFilterChange', this, arguments);
    this.setFilter(this.filter);
  },

  beforeFeaturesAddedWrapper: function(event) {
    // we use wrapper to get "beforeFeaturesAdded" called before "handleAdd"
    //console.log('beforeFeaturesAddedWrapper', this, arguments);
    this.beforeFeaturesAdded(event);
    this.handleAdd(event);
  },
  beforeFeaturesRemovedWrapper: function(event) {
    //console.log('beforeFeaturesRemovedWrapper', this, arguments);
    this.beforeFeaturesRemoved(event);
    this.handleRemove(event);
  },
  beforeFeaturesAdded: function(event) {
    //console.log('beforeFeaturesAdded', this, arguments);
  },
  beforeFeaturesRemoved: function(event) {
    //console.log('beforeFeaturesRemoved', this, arguments);
  },

  /*handleAdd: function(event) {
    //console.log('handleAdd', this, arguments, this.caching);
    if (!this.caching) {
      this.beforeFeaturesAdded(event);
    }
    geonef.ploomap.OpenLayers.Strategy.Filter.prototype.handleAdd.apply(this, arguments);
  },*/

  /*handleRemove: function(event) {
    console.log('handleRemove', this, arguments, this.caching);
    if (!this.caching) {
      this.beforeFeaturesRemoved(event);
    }
    geonef.ploomap.OpenLayers.Strategy.Filter.prototype.handleRemove.apply(this, arguments);
  },*/

  CLASS_NAME: "geonef.ploomap.OpenLayers.Strategy.TimeFilter"

});
