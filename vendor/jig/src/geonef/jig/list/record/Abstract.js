dojo.provide('geonef.jig.list.record.Abstract');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
//dojo.require('geonef.jig.widget._I18n');
dojo.require('dijit.form.CheckBox');
dojo.require('geonef.jig.input._Forward');

dojo.declare('geonef.jig.list.record.Abstract',
             [dijit._Widget, dijit._Templated, geonef.jig.input._Forward],
{

  locale: '',

  templateString: '',

  //baseMsgKey: '',

  // attributeMap: Object
  //    Attribute map (dijit._Widget)
  /*attributeMap: dojo.mixin(dojo.clone(dijit._Widget.prototype.attributeMap), {
   // in child classes, insert here the mappings you need
   }),*/

  /**
   * Whether we have widgets (attr dojoType="...")
   */
  widgetsInTemplate: true,

  isSelected: false,
  isDirty: false,

  //queryApiModule: 'list',
  //queryApiAction: 'save',

  /**
   * Parent widget
   */
  listWidget: null,

  postCreate: function() {
    this.inherited(arguments);
    this.updateVisibility();
    //console.log('record.Abstract', this, this.locale);
  },

  updateVisibility: function() {
    // about fields
    if (this.listWidget && this.listWidget.visibleColumns.length > 0) {
      var tds = dojo.query('> td', this.domNode);
      for (var i = 0; i < this.listWidget.columns.length; i++) {
        var col = this.listWidget.columns[i];
        if (this.listWidget.visibleColumns.indexOf(col) === -1) {
          dojo.style(tds[i], 'display', 'none');
        }
      }
    }
    // for readonly
    if (!this.listWidget || this.listWidget.readOnly) {
      this.getNoReadOnlyWidgets().forEach(
        function(w) { dojo.style(w.domNode, 'display', 'none'); });
    }
  },

  getNoReadOnlyWidgets: function() {
    return [];
  },

  _getSelectedAttr: function() {
    return this.isSelected;
  },

  _setSelectedAttr: function(state, priorityChange) {
    //console.log('_setSelectedAttr', this, arguments);
    if (state === this.isSelected) {
      return;
    }
    this.isSelected = state;
    if (state) {
      dojo.addClass(this.domNode, 'selectedRow');
    } else {
      dojo.removeClass(this.domNode, 'selectedRow');
    }
    this.selectCheckBoxNode.attr('checked', state);
    if (state && this.listWidget && this.listWidget.readOnly) {
      // in readOnly mode, only one row can be selected at once
      var self = this;
      this.listWidget.getSelectedRows()
        .forEach(function(row) {
                   if (row !== self) row.attr('selected', false); });
    }
    if (priorityChange || priorityChange === undefined) {
      this.onSelectStateChange(state);
    }
  },

  _setIsDirtyAttr: function(state) {
    this.isDirty = state;
    if (state) {
      dojo.addClass(this.domNode, 'dirtyRow');
    } else {
      dojo.removeClass(this.domNode, 'dirtyRow');
    }
  },

  /**
   * Event: the row is selected or unselected
   */
  onSelectStateChange: function(state) {
  },

  onSelectCheckBoxChange: function(state) {
    this.attr('selected', state);
  }

});
