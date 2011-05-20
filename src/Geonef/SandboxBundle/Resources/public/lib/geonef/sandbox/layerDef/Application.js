
dojo.provide('geonef.sandbox.layerDef.Application');

// parents
dojo.require('geonef.sandbox.layerDef.Common');
dojo.require('cartapatate.layerDef.Common');
dojo.require('cartapatate.layerDef.Underground');
dojo.require('cartapatate.layerDef.Space');
dojo.require('geonef.ploomap.layerDef.Google');
dojo.require('geonef.ploomap.layerDef.Default');

// used in code
dojo.require('geonef.ploomap.layer.featureDetails.Info');

dojo.declare('geonef.sandbox.layerDef.Application',
             [ geonef.sandbox.layerDef.Common,
               cartapatate.layerDef.Common,
               cartapatate.layerDef.Underground,
               cartapatate.layerDef.Space,
               geonef.ploomap.layerDef.Google,
               geonef.ploomap.layerDef.Default ],
{
  // summary:
  //   Couches disponibles pour application "geonef.sandbox"
  //

});
