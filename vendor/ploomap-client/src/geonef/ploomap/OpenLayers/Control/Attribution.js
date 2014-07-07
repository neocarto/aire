/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Control.Attribution');

/**
 * Class: OpenLayers.Control.Attribution
 * The attribution control adds attribution from layers to the map display.
 * It uses 'attribution' property of each layer.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
geonef.ploomap.OpenLayers.Control.Attribution =
  OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIProperty: seperator
     * {String} String used to seperate layers.
     */
    separator: "",

    /**
     * Constructor: OpenLayers.Control.Attribution
     *
     * Parameters:
     * options - {Object} Options for control.
     */

    /**
     * Method: destroy
     * Destroy control.
     */
    destroy: function() {
        console.log('this.map (destroy)', this, this.map);
        this.map.events.un({
            "removelayer": this.updateAttribution,
            "addlayer": this.updateAttribution,
            "changelayer": this.updateAttribution,
            "changebaselayer": this.updateAttribution,
            scope: this
        });

        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: draw
     * Initialize control.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        this.map.events.on({
            'changebaselayer': this.updateAttribution,
            'changelayer': this.updateAttribution,
            'addlayer': this.updateAttribution,
            'removelayer': this.updateAttribution,
            scope: this
        });
        dojo.create('div', {'class':'opacity'}, this.div);
        this.contentDiv = dojo.create('div', {'class':'cont'}, this.div);
        this.updateAttribution();

        return this.div;
    },

    /**
     * Method: updateAttribution
     * Update attribution string.
     */
    updateAttribution: function(evt) {
      //console.log('updateAttribution', this, arguments);
      if (!this.map) { console.log('missing map updateAttribution', this, this.map); }
      if (evt && (evt.type === 'changelayer' || evt.type === 'changebaselayer') &&
          ['attribution','visibility'].indexOf(evt.property) === -1) { return; }
        var attributions = [];
        if (this.map && this.map.layers) {
            for(var i=0, len=this.map.layers.length; i<len; i++) {
                var layer = this.map.layers[i];
                if (layer.attribution && layer.getVisibility()) {
                    // add attribution only if attribution text is unique
                    if (OpenLayers.Util.indexOf(
                                    attributions, layer.attribution) === -1) {
                        attributions.push( layer.attribution );
                    }
                }
            }
            this.contentDiv.innerHTML = attributions
                .map(function(at) { return '<div class="item">'+at+'</div>'; })
                .join(this.separator);
        }
    },

    CLASS_NAME: "OpenLayers.Control.Attribution"
});
