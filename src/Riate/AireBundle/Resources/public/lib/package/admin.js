
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
dojo.require('geonef.jig.layout.RootPane');
dojo.require('geonef.jig.layout.BorderContainer');
dojo.require('geonef.jig.layout.TabContainer');
dojo.require('geonef.ploomap.map.Classical');
dojo.require('aire.admin.Library');

// Admin tools
dojo.require('aire.info.About');
dojo.require('geonef.ploomap.list.OgrDataSource');
dojo.require('geonef.ploomap.list.OgrLayer');
dojo.require('geonef.ploomap.list.MapCategory');
dojo.require('geonef.ploomap.list.MapCollection');
dojo.require('geonef.ploomap.list.Map');
dojo.require('geonef.ploomap.list.ColorFamily');
dojo.require('geonef.ploomap.data.list.GdalDataset');
dojo.require('geonef.jig.list.File');

// Sub-tools
dojo.require('geonef.ploomap.list.tool.map.View');
dojo.require('geonef.ploomap.list.tool.map.DataView');
dojo.require('geonef.ploomap.list.tool.map.Legend');
dojo.require('geonef.ploomap.list.tool.map.Services');
dojo.require('geonef.ploomap.list.tool.mapCollection.Detail');
dojo.require('geonef.ploomap.legend.package');

// Document modules
dojo.require('geonef.ploomap.list.edition.map.Stock');
dojo.require('geonef.ploomap.list.edition.map.Ratio');
dojo.require('geonef.ploomap.list.edition.map.StockRatio');
dojo.require('geonef.ploomap.list.edition.map.RatioDisc');
dojo.require('geonef.ploomap.list.edition.map.RatioGrid');
dojo.require('geonef.ploomap.list.edition.map.Cartogram');
dojo.require('geonef.ploomap.list.edition.map.Potential');
dojo.require('geonef.ploomap.list.edition.map.LayerList');
dojo.require('geonef.ploomap.list.edition.map.layer.OgrVector');
dojo.require('geonef.ploomap.list.edition.map.layer.Mark');
dojo.require('geonef.ploomap.list.edition.mapCollection.MultiRepr');
dojo.require('geonef.ploomap.list.edition.mapCollection.SingleRepr');
dojo.require('geonef.ploomap.list.edition.mapCollection.FreeCollection');
dojo.require('geonef.ploomap.list.edition.ogrDataSource.Generic');
dojo.require('geonef.ploomap.list.edition.ogrDataSource.PostgreSql');
dojo.require('geonef.ploomap.list.edition.ogrDataSource.File');
dojo.require('geonef.jig.data.list.Template');
dojo.require('geonef.ploomap.data.edition.template.SvgMap');

// input types
dojo.require('geonef.jig.input.Color');
dojo.require('geonef.jig.input.ListString');
dojo.require('geonef.ploomap.input.MsMapExtent');
dojo.require('geonef.ploomap.input.MsGeometryType');
dojo.require('geonef.ploomap.input.MsStyle');
dojo.require('geonef.ploomap.input.document.OgrLayer');
dojo.require('geonef.ploomap.input.OgrLayerField');
dojo.require('dijit.form.SimpleTextarea');
dojo.require('dojox.widget.ColorPicker');
