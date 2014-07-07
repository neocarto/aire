
dojo.provide('geonef.ploomap.layer.featureDetails.PropertyForm');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.layer.featureDetails.ChildMixin');

// for template
dojo.require('geonef.jig.input.Group');
dojo.require('geonef.jig.button.Action');

// in code
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.Textarea');
dojo.require('dijit.form.Select');
dojo.require('geonef.jig.input.DateTextBox');

dojo.declare('geonef.ploomap.layer.featureDetails.PropertyForm',
             [ dijit._Widget, dijit._Templated,
               geonef.ploomap.layer.featureDetails.ChildMixin ],
{
  // summary:
  //   Auto handle property forms
  //

  templateString: dojo.cache('geonef.ploomap.layer.featureDetails',
                             'templates/PropertyForm.html'),

  widgetsInTemplate: true,

  postCreate: function() {
    this.inherited(arguments);
    this.buildFormPropertiesList();
  },

  cancel: function() {
    if (this.feature.state === OpenLayers.State.INSERT) {
      this.close();
    } else {
      this.destroy();
    }
  },

  save: function() {
    this.saveAttrs();
    this.destroy();
  },


  buildFormPropertiesList: function() {
    var c = dojo.create
    , attrs = this.getAttrSchema()
    ;
    //console.log('attrs', this.feature.attributes, attrs);
    // this.feature.attributes
    for (var i in attrs) {
      if (attrs.hasOwnProperty(i)) {
        //console.log('process prop', i, attrs[i]);
        var _d = attrs[i];
        var tr = c('tr', {}, this.attrListNode)
        , td1 = c('td', { innerHTML: _d.label, "class": "n" }, tr)
        , td2 = c('td', {}, tr)
        , input = c('span', { style: 'width:100%' }, td2)
        , func =
          {
            name: function(name, def, node) {
              new dijit.form.TextBox({ name: name }, node);
            },
            string: function(name, def, node) {
              new dijit.form.TextBox({ name: name }, node);
            },
            textarea: function(name, def, node) {
              new dijit.form.Textarea({ name: name }, node);
            },
            date: function(name, def, node) {
              /*window._dz = */new geonef.jig.input.DateTextBox({ name: name }, node);
              //console.log('dateTimeTextBox', window._dz);
            },
            select: function(name, def, node) {
              var sel = new dijit.form.Select({ name: name }, node);
              for (var j in def.options) {
                if (def.options.hasOwnProperty(j)) {
                  sel.addOption({ value: j, label: def.options[j] });
                }
              }
            }
          }[attrs[i].type]
        , _z = func(i, _d, input)
        ;
      }
    }
    this.revertAttrs();
  },

  revertAttrs: function() {
    var
      value = this.feature.attributes
    , schema = this.getAttrSchema()
    , defaultValues = (function() {
                         var vals = {};
                         for (var i in schema) {
                           if (schema.hasOwnProperty(i)) {
                             vals[i] = schema[i]['default'];
                           }
                         }
                         return vals;
                       })()
    , newval = dojo.mixin(defaultValues, value)
    ;
    //console.log('about to apply default values', newval);
    this.attrGroup.attr('value', newval);
  },

  saveAttrs: function() {
    if (this.isReadOnly) {
      console.warn('cannot save feature: layer is readonly', this);
    }
    var value = this.filterSaveValue(this.attrGroup.attr('value'))
    ;
    dojo.mixin(this.feature.attributes, value);
    if (this.feature.state !== OpenLayers.State.INSERT) {
      this.feature.state = OpenLayers.State.UPDATE;
    }
    this.feature.layer.drawFeature(this.feature);
    this.feature.layer.events.triggerEvent(
        'featuremodified', {feature:this.feature});
    this.feature.layer.events.triggerEvent(
        'afterfeaturemodified', {feature:this.feature});
    this.container.saveStrategy.save([this.feature]);
  },

  filterSaveValue: function(value) {
    //console.log('filterSaveValue', this, arguments, this.attributeOrder);
    if (this.attributeOrder) {
      // As TinyOWS needs the WFS XML have the same attr order than PG table's :(
      var newValue = {};
      this.attributeOrder.forEach(
        function(attr) {
          if (value.hasOwnProperty(attr)) {
            newValue[attr] = value[attr];
          }
        });
      return newValue;
    }
    return value;
  },

});
