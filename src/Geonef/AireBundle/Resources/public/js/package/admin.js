
dojo.provide('package.admin');

// (function() {
//    ['addClass','removeClass','hasClass'].forEach(
//        function(f) {
//          dojo.connect(dojo, f, null,
//                      function() { console.log(f, arguments); });
//          });
//  })();

// third-party
dojo.require('package.proj4js');
dojo.require('package.openlayers');

// UI
dojo.require('jig.layout.RootPane');
dojo.require('jig.layout.BorderContainer');
dojo.require('jig.layout.TabContainer');
dojo.require('ploomap.map.Classical');
dojo.require('aire.admin.Library');

// Admin tools
dojo.require('aire.info.About');
dojo.require('ploomap.list.OgrDataSource');
dojo.require('ploomap.list.OgrLayer');
dojo.require('ploomap.list.MapCategory');
dojo.require('ploomap.list.MapCollection');
dojo.require('ploomap.list.Map');
dojo.require('ploomap.list.ColorFamily');
dojo.require('ploomap.data.list.GdalDataset');
dojo.require('jig.list.File');

// Sub-tools
dojo.require('ploomap.list.tool.map.View');
dojo.require('ploomap.list.tool.map.DataView');
dojo.require('ploomap.list.tool.map.Legend');
dojo.require('ploomap.list.tool.map.Services');
dojo.require('ploomap.legend.Simple');
dojo.require('ploomap.legend.CircleIntervals');
dojo.require('ploomap.legend.RatioDisc');

// Document modules
dojo.require('ploomap.list.edition.map.Stock');
dojo.require('ploomap.list.edition.map.Ratio');
dojo.require('ploomap.list.edition.map.StockRatio');
dojo.require('ploomap.list.edition.map.RatioDisc');
dojo.require('ploomap.list.edition.map.RatioGrid');
dojo.require('ploomap.list.edition.map.Cartogram');
dojo.require('ploomap.list.edition.map.LayerList');
dojo.require('ploomap.list.edition.map.layer.OgrVector');
dojo.require('ploomap.list.edition.map.layer.Mark');
dojo.require('ploomap.list.edition.mapCollection.MultiRepr');
dojo.require('ploomap.list.edition.mapCollection.SingleRepr');
dojo.require('ploomap.list.edition.mapCollection.FreeCollection');
dojo.require('ploomap.list.edition.ogrDataSource.Generic');
dojo.require('ploomap.list.edition.ogrDataSource.PostgreSql');
dojo.require('ploomap.list.edition.ogrDataSource.File');

// input types
dojo.require('jig.input.Color');
dojo.require('jig.input.ListString');
dojo.require('ploomap.input.MsMapExtent');
dojo.require('ploomap.input.MsGeometryType');
dojo.require('ploomap.input.MsStyle');
dojo.require('ploomap.input.document.OgrLayer');
dojo.require('ploomap.input.OgrLayerField');
dojo.require('dijit.form.SimpleTextarea');

