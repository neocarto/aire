dojo.provide('catapatate.layer.featureDetails.Element');

// parents
dojo.require('ploomap.layer.featureDetails.Auto');

dojo.declare('catapatate.layer.featureDetails.Element',
             [ ploomap.layer.featureDetails.Auto ],
{
  // summary:
  //   Feature bubble details of a Lieu d'activité
  //

  // As TinyOWS needs the WFS XML have the same attr order than PG table's :(
  attributeOrder: [ 'name', /*'date',*/ 'adresse', 'proprietaire',
                    'contact', 'source', 'notes', 'messe' ],

  isReadOnly: false,

  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    name: { node: 'nameNode', type: 'innerHTML' },
  }),

  templateString: dojo.cache('catapatate.layer.featureDetails', 'templates/Element.html'),

  startup: function() {
    this.inherited(arguments);
    this.tabContainer.resize();
  },

  buildPropertiesList: function() {
    return this.buildFormPropertiesList();
  },

  getAttrSchema: function() {
    return window.workspaceData.settings.lieuxactivites.attributes;
  }

});
