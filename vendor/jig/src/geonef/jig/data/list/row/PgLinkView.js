
dojo.provide('geonef.jig.data.list.row.PgLinkView');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.button.TooltipWidget');

// used in code
//dojo.require('geonef.ploomap.list.OgrLayer');

dojo.declare('geonef.jig.data.list.row.PgLinkView', geonef.jig.list.record.Abstract,
{
  uuid: '!',
  title: '!',
  columns: [],
  linkedViewCount: -1,
  rowCount: -1,

  forwardKeys: ['uuid', 'columns', 'columns', 'linkedViewCount'],

  // attributeMap: object
  //    Attribute map (dijit._Widget)
  attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
    uuid: { node: 'uuidNode', type: 'innerHTML' },
    title: { node: 'titleNode', type: 'innerHTML' },
    linkedViewCount: { node: 'linkedViewCountNode', type: 'innerHTML' }
  }),

  templateString: dojo.cache('geonef.jig.data.list.row', 'templates/PgLinkView.html'),

  postCreate: function() {
    this.inherited(arguments);
    this.showLinkedViewsButton.childWidgetParams = dojo.mixin(
      { filter: { view: { op: 'ref', value: this.uuid }}},
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

  _setLinkedViewCountAttr: function(count) {
    this.linkedViewCount = count;
    this.linkedViewCountNode.innerHTML = count;
    this.showLinkedViewsButton.attr('label', count);
    dojo.style(this.linkedViewCountNode, 'display', !count ? '' : 'none');
    dojo.style(this.showLinkedViewsButton.domNode, 'display', !!count ? '' : 'none');
  },

  _setRowCountAttr: function(count) {
    this.rowCount = count;
    this.showRowsButton.attr('label', count);
  },

  showLinkedViews: function() {
    console.log('showLinkedViews', this, arguments);
    var input = this.listWidget.queryWidget.linkedViewInput;
    input.attr('value', { value: this.uuid, title: this.title });
    input.onChange();
  }

});
