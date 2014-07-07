
dojo.provide('geonef.ploomap.input.MsGeometryType');

dojo.require('dijit.form.Select');

dojo.declare('geonef.ploomap.input.MsGeometryType', dijit.form.Select,
{
  // summary:
  //    Extends dijit.form.Select to provide a list geometry types
  //

  geometryTypes: {
    polygon: 'Polygone',
    line: 'Ligne',
    point: 'Point',
    circle: 'Cercle'
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
