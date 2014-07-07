
dojo.provide('geonef.ploomap.list.SourceLayer');

dojo.require('geonef.jig.list.Abstract');
dojo.require('geonef.ploomap.list.header.SourceLayer');
dojo.require('geonef.ploomap.list.record.SourceLayer');
//dojo.require('geonef.ploomap.list.edition.SourceLayer');

dojo.declare('geonef.ploomap.list.SourceLayer', geonef.jig.list.Abstract,
{
  // queryWidgetClassName: String
  //    Dijit class used for list's <thead>
  queryWidgetClassName: 'geonef.ploomap.list.header.SourceLayer',

  // rowClassName: String
  //    Dijit class used for each record <tr>
  rowClassName: 'geonef.ploomap.list.record.SourceLayer',

  // columnCount: Integer
  //    Number of columns (for the "colspan" attribute)
  columnCount: 6,

  // queryApiModule: String
  //    API module for this.request()
  queryApiModule: 'listQuery.sourceLayer',

  editionWidgetClass: 'geonef.ploomap.list.edition.SourceLayer',

  datasourceUuid: '',

  title: 'Couches',

  postMixInProperties: function() {
    dojo.mixin(this.requestParams, { datasource: this.datasourceUuid });
    dojo.mixin(this, {
                 title: 'Couches de '+this.datasourceUuid
               });
    this.inherited(arguments);
  }


});
