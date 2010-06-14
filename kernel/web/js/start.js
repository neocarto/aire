dojo.registerModulePath('dojo', '/js/dojo');
dojo.registerModulePath('dijit', '/js/dijit');
dojo.registerModulePath('dojox', '/js/dojox');
dojo.registerModulePath('jig', '/js/jig');
dojo.registerModulePath('ploomap', '/js/ploomap');
dojo.registerModulePath('hurepoix', '/js/hurepoix');

//dojo.require('patate.Store');
dojo.require('jig.workspace');
dojo.require('jig.layout.RootPane');

dojo.mixin(dojo.getObject('cartapatate', true), {

  start: function() {
    OpenLayers.ProxyHost = '/cgi-bin/proxy.cgi?url=';
    jig.workspace.initialize({ data: window.workspaceData });
    var workspace = jig.workspace.loadWidget('root');
    workspace.placeOnWindow();
    workspace.startup();
    dojo.style('wait', 'display', 'none');
    return true;
  }

});

dojo.addOnLoad(cartapatate.start);
