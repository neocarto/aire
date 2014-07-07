
/**
 * @requires OpenLayers/Layer/Vector.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Layer.Vector');

dojo.require('geonef.ploomap.OpenLayers.Format.SLD');

/**
 * Extension of OpenLayers.Layer.Vector for common functionalities
 *
 * Notes:
 *    - OpenLayers.Layer.Vectors has a "selectedFeatures" property,
 *      updated by OpenLayers.Control.SelectFeatures, who send
 *      corresponding events :
 *            "beforefeatureselected", "featureselected", "featureunselected"
 *
 *    - OpenLayers.Control.SelectFeatures does not catch any layer
 *      events "{on,before}feature{,s}removed"
 *
 *    - the vector layer does not offer itself any method to manage the
 *      selection
 *
 *    - exception "d.layer is null" if we unselect a selected feature
 *      at "beforefeatureremoved" event (seems that style tries to redraw
 *      feature after it has been removed from layer)
 *      -> workaround: only close popup, not unselect
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
geonef.ploomap.OpenLayers.Layer.Vector = OpenLayers.Class(OpenLayers.Layer.Vector,
{
  EVENT_TYPES: ['featureover','featureout', 'selectcontrolactivated', 'selectcontroldeactivated'],

  /**
   * Click control activated initially.
   *
   * @type {?OpenLayers.Control|geonef.ploomap.OpenLayers.Control.Widget}
   */
  defaultClickControl: geonef.ploomap.OpenLayers.Control.FeaturePopup,

  /**
   * Control to enable when the edit button is clicked
   *
   * If its prototype container has a "supportedGeometryTypes" member,
   * that array is searched for the layer's geometryType. If not found,
   * the controlClass' "fallbackClass" member is used to set this property.
   * (done in method "setupLayer")
   *
   * This is typically used for POINT layers, not supporting geometry
   * modification (fallback is the dragging control).
   *
   * @type {?OpenLayers.Control|geonef.ploomap.OpenLayers.Control.Widget}
   */
  editionClickControlClass: geonef.ploomap.OpenLayers.Control.FeatureModify,

  multipleSelect: false,

  selectControlOptions: {
    // multipleKey: 'altKey',
    // toggleKey: 'altKey',
    // clickout: true,
    // box: false,
    // multiple: false,
    // toggle: true
  },

  /**
   * @type {string}
   */
  defaultStyleName: 'default',

  /** @type {string} */
  hoverStyleName: 'hover',

  /** @type {string} */
  selectStyleName: 'hover',

  /**
   * If set, automatically fetched and apply as layer style
   */
  sldUrl: null,

  /**
   * Current enabled click control
   *
   * @type {?OpenLayers.Control|geonef.ploomap.OpenLayers.Control.Widget}
   */
  clickControl: null,

  disableContextMover: false,


  initialize: function(name, options) {
    //console.log('init vector layer', this, arguments, this.sldUrl);
    OpenLayers.Layer.Vector.prototype.initialize.apply(this, arguments);
    geonef.ploomap.OpenLayers.Layer.Vector.prototype.EVENT_TYPES
        .forEach(function(type) { this.events.addEventType(type); }, this);
    if (this.sldUrl) {
      this.loadSld(this.sldUrl);
    }
  },

  afterAdd: function() {
    OpenLayers.Layer.Vector.prototype.afterAdd.apply(this, arguments);
    this.setupLayer();
    this.setClickControl();
    this.activateSelect();
  },

  removeMap: function() {
    this.cleanup();
    OpenLayers.Layer.Vector.prototype.removeMap.apply(this, arguments);
  },


  /////////////////////////////////////////////////////////////
  // LAYER & CONTROL

  /**
   * Setup event handles, etc. Called upon setMap()
   */
  setupLayer: function() {
    this.events.on(
      {
        featuresadded: this.afterFeaturesAdded,
        beforefeatureremoved: this.beforeFeatureRemoved,
        featureselected: this.onFeatureSelect,
        featureunselected: this.onFeatureUnselect,
        //visibilitychanged: this.visibilityChanged,
        scope: this
      });
    if (this.protocol && this.protocol.format) {
      this.protocol.format.getSrsName = function(feature, options) {
        var srsName = options && options.srsName;
        if(!srsName) {
          srsName = this.srsName;
        }
        return srsName;
      };
    }
    if (this.strategies) {
      this.saveStrategy = this.strategies.filter(
        function(s) { return s.CLASS_NAME === 'OpenLayers.Strategy.Save'; })[0];
      if (this.saveStrategy) {
        this.saveStrategy.events.on(
          {
            start: this.saveStart,
            success: this.saveSuccess,
            fail: this.saveFailure,
            scope: this
          });
      }
    }
    if (this.editionClickControlClass &&
        this.editionClickControlClass.prototype.supportedGeometryTypes &&
        this.editionClickControlClass.prototype.supportedGeometryTypes
            .indexOf(this.geometryType) === -1) {
      this.editionClickControlClass =
        this.editionClickControlClass.prototype.fallbackClass;
    }
  },

  /**
   * Cleanup actions - called at the beginning of removeMap()
   */
  cleanup: function() {
    //console.log('cleanup vector', this);
    this._destroying = true;
    this.removeContextMover();
    if (this.clickControl) {
      this.setClickControl(null, true);
    }
    this.deactivateSelect();
    if (this.saveStrategy) {
      // has strategy been destroyed?
      this.saveStrategy.events.un(
        {
          "start": this.saveStart,
          "success": this.saveSuccess,
          "fail": this.saveFailure,
          scope: this
        });
      this.saveStrategy = null;
    }
    this.events.un(
      {
        "featuresadded": this.afterFeaturesAdded,
        "beforefeatureremoved": this.beforeFeatureRemoved,
        "featureselected": this.onFeatureSelect,
        "featureunselected": this.onFeatureUnselect,
        //"visibilitychanged": this.visibilityChanged,
        scope: this
      });
  },

  loadSld: function(url) {
    dojo.publish('jig/workspace/flash', [
                   "Téléchargement de la feuille de style pour "
                   + "la couche : "+this.name ]);
    var self = this;
    dojo.xhrGet(
      {
        url: url, //handleAs: 'xml',
        load: function(xml) {
          //self.sldTextarea.attr('value', xml);
          self.applySld(xml);
        },
        error: function() {
          console.error('error', self, arguments);
          dojo.publish('jig/workspace/flash', [ 'Échec du téléchargement.' ]);
        }
      });
  },

  applySld: function(sldString) {
    //dojo.publish('jig/workspace/flash', [ 'Application du style...' ]);
    var format = new geonef.ploomap.OpenLayers.Format.SLD();
    var sld = format.read(sldString);
    var self = this;
    [ 'default', 'select', 'hover' ].forEach(
      function(n) {
        self.styleMap.styles[n] = sld.namedLayers[n] ?
           sld.namedLayers[n].userStyles[0] :
           sld.namedLayers['default'].userStyles[0];
      });
    this.redraw();
  },


  /////////////////////////////////////////////////////////////
  // EVENTS

  afterFeaturesAdded: function(event) {
    var features = event.features;
    //console.log('beforeFeaturesAdded', features);
  },

  beforeFeatureRemoved: function(event) {
    var feature = event.feature;
    //console.log('beforeFeatureRemoved', feature, feature.attributes.name);
    feature._ploomapFeatureRemove = true;
    if (this.selectedFeatures.indexOf(feature) !== -1) {
      this.map.selectControl.unselect(feature);
    }
  },

  onFeatureSelect: function(event) {
    var f = event.feature;
    f.selected = true;
    this.drawFeature(f, this.selectStyleName);
  },

  onFeatureUnselect: function(event) {
    var f = event.feature;
    f.selected = false;
    this.drawFeature(f, this.defaultStyleName);
  },

  onFeatureOver: function(feature) {
    if (feature.layer !== this) { return; }
    this.overFeature = feature;
    this.events.triggerEvent('featureover', { feature: feature });
    this.drawFeature(feature, this.hoverStyleName);
    if (!this.disableContextMover) {
      this.createContextMover(feature);
    }
    if (dojo.isFunction(feature.onMouseOver)) {
      feature.onMouseOver();
    }
  },

  onFeatureOut: function(feature) {
    if (feature.layer !== this) { return; }
    //console.log('onFeatureOut', this, arguments);
    this.events.triggerEvent('featureout', { feature: feature });
    var selected = this.selectedFeatures.indexOf(feature) !== -1;
    this.drawFeature(feature, selected ?
                     this.selectStyleName : this.defaultStyleName);
    this.removeContextMover();
    if (dojo.isFunction(feature.onMouseOut)) {
      feature.onMouseOut();
    }
    this.overFeature = null;
  },

  onFeatureCreated: function(feature) {
    console.log('onFeatureCreated', this, arguments);
    //this.attr('createControlActive', false);
    this.map.selectControl.select(feature);
  },

  saveStart: function(event) {
    dojo.publish('ploomap/layer/save/start', [this, event]);
    dojo.publish('jig/workspace/flash',
                 [ "Enregistrement de \""+this.name+"\"..." ]);
  },

  saveSuccess: function(event) {
    dojo.publish('ploomap/layer/save/success', [this, event]);
    dojo.publish('ploomap/layer/save/end', [this, event]);
    dojo.publish('jig/workspace/flash',
                 [ "Enregistrement de \""+this.name+"\" : OK :)" ]);
  },

  saveFailure: function(event) {
    dojo.publish('ploomap/layer/save/failure', [this, event]);
    dojo.publish('ploomap/layer/save/end', [this, event]);
    dojo.publish('jig/workspace/flash',
                 [ "Enregistrement de \""+this.name+"\" : échec :(" ]);
  },

  onFeatureAdded: function(f) {
    // NOT CALLED! comment above
  },

  /////////////////////////////////////////////////////////////
  // MANAGEMENT

  featureToString: function(f) {
    return this.getFeatureTitle ? this.getFeatureTitle(f) :
      (f.attributes.name || f.id);
  },

  // /**
  //  * @return {function} that should be called to step the filter
  //  */
  // addFeatureFilter: function(filter) {
  //   var kept = [];
  //   var layer = this;
  //   var onFeatureAdd
  //   return function() {
  //     layer.addFeatures(kept);
  //   };
  // },


  /////////////////////////////////////////////////////////////
  // UI

  createContextMover: function(f, content_) {
    if (this._contextNode && this._contextNode.ploomapFeature !== f) {
      this.removeContextMover();
    }
    content_ = content_ || this.featureToString(f);
    if (!content_) { return; }
    var oX = oY = 15;
    var newContext;
    if (!this._contextNode) {
      //console.log('createContextMover F', this, arguments);
      this._contextNode = dojo.create('div', {'class':'mouseContextBubble'});
      this._contextNode.ploomapFeature = f;
      var _mouseMove = dojo.hitch(this, function(e) {
                                    //if (this._contextNode)
			            this._contextNode.style.left = '' + (e.clientX + oX) + 'px';
			            this._contextNode.style.top = '' + (e.clientY + oY) + 'px';
		                  });
      geonef.jig.connectOnce(this.map.node, 'onmouseout', this,
                      function(evt) {
		        this.removeContextMover();
		      });
      geonef.jig.connectOnce(window, 'onmousemove', this,
                      function(evt) {
                        this._contextNode.style.position = 'absolute';
		        _mouseMove(evt);
		        dojo.body().appendChild(this._contextNode);
		        this._contextHandler =
			  dojo.connect(window, 'onmousemove', this, _mouseMove);
			//this._contextMover = new dojo.dnd.Mover(node, evt);
		      });
    }
    this._contextNode.innerHTML = content_;
  },

  removeContextMover: function() {
    if (this._contextHandler) {
      dojo.disconnect(this._contextHandler);
      this._contextHandler = null;
    }
    if (this._contextNode) {
      this._contextNode.ploomapFeature = null;
      dojo.body().removeChild(this._contextNode);
      this._contextNode = null;
    }
  },

  buildFeatureNode: function(f, node) {
    node.innerHTML = 'Vecteur';
  },


  /////////////////////////////////////////////////////////////
  // ACTIONS - getters+setters

  activateSelect: function(layers) {
    if (!this._selCnts) {
      if (!this.map.selectControl) {
        this.createSelectControl(layers);
      } else {
        //console.log('add to sel control', this, arguments);
        this.map.selectControl.layer.resetRoots();
        this.map.selectControl.layer.layers.push(this);
        this.map.selectControl.layer.collectRoots();
        /*this.map.map.setLayerIndex(
         this.map.selectControl.layer,
         this.map.map.layers.length);*/
      }
      this._selCnts = [
        dojo.connect(this.map.selectControl, 'overFeature',
                     this, 'onFeatureOver'),
        dojo.connect(this.map.selectControl, 'outFeature',
                     this, 'onFeatureOut')
      ];
      //console.log('made connects', this, this._selCnts);
      this.events.triggerEvent('selectcontrolactivated', {});
    }
  },

  deactivateSelect: function(forAllLayers) {
    if (!this.map.selectControl) { return; }
    if (forAllLayers) {
      this.map.selectControl.layer.layers.slice(0).forEach(
          function(layer) { layer.deactivateSelect(); });
      return;
    }
    if (this._selCnts) {
      if (this.overFeature) {
        this.onFeatureOut(this.overFeature);
      }
      this.map.selectControl.unselectAll();
      this._selCnts.forEach(dojo.disconnect);
      this._selCnts = null;
      this.map.selectControl.layer.resetRoots(); // must be done before removeItem()
      OpenLayers.Util.removeItem(
        this.map.selectControl.layer.layers, this);
      this.events.triggerEvent('selectcontroldeactivated', {});
    }
    if (this.map.selectControl.layer.layers.length === 0) {
      this.map.selectControl.deactivate();
      this.map.selectControl.destroy();
      this.map.selectControl = null;
    } else {
      this.map.selectControl.layer.collectRoots();
    }
  },

  createSelectControl: function(layers) {
    //console.log('createSelectControl', this, arguments);
    if (this.map.selectControl) {
      console.error('select control already exists on map',
                    this.map.selectControl, this.map, this);
      throw new Error('select control already exists',
                      this.map.selectControl, this);
    }
    var control;
    control = new geonef.ploomap.OpenLayers.Control.FeatureSelect(
        layers || [this], dojo.mixin({
            callbacks: {
              over: function(f) { control.overFeature(f); },
              out: function(f) { control.outFeature(f); }
            }
          }, this.selectControlOptions));
    this.map.selectControl = control;
    this.map.addControl(control);
    dojo.mixin(control.handlers.feature,
	{ stopUp: false, stopDown: false, stopClick: true });
    control.activate();
  },

  /**
   * @param {?!OpenLayers.Control|geonef.ploomap.OpenLayers.Control.Widget}
   *                    control to enable
   * @param {?boolean}  if true, don't require user confirmation,
   *                    even in case of unsaved data
   */
  setClickControl: function(Class, anyway_) {
    //console.log('setClickControl', this, arguments);
    var control, undefined;
    if (this.clickControl) {
      if (this.clickControl.canBeClosed && !anyway_ &&
          !this.clickControl.canBeClosed()) {
        return;
      }
      control = this.clickControl;
      // destroy connected func won't do anything
      this.clickControl = null; // this is a way to say "no initiative"
      control.destroy();
    }
    if (Class === undefined) {
      //console.log('setClickControl: set default', this, arguments, this.defaultClickControl);
      Class = this.defaultClickControl;
    }
    if (Class) {
      if (dojo.isFunction(Class)) {
        control = new Class({ layer: this });
      } else {
        control = Class;
      }
      this.clickControl = control;
      this.map.addControl(control);
      control.activate();
      if (control.startup) { control.startup(); }
      if (this.map.selectControl) {
        // for some reason, need to recreate select control
        // (on tool.StreetView, all interactivity of all layers
        //  would be lost otherwise)
        var layers = this.map.selectControl.layer.layers.slice(0);
        this.deactivateSelect(true);
        OpenLayers.Util.removeItem(layers, this);
        this.activateSelect();
        layers.forEach(function(layer) { layer.activateSelect(); });
      }
      geonef.jig.connectOnce(control, 'destroy', this,
        function() {
          if (this.clickControl) {
            // means destroy() wasn't called from the code above
            this.clickControl = null;
            this.setClickControl();
          }});
    }
  },

    /**
     * Method: clone
     * Create a clone of this layer.
     *
     * Note: Features of the layer are also cloned.
     *
     * Returns:
     * {<OpenLayers.Layer.Vector>} An exact clone of this layer
     */
    clone: function (obj) {

        if (obj == null) {
            obj = new geonef.ploomap.OpenLayers.Layer.Vector(this.name, this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.Vector.prototype.clone.apply(this, [obj]);

        return obj;
    },

  CLASS_NAME: 'geonef.ploomap.OpenLayers.Layer.Vector'

});

OpenLayers.Layer.Vector.prototype.renderers = ["SVG2", "VML", "Canvas"];
