
dojo.provide('geonef.ploomap.list.edition.Map');

// parent
dojo.require('geonef.jig.list.edition.AutoProperties');

// used in code
dojo.require('geonef.jig.button.Action');
dojo.require('geonef.jig.api');
dojo.require('geonef.jig.button.TooltipWidget');
dojo.require('geonef.ploomap.legend.Container');
dojo.require('geonef.jig.input.AbstractListRow');
dojo.require('geonef.ploomap.list.MapCollection');

/**
 * @class Base class for map edition
 * @abstract
 */
dojo.declare('geonef.ploomap.list.edition.Map', geonef.jig.list.edition.AutoProperties,
{
  // summary:
  //
  //

  /* overloaded */
  saveNoticeChannel: 'ploomap/map/save',

  /* overloaded */
  apiModule: 'listQuery.map',

  /* overloaded */
  localeSelect: true,

  /* overloaded */
  checkProperties: true,

  /* overloaded */
  postMixInProperties: function() {
    this.inherited(arguments);
    this.propertyTypes = dojo.mixin(
      {
        mapCollection: {
          'class': 'geonef.jig.input.AbstractListRow',
          options: {
            listClass: 'geonef.ploomap.list.MapCollection',
            nullLabel: 'Série...',
            requestModule: 'listQuery.mapCollection',
            listVisibleColumns: ['selection', 'category', 'title',
                                 'published', 'mapCount'],
            labelField: 'title'
          }
        },
        extent: {
          'class': 'geonef.ploomap.input.MsMapExtent',
          options: { mapInput: 'auto' }},
        userNotes: { 'class': 'dijit.form.SimpleTextarea' },
        published: { 'class': 'geonef.jig.input.BooleanCheckBox' },
        svgTemplate: {
          'class': 'geonef.jig.input.AbstractListRow',
          options: {
            listClass: 'geonef.jig.data.list.Template',
            nullLabel: 'Modèle...',
            editionWidget: 'geonef.ploomap.data.edition.template.${module}',
            requestModule: 'geonefZig/listQuery.template',
            listVisibleColumns: ['selection', 'name', 'validity', 'module', 'type', 'lastEdition']
          }
        },
      }, this.propertyTypes);
  },

  getPropertiesOrder: function() {
    return ['title', 'extent', 'userNotes', 'mapCollection',
            'level', 'published', 'svgTemplate'];
  },

  _getTitleAttr: function() {
    var value = this.origValue; // this.attr('value');
    return this.hardTitle || (value && value.title ?
      'Carte : ' + value.title :
      'Carte sans nom');
  },

  buildButtons: function() {
    this.inherited(arguments);
    this.viewButton = this.buildDDButton(
      'general', 'geonef.ploomap.list.tool.map.View', 'Aperçu');
    this.legendButton = this.buildDDButton(
      'general', 'geonef.ploomap.list.tool.map.Legend', 'Légende');
    this.servicesButton = this.buildDDButton(
      'general', 'geonef.ploomap.list.tool.map.Services', 'Services');
  },

  // buildCustomButtons: function() {
  //   this.viewButton = new geonef.jig.button.TooltipWidget({
  //       childWidgetClass: 'geonef.ploomap.list.tool.map.View',
  //       childWidgetParams: { uuid: null },
  //       label: 'Aperçu'
  //   });
  //   this.viewButton.placeAt(this.actionColumn);
  //   this.legendButton = new geonef.jig.button.TooltipWidget({
  //       childWidgetClass: 'geonef.ploomap.list.tool.map.Legend',
  //       childWidgetParams: { uuid: null },
  //       label: 'Légende'
  //   });
  //   this.legendButton.placeAt(this.actionColumn);
  //   this.servicesButton = new geonef.jig.button.TooltipWidget({
  //       childWidgetClass: 'geonef.ploomap.list.tool.map.Services',
  //       childWidgetParams: { uuid: null },
  //       label: 'Services'
  //   });
  //   dojo.addClass(this.servicesButton.domNode, 'jigLastButton');
  //   this.servicesButton.placeAt(this.actionColumn);
  //   // start
  //   this.viewButton.startup();
  //   this.legendButton.startup();
  //   this.servicesButton.startup();
  // },

  // showMapFile: function() {
  //   geonef.jig.api.request(
  //     {
  //       module: this.apiModule,
  //       action: 'dumpMapString',
  //       uuid: this.uuid,
  //       callback: function(data) {
  //         var content = data.mapString;
  //         alert(content);
  //       }
  //     });
  // },

  getButtons: function() {
    return [this.viewButton, this.legendButton, this.servicesButton];
  },

  highlightPropCheck: function(data) {
    this.inherited(arguments);
    this.getButtons().forEach(
      function(b) { b.attr('disabled', !data.valid); });
  },

  onObjectUpdate: function() {
    //console.log('onObjectUpdate', this, arguments);
    this.inherited(arguments);
    this.getButtons().forEach(
        function(button) {
          // if (!button.subWidget ||
          //     button.subWidget.uuid !== this.uuid) {
            button.subAttr('uuid', this.uuid);
          //   if (button.subWidget &&
          //       button.subWidget.refreshMap) {
          //     button.subWidget.refreshMap();
          //   }
          // }
        }, this);
  }

});
