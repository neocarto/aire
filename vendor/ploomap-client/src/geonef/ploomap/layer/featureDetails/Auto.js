
dojo.provide('geonef.ploomap.layer.featureDetails.Auto');

// parents
dojo.require('geonef.ploomap.layer.featureDetails.Info');

dojo.declare('geonef.ploomap.layer.featureDetails.Auto',
             geonef.ploomap.layer.featureDetails.Info,
{
  // summary:
  //   Feature details - automatic list of properties
  //

  buildReadOnlyPropertiesList: function() {
    var c = dojo.create
    , attrs = this.feature.attributes
    ;
    geonef.jig.forEach(attrs,
      function(attr, key) {
        var tr = c('tr', {}, this.listNode)
        , td1 = c('td', { innerHTML: key, "class": "n" }, tr)
        , td2 = c('td', { innerHTML: attr }, tr);
      }, this);
  }

});
