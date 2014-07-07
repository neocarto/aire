
dojo.provide('geonef.ploomap.util');

geonef.ploomap.util =
{

  factoryCreateLayer: function(factory, options) {
    var opts = dojo.mixin({}, factory.options, options);
    var _Class = geonef.jig.util.getClass(factory['class']);
    ['maxExtent', 'restrictedExtent', 'tileOrigin'].forEach(
        function(p) {
          if (dojo.isArray(opts[p])) {
            if (opts[p].length === 2) {
              opts[p] = OpenLayers.LonLat.fromArray(opts[p]);
            } else if (opts[p].length === 4) {
              opts[p] = OpenLayers.Bounds.fromArray(opts[p]);
            }
          }
        });

    var layer = new _Class(opts);
    //console.log('layer', layer);

    return layer;
  }

};
