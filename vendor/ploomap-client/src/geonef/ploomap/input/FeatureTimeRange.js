
dojo.provide('geonef.ploomap.input.FeatureTimeRange');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._LayoutSwitch');

// used in template
dojo.require('dojox.form.RangeSlider');
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.ToggleButton');
dojo.require('dijit.form.NumberSpinner');

// used in code
dojo.require('dijit.form.VerticalRule');

dojo.declare('geonef.ploomap.input.FeatureTimeRange',
             [ dijit._Widget, dijit._Templated, geonef.jig.widget._LayoutSwitch ],
{
  // summary:
  //    Offers a range slider to filter time
  //

  helpPresentation: 'geonef.ploomap.presentation.featureTimeRange',

  layer: null,

  filterStrategy: null,

  featureLabels: null,

  layoutSwitcherPosition: 'left',

  templateString: dojo.cache('geonef.ploomap.input',
                             'templates/FeatureTimeRange.html'),
  widgetsInTemplate: true,


  ////////////////////////////////////////////////////////////
  // WIDGET LIFECYCLE

  postMixInProperties: function() {
    this.inherited(arguments);
    this.features = [];
    this.featureLabels = {}; // div nodes indexed by feature id
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.buildHelpButton();
  },

  _setLayerAttr: function(layer) {
    //console.log('setLayerAttr', this, arguments);
    var layerEvents = { visibilitychanged: this.onVisibilityChanged,
                        afterfeaturemodified: this.onFeatureModified,
                        scope: this };
    var mapEvents = { zoomend: this.onVisibilityChanged,
                      scope: this };
    if (this.layer) {
      if (this.layer.map) {
        this.layer.map.events.un(mapEvents);
      }
      this.layer.events.un(layerEvents);
      this.disconnect(this._cnt1);
      this.disconnect(this._cnt2);
    }
    this.layer = layer;
    if (layer) {
      this._cnt1 = this.connect(this.filterStrategy, 'beforeFeaturesAdded', 'onFeaturesAdded');
      this._cnt2 = this.connect(this.filterStrategy, 'beforeFeaturesRemoved', 'onFeaturesRemoved');
      this.filter = new geonef.ploomap.input._FeatureTimeRangeFilter(
        { control: this/*, evaluateTrue: dojo.hitch(this, 'onFeatureAccepted')*/ });
      this.slider.attr('value', [0,0]);
      this.layer.events.on(layerEvents);
      this.layer.map.events.on(mapEvents);
    }
  },

  destroy: function() {
    //console.log('destroy', this, arguments);
    this.attr('layer', null);
    this.inherited(arguments);
  },


  ////////////////////////////////////////////////////////////
  // EVENTS

  onFeaturesAdded: function(event) {
    //console.log('onFeaturesAdded', this, arguments);
    var features = event.features;
    // check added features for new min or max
    var value = this.slider.attr('value');
    var limits = this.getMinMax(features);
    //console.log('add limits', event, limits);
    var changed = false;
    if (limits.min < this.slider.minimum || this.slider.minimum === 0 || this.slider.minimum === undefined) {
      this.slider.attr('minimum', limits.min);
      changed = true;
    }
    if (limits.max > this.slider.maximum || this.slider.maximum === 100 || this.slider.maximum === undefined) {
      this.slider.attr('maximum', limits.max);
      changed = true;
    }
    this.slider._printSliderBar();
    if (value[0] === value[1]) {
      this.slider.attr('value', [limits.max, limits.min]);
    }
    if (changed) {
      this.onMinMaxChange();
    }
    this.registerFeatures(features);
    //var val = this.slider.attr('value');
    //console.log('value', val);
  },

  onFeaturesRemoved: function(event) {
    //console.log('onFeaturesRemoved', this, arguments);
    var features = event.features;
    // re-check all layer.features and establish min & max
    var remaining = this.layer.features.filter(
      function(f) { return features.indexOf(f) === -1; });
    var limits = this.getMinMax(remaining);
    //console.log('remaining', remaining, 'limits', limits, features);
    var changed = false;
    if (limits.min !== this.slider.minimum) {
      this.slider.attr('minimum', limits.min);
      changed = true;
    }
    if (limits.max !== this.slider.maximum) {
      this.slider.attr('maximum', limits.max);
      changed = true;
    }
    this.slider._printSliderBar();
    if (changed) {
      this.onMinMaxChange();
    }
    this.unregisterFeatures(features);
  },

  onSliderMove: function() {
    //console.log('onSliderMove', this, arguments);
    this.onSliderChange();
  },

  onSliderChange: function() {
    var value = this.slider.attr('value');
    //console.log('value', value);
    this.filter.setLimits(value[0], value[1]);
    this.filterMaxNode.innerHTML = this.formatNumber(value[0]);
    this.filterMinNode.innerHTML = this.formatNumber(value[1]);
    this.onDurationChange();
  },

  onMinMaxChange: function() {
    // slider min & slider max changes
    //console.log('minMaxChange', this.slider.maximum, this.slider.minimum,
    //            this.filter.maximum, this.filter.minimum);
    this.maxNode.innerHTML = this.formatNumber(this.slider.maximum);
    this.minNode.innerHTML = this.formatNumber(this.slider.minimum);
    var self = this;
    this.features.forEach(function(f) { self.updateFeatureLabelPosition(f); });
    var value = this.slider.attr('value');
    if (value[0] > this.slider.maximum ||
        value[0] === this.oldMaximum) { value[0] = this.slider.maximum; }
    if (value[1] > this.slider.minimum ||
        value[1] === this.oldMinimum) { value[1] = this.slider.minimum; }
    this.oldMaximum = this.slider.maximum;
    this.oldMinimum = this.slider.minimum;
    this.slider.attr('value', value);
    this.onDurationChange();
  },

  onVisibilityChanged: function() {
    var state = this.layer.getVisibility() && this.layer.inRange;
    //console.log('onVisibilityChanged', this.layer, state);
    dojo.style(this.domNode, 'display', state ? '' : 'none');
  },

  onFeatureModified: function(event) {
    //console.log('onFeatureModified', this, arguments);
    var feature = event.feature;
    this.onFeaturesRemoved({features:[feature]});
    this.onFeaturesAdded({features:[feature]});
  },


  onDurationChange: function() {
    //console.log('onDurationChange', this, arguments);
    if (this.animation && this.animation.status() === 'playing') {
      return;
    }
    var duration = this.durationInput.attr('value');
    var value = this.slider.attr('value');
    var start = value[0];
    var end = this.slider.maximum;
    var scale = parseInt((end - start) / (duration * 1000)); // miliseconds per milisecond
    var unit = (scale / (3600 * 24 * (365.25 / 12)))
                 .toPrecision(3).replace(/\./, ',');
    this.timeScaleNode.innerHTML = scale;
    this.timeScaleUnitNode.innerHTML = unit;
    //console.log('duration', duration, 'end', end, 'start', start, 'scale', scale, 'unit', unit);
  },

  onFeatureLabelClick: function(feature) {
    console.log('onFeatureLabelClick', feature);
    var control = feature.layer.map
      .getControlsByClass('OpenLayers.Control.SelectFeature')
      .filter(function(control) { return control.layer === feature.layer; })[0];
    if (!control) {
      console.error('no select control was found for layer ', feature.layer);
      console.log('among controls', feature.layer.map
                  .getControlsByClass('OpenLayers.Control.SelectFeature'));
    }
    control.clickFeature(feature);
    //control.select(feature);
  },


  ////////////////////////////////////////////////////////////
  // MANAGEMENT

  registerFeatures: function(features) {
    var self = this;
    features.filter(function(f) { return self.features.indexOf(f) === -1; })
      .forEach(function(f) {
                 self.features.push(f);
                 self.drawFeatureOnScale(f);
               });
  },

  unregisterFeatures: function(features) {
    var self = this;
    features.filter(function(f) { return self.features.indexOf(f) !== -1; })
      .forEach(function(f) {
                 self.features = OpenLayers.Util.removeItem(self.features, f);
                 self.removeFeatureFromScale(f);
               });
  },

  getMinMax: function(features) {
    // static method
    var s = { min: undefined, max: undefined };
    features.map(this.featureToNumber)
      .forEach(function(n) {
                 //console.log('n', n);
                 ['min','max'].forEach(
                   function(l) {
                     s[l] = s[l] === undefined ? n : Math[l](s[l], n);
                   });
               });
    return s;
  },

  featureToNumber: function(feature) {
    // static method
    // get number for given feature - central method
    if (!dojo.isString(feature.attributes.date)) {
      return 0;
    }
    var date = feature.attributes.date.replace(/Z/, '').replace(/-/g, '/');
    var n = (new Date(date)).getTime();
    //console.log('date', date, n);
    return n;
  },

  formatNumber: function(number) {
    // static method
    // give a human form of number (here, date to MM/year)
    if (number === undefined || number === null || isNaN(number)) {
      return '(aucune date)';
    }
    var date = new Date(number);
    var f = function(n) { return (n < 10 ? '0' : '') + n; };
    return ''+f(date.getDate())+'/'+f(date.getMonth()+1)+'/'+date.getFullYear();
    //return '' + date.toLocaleDateString(); //(date.getMonth()+1) + ' - ' + date.getFullYear();
  },


  ////////////////////////////////////////////////////////////
  // UI

  drawFeatureOnScale: function(feature) {
    //console.log('drawFeatureOnScale', feature);
    if (this.featureLabels[feature.id]) {
      var node = this.featureLabels[feature.id];
      this.labelContainer.removeChild(node);
    }
    var self = this;
    this.featureLabels[feature.id] = dojo.create('div',
    {
      'class': 'dijitRuleLabelContainer dijitRuleLabelContainerV '
        + 'link',
      innerHTML: this.getFeatureLabelContent(feature),
      //title: group.name,
      onclick: function(event) {
        console.log('click!', this, arguments);
        event.stopPropagation();
        self.onFeatureLabelClick(feature);
        return false;
      },
      onmouseover: function(event) {
        //console.log('mouse over', this, arguments);
        if (feature.layer) feature.layer.optWidget.onFeatureOver(feature);
      },
      onmouseout: function(event) {
        // console.log('mouse out', this, arguments);
        if (feature.layer) feature.layer.optWidget.onFeatureOut(feature);
      }
    }, this.labelContainer);
    feature._ploomapTimeRange_cnts = [
// console.log('MOv', self.featureLabels[feature.id], feature.id));
      dojo.connect(feature, 'onMouseOver',
        function() { dojo.addClass(self.featureLabels[feature.id], 'focus'); }),
      dojo.connect(feature, 'onMouseOut',
        function() { dojo.removeClass(self.featureLabels[feature.id], 'focus'); })
    ];
    this.updateFeatureLabelPosition(feature);
  },

  updateFeatureLabelPosition: function(feature) {
    var num = this.featureToNumber(feature);
    var extent = this.slider.maximum - this.slider.minimum;
    var pct = ((num - this.slider.minimum) / extent) * 100;
    dojo.style(this.featureLabels[feature.id], 'top', (100-pct)+'%');
  },

  removeFeatureFromScale: function(feature) {
    //console.log('removeFeatureFromScale', feature);
    if (feature._ploomapTimeRange_cnts) {
      feature._ploomapTimeRange_cnts.forEach(dojo.disconnect);
      feature._ploomapTimeRange_cnts = null;
    }
    if (this.featureLabels[feature.id]) {
      this.labelContainer.removeChild(this.featureLabels[feature.id]);
      delete this.featureLabels[feature.id];
    }
  },

  getFeatureLabelContent: function(feature) {
    return '<span class="label notSticky">' + feature.attributes.name +
      '</span><span class="date">' +
      this.formatNumber(this.featureToNumber(feature)) + '</span>';
  },

  buildHelpButton: function() {
    this.helpButton = new dijit.form.Button(
      { label: "?", onClick: dojo.hitch(this, 'startHelpPresentation'),
        title: "Lancer la présentation d'aide" });
    dojo.addClass(this.helpButton.domNode, 'jigCacoinHelpButton notSticky');
    this.helpButton.placeAt(this.domNode, 'last');
    this.helpButton.startup();
  },

  startHelpPresentation: function() {
    if (dojo.isString(this.helpPresentation)) {
      dojo['require'](this.helpPresentation);
      this.helpPresentation = dojo.getObject(this.helpPresentation);
    }
    dojo['require']('geonef.jig.macro.Player');
    geonef.jig.macro.Player.prototype.attemptPlay(this.helpPresentation);
  },


  ////////////////////////////////////////////////////////////
  // ACTIONS / Getters / Setters

  getFilter: function() {
    // needed by strategy
    return this.filter;
  },

  _setAutoMoveAttr: function(state) {
    console.log('_setAutoMoveAttr', this, arguments);
    if (this.animation) {
      this.animation.stop();
      this.animation = null;
    }
    if (state) {
      var duration = this.durationInput.attr('value') * 1000;
      var value = this.slider.attr('value');
      var start = value[0];
      var end = this.slider.maximum;
      if (end - start < 3600 * 48 /* 2 days */) {
        alert("Avant de lancer l'animation, veuillez positionner "
              + "les curseurs du filtre sur l'échelle temps\n"
              + "(le curseur du haut doit faire du chemin avant d'arriver"
              + "à la date maximale).");
        this.startAutoMoveButton.attr('checked', false);
        return;
      }
      var extent = value[0] - value[1];
      var self = this;
      this.animation = new dojo.Animation(
        {
          curve: [ start, end ],
          duration: duration,
          onAnimate: function(value) {
            //console.log('onAnimate', this, arguments);
            self.slider.attr('value', [value, value - extent]);
          },
          onEnd: function() {
            self.startAutoMoveButton.attr('checked', false);
            //self.animation = null;
          }
        });
      console.log('playing animation', this, arguments);
      this.animation.play();
    }
  }

});

