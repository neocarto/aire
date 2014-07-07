/**
 * @requires OpenLayers/Control.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.Widget');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.jig.widget._LayoutSwitch');

// template
dojo.require('geonef.jig.button.Action');

/**
 * @class Base class for widgets implemented as controls
 *
 * This class extends dijit._Widget and dijit._Templated while
 * implementing the OpenLayers.Control interface so that an
 * instance can be added the the map, through map.addControl()
 */
dojo.declare('geonef.ploomap.OpenLayers.Control.Widget',
             [ dijit._Widget, dijit._Templated, geonef.jig.widget._LayoutSwitch ],
{

  /**
   * Related map
   *
   * @type {OpenLayers.Map}
   */
  map: null,

  layoutSwitcherPosition: 'right',

  //zIndex: null,
  //outsideViewport: true,
  autoActivate: true,


  /////////////////////////////////////////////////////////////
  // LIFECYCLE & OpenLayers Control interface

  buildRendering: function() {
    this.inherited(arguments);
    this.connect(this.domNode, 'onmousedown',
                 function(evt) { evt.stopPropagation(); });
  },

  setMap: function(map) {
    this.map = map;
  },

  draw: function (px) {
    //console.log('sz draw', this, arguments);
    return this.domNode;
  },

  moveTo: function (px) {
    //console.log('control widget moveTo', this, arguments);
  },

  activate: function () {
    // Does not work: z-index overriden by OL
    // if (this.zIndex) {
    //   dojo.style(this.domNode, 'z-index', ''+this.zIndex);
    //   console.log('control widget activate', this, arguments, this.zIndex,
    //              dojo.style(this.domNode, 'z-index'));
    // }
    dojo.style(this.domNode, 'display', '');
  },

  deactivate: function () {
    //console.log('control widget deactivate', this, arguments);
    dojo.style(this.domNode, 'display', 'none');
  },

  destroy: function() {
    this.deactivate();
    this.inherited(arguments);
  }

  /////////////////////////////////////////////////////////////
  //

});
