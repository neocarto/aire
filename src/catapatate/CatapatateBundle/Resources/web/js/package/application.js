
dojo.provide('package.application');

// basic
dojo.require('jig.workspace');
dojo.require('ploomap.tool.layer.Simple');
dojo.require('ploomap.tool.layer.Select');

// application-specific
dojo.require('catapatate.layerDef.Application');

// initial cacoins
dojo.require('jig.layout.RootPane');
dojo.require('jig.layout.BorderContainer');
dojo.require('ploomap.map.Geoportal');
dojo.require('ploomap.tool.Layers');
dojo.require('catapatate.info.About');

// These must be at the end (otherwise, the page won't load :-/ )
//dojo.require('hurepoix.layer.LieuActivite');
//dojo.require('hurepoix.layer.Annuaire');

// Optional
//dojo.require('package.presentationView');
