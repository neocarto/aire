
dojo.provide('geonef.ploomap.tool.WmsCapabilities');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');

// used in template
dojo.require('dijit.form.TextBox');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('dojo.io.iframe');

/**
 * Tool to request a WMS server for capabilities and add a layer based on it
 *
 * The API is used to request our server for proxying the target WML service.
 * We can't use a hidden iframe as content-type may not be text/xml.
 *
 */
dojo.declare('geonef.ploomap.tool.WmsCapabilities',
             [ dijit._Widget, dijit._Templated, geonef.ploomap.MapBinding ],
{

  wmsUrl: '',
  wmsUrlCapabilities: '',
  wmsUser: '',
  wmsPasswd: '',

  templateString: dojo.cache('geonef.ploomap.tool', 'templates/WmsCapabilities.html'),
  widgetsInTemplate: true,

  fetchCapabilities: function(url) {
    if (!dojo.isString(url)) {
      url = null;
    }
    if (!url) {
      url = this.urlInput.attr('value');
      url = dojo.trim(url);
      if (!url) {
        alert("L'adresse du serveur WMS doit être spécifiée");
      }
    }
    if ('?&'.indexOf(url[url.length - 1]) === -1) {
      url += '?';
    }
    this.wmsUrl = url;
    this.wmsUrlCapabilities = url + dojo.objectToQuery(
      { SERVICE: 'WMS', VERSION: '1.1.1', REQUEST: 'GetCapabilities' });
    console.log('caps', this.wmsUrlCapabilities);
    var auth = this.wmsUser ? { auth: { user: this.wmsUser,
                                        passwd: this.wmsPasswd }} : {};
    geonef.jig.api.request(dojo.mixin({
      module: 'proxy',
      action: 'request',
      method: 'get',
      url: this.wmsUrlCapabilities,
      callback: dojo.hitch(this, 'handleCapabilities')
    }, auth));
    while (this.listNode.firstChild) {
      this.listNode.removeChild(this.listNode.firstChild);
    }
    this.onResize();
  },

  handleCapabilities: function(data) {
    console.log('handleCapabilities', this, arguments);
    dojo.style(this.waitNode, 'display', 'none');
    if (data.code == 401) {
      var user = window.prompt("Le serveur demande une authentification.\n"
                               + "Veuillez indiquer le nom d'utilisateur :");
      if (!user) { return; }
      var passwd = window.prompt("Veuillez entrer le mot de passe :");
      if (!passwd) { return; }
      this.wmsUser = user;
      this.wmsPasswd = passwd;
      this.fetchCapabilities(this.wmsUrl);
      return;
    }
    if (!data.content) {
      alert("la requête a échoué :\n"+this.wmsUrlCapabilities);
      return;
    }
    var format = new OpenLayers.Format.WMSCapabilities({});
    var capabilities = format.read(data.content);
    //var layer = format.createLayer();
    console.log('capabilities', capabilities, format);
    //capabilities.service.title
    dojo.place(geonef.jig.makeDOM(
      ['tr', {}, [
         ['td', {'class':'n'}, "Titre du service"],
         ['td', {}, capabilities.service.title]]]), this.listNode);
    this.capabilities = capabilities;
    this.onResize();
  },

  addLayer: function() {
    this.afterMapBound(
      function() {
        console.log('addLayer', this, arguments);
        var layers = this.capabilities.capability.nestedLayers[0].nestedLayers.map(
            function(l) { return l.name; }).join(',');
        var layer = new OpenLayers.Layer.WMS(
          this.capabilities.service.title,
          this.capabilities.capability.request.getmap.href,
          {
            layers: layers,
            format: 'image/png',
          }, {
            isBaseLayer: false,
          });
        console.log('layers/layer', layers, layer);
        this.mapWidget.map.addLayer(layer);
      });
  },

  onResize: function() {
    this.inherited(arguments);
  }

});

