
dojo.provide('geonef.ploomap.panel.layer.Vector');

// parents
dojo.require('geonef.ploomap.panel.layer.Simple');

// used in template
dojo.require('dijit.form.Textarea');

// used in code
dojo.require('geonef.jig.workspace');
dojo.require('geonef.ploomap.OpenLayers.Control.FeatureSelect');
dojo.require('geonef.ploomap.OpenLayers.Control.FeaturePopup');
dojo.require('geonef.ploomap.OpenLayers.Control.FeatureDrag');
dojo.require('geonef.ploomap.OpenLayers.Control.FeatureModify');
dojo.require('geonef.ploomap.OpenLayers.Control.FeatureDraw');
//dojo.require('geonef.ploomap.OpenLayers.Format.SLD');

/**
 * @class OPT box for vector layers
 */
dojo.declare('geonef.ploomap.panel.layer.Vector',
             geonef.ploomap.panel.layer.Simple,
{
  /**
   * Overload member from geonef.ploomap.panel.layer.Simple
   *
   * @type {geonef.ploomap.OpenLayers.Layer.Vector}
   */
  layer: null,

  selectControlActive: true,

  /** @inheritDoc */
  templateString: dojo.cache("geonef.ploomap.panel.layer", "templates/Vector.html"),

  iconUrl: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_vector_active.png'),


  /////////////////////////////////////////////////////////////
  // Widget lifecycle

  buildButtons: function() {
    this.buildButton('general', 'actionRefresh', "Recharger");
    this.inherited(arguments);
    if (this.layer.saveStrategy) {
      //this.buildButton('general', dojo.hitch(this, 'setClickControl',
      //    geonef.ploomap.OpenLayers.Control.FeatureDrag), "Déplacer...");
      this.buildButton('general', dojo.hitch(this.layer, this.layer.setClickControl,
          geonef.ploomap.OpenLayers.Control.FeatureDraw), "Mode création");
      this.buildButton('general',
          dojo.hitch(this.layer, this.layer.setClickControl,
                     this.editionClickControlClass),
          "Mode édition");
    }
  },

  setupEvents: function() {
    this.inherited(arguments);
    this.layer.events.on(
      {
        selectcontrolactivated: this.onSelectControlActivated,
        selectcontroldeactivated: this.onSelectControlDeactivated,
        scope: this,
      });
  },

  destroy: function() {
    this.layer.events.un(
      {
        selectcontrolactivated: this.onSelectControlActivated,
        selectcontroldeactivated: this.onSelectControlDeactivated,
        scope: this,
      });
    this.inherited(arguments);
  },



  actionRefresh: function() {
    this.layer.destroyFeatures();
    console.log('refresh', this, arguments, this.layer.calculateInRange(), this.layer.visibility);
    this.layer.refresh({ force: true });
  },

  onSelectControlDeactivated: function() {
    this.selectControlActive = false;
    this.toggleSelectControlButton.attr('checked', false);
  },

  onSelectControlActivated: function() {
    this.selectControlActive = true;
    this.toggleSelectControlButton.attr('checked', true);
  },

  /**
   * Change whether this layer is enabled within the select control
   */
  _setSelectControlActiveAttr: function(state) {
    this.toggleSelectControlButton.attr('checked', state);
    if (this.selectControlActive !== state) {
      this.selectControlActive = state;
      this.afterMapBound(
        function() {
          if (state) {
            this.layer.activateSelect();
          } else {
            this.layer.deactivateSelect();
          }
        });
    }
  }

});
