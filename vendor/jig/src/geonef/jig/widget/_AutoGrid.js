
dojo.provide('geonef.jig.widget._AutoGrid');

dojo.declare('geonef.jig.widget._AutoGrid', null,
{
  // summary:
  //    automatically build a grid (<table>) of items from an array definition
  //

  domNodeName: 'div',
  templateString: '<${domNodeName} class="jigCacoin"></${domNodeName}>',
  widgetsInTemplate: true,

  autoBuildGrid: true,

  gridNbColumns: 3,

  gridFillDummy: false,

  buildRendering: function() {
    this.inherited(arguments);
    if (this.autoBuildGrid) {
      var node = this.getGridParentNode();
      if (node) {
        this.buildGrid(node, this.getGridMembers());
      }
    }
  },

  getGridParentNode: function() {
    return this.domNode;
  },

  buildGrid: function(gridNode, gridMembers) {
    //console.log('build grid', this, arguments);
    var gridTable = dojo.create('table', {}, gridNode);
    var gridCols = dojo.create('cols', {}, gridTable);
    var gridTBody = dojo.create('tbody', {}, gridTable);
    var pct = parseInt(100 / this.gridNbColumns);
    var i;
    for (i = 0; i < this.gridNbColumns; ++i) {
      dojo.create('col', { style: 'width:'+pct+'%' }, gridCols);
    }
    if (this.gridFillDummy && (gridMembers.length % this.gridNbColumns)) {
      var toComplete = this.gridNbColumns -
        (gridMembers.length % this.gridNbColumns);
      for (i = 0; i < toComplete; ++i) {
        gridMembers.push(null);
      }
    }
    gridMembers.forEach(
      dojo.hitch(this, 'addGridMember', gridTBody, this.gridNbColumns));
    dojo.addClass(gridTable, 'jigAutogrid jigButtonArea');
  },

  addGridMember: function(gridTBody, gridNbColumns, member) {
    //console.log('addGridMember', this, arguments);
    var tr = dojo.query('tr:last-child', gridTBody)[0];
    if (!tr || dojo.query('> *', tr).length === gridNbColumns) {
      tr = dojo.create('tr', {}, gridTBody);
    }
    if (member) {
      this.processGridMember(member, tr);
    } else {
      dojo.create('td', {}, tr);
    }
  },

  processGridMember: function(member, tr) {
    // summary:
    //          do what is needed to build the item
    // type:
    //          "abstract" method
  },

  getGridMembers: function() {
    // summary:
    //          return array of items to add to the grid (can by anything)
    // type:
    //          "abstract" method
    return [];
  }

});
