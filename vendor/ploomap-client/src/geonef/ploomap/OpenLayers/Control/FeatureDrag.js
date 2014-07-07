/**
 * @requires OpenLayers/Control/DragFeature.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.FeatureDrag');

// parents
dojo.require('geonef.ploomap.OpenLayers.Control.FeatureEdition');

/**
 * Control for dragging features
 *
 * @class
 */
dojo.declare('geonef.ploomap.OpenLayers.Control.FeatureDrag',
             geonef.ploomap.OpenLayers.Control.FeatureEdition,
{

  operationLabel: 'déplacement',
  editTip: "Glisser la géométrie et lacher le bouton à l'endroit souhaité..",
  startTip: "Cliquer puis glisser pour déplacer une géométrie sur la carte...",

  /**
   * @type {OpenLayers.Pixel}
   */
  startPx: null,

  /**
   * @type {OpenLayers.LonLat}
   */
  startLonLat: null,


  /////////////////////////////////////////////////////////////
  // Operations

  buildRendering: function() {
    this.inherited(arguments);
    this.buildButton('actions', 'setModifyControl', 'Mode édition');
    dojo.place(geonef.jig.makeDOM(
        ['table', {'class':'jigList', style:'width:350px'},
          ['tbody', {}, [
            ['tr', {}, [
              ['td', {'class':'n'}, 'Position (carte)'],
              ['td', { attachPoint: 'posLonLatNode' }]]],
            ['tr', {}, [
              ['td', {'class':'n'}, 'Position (pixels)'],
              ['td', { attachPoint: 'posXYNode' }]]],
            ['tr', {}, [
              ['td', {'class':'n'}, 'Déplacement (carte)'],
              ['td', { attachPoint: 'shiftLonLatNode' }]]],
            ['tr', {}, [
              ['td', {'class':'n'}, 'Déplacement (pixels)'],
              ['td', { attachPoint: 'shiftXYNode' }]]]]]],
            this), this.editInfoNode);
  },

  createControl: function() {
    this.control = new OpenLayers.Control.DragFeature(this.layer, {});
    //console.log('create control', this, this.control, this.layer);
    this.connect(this.control, 'onStart', 'onModificationStart');
    this.connect(this.control, 'onDrag', 'onModification');
    this.connect(this.control, 'onComplete', 'onModificationEnd');
  },

  setModifyControl: function() {
    dojo['require']('geonef.ploomap.OpenLayers.Control.FeatureModify');
    console.log('calling set mm', geonef.ploomap.OpenLayers.Control.FeatureModify);
    this.layer.setClickControl(
      geonef.ploomap.OpenLayers.Control.FeatureModify);
  },


  /////////////////////////////////////////////////////////////
  // Events

  onModificationStart: function(feature, px) {
    this.inherited(arguments);
    this.startPx = px.clone();
    this.startLonLat = this.map.getLonLatFromPixel(px);
  },

  onModification: function(feature, px) {
    this.inherited(arguments);
    this.updateMoveInfo(px);
  },

  onModificationEnd: function(feature, px) {
    this.inherited(arguments);
    this.startPx = null;
    this.startLonLat = null;
  },


  /////////////////////////////////////////////////////////////
  // UI

  /**
   * @param {OpenLayer.Pixel}
   */
  updateMoveInfo: function(px) {
    var lonLat = this.map.getLonLatFromPixel(px);
    // var units = [this.map.getUnits()];
    // if (this.map.getUnits() === 'm') {
    //   units.push('km');
    // }
    //console.log('updateMoveInfo', this, px, lonLat);
    var lonLatToStr = function(lonLat) {
      return ''+parseInt(lonLat.lon)+' ; '+parseInt(lonLat.lat);
    };
    var posLonLat = lonLatToStr(lonLat);
    var shiftLonLat = lonLatToStr(
      new OpenLayers.LonLat(lonLat.lon - this.startLonLat.lon,
                            lonLat.lat - this.startLonLat.lat));
    var posXY = ''+px.x+' ; '+px.y;
    var shiftXY = ''+(px.x - this.startPx.x)+' ; '+(px.y - this.startPx.y);
    var assoc = {
      posLonLatNode: posLonLat,
      posXYNode: posXY,
      shiftLonLatNode: shiftLonLat,
      shiftXYNode: shiftXY
    };
    for (var i in assoc) {
      if (assoc.hasOwnProperty(i)) {
        this[i].innerHTML = ''+assoc[i];
      }
    }
  }

});
