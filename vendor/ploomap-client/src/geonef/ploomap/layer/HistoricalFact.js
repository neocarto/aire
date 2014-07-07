
dojo.provide('geonef.ploomap.layer.HistoricalFact');

// parents
dojo.require('geonef.ploomap.layer.Vector');

// used in code
dojo.require('geonef.ploomap.layer.featureDetails.HistoricalFact');

dojo.declare('geonef.ploomap.layer.HistoricalFact', [ geonef.ploomap.layer.Vector ],
{
  // summary:
  //   Layer details for historical fact
  //

  featureDetailsClass: 'geonef.ploomap.layer.featureDetails.HistoricalFact',

  popupWidth: '350px',
  popupHeight: '280px'

});
