
dojo.provide('geonef.ploomap.layer.featureDetails.Info');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.layer.featureDetails.ChildMixin');
dojo.require('geonef.jig.widget.ButtonContainerMixin');

// for template
dojo.require('geonef.jig.button.Action');

// in code

/**
 * @class Show basic information about vector feature
 */
dojo.declare('geonef.ploomap.layer.featureDetails.Info',
             [ dijit._Widget, dijit._Templated,
               geonef.ploomap.layer.featureDetails.ChildMixin,
               geonef.jig.widget.ButtonContainerMixin],
{
  /**
   * @type {!string}
   */
  title: '',

  /**
   * @type {!boolean}
   */
  saving: false,

  templateString: dojo.cache('geonef.ploomap.layer.featureDetails',
                             'templates/Info.html'),

  widgetsInTemplate: true,

  /**
   * attributeMap from {dijit._Widget}
   *
   * @inheritsDoc
   * @type {Object.<Object<string, string>>}
   */
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    title: { node: 'titleNode', type: 'innerHTML' },
  }),

  getValueHandlers: {
    name: function() {
      return this.title;
    },
    string: function(name, attr) {
      return this.feature.attributes[name] || attr['default'];
    },
    select: function(name, attr) {
      var key = this.feature.attributes[name] || attr['default'];
      return attr.options[key];
    }
  },


  ////////////////////////////////////////////////////////////////////
  // Lifecycle

  buildRendering: function() {
    this.inherited(arguments);
    this.buildReadOnlyPropertiesList();
    if (this.container.saveStrategy) {
      this.buildEditionButtons();
    } else {
      dojo.style(this.editLinkNode, 'display', 'none');
    }
  },

  postCreate: function() {
    if (!dojo.query('*[widgetid]', this.actionsNode).length) {
      dojo.style(this.actionsNode, 'display', 'none');
    }
    this.updateValues();
    this.subscribe('ploomap/layer/save/start',
                   function(layer, event) {
                     if (event.features.indexOf(this.feature) !== -1) {
                       this.attr('saving', true);
                       this.updateValues();
                     }
                   });
    this.subscribe('ploomap/layer/save/end',
                   function(layer, event) {
                     if (layer === this.feature.layer) {
                       this.attr('saving', false);
                     }
                   });
  },

  buildEditionButtons: function() {
    this.buildButton('actions', 'deleteFeature', 'Supprimer');
    //this.buildButton('actions', 'moveFeatureGeometry', 'Déplacer');
    if (this.feature.geometry.CLASS_NAME !== 'OpenLayers.Geometry.Point') {
      //this.buildButton('actions', 'editFeatureGeometry', 'Modifier la géométrie');
    }
  },


  ////////////////////////////////////////////////////////////////////
  // UI

  updateValues: function() {
    this.attr('title', this.feature.layer.getFeatureTitle ?
        this.feature.layer.getFeatureTitle(this.featue) :
            (this.feature.attributes.name || this.feature.fid));
    while (this.listNode.lastChild) {
      this.listNode.removeChild(this.listNode.lastChild);
    }
    this.buildReadOnlyPropertiesList();
  },

  buildReadOnlyPropertiesList: function() {
    var c = dojo.create
    , attrs = this.getAttrSchema()
    ;
    geonef.jig.forEach(attrs,
      function(attr, key) {
        var tr = c('tr', {}, this.listNode)
        , td1 = c('td', { innerHTML: attr.label, "class": "n" }, tr)
        , value = this.getValueHandlers[
                      this.getValueHandlers[attr.type] ? attr.type : 'string'
                  ].call(this, key, attr)
        , td2 = c('td', { innerHTML: value }, tr);
      }, this);
  },


  ////////////////////////////////////////////////////////////////////
  // Getters/setters

  _setSavingAttr: function(state) {
    this.saving = state;
    dojo.style(this.savingNode, 'display', state ? '' : 'none');
  },


  ////////////////////////////////////////////////////////////////////
  // Actions

  editProperties: function() {
    this.openWidget(this.container.propertyWidgetClass);
  },

  deleteFeature: function() {
    this.container.deleteFeature();
  },

  // moveFeatureGeometry: function() {
  //   this.container.moveFeatureGeometry();
  // },

  editFeatureGeometry: function() {
    this.container.editFeatureGeometry();
  }

});
