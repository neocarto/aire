
dojo.provide('geonef.ploomap.list.edition.mapCollection.MultiRepr');

// parent
dojo.require('geonef.ploomap.list.edition.mapCollection.Published');

dojo.declare('geonef.ploomap.list.edition.mapCollection.MultiRepr',
             geonef.ploomap.list.edition.mapCollection.Published,
{
  module: 'MultiRepr',

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        startMap: {
          'class': 'dijit.form.Select',
          options: {
            options: [
              { value: 'stock/nuts0', label: "Stock - NUTS 0" },
              { value: 'stock/nuts1', label: "Stock - NUTS 1" },
              { value: 'stock/nuts2', label: "Stock - NUTS 2" },
              { value: 'stock/nuts23', label: "Stock - NUTS 23" },
              { value: 'stock/nuts3', label: "Stock - NUTS 3" },
              { value: 'ratio/nuts0', label: "Ratio - NUTS 0" },
              { value: 'ratio/nuts1', label: "Ratio - NUTS 1" },
              { value: 'ratio/nuts2', label: "Ratio - NUTS 2" },
              { value: 'ratio/nuts23', label: "Ratio - NUTS 23" },
              { value: 'ratio/nuts3', label: "Ratio - NUTS 3" },
              { value: 'stockRatio/nuts0', label: "Stock+ratio - NUTS 0" },
              { value: 'stockRatio/nuts1', label: "Stock+ratio - NUTS 1" },
              { value: 'stockRatio/nuts2', label: "Stock+ratio - NUTS 2" },
              { value: 'stockRatio/nuts23', label: "Stock+ratio - NUTS 23" },
              { value: 'stockRatio/nuts3', label: "Stock+ratio - NUTS 3" },
              { value: 'ratioDisc/nuts0', label: "Discontinuités - NUTS 0" },
              { value: 'ratioDisc/nuts1', label: "Discontinuités - NUTS 1" },
              { value: 'ratioDisc/nuts2', label: "Discontinuités - NUTS 2" },
              { value: 'ratioDisc/nuts23', label: "Discontinuités - NUTS 23" },
              { value: 'ratioDisc/nuts3', label: "Discontinuités - NUTS 3" },
              { value: 'ratioGrid/300km', label: "Carroyages - 300 km" },
              { value: 'ratioGrid/200km', label: "Carroyages - 200 km" },
              { value: 'ratioGrid/100km', label: "Carroyages - 100 km" },
              { value: 'ratioGrid/50km', label: "Carroyages - 50 km" },
              { value: 'cartogram/nuts0', label: "Anamorphoses - NUTS 0" },
              { value: 'cartogram/nuts1', label: "Anamorphoses - NUTS 1" },
              { value: 'cartogram/nuts2', label: "Anamorphoses - NUTS 2" },
              { value: 'cartogram/nuts23', label: "Anamorphoses - NUTS 23" },
              { value: 'cartogram/nuts3', label: "Anamorphoses - NUTS 3" },
              { value: 'potential/300km', label: "Potentiel - 300 km" },
              { value: 'potential/200km', label: "Potentiel - 200 km" },
              { value: 'potential/100km', label: "Potentiel - 100 km" },
              { value: 'potential/50km', label: "Potentiel - 50 km" }
            ]
          }
        }
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    var props = ['startMap'];
    return this.inherited(arguments).concat(props);
  }

});
