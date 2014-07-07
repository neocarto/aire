dojo.provide('geonef.jig.macro.Editor');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.input.Group');
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');
dojo.require('geonef.jig.macro.editor.ActionList');
dojo.require('dijit.form.SimpleTextarea');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.jig.util');
dojo.require('dojo.dnd.Source');
dojo.require('geonef.jig.macro.Player');

dojo.declare('geonef.jig.macro.Editor', [ geonef.jig.layout._Anchor, dijit._Templated ],
{
  // summary:
  //   Macro editor
  //

  helpPresentation: 'geonef.ploomap.presentation.macroEditor',
  templateString: dojo.cache('geonef.jig.macro', 'templates/Editor.html'),
  widgetsInTemplate: true,


  buildRendering: function() {
    this.inherited(arguments);
    this.createDnd();
  },

  createDnd: function() {
    this.actionListNode.dndType = this.id;
    this.actionListNode.type = this.id;
    this.dnd = new dojo.dnd.Source(this.actionListNode,
                                   { withHandles: true,
                                     singular: true,
                                     accept: this.id+'-dnd',
                                     creator: dojo.hitch(this, 'dndAvatarCreator')
                                   });
    this.connect(this.dnd, 'onDrop', 'onValueChange');
  },

  dndAvatarCreator: function(item) {
    //console.log('creator', this, arguments);
    var avatar = dojo.create('div', { innerHTML: "Déplacement de l'action..." });
    return {
      node: avatar,
      data: item,
      type: this.id+'-dnd'
    };
  },

  destroy: function() {
    this.inherited(arguments);
    this.dnd.destroy();
    this.dnd = null;
  },

  addAction: function(actionRunner) {
    //console.log('addAction', this, arguments);
    var EditorClass = geonef.jig.macro.Editor.prototype.
      getEditorClassForRunner(actionRunner);
    var editor = new EditorClass();
    dojo.addClass(editor.domNode, 'dojoDndItem');
    editor.placeAt(this.actionListNode);
    editor.startup();
    dijit.scrollIntoView(editor.domNode);
    if (!this.batch) {
      geonef.jig.workspace.highlightWidget(editor, 'open');
    }
    this.actionGroupInput.updateChildren();
    this.dnd.sync();
    //dojo.publish('jig/workspace/flash',
    //             ["Présentation : action <i>"+editor.typeLabel+"</i> chargée"]);
  },

  resize: function() {
    //console.log('resize', this, arguments);
    this.inherited(arguments);
    //var box = dojo.contentBox(this.domNode);
    //var coords = dojo.coords(this.tabContainer.domNode);
    //console.log('box', box, coords);
    this.tabContainer.resize();
  },

  _setMacroAttr: function(macro) {
    //console.log('_setMacroAttr', this, arguments);
    macro = dojo.mixin({ actions: [] }, macro);
    dojo.query('> div', this.actionListNode).map(dijit.byNode)
      .forEach(function(w) { w.destroy(); });
    var errors = false;
    var addAction = function(action) {
      if (!action.type) {
        console.warn('missing type on macro action', action, macro);
        errors = true;
      }
      this.addAction(action.type);
      /*var _Class = geonef.jig.macro.Editor.prototype.getEditorClassForRunner(action.type);
      var actionEditor = new _Class();
      actionEditor.placeAt(this.actionListNode);
      actionEditor.startup();*/
    };
    this.batch = true;
    (macro.actions || []).forEach(dojo.hitch(this, addAction));
    this.batch = false;
    this.actionGroupInput.updateChildren();
    if (errors) {
      window.alert('Erreur !');
    }
    this.groupInput.attr('value', macro);
    this.dnd.sync();
    dojo.publish('jig/workspace/flash',
                 ["Présentation : "+ macro.actions.length+" actions chargées"]);
  },

  onValueChange: function() {
    //console.log('onValueChange', this, arguments);
    var value = this.groupInput.attr('value');
    var json = dojo.toJson(value);
    //console.log('got json', value, json);
    this.saveJsonNode.innerHTML = json;
    //this.saveTextarea.attr('value', json);
  },

  actionLoad: function() {
    var text = dojo.trim(this.loadTextarea.attr('value'));
    if (!text) {
      window.alert("Pour charger une présentation, veuillez coller le bloc\n"
                   + "précédemment exporté via la fonction 'enregistrer'.");
      return;
    }
    var value = dojo.fromJson(text);
    if (!value) {
      console.warn('bad JSON value: ', text);
      window.alert("Le bloc n'est pas valide !\n\n"
                   + "Assurez-vous qu'il provient bien de la fonction 'enregistrer'\n"
                   + "de cette application.");
      return;
    }
    var currentValue = this.groupInput.attr('value');
    if (currentValue.actions.length > 0) {
      if (!window.confirm("Vous allez perdre la présentation actuelle.\n"
                          + "Continuer à charger la nouvelle présentation ?")) {
        return;
      }
    }
    //console.log('loading:', value, this.groupInput);
    dojo.publish('jig/workspace/flash', ["Chargement de la présentation..."]);
    this.attr('macro', value);
    this.tabContainer.selectChild(this.actionsPane);
  },

  actionRun: function() {
    var macro = this.groupInput.attr('value');
    if (!macro.actions.length) {
      window.alert("Vous n'avez pas défini d'action pour cette présentation !");
      return;
    }
    geonef.jig.macro.Player.prototype.attemptPlay(macro);
  },

  actionClear: function() {
    var currentValue = this.groupInput.attr('value');
    if (currentValue.actions.length > 0) {
      if (!window.confirm("Repartir de zéro ?")) {
        return;
      }
    }
    this.attr('macro', null);
  },

  actionDump: function() {
    var value = this.groupInput.attr('value');
    console.log('value', value);
  }

});

/////////////////////////////////////////////////////////////
// STATIC MEMBERS

geonef.jig.macro.Editor.prototype.getEditorClassForRunner = function(runnerClass) {
  var RunnerClass = dojo.isFunction(runnerClass) ?
    runnerClass : geonef.jig.util.getClass(runnerClass);
  var editorClass = RunnerClass.prototype.EDITOR_CLASS;
  var EditorClass = geonef.jig.util.getClass(editorClass);
  return EditorClass;
};
