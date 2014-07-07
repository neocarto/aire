
dojo.provide('geonef.jig.macro.action.Editor');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');

// for code
dojo.require('geonef.jig.util');

dojo.declare('geonef.jig.macro.action.Editor',
             [ dijit._Widget, dijit._Templated, geonef.jig.input._Container ],
{
  // summary:
  //   Base class for action editor widgets
  //

  // Overload this
  RUNNER_CLASS: 'geonef.jig.macro.action.Runner',

  // Default to true
  widgetsInTemplate: true,

  // askDelete: boolean
  //    Do we prompt the user for confirmation before delete action?
  askDelete: false,

  // Private
  RunnerClass: null,
  typeLabel: null,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.RunnerClass = geonef.jig.util.getClass(this.RUNNER_CLASS);
    this.typeLabel = this.RunnerClass.prototype.label;
  },

  destroy: function() {
    geonef.jig.workspace.highlightWidget(this, 'close');
    this.inherited(arguments);
  },

  buildRendering: function() {
    this.inherited(arguments);
    this.name = this.id;
    dojo.addClass(this.domNode, 'jigMacroActionEditor item');
    this.buildSummaryNode();
    this.buildLabelNode();
    //this.buildDnDHandle();
  },

  startup: function() {
    this.inherited(arguments);
    //this.onChange();
    /*if (this.dropDownButton) {
      var self = this;
      window.setTimeout(
        function() {
          //console.log('load dropd...', self, arguments);
          self.dropDownButton.loadDropDown();
        }, 500);
    }*/
  },

  getInputRootNodes: function() {
    var nodes = this.inherited(arguments);
    if (this.tooltipDialog) {
      nodes.push(this.tooltipDialog.domNode);
    }
    return nodes;
  },

  _setValueAttr: function(value) {
    //console.log('_setValueAttr', this, arguments);
    if (value && value.type !== this.RUNNER_CLASS) {
      console.warn('mismatching type for action editor:', value.type,
                   '; should be:', this.RUNNER_CLASS, 'for value', value, this);
    }
    this.inherited(arguments);
  },

  _getValueAttr: function() {
    return dojo.mixin(this.inherited(arguments),
                      { type: this.RUNNER_CLASS });
  },

  buildLabelNode: function() {
    this.label = dojo.create('span', { 'class': 'label dojoDndHandle' },
                             this.domNode, 'first');
  },

  buildSummaryNode: function() {
    this.summaryNode = dojo.create('span', { 'class': 'summary link' },
                                   this.domNode, 'first');
    this.connect(this.summaryNode, 'onclick', 'onSummaryNodeClick');
  },

  onChange: function() {
    //console.log('onChange', this, arguments);
    this.inherited(arguments);
    this.summaryNode.innerHTML = this.getSummary();
  },

  getSummary: function() {
    return "...";
  },

  onSummaryNodeClick: function() {
    if (this.dropDownButton) {
      this.dropDownButton.loadDropDown();
    }
  },

  //buildDnDHandle: function() {
    //this.dndHandle = dojo.create('span', { 'class': 'dndHandle' },
    //                             this.domNode, 'first');
  //},

  _setTypeLabelAttr: function(label) {
    this.label.innerHTML = label;
  },

  actionDelete: function() {
    if (this.askDelete &&
        !confirm("Supprimer cette action ?")) {
      return;
    }
    this.destroy();
  }

});
