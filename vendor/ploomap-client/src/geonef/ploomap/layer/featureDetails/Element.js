
dojo.provide('geonef.ploomap.layer.featureDetails.Element');

// parents
dojo.require('geonef.ploomap.layer.featureDetails.StackContainerBase');

// used in template
//dojo.require('dijit.layout.StackContainer');

dojo.declare('geonef.ploomap.layer.featureDetails.Element',
             [ geonef.ploomap.layer.featureDetails.StackContainerBase ],
{
  // summary:
  //   Feature details - automatic list of properties
  //

  initialChild: 'geonef.ploomap.layer.featureDetails.Info',

  postMixInProperties: function() {
    //console.log('postMixInProperties element', this, this.feature);
    this.featureType = this.feature.attributes.element_type ||
      this.feature.layer.elementType;
    this.inherited(arguments);
  },

  getAttrSchema: function() {
    //console.log('schema', this, window.workspaceData.settings.elementTypes);
    var attrList = window.workspaceData.settings.
                     elementTypes[this.featureType].attributes;
    return attrList;
  }

});
