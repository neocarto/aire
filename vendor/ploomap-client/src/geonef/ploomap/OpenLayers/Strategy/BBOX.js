
dojo.provide('geonef.ploomap.OpenLayers.Strategy.BBOX');

geonef.ploomap.OpenLayers.Strategy.BBOX = OpenLayers.Class(OpenLayers.Strategy.BBOX,
{
  // summary:
  //   fix some problems with OL's BBOX strategy
  //

  merge: function(resp) {
    //console.log('bbox merge!', this, arguments);
    // keep only new features
    if (!dojo.isArray(resp.features)) {
      return;
    }
    var origFids = this.layer.features.map(function(f) { return f.fid; });
    var respFids = resp.features.map(function(f) { return f.fid; });
    var toAdd = resp.features.filter(
      function(f) { return origFids.indexOf(f.fid) === -1; });
    var newFids = toAdd.map(function(f) { return f.fid; });
    var toDelete = this.layer.features.filter(
      function(f) { return respFids.indexOf(f.fid) === -1 &&
                    f.state !== OpenLayers.State.INSERT; });
    //console.log('bbox orig', origFids, 'resp', respFids, 'new', newFids, 'toDelete', toDelete, 'toAdd', toAdd);
    var remote = this.layer.projection;
    var local = this.layer.map.getProjectionObject();
    //console.log('22', this, arguments);
    if(!local.equals(remote)) {
      var geom;
      for(var i = 0, len = toAdd.length; i < len; ++i) {
        geom = toAdd[i].geometry;
        if(geom) {
          geom.transform(remote, local);
        }
      }
    }
    //console.log('33', this, arguments);
    if (toDelete.length > 0) {
      dojo.publish('jig/workspace/flash',
      [ "\""+this.layer.name+"\" : disparition de "+
        toDelete.length+" éléments" ]);
    }
    this.layer.destroyFeatures(toDelete);
    //console.log('44', this, arguments);
    if (toAdd.length > 0) {
      dojo.publish('jig/workspace/flash',
        [ "\""+this.layer.name+"\" : apparition de "+
          toAdd.length+" éléments" ]);
    }
    this.layer.addFeatures(toAdd);
    this.response = null;
    this.layer.events.triggerEvent("loadend");
    //console.log('end', this, arguments);
  }

});