dojo.provide('geonef.ploomap.input._FeatureTimeRangeFilter');

// parents
//dojo.require('OpenLayers.Filter');

geonef.ploomap.input._FeatureTimeRangeFilter = OpenLayers.Class(OpenLayers.Filter,
{
  // summary:
  //
  //

  control: null,
  minimum: undefined,
  maximum: undefined,

  initialize: function(options) {
    this.control = options.control;
    OpenLayers.Filter.prototype.initialize.apply(this, arguments);

  },

  setLimits: function(maximum, minimum) {
    this.maximum = maximum;
    this.minimum = minimum;
    if (minimum !== undefined && maximum !== undefined) {
      this.onChange();
    }
  },

  onChange: function() {
    //console.log('change filter max', this.maximum, 'min', this.minimum,
    //            'cMax', this.control.slider.maximum, 'cMin', this.control.slider.minimum);
    // hook - means this filter has changed, so evaluation needs to be done again
  },

  evaluate: function(feature) {
    //var r = dojo.hitch(this, function() {
    //console.log('evaluate', this, arguments);
    if (feature.state === OpenLayers.State.INSERT) {
      this.evaluateTrue(feature);
      return true;
    }
    var number = this.control.featureToNumber(feature);
    if (this.minimum !== undefined && number < this.minimum) {
      //console.log('ev false', this, arguments);
      return false;
    }
    if (this.maximum !== undefined && number > this.maximum) {
      //console.log('ev false', this, arguments);
      return false;
    }
    //console.log('ev true', this, arguments);
    this.evaluateTrue(feature);
    return true;
    /*                   })();
    console.log('eval:', r);
    return r;*/
  },

  evaluateTrue: function(feature) {
    // hook
  }

});
