
dojo.provide('geonef.ploomap.input.SpatialRef');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.button.Action');

dojo.declare('geonef.ploomap.input.SpatialRef', [ dijit._Widget, dijit._Templated ],
{

  templateString: dojo.cache('geonef.ploomap.input', 'templates/SpatialRef.html'),
  widgetsInTemplate: true,

  name: 'spatialRef',
  value: '',

  apiModule: 'spatialRef',
  roadOnly: true,

  _setValueAttr: function(spatialRef) {
    this.value = spatialRef;
    if (spatialRef) {
      this.requestDetail();
    }
  },

  requestDetail: function() {
    return geonef.jig.api.request(
      {
        module: this.apiModule,
        action: 'getDetail',
        spatialRef: this.attr('value'),
        scope: this, callback: this.setDetail
      });
  },

  setDetail: function(data) {
    this.proj4Node.innerHTML = '';
    this.wktNode.innerHTML = '';
    if (data.status == 'error') {
      alert('Erreur lors de la requête sur la projection "'+data.spatialRef+
            '": \n'+data.error);
      return;
    }
    this.typeNode.innerHTML = data.type;
    this.proj4Node.innerHTML = data.formats.proj4;
    this.wktNode.innerHTML = data.formats.wkt;
    this.wktPNode.innerHTML = data.formats.prettyWkt
      .replace(/\n/g, '<br/>')
      .replace(/ /g, '&nbsp;');
    this.xmlNode.innerHTML = data.formats.xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>')
      .replace(/ /g, '&nbsp;')
    ;
    this.authorityNode.innerHTML = data.epsg ?
      'EPSG:'+data.epsg : '(aucun)';
    // this.authorityNode.innerHTML = data.auth ?
    //   (data.auth.name+':'+data.auth.code) : 'non trouvé';
  }

});
