
dojo.provide('geonef.ploomap.input.ExtentView');

// parents
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('geonef.ploomap.MapBinding');

// HTML template
dojo.require('dijit.form.DropDownButton');
dojo.require('dijit.TooltipDialog');

// used in code
dojo.require('geonef.jig.clipboard');

dojo.declare('geonef.ploomap.input.ExtentView',
             [ dijit._Widget, dijit._Templated, geonef.ploomap.MapBinding ],
{
  // summary:
  //    Special input for geographic extent. Provides rich UI to manipulate it.
  //
  // todo:
  //    - bookmarks
  //    - address history (autocomplete)
  //    - mouse cursor change on drawMode (layer div onMouseOver)
  //

  templateString: dojo.cache('geonef.ploomap.input', 'templates/ExtentView.html'),
  widgetsInTemplate: true,

  name: 'extentView',
  value: undefined,

  isMapExtent: true,

  label: "Région",

  autoPanMap: true,

  geocodingEnabled: true,

  iconBaseUrl: dojo.moduleUrl('geonef.ploomap', 'style/icon'),


  buildRendering: function() {
    this.inherited(arguments);
    /*if (!this.autoPanMap) {
      dojo.style(this.zoomToCurrentButton.domNode, 'display', 'none');
    }*/
  },

  destroy: function() {
    this.destroyVectorLayer();
    this.inherited(arguments);
  },

  _setLabelAttr: function(label) {
    if (label === this.label && this.isMapExtent &&
        !this.hideSelectMapExtentButton /* prop of child class.. */) {
      label = 'Étendue visible';
    }
    this.label = label;
    this.mainButton.attr('label', label);
  },


  // EXTENT-RELATED
  /////////////////////////////////////////////////////////////

  _getValueAttr: function() {
    if (!this.mapReady.hasFired()) {
      return undefined;
    }
    if (this.isMapExtent) {
      return this.mapWidget.map.getExtent();
    }
    return this.value;
  },

  _setValueAttr: function(bounds) {
    //console.log('extent setvalueattr', this, arguments);
    this.afterMapBound(
      function() {
        if (bounds === undefined) {
          this.selectMapExtent();
        } else if (!bounds) {
          this.value = null;
        } else {
          this.isMapExtent = false;
          this._doSetValue(bounds);
        }
      });
  },

  _doSetValue: function(bounds) {
    if (this.value && this.value.toString() === bounds.toString()) {
      //console.log('******* same bounds!', bounds, bounds.toString());
      return false;
    }
    this.value = bounds;
    if (!this.isMapExtent) {
      if (this.dialogOpen) {
        this.createVectorLayer();
      }
      this.mainButton.attr('label', this.formatSize(bounds));
      if (this.autoPanMap &&
          (!this.mapWidget.map.getExtent().intersectsBounds(bounds) ||
           bounds.containsBounds(this.mapWidget.map.getExtent()))) {
        this.mapWidget.map.zoomToExtent(bounds);
      }
    }
    this.onChange();
    return true;
  },

  onChange: function() {
    // hook
    //console.log('Extent.onChange', this.value);
  },

  zoomToCurrent: function() {
    var bounds = this.attr('value');
    //console.log('zoomToCurrent', this, bounds);
    if (bounds) {
      this.mapWidget.map.zoomToExtent(bounds);
    }
  },


  // CLIPBOARD FUNCTIONALITY
  /////////////////////////////////////////////////////////////

  copyToClipboard: function() {
    if (!this.attr('value')) {
      return;
    }
    geonef.jig.clipboard.push('extent', this.attr('value').toArray());
    dojo.publish('jig/workspace/flash', [ 'Région copiée sur le presse-papier' ]);
  },

  // pasteFromClipboard defined in geonef.ploomap.input.Extent


  // UTILS
  /////////////////////////////////////////////////////////////

  formatSize: function(bounds) {
    var
      w = bounds.getWidth()
    , h = bounds.getHeight()
    , max = Math.max(w, h)
    , units = [ 'm', 'km' ]
    , mult = 1000
    , preci = 0.1
    , logNp = function(x, base) { return Math.max(0, Math.floor(Math.log(x) / Math.log(base))); }
    , exp = Math.min(logNp(max, mult), units.length - 1)
    , getU = function(x) { return Math.round((x / Math.pow(mult, exp)) * (1 / preci)) / (1 / preci); }
    , commaR = function(s) { return (''+s).replace(/\./, ','); }
    , nw = commaR(getU(w))
    , nh = commaR(getU(h))
    , str = nw + ' x ' + nh + ' ' + units[exp]
    ;
    return str;
  }

});
