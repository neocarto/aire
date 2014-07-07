
dojo.provide('geonef.jig.list.edition.CommonProperties');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.input._Container');
dojo.require('geonef.jig.widget._AsyncInit');
dojo.require('geonef.jig.list.edition._AutoPropertiesEmbed');

// used in template
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.data.tool.LocaleSwitch');

// used in code
dojo.require('dojo.dnd.Source');
dojo.require('geonef.jig.locale');

/**
 * @class Manage dynamic list of common properties
 */
dojo.declare('geonef.jig.list.edition.CommonProperties',
             [dijit._Widget, dijit._Templated,
              geonef.jig.input._Container, geonef.jig.widget._AsyncInit,
              geonef.jig.list.edition._AutoPropertiesEmbed],
{

  /**
   * Title of the form
   *
   * @type {string}
   */
  title: "",

  /**
   * Forms whose properties may be put in common here
   *
   * This array must be given at construction time and never modified
   * until destroy.
   *
   * @type {Array.<geonef.jig.list.edition.AutoProperties>}
   */
  linkedForms: [],

  dndSources: [],

  saveButtonLabel: "Tout enregistrer",

  ignoreKeys: ['uuid', 'module'],

  /**
   * Whether the properties should be checked (server-side)
   *
   * @param boolean
   */
  checkProperties: true,

  templateString: dojo.cache('geonef.jig.list.edition',
                             'templates/CommonProperties.html'),
  widgetsInTemplate: true,

  propertyTypes: {},

  propertiesOrder: [],

  locale: '',

  ////////////////////////////////////////////////////////////////////
  // Widget lifecycle & init

  postMixInProperties: function() {
    this.saveButtonLabel = "Enregistrer les "+this.linkedForms.length;
    this.ignoreKeys = this.ignoreKeys.slice();
    this.linkedForms = this.linkedForms.slice(0);
    this.propertyTypes = dojo.mixin({}, this.propertyTypes);
    this.propertiesOrder = this.propertiesOrder.slice(0);
    //this.dndSources = [];
    this.inherited(arguments);
    if (!this.locale) {
      this.locale = geonef.jig.locale.getLocale();
    }
    this.asyncInit.deferCall(this, ['autoPool']);
    this.linkedForms.forEach(this.setupLinkedForm, this);
  },

  setupLinkedForm: function(form) {
    this.asyncInit.dependsOn(form.valueReady || form.asyncInit);
    this.connect(form, 'onPropertyRowAdded', 'processLinkedRow');
    //this.connect(form, 'postSave', 'autoPool');
    this.connect(form, 'getValueHook', dojo.hitch(this, 'applyCommon', form));
    if (this.checkProperties) {
      this.connect(form, 'highlightPropCheck', 'highlightPropCheck');
    }
    if (form.localeButton) {
      dojo.style(form.localeButton.domNode, 'display', 'none');
    }
    var props = form.getPropertiesOrder();
    var types = form.propertyTypes;
    props.forEach(
        function(prop) {
          if (this.ignoreKeys.indexOf(prop) !== -1) { return; }
          if (this.propertiesOrder.indexOf(prop) === -1) {
            this.propertiesOrder.push(prop);
          }
          if (types[prop] && !this.propertyTypes[prop]) {
            // if (this.propertyTypes[prop] &&
            //     this.propertyTypes[prop] !== types[prop]) {
            //   console.warn('property type ', prop, 'conflicts:',
            //                this.propertyTypes[prop], 'and', types[prop]);
            // } else {
            this.propertyTypes[prop] = types[prop];
            //}
          }
        }, this);
  },

  // postCreate: function() {
  //   this.inherited(arguments);
  //   //this.createDnd();
  // },

  loadMetaData: function() {
    // do nothing
  },

  // createDnd: function() {
  //   var self = this;
  //   this.propertyListNode.dndType = this.id;
  //   this.propertyListNode.type = this.id;
  //   this.dnd = new dojo.dnd.Source(
  //     this.propertyListNode.parentNode,
  //     {
  //       withHandles: true,
  //       singular: true,
  //       autoSync: true,
  //       accept: this.id+'-dnd',
  //       creator: function(item) {
  //         var avatar = dojo.create('div', { innerHTML: "Rendre spécifique..." });
  //         return { node: avatar, data: item, type: self.id+'-dnd' };
  //       }
  //     });
  //   this.connect(this.dnd, 'onDrop',
  //       function() {
  //         console.log('onDrop in', self, self.dnd);
  //       });
  //   console.log('dnd', this, this.dnd);
  // },

  onAsyncInitEnd: function() {
    this.inherited(arguments);
  },

  destroy: function() {
    // this.dndSources.forEach(function(s) { s.destroy(); });
    // this.dndSources = null;
    this.linkedForms.forEach(this.unlinkForm, this);
    this.linkedForms = null;
    this.inherited(arguments);
  },

  /**
   * Called from destroy(). Do not call directly.
   *
   * The linkedForms property is not changed here.
   */
  unlinkForm: function(widget) {
    //console.log('unlinkForm', this, arguments);
  },

  _setTitleAttr: function(title) {
    this.title = title;
  },

  _setSaveButtonLabelAttr: function(label) {
    this.saveButtonLabel = label;
    this.saveButton.attr('label', label);
  },


  ////////////////////////////////////////////////////////////////////
  // Property operations

  /**
   * Move common params from linked [deferred call]
   */
  autoPool: function() {
    //console.log('autoPool', this.id);
    window.setTimeout(dojo.hitch(this, function() { // weird; some linked form
                                                    // would not have a value set
    var values = this.linkedForms.map(function(w) { return w.attr('value'); });
    //var values2 = this.linkedForms.map(function(w) { return w.attr('value'); });
    var commonValues = {};
    var thisValue = this.attr('value');
    var d = {};
    this.getPropertiesOrder().forEach(
      function(key) {
        var vals = values.
          filter(function(v, k) {
                   /*console.log('v', v, 'v[key]', v[key]);*/
                   // only check forms having the "key" property
                   return this.linkedForms[k].
                     getPropertiesOrder().indexOf(key) !== -1;
                   //return v[key] !== undefined;
                 }, this).
          map(function(v) { return v[key]; });
        if (vals.length > 1 &&
            vals.every(function(v) { return v === vals[0] &&
                                            v !== undefined; })) {
          commonValues[key] = vals[0];
        }
        d[key] = vals;
      }, this);
    //console.log('common', this.id, commonValues, d);
    geonef.jig.forEach(commonValues,
        function(val, key) { this.setPropertyCommon(key, val); }, this);
    }), 10); // end timeout func
  },

  setPropertyCommon: function(key, val, ask_) {
    //console.log('setPropertyCommon42', this, arguments);
    //var undefined;
    if (ask_) {
      //console.log('this.linkedForms', this.linkedForms);
      // get values from linked forms' method "getPropertyValues" (if exists)
      //
      var others = [];
      var cancel = false;
      this.linkedForms.forEach(
        function(form) {
          if (cancel) { return; }
          var v = form.attr('value');
          if (form.getPropertiesOrder().indexOf(key) !== -1) {
            if (v[key] === undefined) {
              window.alert("Pour être mise mettre en commun \n"+
                           "au niveau \""+this.attr('title')+"\"\n"+
                           "la propriété doit d'abord être commune\n"+
                           "au niveau \""+form.attr('title')+"\"");
              cancel = true;
              return;
            }
            if (v[key] !== val) {
              others.push(v[key]);
            }
          } // else: ignore (property not present in form)
        }, this);
      if (cancel) { return; }
      //console.log('others', others);
      if (others.length && !window.confirm(
            "Écraser les autres valeurs (\""+others.join('", "')+"\") " +
            "par celle-ci : "+val+" ?")) { return; }
    }
    this.buildPropertyRow(key);
    if (val !== undefined && this.propRows[key]) {
      this.setSubValue(key, val);
    }
    //console.log('added common prop', key, val);
    this.linkedForms.forEach(
        function(form) { form.destroyPropertyRow(key); });
    //this.dnd.sync();
  },

  setPropertySpecific: function(name) {
    //console.log('setPropertySpecific', this, arguments);
    var value = this.attr('value')[name];
    var iw = this.getDescendants()
      .filter(function(w) { return w.name === name; })[0];
    var tr = iw.domNode.parentNode/*td*/.parentNode/*tr*/;
    iw.destroyRecursive();
    this.propertyListNode.removeChild(tr);
    this.linkedForms.forEach(
        function(form) {
          var row = form.buildPropertyRow(name);
          if (row) {
            form.setSubValue(name, value);
          }
        });
  },

  applyCommon: function(form, value) {
    var formProps = form.getPropertiesOrder();
    var common = geonef.jig.filter(this.attr('value'),
      function(v, k) { return formProps.indexOf(k) !== -1; });
    //console.log('applyCommon', this, arguments, 'val', dojo.mixin({}, value), 'common', common);
    dojo.mixin(value, common);
  },

  saveValues: function() {
    this.linkedForms.forEach(
        function(form) {
          if (form.saveValues) {
            form.saveValues();
          }
        });
  },


  ////////////////////////////////////////////////////////////////////
  // UI manipulation

  processLinkedRow: function(tr) {
    //console.log('processLinkedRow', this, arguments);
    //return;
    this.buildButtonCommon(tr);
  },

  buildPropertyRow: function(field) {
    var value = this.attr('value');
    if (value[field] !== undefined) { return null; }
    var tr = this.inherited(arguments);
    //console.log('buildPropertyRow', this, field, tr, this.propRows[field], this.propRows);
    //console.log('buildPropertyRow common', this, field, tr);
    if (tr) {
      this.buildButtonSpecific(field, tr);
    }
    return tr;
  },

  buildButtonCommon: function(tr) {
    var nl = dojo.query('> td.v > *[widgetid]', tr);
    if (nl.length > 0) {
      //console.log('nl', nl, nl[0], tr);
      var td = dojo.query('> td', tr)[2];
      //var td = dojo.create('td', {}, tr);
      var iw = dijit.byNode(nl[0]);
      //console.log('found', iw, tr, nl);
      var self = this;
      var button = new geonef.jig.button.Action(
        { label:"&larr;C",
          title: "Rendre ce paramètre commun",
          onClick: function() {
            self.setPropertyCommon(iw.name, iw.attr('value'), true);
          }
        });
      button.placeAt(td);
      button.startup();
    }
  },

  buildButtonSpecific: function(field, tr) {
    var td3 = dojo.query('> td', tr)[2]; //dc('td', {}, tr);
    var button = new geonef.jig.button.Action(
        { label: 'S&rarr;',
          title: "Rendre ce paramètre spécifique",
          onClick: dojo.hitch(this, 'setPropertySpecific', field) });
    button.placeAt(td3);
    button.startup();
  },

  // setupForm: function(form) {
  //   var self = this;
  //   // form.propertyListNode.dndType = this.id;
  //   // form.propertyListNode.type = this.id;
  //   // var self = this;
  //   // var nl = dojo.query('> tr > td.n', form.propertyListNode);
  //   // nl.map(function(n) {return n.parentNode; }).addClass('dojoDndItem');
  //   // nl.addClass('dojoDndHandle');
  //   // //this.dndSources.push(
  //   // var dnd = new dojo.dnd.Source(form.propertyListNode.parentNode,
  //   //   {
  //   //     withHandles: true,
  //   //     singular: true,
  //   //     autoSync: true,
  //   //     accept: this.id+'-dnd',
  //   //     creator: function(item) {
  //   //       var avatar = dojo.create('div', { innerHTML: "Mettre en commun..." });
  //   //       return { node: avatar, data: item, type: self.id+'-dnd' };
  //   //     }
  //   //   });
  //   // this.connect(dnd, 'onDrop',
  //   //     function() {
  //   //       console.log('onDrop ext', self, dnd, form);
  //   //     });
  //   // console.log('made dnd', dnd);
  // },

});
