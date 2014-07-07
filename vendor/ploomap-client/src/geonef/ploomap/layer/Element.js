
dojo.provide('geonef.ploomap.layer.Element');

// parents
dojo.require('geonef.ploomap.layer.Vector');

dojo.declare('geonef.ploomap.layer.Element', [ geonef.ploomap.layer.Vector ],
{
  // summary:
  //   Layer details for element layer (reseau, galeries, acces..)
  //

  featureDetailsClass: 'geonef.ploomap.layer.featureDetails.Element',

  popupWidth: '330px',
  popupHeight: '400px'

});
