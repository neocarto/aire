
dojo.provide('geonef.ploomap.list.tool.mapCollection.Detail');

// parents
dojo.require('geonef.jig.layout._Anchor');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._AsyncInit');

// used in template
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.AccordionContainer');
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('geonef.ploomap.list.edition.MapCollection');
dojo.require('geonef.jig.list.edition.CommonProperties');
dojo.require('geonef.jig.button.InstanciateAnchored');

// used in code
dojo.require('geonef.jig.api');
dojo.require('geonef.jig.util');

/**
 * Detailed view for map collections
 *
 * @class
 */
dojo.declare('geonef.ploomap.list.tool.mapCollection.Detail',
             [ geonef.jig.layout._Anchor, dijit._Templated, geonef.jig.widget._AsyncInit ],
{
  uuid: '',

  locale: '',

  recordListRow: null,

  title: 'Détail de la collection',

  apiModule: 'listQuery.mapCollection.multiRepr',

  templateString: dojo.cache('geonef.ploomap.list.tool.mapCollection',
                             'templates/Detail.html'),
  widgetsInTemplate: true,

  postMixInProperties: function() {
    this.inherited(arguments);
    this.reprCommonProps = [];
    this.uiReady = new geonef.jig.Deferred();
    this.uiReady.setControl(this.domNode);
  },

  postCreate: function() {
    this.inherited(arguments);
    this.loadInfo();
  },

  loadInfo: function() {
    this.asyncInit.dependsOn(
      geonef.jig.api.request({
        module: this.apiModule,
        action: 'loadInfo',
        uuid: this.uuid,
        locale: this.locale,
        callback: dojo.hitch(this, 'setupAll')
      }));
  },

  setupAll: function(data) {
    //console.log('setupAll', this, arguments);
    geonef.jig.forEach(data.maps, this.setupRepresentation, this);
    var title = "Toute la série";
    this.mainCommonProps = new geonef.jig.list.edition.CommonProperties(
      { region:'left', 'splitter': true, style: 'width:45%',
        linkedForms: this.reprCommonProps, title: title });
    console.log('created this.mainCommonProps', this, this.mainCommonProps);
    this.mapCollectionContainer.addChild(this.mainCommonProps);
    this.mainCommonProps.autoPool();
    this.uiReady.callback();
  },

  setupRepresentation: function(data, name) {
    //console.log('setupRepresentation', this, arguments);
    var title = "Représentation \""+name+"\"";
    var reprCont = new dijit.layout.BorderContainer(
      { design:'sidebar', title: title });
    var tabCont = new dijit.layout.TabContainer(
      { doLayout:true,region:'center' });
    var mapForms = [];
    geonef.jig.forEach(data,
      function(uuid, level) {
        var module = name[0].toUpperCase() + name.substr(1);
        var Class = geonef.jig.util.getClass('geonef.ploomap.list.edition.map.' + module);
        var mapEdition = new Class({ hardTitle: level, uuid: uuid });
        dojo.style(mapEdition.domNode, { height: '100%' });
        tabCont.addChild(mapEdition);
        mapForms.push(mapEdition);
      }, this);
    var commonProps = new geonef.jig.list.edition.CommonProperties(
      { region:'left', 'splitter': true, style: 'width:45%',
        linkedForms: mapForms, title: title });
    this.reprCommonProps.push(commonProps);
    reprCont.addChild(commonProps);
    reprCont.addChild(tabCont);
    this.reprContainer.addChild(reprCont);
    commonProps.autoPool();
  },

  resize: function() {
    //console.log('resize', this, arguments, this.mainContainer);
    this.inherited(arguments);
    this.mainContainer.resize();
  },

  save: function() {
    console.log('save', this, arguments);
  },

  openPreview: function() {

  },


});
