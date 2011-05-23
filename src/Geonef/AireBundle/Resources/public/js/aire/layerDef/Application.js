
dojo.provide('catapatate.layerDef.Application');

// parents
dojo.require('aire.layerDef.Collection');
dojo.require('ploomap.layerDef.Default');

// used in code
//dojo.require('ploomap.layer.featureDetails.Info');

/**
 * LayerDef provider for ther AIRE application
 */
dojo.declare('catapatate.layerDef.Application',
             [ ploomap.layerDef.Default,
               aire.layerDef.Collection ],
{
});
