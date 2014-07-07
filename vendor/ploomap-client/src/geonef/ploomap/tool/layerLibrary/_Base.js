
dojo.provide('geonef.ploomap.tool.layerLibrary._Base');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');
dojo.require('geonef.jig.widget._AutoGrid');

dojo.declare('geonef.ploomap.tool.layerLibrary._Base',
	     [ geonef.jig.layout._Anchor, dijit._Templated,
               geonef.ploomap.MapBinding, geonef.jig.widget._AutoGrid ],
{
  // summary:
  //    base class for layer-library widgets
  //

  name: 'Cartoth',
  icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/tool_layerlibrary.png'),
  autoBuildAnchorButton: false,
  widgetsInTemplate: true,

  layers: [],

  getGridMembers: function() {
    // overload
    var def = dojo.getObject('workspaceData.settings.layers');
    return def ? this.layers.filter(
      function(l) { return def.indexOf(l.name) !== -1; }) : this.layers;
  },

  processGridMember: function(member, tr) {
    // overload
    //console.log('processGridMember', this, arguments);
    var type = member.type || 'Button';
    this['processGridMember'+type].call(this, member, tr);
  },

  processGridMemberButton: function(member, tr) {
    //console.log('processGridMemberButton', this, arguments);
    var dc = dojo.create
    , buttonNode = dc('button', {}, tr)
    ;
    if (member.icon) {
      var img = dc('img', { src: member.icon }, buttonNode)
      , br = dc('br', {}, buttonNode)
      ;
    }
    var span = dc('span', { innerHTML: member.title }, buttonNode)
    , self = this
    , button = new dijit.form.Button(
                 { onClick: function() {
                     self.clickForLayer(member); }
                 }, buttonNode)
    ;
  },

  processGridMemberSubList: function(member, tr) {
    console.log('processGridMemberSubList', this, arguments);
    var defaultMember = member.list.filter(
      function(item) { return item.name === member['default']; })[0]
    , dc = dojo.create
    , buttonNode = dc('button', {}, tr)
    , img = dc('img', { src: member.icon }, buttonNode)
    , br = dc('br', {}, buttonNode)
    , span = dc('span', { innerHTML: member.title }, buttonNode)
    , tooltipNode = dc('div', {}, buttonNode)
    , self = this
    , tooltip = new dijit.TooltipDialog({}, tooltipNode)
    , button = new dijit.form.ComboButton(
                 {
                   label: member.title,
                   onClick: function() {
                     if (defaultMember) {
                       self.clickForLayer(defaultMember);
                     } else {
                       console.log('member', member.list);
                       member.list.forEach(
                         function(item) {
                           self.clickForLayer(item);
                           /*item.layers.forEach(
                             function(layerDef) {
                               self.addLayerFromData(layerDef);
                             });*/
                         });
                     }
                   }
                 }, buttonNode)
    //, tooltip = new dijit.TooltipDialog()
    ;
    //button.addChild(tooltip);
    this.buildGrid(tooltip.containerNode, member.list);
    //console.log('butt', button, buttonNode);
    //member.list
  },

  processGridMemberSubListElements: function(member, tr) {
    console.log('processGridMemberSubListElements', this, arguments);
    var self = this;
    //console.log('proj', self.mapWidget.map.getProjection(), self.mapWidget.map.getProjectionObject());
    var member2 = {
      title: member.title, icon: member.icon, 'default': member['default'],
      list: member.elementTypes.map(
        function(et) {
          return {
            name: et.name, title: et.title,
            icon: dojo.moduleUrl('geonef.ploomap', 'style/icon/layer_elements.png'),
            layers: [
              {
                creator: function() {
                  return new OpenLayers.Layer.Vector('Éléments '+et.title,
                  {
                    maxResolution: et.maxResolution,
                    minResolution: et.minResolution,
                    projection: self.mapWidget.map.getProjectionObject(), //new OpenLayers.Projection('EPSG:900913'),
                    //projection: new OpenLayers.Projection('EPSG:900913'),
                    strategies: [ new OpenLayers.Strategy.BBOX() ],
                    protocol: new OpenLayers.Protocol.WFS(
                      {
                        url: "http://b.tiles.cartapatate.net:8080/geoserver/ows",
                        featureType: "pm_feature",
                        featureNS: "http://carte.catapatate.net/",
                        geometryName: "geometry",
                        //srsName: "EPSG:900913"
                        srsName: self.mapWidget.map.getProjection()
                      }),
                    filter: new OpenLayers.Filter.Logical({
                      type: OpenLayers.Filter.Logical.AND,
                      filters: [
                        new OpenLayers.Filter.Comparison({
                          type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                          property: "deleted",
                          value: true
                        }),
                        new OpenLayers.Filter.Comparison({
                          type: OpenLayers.Filter.Comparison.EQUAL_TO,
                          property: "featuretype",
                          value: et.name
                        })
                      ]
                    }),
                    optClass: 'geonef.ploomap.layer.Element',
                    sldUrl: '/res/sld/elements.xml'
                  });
                }
              }
            ]
          };
        })
    };
    this.processGridMemberSubList(member2, tr);
  }

  /*addLayerFromData: function(l) {
    // summary:
    //          add layers for the provided definition
    if (dojo.isArray(l)) {
      l.forEach(dojo.hitch(this,
        function(sl) { this.addLayerFromData(sl); }));
      return;
    }
    if (l.name && this.mapWidget.map.layers.some(
	  function(z) { return z.mapName === l.name; })) {
      alert('Déjà sur la carte !');
      return;
    }
    var layer;
    if (l.creator) {
      layer = l.creator(this.mapWidget);
    } else {
      var Class = geonef.jig.util.getClass(l.layerClass);
      layer = new Class(l.title, l.name, l.layerParams);
    }
    var next = dojo.hitch(this,
      function(status) {
        if (status) {
          if (layer.layerExtent &&
              !layer.layerExtent.intersectsBounds(this.mapWidget.map.getExtent(), false)) {
            this.mapWidget.map.zoomToExtent(layer.layerExtent, true);
          }
          if (!layer.map) {
            this.mapWidget.map.addLayer(layer);
          }
          dojo.publish('jig/workspace/flash', [ "Couche ajoutée : "+layer.name ]);
        } else {
          alert('Cette couche n\'est finalement pas disponible.');
        }
      });
    if (layer.checkServer) {
      layer.checkServer(next);
    } else {
      next(true);
    }
  }*/

});
