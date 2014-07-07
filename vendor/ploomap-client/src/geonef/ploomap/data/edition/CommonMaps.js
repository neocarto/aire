
dojo.provide('geonef.ploomap.data.edition.CommonMaps');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._AsyncInit');

// used in template
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.TabContainer');
dojo.require('geonef.jig.list.edition.CommonProperties');

// used in code
dojo.require('geonef.jig.util');
dojo.require('geonef.jig.util.string');

/**
 * Detailed view for map collections
 *
 * @class
 */
dojo.declare('geonef.ploomap.data.edition.CommonMaps',
             [ geonef.jig.layout._Anchor, dijit._Templated, geonef.jig.widget._AsyncInit ],
{
  locale: '',

  mapRows: [],

  /**
   * Map edition widgets - set at initialisation
   *
   * @type {Array.<geonef.jig.list.edition.Map>}
   */
  mapForms: [],

  /**
   * CommonProperties widget - set at initialisation
   *
   * @type {geonef.jig.list.edition.CommonProperties}
   */
  commonEdit: null,

  /**
   * Widget title
   *
   * @type {!string}
   */
  title: 'Édition commune des cartes',

  /**
   * @inheritsDoc
   */
  templateString: dojo.cache('geonef.ploomap.data.edition',
                             'templates/CommonMaps.html'),

  /**
   * @inheritsDoc
   */
  widgetsInTemplate: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.mapRows = this.mapRows.slice(0);
    this.mapForms = this.mapForms.slice(0);
    this.uiReady = new geonef.jig.Deferred();
    this.uiReady.setControl(this.domNode);
  },

  postCreate: function() {
    this.inherited(arguments);
    this.setupAll();
  },

  setupAll: function() {
    //console.log('setupAll', this, arguments);
    this.mapRows.forEach(this.setupMap, this);
    this.commonEdit = new geonef.jig.list.edition.CommonProperties(
      { region:'left', 'splitter': true, style: 'width:45%',
        linkedForms: this.mapForms, locale: this.locale });
    this.mainContainer.addChild(this.commonEdit);
    this.commonEdit.autoPool();
    this.uiReady.callback();
  },

  setupMap: function(map) {
    //console.log('setupMaps', this, arguments);
    var module = geonef.jig.util.string.ucFirst(map.module);
    module = module[0].toUpperCase() + module.substr(1);
    var Class = geonef.jig.util.getClass('geonef.ploomap.list.edition.map.' + module);
    var mapEdition = new Class({ hardTitle: map.title, uuid: map.uuid, locale: this.locale });
    dojo.style(mapEdition.domNode, { height: '100%' });
    this.tabContainer.addChild(mapEdition);
    this.mapForms.push(mapEdition);
  },

  resize: function() {
    //console.log('resize', this, arguments, this.mainContainer);
    this.inherited(arguments);
    this.mainContainer.resize();
  }

});
