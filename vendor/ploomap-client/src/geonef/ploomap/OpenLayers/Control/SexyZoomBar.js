
/**
 * @requires OpenLayers/Control.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.SexyZoomBar');

// parents
dojo.require('geonef.ploomap.OpenLayers.Control.Widget');

// template
dojo.require('geonef.jig.button.Action');
dojo.require('dijit.form.VerticalSlider');

// code
dojo.require('dijit.form.VerticalRule');
//dojo.require('geonef.ploomap.tool.Magnifier');
dojo.require('geonef.ploomap.presentation.sexyZoomBar');
dojo.require('geonef.jig.button.Link');
dojo.require('geonef.jig.util');

dojo.declare('geonef.ploomap.OpenLayers.Control.SexyZoomBar',
             geonef.ploomap.OpenLayers.Control.Widget,
{
  // summary:
  //    Like OL ZoomBar control, with better user experience (hover features, etc)
  //

  //magnifierClass: geonef.ploomap.tool.Magnifier,
  helpPresentation: 'geonef.ploomap.presentation.sexyZoomBar',

  templateString: dojo.cache('geonef.ploomap.OpenLayers.Control',
                             'templates/SexyZoomBar.html'),

  widgetsInTemplate: true,

  layoutSwitcherPosition: 'right',

  zIndex: 42000,

  notStickySlider: false,

  buttonsEnabled: [/*'help'*//*, 'magnifier', 'location'*/],

  numZoomLevels: null,

  minusOnTop: false,

  searchEnabled: false,

  zoomLevelGroups: [
    { min: 78271.516953125, max: 156543.03390625,
      name: 'world', label: 'Monde', lineHeight: 18 },
    { min: 19567.87923828125, max: 39135.7584765625,
      name: 'continent', label: 'Continent', lineHeight: 18 },
    { min: 2445.9849047851562, max: 9783.939619140625,
      name: 'country', label: 'Pays', lineHeight: 30 },
    { min: 611.4962261962891, max: 1222.9924523925781,
      name: 'region', label: 'Région', lineHeight: 18 },
    { min: 76.43702827453613, max: 305.74811309814453,
      name: 'department', label: 'Département', lineHeight: 30 },
    { min: 9.554628534317017, max: 38.218514137268066,
      name: 'city', label: 'Commune', lineHeight: 30 },
    { min: 2.388657133579254, max: 4.777314267158508,
      name: 'district', label: 'Quartier', lineHeight: 18 },
    { min: 0.5971642833948135, max: 1.194328566789627,
      name: 'street', label: 'Rue', lineHeight: 8 }
  ],

  buildRendering: function() {
    this.inherited(arguments);
    var settings = geonef.jig.workspace.data.settings;
    var css = settings && settings.zoomBar && settings.zoomBar.css;
    if (css) {
      dojo.addClass(this.domNode, css);
    }
    if (this.buttonsEnabled.indexOf('help') !== -1) { this.buildHelpButton();}
    if (this.searchEnabled) {
      this.buildSearch();
    }
  },

  destroy: function() {
    this.destroySearch();
    if (this.map) {
      this.map.events.on({
        zoomend: this.onZoomChange,
        changebaselayer: this.updateZooms,
        scope: this
      });
    }
    this.inherited(arguments);
  },

  fixLayout: function() {
    dojo.query('tr', this.slider.domNode).forEach(
      function(tr, idx, list) {
        if (this.notStickySlider &&
            (idx === 1 || idx === 2 || idx === 3)) {
          dojo.addClass(tr, 'notSticky');
        }
        if (this.minusOnTop && idx === 4) {
          dojo.place(tr, list[0], 'after');
        }
      }, this);
    if (this.notStickySlider) {
      dojo.addClass(this.domNode, 'notStickySlider');
    }
  },

  buildHelpButton: function() {
    this.helpButton = new dijit.form.Button(
      { label: "?", onClick: dojo.hitch(this, 'startHelpPresentation'),
        title: "Lancer la présentation d'aide" });
    dojo.addClass(this.helpButton.domNode, 'jigCacoinHelpButton notSticky');
    this.helpButton.placeAt(this.domNode, 'last');
    this.helpButton.startup();
  },

  startHelpPresentation: function() {
    if (dojo.isString(this.helpPresentation)) {
      dojo['require'](this.helpPresentation);
      this.helpPresentation = dojo.getObject(this.helpPresentation);
    }
    dojo['require']('geonef.jig.macro.Player');
    geonef.jig.macro.Player.prototype.attemptPlay(this.helpPresentation);
  },

  setMap: function(map) {
    this.inherited(arguments);
    var self = this;
    map.mapWidget.isGeoReady.addCallback(
      function() {
        self.setCss();
        self.fixLayout();
        self.updateZooms();
        self.onZoomChange();
        map.events.on({
          zoomend: self.onZoomChange,
          changebaselayer: self.updateZooms,
          scope: self
        });
      });
  },

  /**
   * Update everything to match current baseLayer's zooms
   *
   * @todo call it whenever the base layer changes
   */
  updateZooms: function() {
    // we "stick" everything temporarily for heights computations
    this.setAlernateLayoutConstraint('buildUI', true);
    this.numZoomLevels = this.map.getNumZoomLevels();
    this.slider.attr('maximum', this.numZoomLevels - 1);
    this.slider.attr('discreteValues', this.numZoomLevels);
    this.buildRules();
    this.buildNiceHelp();
    this.setAlernateLayoutConstraint('buildUI', false);
    this.onZoomChange();
  },

  /**
   * Build the hints (country, region, dpt...) on the right and zoom numbers on the left
   */
  buildNiceHelp: function() {
    [this.slider.leftDecoration,
     this.slider.rightDecoration].forEach(
         function(node) {
           while (node.lastChild) {
             node.removeChild(node.lastChild);
           }
         });
    this.labelList = dojo.create('div', {
      'class': 'dijitRuleContainer dijitRuleContainerV '
               + 'dijitRuleLabelsContainer '
               + 'dijitRuleLabelsContainerV rightLabels' },
      this.slider.rightDecoration/*containerNode*/);
    this.zoomList = dojo.create('div', {
      'class': 'dijitRuleContainer dijitRuleContainerV '
               + 'dijitRuleLabelsContainer '
               + 'dijitRuleLabelsContainerV leftLabels' },
      this.slider.leftDecoration /*containerNode*/);
    var count = this.numZoomLevels;
    var i;
    var interval = 100 / (count-1);
    var height = dojo.contentBox(this.slider.containerNode.parentNode).h;
    var h = height / (count - 1);
    var self = this;
    var minRes = this.map.getResolutionForZoom(count - 1);
    var drawZoomLevelGroup = dojo.hitch(this,
      function(group) {
        if (group.max <= minRes) { return; }
        var max = Math.min(this.map.getZoomForResolution(group.min), count);
        var min = this.map.getZoomForResolution(group.max);
        var topPct = interval * (count - max - 1);
        var heightPct = interval * (max - min + 0.8);
        var node = dojo.create('div',
        {
          'class': 'dijitRuleLabelContainer dijitRuleLabelContainerV '
                   + 'link notSticky ' + group.name,
          style: 'top:'+topPct+'%; height:'+heightPct+'%;line-height:'+
            group.lineHeight+'px',
          innerHTML: group.label,
          title: group.name,
          onclick: function() {
            var mapZ = self.map.getZoom();
            var zoom = Math.abs(mapZ - min) <
                       Math.abs(mapZ - max) ? min : max;
            self.map.zoomTo(zoom);
          }
        }, this.labelList);
      });
    var drawZoomLevel = dojo.hitch(this,
      function(pos, ndx) {
        var node = dojo.create('div',
        {
          'class': 'dijitRuleLabelContainer dijitRuleLabelContainerV'
                   + ' link notSticky',
          style: 'top:'+pos+'%',
          onclick: function() { self.map.zoomTo(ndx); },
          innerHTML: ndx
        }, this.zoomList);

      });
    for (i = 0; i < count; i++) {
      if (count > 18 && i % 2) { continue; }
      drawZoomLevel(interval * (count - i - 1), i);
    }
    (this.map.mapWidget.zoomLevelGroups ||
     this.zoomLevelGroups).forEach(drawZoomLevelGroup);
  },


  buildRules: function() {
    if (this.sliderRules) {
      this.sliderRules.destroy();
    }
    this.rulesNode = dojo.create('ol', {}, this.slider.containerNode);
    this.sliderRules = new dijit.form.VerticalRule({
						count: this.map.numZoomLevels /*+ 2*/,
						style: "width:3px"
					}, this.rulesNode);
    dojo.addClass(this.sliderRules.domNode, 'rule notSticky');
  },

  /**
   * Set position-related CSS class to slider <tr>, for "reduced" CSS rules
   */
  setCss: function() {
    var i = 0;
    dojo.query('tr', this.slider.domNode)
        .forEach(function(tr) { dojo.addClass(tr, 'tr'+i); ++i; });
  },

  buildSearch: function() {
    this.searchLink = new geonef.jig.button.Link(
        { label: "Rechercher<br/>l'adresse...", cssClasses: 'searchAction notSticky',
          onClick: dojo.hitch(this, this.activateSearch) });
    this.searchLink.placeAt(this.domNode).startup();
  },

  destroySearch: function() {
    if (this.searchPane) {
      this.deactivateSearch();
      this.searchPane.destroy();
      delete this.searchPane;
    }
  },

  activateSearch: function() {
    if (!this.searchPane) {
      var Search = geonef.jig.util.getClass('geonef.ploomap.control.Geocoder');
      this.searchPane = new Search();
      dojo.addClass(this.searchPane.domNode, 'floating');
      var w = new geonef.jig.button.Link(
        { label: "&larr;&nbsp;Retour",
          onClick: dojo.hitch(this, this.deactivateSearch) });
      dojo.addClass(w.domNode, 'backlink');
      w.placeAt(this.searchPane.domNode);
      w.startup();
      this.searchPane._supportingWidgets.push(w);
      this.searchPane.placeAt(this.map.div).startup();
    }
    dojo.addClass(this.map.div, 'hasGeocoder');
    dojo.style(this.searchPane.domNode, 'display', '');
    this.searchPane.onAppear();
  },

  deactivateSearch: function() {
    this.searchPane.onDisappear();
    dojo.style(this.searchPane.domNode, 'display', 'none');
    dojo.removeClass(this.map.div, 'hasGeocoder');
  },

  onSliderChange: function() {
    if (this._noChangeEv || !this.map) {
      return;
    }
    var zoom = this.slider.attr('value');
    this.slider.sliderHandle.innerHTML = zoom;
    this.map.zoomTo(zoom);
  },

  onZoomChange: function() {
    this._noChangeEv = true;
    this.slider.attr('value', this.map.getZoom());
    this._noChangeEv = false;
  },

  // openMagnifier: function() {
  //   if (this.magnifier) { return; }
  //   var
  //     self = this
  //   , widgetId = this.map.mapWidget.id+'_magnifier'
  //   , creator = function(id) {
  //                   return new geonef.ploomap.tool.Magnifier(
  //                     { id: id, mapWidget: self.map.mapWidget }); }
  //   ;
  //   this.magnifier = geonef.jig.workspace.loadWidget(widgetId, creator)
  //   ;
  //   if (!this.magnifier) {
  //     return;
  //   }
  //   geonef.jig.connectOnce(this.magnifier, 'destroy', this,
  //                   function() { this.magnifier = null; });
  //   //geonef.jig.workspace.autoAnchorWidget(widget);
  //   this.magnifier.placeAt(this.containerNode);
  //   geonef.jig.workspace.highlightWidget(this.magnifier, 'open');
  //   this.magnifier.startup();
  // }

});
