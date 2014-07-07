
dojo.provide('geonef.jig.list.header.generic.SelectEntityFilter');

// parent
dojo.require('geonef.jig.list.header.generic.SelectFilter');

// used in code
dojo.require('geonef.jig.locale');

dojo.declare('geonef.jig.list.header.generic.SelectEntityFilter',
             geonef.jig.list.header.generic.SelectFilter,
{
  title: '_Entity_',
  name: '_entity_',
  apiModule: 'listQuery._entity_',
  locale: '',
  labelProp: 'name',
  orNull: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    if (!this.locale) {
      this.locale = geonef.jig.locale.getLocale();
    }
  },

  _getValueAttr: function() {
    var value = this.inherited(arguments);
    return value && value.value === '__none__' ?
      { op: 'exists', value: false } : value;
  },

  populateValues: function() {
    var self = this;
    geonef.jig.api.request({
      module: this.apiModule,
      action: 'query',
      locale: this.locale,
      sort: { name: 'uuid', desc: false },
      callback: function(data) {
        self.installValues(self.filterEntityValues(data.rows));
      }
    });
  },

  filterEntityValues: function(rows) {
    var values = this.orNull ?
      [ { value: '__none__', label: '(sans)' }] : [];
    var self = this;
    return values.concat(rows.map(
        function(row) {
          return { value: row.uuid,
                   label: row[self.labelProp] };
        }));
  },


});
