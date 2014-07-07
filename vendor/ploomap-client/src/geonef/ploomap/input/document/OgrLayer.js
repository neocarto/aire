
dojo.provide('geonef.ploomap.input.document.OgrLayer');

// parents
dojo.require('geonef.jig.input.AbstractListRow');

dojo.declare('geonef.ploomap.input.document.OgrLayer', geonef.jig.input.AbstractListRow,
{
  // summary:
  //
  //

  listClass: 'geonef.ploomap.list.OgrLayer',
  requestApiModule: 'listQuery.ogrLayer',
  nullLabel: '',
  listVisibleColumns: ['selection', 'name', 'source', 'type',
                       'columns', 'featureCount'],
  labelField: 'name',
  layerType: '',

  postMixInProperties: function() {
    this.listVisibleColumns = dojo.clone(this.listVisibleColumns);
    if (this.layerType) {
      if (this.layerType === 'geometry') {
        this.initialFilter = { geometryType:
                               { op: 'in', not: true, value: ['none'] }};
        if (!this.nullLabel) {
          this.nullLabel = 'Couche vecteurs...';
        }
      }
      if (this.layerType === 'attribute') {
        this.initialFilter = { geometryType:
                               { op: 'in', not: false, value: ['none'] }};
        if (!this.nullLabel) {
          this.nullLabel = 'Couche attributaire...';
        }
      }
    }
    this.inherited(arguments);
  },


});
