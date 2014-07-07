
/**
 * @requires OpenLayers/Strategy.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Strategy.JsonAttribute');

dojo.require('geonef.jig.util');

geonef.ploomap.OpenLayers.Strategy.JsonAttribute = OpenLayers.Class(OpenLayers.Strategy,
{

  /**
   * Name of attribute containing JSON to extract
   */
  attribute: 'data',

  /**
   * Attributes schema
   *
   * @type {Object}
   */
  schema: {},

  /**
   * Strategy to communicate with for save operation
   *
   * @type {?OpenLayers.Strategy.Save}
   */
  saveStrategy: null,

  /**
   * APIMethod: activate
   * Activate the strategy.  Register any listeners, do appropriate setup.
   *
   * Returns:
   * {Boolean} The strategy was successfully activated.
   */
  activate: function() {
    var activated = OpenLayers.Strategy.prototype.activate.call(this);
    if(activated) {
      this.layer.events.on({
        beforefeaturesadded: this.eventDecodeFeatures,
        scope: this
      });
      if (this.saveStrategy) {
        this.saveStrategy.events.on({
            start: this.eventEncodeFeatures,
            success: this.eventAfterCommit,
            fail: this.eventAfterCommit,
            scope: this
        });
      }
    }

    return activated;
  },

  /**
   * APIMethod: deactivate
   * Deactivate the strategy.  Unregister any listeners, do appropriate
   *     tear-down.
   *
   * Returns:
   * {Boolean} The strategy was successfully deactivated.
   */
  deactivate: function() {
    var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
    if(deactivated) {
      if (this.saveStrategy) {
        this.saveStrategy.events.un({
            start: this.eventEncodeFeatures,
            success: this.eventDecodeFeatures,
            fail: this.eventDecodeFeatures,
            scope: this
        });
      }
      this.layer.events.un({
        beforefeaturesadded: this.eventDecodeFeatures,
        scope: this
      });
    }
    return deactivated;
  },

  eventDecodeFeatures: function(event) {
    if (event.features) {
      event.features.forEach(this.decodeFeature, this);
    }
  },

  decodeFeature: function(feature) {
    //console.log('decodeFeature', this, arguments);
    var json = feature.attributes[this.attribute] || '{}';
    var undefined;
    var obj = dojo.fromJson(json);
    geonef.jig.forEach(this.schema,
      function(attr, name) {
        //console.log('attr', name, feature.attributes[name], attr, feature);
        if (obj[name]) {
          if (feature.attributes[name]) {
            console.warn('in Strategy.JsonAttribute, attribute ' +
                         'already defined in feature',
                         this, feature, name, attr);
            //throw new Error('attribute already defined');
            // if (!feature.attributes._hidden) {
            //   feature.attributes._hidden = {};
            // }
            // feature.attributes._hidden[name] = feature.attributes[name];
          }
          feature.attributes[name] = obj[name];
        } else if (attr['default']) {
          feature.attributes[name] = attr['default'];
        }
      }, this);
  },

  eventEncodeFeatures: function(event) {
    //console.log('JSON encoderEventFeatures', this, arguments);
    var features = event.features;
    // var nFeatures = features.map(
    //   function(f) {
    //     console.log('replace f', f);
    //     var copy = f.clone();
    //     copy.state = f.state;
    //     copy.fid = f.fid;
    //     copy.url = f.url;
    //     return copy;
    //   }, this);
    features.forEach(dojo.hitch(this, 'encodeFeature'));
    // features.splice(0, features.length);
    // nFeatures.forEach(function(f) { console.log('pushing f', f);features.push(f); });
  },

  encodeFeature: function(feature) {
    //console.log('encodeFeature', this, arguments);
    var obj = {};
    geonef.jig.forEach(this.schema,
      function(attr, name) {
        if (attr.type !== 'name') {
          if (feature.attributes[name] !== undefined) {
            obj[name] = feature.attributes[name];
          }
          delete feature.attributes[name];
        }
      });
    var json = dojo.toJson(obj);
    feature.attributes[this.attribute] = json;
  },

  eventAfterCommit: function(event) {
    var features = event.response.reqFeatures;
    features.map(function(f) { return f._original || f; })
        .forEach(this.decodeFeature, this);
  }

});



