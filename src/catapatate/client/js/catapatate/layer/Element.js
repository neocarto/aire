
dojo.provide('catapatate.layer.Element');

// parents
dojo.require('ploomap.layer.Vector');

// used in code
dojo.require('catapatate.layer.featureDetails.Element');

dojo.declare('catapatate.layer.Element', [ ploomap.layer.Vector ],
{
  // summary:
  //   Layer pour les éléments
  //

  featureDetailsClass: 'catapatate.layer.featureDetails.Element',

  popupWidth: '350px',
  popupHeight: '280px'

});
