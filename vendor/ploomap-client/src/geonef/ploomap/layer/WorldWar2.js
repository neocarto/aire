
dojo.provide('geonef.ploomap.layer.WorldWar2');

// parents
dojo.require('geonef.ploomap.layer.Vector');

// used in code
dojo.require('geonef.ploomap.layer.featureDetails.WorldWar2');

dojo.declare('geonef.ploomap.layer.WorldWar2', [ geonef.ploomap.layer.Vector ],
{
  // summary:
  //   Layer details for World War 2 events
  //

  featureDetailsClass: 'geonef.ploomap.layer.featureDetails.WorldWar2',

  popupWidth: '350px',
  popupHeight: '280px'

});
