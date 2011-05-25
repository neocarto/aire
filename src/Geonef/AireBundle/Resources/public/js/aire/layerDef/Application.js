
dojo.provide('catapatate.layerDef.Application');

// parents
dojo.require('aire.layerDef.Collection');
dojo.require('geonef.ploomap.layerDef.Default');

// used in code
//dojo.require('geonef.ploomap.layer.featureDetails.Info');

/**
 * LayerDef provider for ther AIRE application
 */
dojo.declare('catapatate.layerDef.Application',
             [ geonef.ploomap.layerDef.Default,
               aire.layerDef.Collection ],
{
});
