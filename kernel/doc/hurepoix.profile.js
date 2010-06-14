dependencies ={
  prefixes: [
    [ "dojo", "/home/okapi/dev/dojo/dojo"],
    [ "dijit", "/home/okapi/dev/dojo/dijit"],
    [ "dojox", "/home/okapi/dev/dojo/dojox"],
    [ "jig", "/home/okapi/dev/cartapatate/hurepoix/src/vendor/zig/res/js/jig"],
    [ "ploomap", "/home/okapi/dev/cartapatate/hurepoix/src/vendor/ploomap/res/js/ploomap"],
    [ "hurepoix", "/home/okapi/dev/cartapatate/hurepoix/hurepoix/web/js/hurepoix"]
    //[ "OpenLayers", "../../../../../pkg/ploomap/res/js/openlayers/lib/OpenLayers"]
  ],
  layers:  [
    {
      name: "../workspace_default.js",
      dependencies: [
        // misc deps
  	"dojo.fx.easing",
  	"jig.workspace",
  	"ploomap.tool.layer.Simple",
  	"ploomap.tool.layer.Select",
        // initial cacoins
  	"jig.layout.RootPane",
  	"jig.layout.BorderContainer",
  	"ploomap.map.Classical",
  	"ploomap.tool.Layers",
        "hurepoix.info.About",
        // tools
        "ploomap.tool.OverviewMap",
        "ploomap.tool.Measure",
        "ploomap.tool.Measure",
        "hurepoix.info.About"
      ]
    }
  ]
};
