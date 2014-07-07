dojo.provide('geonef.jig.list.header.generic.Actions');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.list.header.generic.AbstractField');
dojo.require('geonef.jig.widget.ButtonContainerMixin');

// used in template
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.data.tool.LocaleSwitch');

dojo.declare('geonef.jig.list.header.generic.Actions',
             [dijit._Widget, dijit._Templated,
              geonef.jig.list.header.generic.AbstractField,
              geonef.jig.widget.ButtonContainerMixin,
              geonef.jig.widget._AsyncInit],
{

  templateString: dojo.cache('geonef.jig.list.header.generic', 'templates/Actions.html'),

  //baseMsgKey: 'list.common.header.actions',

  /**
   * Whether we have widgets (attr dojoType="...")
   */
  widgetsInTemplate: true,

  titleProp: 'name',

  buildLocaleSelect: false,

  buildRendering: function() {
    this.inherited(arguments);
    this.buildCustomButtons();
  },

  buildCustomButtons: function() {
    // to overload if needed
    this.buildButton('general', 'refreshList', 'Rachaîchir');
    this.buildButton('general', 'close', 'Fermer');
    this.buildButton('selection', 'duplicateSelected', 'Dupliquer');
    this.buildButton('selection', 'deleteSelected', 'Supprimer');
    if (this.buildLocaleSelect) {
      this.asyncInit.addCallback(dojo.hitch(this,
        function() { // this.getListWidget() needs startup (DOM insertion)
          var localeButton = new geonef.jig.data.tool.LocaleSwitch(
            { listWidget: this.getListWidget() });
          this.addButton(localeButton, 'dom');
        }));
    }
  },

  buildBreak: function(container, position) {
    dojo.create('br', { style: 'margin-bottom:8px;' },
                this[container+'Node'], position);
  },

  addNew: function() {
    console.log('add new', this, arguments);
    var listWidget = this.getListWidget();
    if (!listWidget.editionWidgetClass) {
      throw new Error('admin widget has no "editionWidgetClass" property');
    }
    var Class = geonef.jig.util.getClass(listWidget.editionWidgetClass);
    var editionWidget = new Class({ uuid: null });
    var self = this;
    // editionWidget.connect(editionWidget, 'postSave',
    //                       function() { listWidget.refreshList(); });
    geonef.jig.workspace.autoAnchorWidget(editionWidget);
  },

  deleteSelected: function(selection) {
    //console.log('deleteSelected', this, arguments);
    var list = this.getListWidget();
    var uuids = selection.map(function(r) { return r.attr('uuid'); });
    var txt = ''+uuids.length+" entrées seront supprimées.\n"
      + "Continuer ?";
    if (!confirm(txt)) {
      return;
    }
    list.request({
      action: 'delete',
      uuids: uuids,
      callback: function(resp) {
      }
    });
    list.refresh();
  },

  duplicateSelected: function(selection) {
    var list = this.getListWidget();
    var request = {
      action: 'duplicate',
      callback: function(resp) {
        list.refresh();
      }
    };
    if (selection.length === 1) {
      var name = prompt("Dupliquer \""+
                        selection[0].attr(this.titleProp)+"\" sous quel nom ?");
      if (!name) {
        return;
      }
      dojo.mixin(request, { uuid: selection[0].attr('uuid'), title: name });
    } else {
      var uuids = selection.map(function(r) { return r.uuid; });
      do {
        var val = prompt('Duplication de '+selection.length+" entrées.\n"
                         + "Entrer le motif du nom "
                         + "(le '%' est remplacé par le nom d'origine) :");
        val = dojo.trim(val);
      } while (dojo.isString(val) && (val.indexOf('%') === -1 || val === '%'));
      if (!val) {
        return;
      }
      dojo.mixin(request, { uuids: uuids, pattern: val });
    }
    list.request(request);
  },

  refreshList: function() {
    this.getListWidget().refresh();
  },

  close: function() {
    this.getListWidget().destroyRecursive();
  }

  // downloadSpreadSheet: function() {
  //   // the is like admin.refreshList(), but we only make the
  //   // request structure to send it in another way
  //   var qW = this.getListWidget().queryWidget,
  //   req = {
  //     module: qW.queryApiModule,
  //     action: 'htmlList',
  //     sort: qW.sort,
  //     filters: qW.attr('value')
  //   },
  //   form = dojo.create('form', { action: '/api/download/excelList.xls', target: '_blank', method: 'GET' },
  //                      dojo.body()),
  //   input = dojo.create('input', { type: 'hidden', name: 'request', value: dojo.toJson(req) }, form);
  //   input2 = dojo.create('input', { type: 'hidden', name: 'outputMethod', value: 'raw' }, form);
  //   form.submit();
  // },

});
