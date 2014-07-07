
dojo.provide('geonef.ploomap.list.record.OgrLayer');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in code
dojo.require('geonef.jig.util.number');
//dojo.require('geonef.jig.list.record.generic.EditAction');
//dojo.require('geonef.ploomap.list.OgrLayer');
//dojo.require('dojox.string.sprintf');
dojo.require('geonef.jig.util.string');

// used in template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.input.Label');
dojo.require('geonef.ploomap.input.OgrGeometryType');

dojo.declare('geonef.ploomap.list.record.OgrLayer', geonef.jig.list.record.Abstract,
{
  uuid: '!',
  source: '!',
  name: '!',
  geometryType: '!',
  fields: [],
  fieldCountColumn: '!',
  fidField: '!',
  geometryField: '!',
  featureCount: '!',
  extent: '!',
  spatialRef: '',

  forwardKeys: ['uuid', 'source', 'name', 'geometryType', 'fields',
                'fieldCountColumn', 'fidField', 'featureCount',
                'extent', 'spatialRef'],

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    source: { node: 'sourceNode', type: 'innerHTML' },
    name: { node: 'nameNode', type: 'innerHTML' },
    featureCount: { node: 'featureCountNode', type: 'innerHTML' },
    spatialRef: { node: 'spatialRefNode', type: 'innerHTML' }
  }),

  templateString: dojo.cache("geonef.ploomap.list.record", "templates/OgrLayer.html"),

  // destroy: function() {
  //   console.log('destroy', this, arguments);
  //   this.inherited(arguments);
  // },

  // destroyRendering: function() {
  //   console.log('destroyRendering', this, arguments);
  //   dojo.query('> tr.field', this.fieldListNode).orphan();
  //   this.inherited(arguments);
  // },

  featuresAction: function() {
    console.log('not implemented (featuresAction)', this, arguments);
  },

  _setGeometryTypeAttr: function(type) {
    this.geometryType = type;
    this.geometryTypeSelect.attr('value', type);
  },

  _setFidFieldAttr: function(name) {
    this.fidField = name;
    this.fidFieldNode.innerHTML = dojo.toJson(name);
    //this.fidFieldNode.innerHTML = name ? name : '<i>(implicite)</i>';
  },

  _setGeometryFieldAttr: function(name) {
    this.geometryField = name;
    this.geometryFieldNode.innerHTML = dojo.toJson(name);
    //this.geometryFieldNode.innerHTML = name ? name : '<i>(implicite)</i>';
  },

  _setExtentAttr: function(extent) {
    if (!extent || !extent.length) {
      //this.extentButton.attr('label', '-');
      this.extentLabelNode.innerHTML = '-';
      this.extentNode.innerHTML = '-';
    } else {
      this.extentNode.innerHTML =
        ''+extent[0]+', '+extent[1]+'&ndash;<br/>'+
        extent[2]+', '+extent[3];
      //this.extentButton.attr('label',
      this.extentLabelNode.innerHTML =
        geonef.jig.util.number.formatDims(
          [extent[2] - extent[0], extent[3] - extent[1]],
          { joinSep: ' x ' })/*)*/;
    }
  },

  _setSpatialRefAttr: function(spatialRef) {
    this.spatialRefButton.attr(
      'label', geonef.jig.util.string.summarize(spatialRef, 12));
    this.spatialRefButton.subAttr('value', spatialRef);
  },

  _setFieldsAttr: function(fields) {
    //this.fieldsButton.attr('label', fields.length+' champs');
    this.fieldsNode.innerHTML = fields.length+' champs';
    dojo.query('> tr.field', this.fieldListNode).orphan();
    var metaFields = [
      { n: 'name' },
      { n: 'type', enumV: { integer: 'Entier', integerList: "Liste d'entiers",
                            real: 'Réel', realList: "Liste de réels",
                            string: "Texte", stringList: "Liste de textes",
                            binary: "Brut" } },
      { n: 'width' },
      { n: 'precision' },
      { n: 'justify', enumV: { 'undefined': 'indéfini',
                               left: 'gauche', right: 'droite' } }
    ];
    var dc = dojo.create;
    fields.forEach(
      function(field) {
        var tr = dc('tr', { 'class': 'field' },
                    this.fidFieldNode.parentNode, 'before');
        metaFields.forEach(
          function(metaField) {
            var td = dc('td',
                { 'class': 'n',
                   innerHTML: metaField.enumV ?
                       metaField.enumV[field[metaField.n]] :
                           field[metaField.n] }, tr);
          });
    }, this);
  }


});
