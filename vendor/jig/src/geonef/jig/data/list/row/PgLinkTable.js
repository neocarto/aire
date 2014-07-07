
dojo.provide('geonef.jig.data.list.row.PgLinkTable');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.button.TooltipWidget');

// used in code
//dojo.require('geonef.ploomap.list.OgrLayer');

dojo.declare('geonef.jig.data.list.row.PgLinkTable', geonef.jig.list.record.Abstract,
{
  uuid: '!',
  columns: [],
  viewCount: '!',

  forwardKeys: ['uuid', 'columns', 'columns', 'viewCount'],

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    viewCount: { node: 'viewCountNode', type: 'innerHTML' }
  }),

  templateString: dojo.cache('geonef.jig.data.list.row', 'templates/PgLinkTable.html'),

  postCreate: function() {
    this.inherited(arguments);
    this.showViewsButton.childWidgetParams = dojo.mixin(
      { filter: { table: { op: 'ref', value: this.uuid }}},
      this.listWidget.viewsListParams);
  },

  // editAction: function() {
  //   var getClass =
  //     geonef.ploomap.list.edition.ogrDataSource.Generic.prototype.getClassForModule;
  //   var Class = getClass(this.module);
  //   console.log('got class', Class);
  //   var widget = new Class({ uuid: this.uuid });
  //   console.log('instanciated', this, arguments);
  //   geonef.jig.workspace.autoAnchorWidget(widget);
  //   console.log('anchored', this, arguments);
  // },

  _setColumnsAttr: function(columns) {
    //this.columnsButton.attr('label', columns.length+' champs');
    this.columnsNode.innerHTML = columns.length+' colonnes';
    dojo.query('> tr.column', this.columnListNode).orphan();
    var metaColumns = [
      { n: 'name' },
      { n: 'type' }
    ];
    var dc = dojo.create;
    columns.forEach(
      function(column) {
        var tr = dc('tr', { 'class': 'column' }, this.columnListNode);
        metaColumns.forEach(
          function(metaColumn) {
            var td = dc('td',
                { 'class': 'n', innerHTML: column[metaColumn.n] }, tr);
          });
    }, this);
  },

  _setViewCountAttr: function(count) {
    this.viewCount = count;
    this.viewCountNode.innerHTML = count;
    this.showViewsButton.attr('label', count);
    dojo.style(this.viewCountNode, 'display', !count ? '' : 'none');
    dojo.style(this.showViewsButton.domNode, 'display', !!count ? '' : 'none');
  }

});
