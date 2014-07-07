
dojo.provide('geonef.jig.data.list.row.PgLinkData');

// parent
dojo.require('geonef.jig.list.record.Abstract');

// used in template
dojo.require('dijit.form.CheckBox');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.jig.input.TextBox');


dojo.declare('geonef.jig.data.list.row.PgLinkData', geonef.jig.list.record.Abstract,
{
  rowId: null,

  values: {},

  forwardKeys: ['values'],

  templateString: dojo.cache('geonef.jig.data.list.row', 'templates/PgLinkData.html'),

  /**
   * Set in "buildColumns" function
   *
   * @type {Object.<string, HTMLTableDataCellElement>}
   */
  columnNodes: {},


  postMixInProperties: function() {
    this.inherited(arguments);
    //this.forwardKeys = this.forwardKeys.slice();
    this.values = dojo.mixin({}, this.values);
  },

  buildRendering: function() {
    this.inherited(arguments);
    if (!this.rowId) {
      dojo.style(this.deleteButton.domNode, 'display', 'none');
    }
    this.buildColumns();
  },

  destroy: function() {
    if (this.editionWidgets) {
      this.cancelEdition();
    }
    this.inherited(arguments);
  },

  startup: function() {
    this.inherited(arguments);
    if (!this.rowId) {
      this.enterEdition();
    }
  },

  buildColumns: function() {
    //console.log('buildColumns', this, arguments);
    this.columnNodes = {};
    geonef.jig.forEach(this.listWidget.columnsDefs, this.buildColumn, this);
  },

  buildColumn: function(def) {
    //var value = this[def.name] || '';
    this.columnNodes[def.name] =
      dojo.create('td', { 'class':'pad'}, this.actionNode, 'before');
    this.forwardKeys.push(def.name);
  },

  _setValuesAttr: function(values) {
    this.values = values;
    for (var n in values) {
      if (n === 'id') {
        this.attr('rowId', values.id);
      } else if (values.hasOwnProperty(n) && this.columnNodes[n]) {
        this.columnNodes[n].innerHTML = values[n];
      }
    }
  },

  _setRowIdAttr: function(id) {
    this.rowId = id;
    this.rowIdNode.innerHTML = id;
  },

  deleteRow: function() {
    this.listWidget.queryWidget.actionsField.deleteRows([this]);
  },

  enterEdition: function() {
    dojo.addClass(this.domNode, 'edition');
    this.editionWidgets = {};
    geonef.jig.forEach(this.columnNodes,
        function(td, name) {
          dojo.style(td, 'display', 'none');
          var newTd = dojo.create('td', {}, td, 'after');
          var editor = new geonef.jig.input.TextBox(
            { name: name, value: this.values[name] });
          editor.connect(editor, 'onEnter',
                         dojo.hitch(this, this.commitEdition));
          editor.placeAt(newTd);
          editor.startup();
          this.editionWidgets[name] = editor;
        }, this);
  },

  cancelEdition: function() {
    dojo.removeClass(this.domNode, 'edition');
    if (this.editionWidgets) {
      geonef.jig.forEach(this.editionWidgets,
          function(editor, name) {
            var td = editor.domNode.parentNode;
            editor.destroy();
            this.domNode.removeChild(td);
            dojo.style(this.columnNodes[name], 'display', '');
          }, this);
      this.editionWidgets = null;
    }
    if (!this.rowId) {
      this.destroy();
    }
  },

  commitEdition: function() {
    //console.log('commit', this, arguments);
    var values = this.rowId ? { id: this.rowId } : {};
    geonef.jig.forEach(this.editionWidgets,
        function(editor, name) {
          values[name] = editor.attr('value');
        }, this);
    this.listWidget.request({
      action: 'commitRow',
      row: values,
      callback: dojo.hitch(this, this.afterCommit, values)
    });
  },

  afterCommit: function(values, data) {
    this.attr('values', values);
    if (!this.rowId) {
      console.log('no row id!', this, arguments);
      this.attr('rowId', data.insertId);
      this.listWidget.refresh();
    } else {
      this.cancelEdition();
    }
  }

});
