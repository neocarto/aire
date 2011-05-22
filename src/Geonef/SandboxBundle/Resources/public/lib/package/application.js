
dojo.provide('package.application');

// third-party
dojo.require('package.proj4js');
dojo.require('package.openlayers');

// basic
dojo.require('geonef.jig.workspace');
dojo.require('geonef.ploomap.tool.layer.Simple');
dojo.require('geonef.ploomap.tool.layer.Select');

// initial cacoins
dojo.require('geonef.jig.layout.RootPane');
dojo.require('geonef.jig.layout.BorderContainer');
dojo.require('geonef.ploomap.map.Geoportal');
dojo.require('geonef.ploomap.tool.Layers');
dojo.require('geonef.sandbox.info.About');
dojo.require('geonef.ploomap.tool.OverviewMap');

// application-specific
dojo.require('geonef.sandbox.layerDef.Application');
dojo.require('geonef.sandbox.layerLibrary.Application');

// tools
dojo.require('geonef.ploomap.tool.Export');
dojo.require('geonef.ploomap.tool.Measure');
dojo.require('geonef.ploomap.tool.StreetView');
dojo.require('geonef.ploomap.tool.OverviewMap');
dojo.require('geonef.ploomap.tool.Itineraries');
dojo.require('geonef.jig.tool.UserFeedback');

// misc
dojo.require('geonef.ploomap.OpenLayers.Control.ScaleLine');
dojo.require('geonef.ploomap.OpenLayers.Control.TileLoadSpinner');

// Optional
//dojo.require('package.presentationView');
