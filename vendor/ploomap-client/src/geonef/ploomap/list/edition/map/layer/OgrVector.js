

dojo.provide('geonef.ploomap.list.edition.map.layer.OgrVector');

// parents
dojo.require('geonef.ploomap.list.edition.map.layer.Abstract');

// used in template
dojo.require('geonef.jig.input.BooleanCheckBox');
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');

dojo.declare('geonef.ploomap.list.edition.map.layer.OgrVector',
             geonef.ploomap.list.edition.map.layer.Abstract,
{
  // summary:
  //   Vector layer designed to work with an OGR datasource
  //

  module: 'OgrVector',

  templateString: dojo.cache("geonef.ploomap.list.edition.map.layer",
                             "templates/OgrVector.html"),

  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        ogrLayer: {
          'class': 'geonef.jig.input.AbstractListRow',
          options: {
            listClass: 'geonef.ploomap.list.OgrLayer',
            nullLabel: 'Couche OGR...',
            requestModule: 'listQuery.ogrLayer',
            labelField: 'name',
            listVisibleColumns: ['selection', 'source', 'name', 'type',
                                 'featureCount', 'extent', 'spatialRef']
          },
          attachEvents: {
            onRowSelected: 'ogrLayerRowSelected'
          }
        },
        spatialRef: { 'class': 'dijit.form.TextBox' },
        geometryType: { 'class': 'geonef.ploomap.input.MsGeometryType' },
        style: { 'class': 'geonef.ploomap.input.MsStyle' },
        forceOgr: { 'class': 'geonef.jig.input.BooleanCheckBox' }
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    var props = ['ogrLayer', 'spatialRef', 'geometryType', 'style', 'forceOgr'];
    return props.concat(this.inherited(arguments));
  },

  getInputRootNodes: function() {
    return [ this.domNode, this.propertyListNode ];
  },

  destroy: function() {
    //console.log('destroy', this, arguments);
    if (this.domNode && this.domNode.parentNode) {
      this.domNode.parentNode.removeChild(this.domNode);
    }
    this.inherited(arguments);
  },

  _getSummaryAttr: function() {
    return this.inherited(arguments);
    // var value = this.attr('value');
    // var txt = value.name ? value.name : '...';
    // return txt;
  },

  ogrLayerRowSelected: function(row) {
    console.log('ogrLayerRowSelected', this, arguments);
    var value = this.attr('value');
    if (!value.name) {
      this.setSubValue('name', row.attr('name'));
    }
    var geomType = row.attr('geometryType');
    var types = {
      point: 'point',
      point25D: 'point',
      lineString: 'line',
      lineString25D: 'line',
      polygon: 'polygon',
      polygon25D: 'polygon',
      multiPoint: 'point',
      multiPoint25D: 'point',
      multiLineString: 'line',
      multiLineString25D: 'line',
      multiPolygon: 'polygon',
      multiPolygon25D: 'polygon',
    };
    console.log('geomType', geomType, types[geomType], types, row);
    if (types[geomType]) {
      this.setSubValue('geometryType', types[geomType]);
    }
    var spatialRef = row.attr('spatialRef');
    this.setSubValue('spatialRef', spatialRef);
  },


});
