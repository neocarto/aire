
dojo.provide('catapatate.layerDef.Application');

// parents
dojo.require('catapatate.layerDef.Common');
dojo.require('cartapatate.layerDef.Common');
dojo.require('cartapatate.layerDef.Underground');
//dojo.require('ploomap.layerDef.Geoportal');
//dojo.require('ploomap.layerDef.Google');
dojo.require('ploomap.layerDef.Default');

// used in code
dojo.require('ploomap.layer.featureDetails.Info');

dojo.declare('catapatate.layerDef.Application',
             [ catapatate.layerDef.Common,
               cartapatate.layerDef.Common,
               cartapatate.layerDef.Underground,
               //ploomap.layerDef.Google,
               ploomap.layerDef.Default ],
{
  // summary:
  //   Couches disponibles pour application "catapatate"
  //

});
