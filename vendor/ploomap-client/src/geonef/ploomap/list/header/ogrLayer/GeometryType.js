
dojo.provide('geonef.ploomap.list.header.ogrLayer.GeometryType');

// parent
dojo.require('geonef.jig.list.header.generic.AbstractEnumType');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('dijit.form.Form');

// used in code
dojo.require('geonef.ploomap.input.OgrGeometryType');

dojo.declare('geonef.ploomap.list.header.ogrLayer.GeometryType',
             geonef.jig.list.header.generic.AbstractEnumType,
{
  name: 'geometryType',
  title: 'Géométrie',

  populateEnumValues: function() {
    var values =
      (function() {
         var t = [],
           list = geonef.ploomap.input.OgrGeometryType.prototype.geometryTypes;
         for (var p in list) {
           if (list.hasOwnProperty(p)) {
             t.push({ value: p, label: list[p] });
           }
         }
         return t;
      })();
    this.installEnumValues(values);
  }

});
