
dojo.provide('geonef.ploomap.input.OgrLayerField');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// used in template
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.jig.button.Action');

// used in code
dojo.require('geonef.jig.api');
dojo.require('geonef.jig.util.string');

dojo.declare('geonef.ploomap.input.OgrLayerField', [ dijit._Widget, dijit._Templated ],
{
  // summary:
  //   Let the user choose a field from a layer defined elsewhere
  //


  ogrLayerInputName: '',

  value: null,
  name: '',
  label: '',
  nullLabel: "Choisir...",
  mapInput: '',

  apiModule: 'listQuery.ogrLayer',

  templateString: dojo.cache('geonef.ploomap.input', 'templates/OgrLayerField.html'),
  widgetsInTemplate: true,

  onTextBoxChange: function() {
    this.attr('value', this.textBox.attr('value'));
  },

  _setValueAttr: function(value) {
    if (value === this.value) { return; }
    this.value = value;
    if (this.textBox.attr('value') != value) {
      this.textBox.attr('value', value);
    }
    this.button.attr('label', value || this.nullLabel);
    this.onChange();
  },

  _setMapInputAttr: function(mapInput) {
    //console.log('_setMapInputAttr', this, arguments, this.domNode,
    //           this.domNode.parentNode);
    if (mapInput === 'auto') {
      if (!this.domNode.parentNode) {
        geonef.jig.connectOnce(this, 'startup', this,
                        dojo.hitch(this, '_setMapInputAttr', 'auto'));
        return;
      }
      // get from ascendants
      mapInput = null;
      for (var node = this.domNode.parentNode; node; node = node.parentNode) {
        if (node.hasAttribute('widgetId')) {
          mapInput = dijit.byNode(node);
          break;
        }
      }
      if (!mapInput) {
        throw new Error('auto map input: not found in ascendants',
          this, 'parentNode:', this.domNode.parentNode);
      }
    }
    if (mapInput && dojo.isString(mapInput)) {
      mapInput = dijit.byId(mapInput);
    }
    this.mapInput = mapInput;
  },

  onChange: function() {
    // hook
  },

  updateList: function() {
    if (!this.mapInput) {
      throw new Error('no mapInput defined for OgrLayerField widget', this);
    }
    var value = this.mapInput.attr('value');
    var ogrLayer = value[this.ogrLayerInputName];
    if (!ogrLayer) {
      window.alert("Pas de couche définie (paramètre "+this.ogrLayerInputName+")");
      return;
    }
    geonef.jig.api.request({
      module: this.apiModule,
      action: 'getFields',
      uuid: ogrLayer,
      callback: dojo.hitch(this, 'installList')
    }).setControl(this.dialog.domNode);
  },

  installList: function(data) {
    var fields = data.fields;
    dojo.query('> tr.field', this.fieldListNode).orphan();
    var metaFields = [
      { n: 'name' },
      { n: 'type', enumV: { integer: 'Entier', integerList: "Liste d'entiers",
                            real: 'Réel', realList: "Liste de réels",
                            string: "Texte", stringList: "Liste de textes",
                            binary: "Brut" } },
      { n: 'width' },
      { n: 'precision' },
      { n: 'justify', enumV: { 'undefined': 'indéfini',
                               left: 'gauche', right: 'droite' } }
    ];
    var dc = dojo.create;
    var self = this;
    fields.forEach(
      function(field) {
        var tr = dc('tr', { 'class': 'field link',
                            onclick: function() {
                              self.attr('value', field.name);
                            }}, this.fieldListNode);
        metaFields.forEach(
          function(metaField) {
            var td = dc('td',
                { 'class': 'n',
                   innerHTML: metaField.enumV ?
                       metaField.enumV[field[metaField.n]] :
                           field[metaField.n] }, tr);
          });
    }, this);
    this.onResize();
  },

  onResize: function() {
    // hook
  }

});
