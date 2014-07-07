
dojo.provide('geonef.ploomap.input.OgrGeometryType');

dojo.require('dijit.form.Select');

dojo.declare('geonef.ploomap.input.OgrGeometryType', dijit.form.Select,
{
  // summary:
  //    Extends dijit.form.Select to provide a list geometry types
  //

  geometryTypes: {
    none: "Aucune",
    unknown: "Inconnue",
    point: "Point",
    point25D: "Point 2.5D",
    lineString: "Ligne",
    lineString25D: "Ligne 2.5D",
    polygon: "Polygone",
    polygon25D: "Polygone 2.5D",
    multiPoint: "Collection de points",
    multiPoint25D: "Collections de points 2.5D",
    multiLineString: "Collection de lignes",
    multiLineString25D: "Collection de lignes 2.5D",
    multiPolygon: "Collection de polygones",
    multiPolygon25D: "Collection de polygone 2.5D",
    geometryCollection: "Collection de géométries",
    geometryCollection25D: "Collection de géométries 2.5D",
    linearRing: "Linear ring",
  },

  postCreate: function() {
    this.inherited(arguments);
    this.createInitialOptions();
  },

  createInitialOptions: function() {
    for (var type in this.geometryTypes) {
      if (this.geometryTypes.hasOwnProperty(type)) {
        this.addOption({ value: type, label: this.geometryTypes[type] });
      }
    }
  }

});
