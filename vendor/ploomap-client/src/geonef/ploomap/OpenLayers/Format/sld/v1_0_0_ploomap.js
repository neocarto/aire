
/**
 * @requires OpenLayers/Format/Filter/v1_0_0.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Format.sld.v1_0_0_ploomap');

/**
 * @class geonef.ploomap.OpenLayers.Format.sld.v1_0_0_ploomap
 *
 * Ploomap customization of SLD 1.0.0.
 *
 * @todo ploomap NS writers
 */
dojo.declare('geonef.ploomap.OpenLayers.Format.sld.v1_0_0_ploomap',
             OpenLayers.Format.SLD.v1_0_0,
{

    /**
     * Constant: VERSION
     * {String} 1.0.0
     */
    VERSION: "1.0.0-ploomap",

    namespaces: OpenLayers.Util.applyDefaults(
    {
      ploomap: "http://geonef.fr/ns/sld-extensions"
    }, OpenLayers.Format.SLD.v1_0_0.prototype.namespaces),

    readers: OpenLayers.Util.applyDefaults({
      sld: OpenLayers.Util.applyDefaults({
        Graphic: function(node, symbolizer) {
          symbolizer.graphic = true;
          var graphic = {};
          // painter's order not respected here, clobber previous with next
          this.readChildNodes(node, graphic);
          //console.log('graphic: read', graphic, this, arguments);
          // directly properties with names that match symbolizer properties
          var properties = [
              "stroke", "strokeColor", "strokeWidth", "strokeOpacity",
              "strokeLinecap", "fill", "fillColor", "fillOpacity",
              "graphicName", "rotation", "graphicFormat",
              "graphicWidth", "graphicHeight", "graphicXOffset",
              "graphicYOffset"
          ];
          var prop, value;
          for(var i=0, len=properties.length; i<len; ++i) {
              prop = properties[i];
              value = graphic[prop];
              if(value != undefined) {
                  symbolizer[prop] = value;
              }
          }
          // set other generic properties with specific graphic property names
          if(graphic.opacity != undefined) {
              symbolizer.graphicOpacity = graphic.opacity;
          }
          if(graphic.size != undefined) {
              symbolizer.pointRadius = graphic.size / 2;
          }
          if(graphic.href != undefined) {
              symbolizer.externalGraphic = graphic.href;
          }
          // rotation removed (handled above)
        }
      }, OpenLayers.Format.SLD.v1_0_0.prototype.readers.sld),
      ploomap: {
        GraphicWidth: function(node, graphic) {
          var value = this.readOgcExpression(node);
          if (value) {
            graphic.graphicWidth = parseInt(value, 10);
          }
        },
        GraphicHeight: function(node, graphic) {
          var value = this.readOgcExpression(node);
          if (value) {
            graphic.graphicHeight = parseInt(value, 10);
          }
        },
        GraphicXOffset: function(node, graphic) {
          var value = this.readOgcExpression(node);
          if (value) {
            graphic.graphicXOffset = parseInt(value, 10);
          }
        },
        GraphicYOffset: function(node, graphic) {
          var value = this.readOgcExpression(node);
          if (value) {
            graphic.graphicYOffset = parseInt(value, 10);
          }
        }
      }
    }, OpenLayers.Format.SLD.v1_0_0.prototype.readers),

    CLASS_NAME: "geonef.ploomap.OpenLayers.Format.sld.v1_0_0"

});
